// Configuración de Cliente Headless de Shopify
const shopifyClient = ShopifyBuy.buildClient({
    domain: 'myooz-inc.myshopify.com',
    storefrontAccessToken: 'acd24150be762dc32d5801dbdf47b973'
});

// Estado Global
let shopifyProducts = [];
const selectedVariants = {};

// Renderizado Dinámico
async function renderMerchGrid(containerId, filterCategory = 'all', isCompact = false) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (isCompact) grid.classList.add('compact');
    else grid.classList.remove('compact');

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 5rem;">Conectando con Shopify...</div>';

    try {
        if (shopifyProducts.length === 0) {
            shopifyProducts = await shopifyClient.product.fetchAll();
        }

        // Filtro por "vendor" (MYOOZ InC, GGB Beats, Joss, etc) o "productType"
        const filtered = filterCategory === 'all' 
            ? shopifyProducts 
            : shopifyProducts.filter(p => {
                const vendor = (p.vendor || '').toLowerCase();
                const target = filterCategory.toLowerCase();
                return vendor.includes(target) || p.productType.toLowerCase().includes(target);
            });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results-state" style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.03); border-radius: 24px; border: 1px dashed rgba(255,255,255,0.1);">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.5;">🛍️</div>
                    <h3 style="color: #fff; font-family: 'Outfit'; font-size: 1.8rem; margin-bottom: 1rem;">No hay productos todavía</h3>
                    <p style="color: rgba(255,255,255,0.5); font-size: 1.1rem; max-width: 400px; margin: 0 auto;">Ve a tu panel de Shopify y asegúrate de publicar productos en el canal de ventas "Headless".</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filtered.map(p => {
            // Variante seleccionada por defecto
            if (!selectedVariants[p.id]) {
                selectedVariants[p.id] = p.variants[0];
            }
            
            const activeVariant = selectedVariants[p.id];
            const price = activeVariant.price.amount;
            const imageUrl = activeVariant.image ? activeVariant.image.src : (p.images[0] ? p.images[0].src : 'https://placehold.co/400x400/050505/8b3fcc?text=No+Image');

            return `
                <div class="product-card" data-category="${p.vendor}">
                    <div class="product-image-wrapper">
                        <img id="img-${p.id}" src="${imageUrl}" alt="${p.title}">
                    </div>
                    <div class="product-meta">
                        <span class="product-tag">${p.productType || p.vendor || 'MYOOZ'}</span>
                        <h3 class="product-name">${p.title}</h3>
                        <div class="product-price">
                            <small>USD</small> $${parseFloat(price).toFixed(2)}
                        </div>
                        
                        ${p.variants.length > 1 ? `
                            <select class="variant-select-dropdown" onchange="switchShopifyVariant('${p.id}', this.value)" style="width:100%; margin: 10px 0; padding: 8px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                                ${p.variants.map(v => `
                                    <option value="${v.id}" ${activeVariant.id === v.id ? 'selected' : ''}>${v.title}</option>
                                `).join('')}
                            </select>
                        ` : ''}

                        <button class="add-to-cart-btn" onclick="addShopifyToCart('${p.id}')">
                            AÑADIR AL CARRITO
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch(err) {
        console.error('Error fetching Shopify products:', err);
        grid.innerHTML = `<p style="color:red; text-align:center;">Error cargando catálogo.</p>`;
    }
}

function switchShopifyVariant(productId, variantId) {
    const product = shopifyProducts.find(p => p.id === productId);
    const variant = product.variants.find(v => v.id === variantId);
    selectedVariants[productId] = variant;

    if(variant.image) {
        const img = document.getElementById(`img-${productId}`);
        if(img) img.src = variant.image.src;
    }
}

async function addShopifyToCart(productId) {
    const product = shopifyProducts.find(p => p.id === productId);
    const variant = selectedVariants[productId] || product.variants[0];
    
    // Mapeo hacia nuestro carrito global (tienda.html)
    if (window.addItemToCart) {
        window.addItemToCart({
            id: product.id,
            name: product.title,
            price: parseFloat(variant.price.amount),
            image: variant.image ? variant.image.src : (product.images[0] ? product.images[0].src : ''),
        }, {
            id: variant.id, 
            label: variant.title
        });
        return;
    } 

    // Si no hay carrito global (páginas de artistas), hacemos Compra Rápida
    try {
        const btn = event.target || document.querySelector(`[onclick="addShopifyToCart('${productId}')"]`);
        const origText = btn.innerText;
        btn.innerText = 'CONECTANDO...';
        btn.style.opacity = '0.5';
        btn.disabled = true;

        const checkout = await shopifyClient.checkout.create();
        const updatedCheckout = await shopifyClient.checkout.addLineItems(checkout.id, [{
            variantId: variant.id,
            quantity: 1
        }]);
        
        // Redirigir seguro a Shopify
        window.location.href = updatedCheckout.webUrl;
    } catch(err) {
        console.error('Error Quick Checkout:', err);
        alert('Error conectando con Shopify. Intenta de nuevo.');
    }
}
