// Configuración de Cliente Headless de Shopify
let shopifyClient;
try {
    if (typeof ShopifyBuy !== 'undefined') {
        shopifyClient = ShopifyBuy.buildClient({
            domain: 'myooz-inc.myshopify.com',
            storefrontAccessToken: 'acd24150be762dc32d5801dbdf47b973'
        });
    } else {
        console.error("El SDK de ShopifyBuy no se cargó correctamente.");
    }
} catch(e) {
    console.error("Error inicializando Shopify Client", e);
}

// Estado Global
let shopifyProducts = [];
const selectedVariants = {};
const activeOptions = {}; // Tracks { productId: { Color: 'Black', Size: 'M' } }

const colorMap = {
    'black': '#000', 'negro': '#000', 'white': '#fff', 'blanco': '#fff',
    'blue': '#0047ab', 'azul': '#0047ab', 'deep blue': '#0b132b', 'deep': '#0b132b',
    'grey': '#555', 'gris': '#555', 'purple': '#8B3FCC', 'morado': '#8B3FCC', 
    'beige': '#f5f5dc', 'olive': '#3d3d22', 'wine': '#722f37', 'vino': '#722f37',
    'green': '#004b23', 'verde': '#004b23', 'red': '#8b0000', 'rojo': '#8b0000'
};

function getColorHex(name) {
    return colorMap[name.toLowerCase().trim()] || name.toLowerCase().replace(/\s/g, '');
}

// Renderizado Dinámico
async function renderMerchGrid(containerId, filterCategory = 'all', isCompact = false) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (isCompact) grid.classList.add('compact');
    else grid.classList.remove('compact');

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 5rem;">Conectando con Shopify...</div>';

    if (!shopifyClient) {
        grid.innerHTML = `<p style="color:red; text-align:center; grid-column: 1/-1; padding: 5rem;">
            No se pudo conectar con Shopify. Desactiva tu AdBlocker o intenta en otro navegador.
        </p>`;
        return;
    }

    try {
        if (shopifyProducts.length === 0) {
            shopifyProducts = await shopifyClient.product.fetchAll();
        }

        const filtered = filterCategory === 'all' 
            ? shopifyProducts 
            : shopifyProducts.filter(p => {
                const vendor = (p.vendor || '').toLowerCase();
                const target = filterCategory.toLowerCase();
                return vendor.includes(target) || (p.productType || '').toLowerCase().includes(target);
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
            // Inicializar estado del producto
            if (!activeOptions[p.id]) {
                activeOptions[p.id] = {};
                p.options.forEach(opt => {
                    activeOptions[p.id][opt.name] = opt.values[0].value;
                });
                
                // Buscar variante inicial que coincida
                let initialVariant = p.variants.find(v => {
                    return v.selectedOptions.every(so => activeOptions[p.id][so.name] === so.value);
                });
                selectedVariants[p.id] = initialVariant || p.variants[0];
            }
            
            const variant = selectedVariants[p.id];
            const price = variant.price.amount;
            const imageUrl = variant.image ? variant.image.src : (p.images[0] ? p.images[0].src : 'https://placehold.co/400x400/050505/8b3fcc?text=No+Image');

            // Renderizar Opciones (Color vs Talla)
            let optionsHTML = '';
            if (p.options.length > 0 && p.options[0].name !== 'Title') {
                optionsHTML = `<div class="options-container" style="margin: 15px 0; display: flex; flex-direction: column; gap: 10px;">`;
                
                p.options.forEach(opt => {
                    const isColor = opt.name.toLowerCase().includes('color');
                    
                    optionsHTML += `<div class="option-group">
                        <span style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px;">${opt.name}</span>
                        <div class="option-values" style="display:flex; gap:8px; margin-top:5px; flex-wrap:wrap;">`;
                    
                    opt.values.forEach(val => {
                        const isActive = activeOptions[p.id][opt.name] === val.value;
                        if (isColor) {
                            optionsHTML += `<div class="variant-dot ${isActive ? 'active' : ''}" 
                                style="background-color: ${getColorHex(val.value)}; cursor:pointer;"
                                onclick="updateShopifyOption('${p.id}', '${opt.name}', '${val.value.replace(/'/g, "\\'")}')"
                                title="${val.value}"></div>`;
                        } else {
                            optionsHTML += `<button class="size-pill ${isActive ? 'active' : ''}" 
                                style="padding:4px 12px; border:1px solid ${isActive ? '#8B3FCC' : 'rgba(255,255,255,0.1)'}; background:${isActive ? 'rgba(139,63,204,0.1)' : 'transparent'}; color:#fff; border-radius:4px; cursor:pointer; font-size:0.8rem;"
                                onclick="updateShopifyOption('${p.id}', '${opt.name}', '${val.value.replace(/'/g, "\\'")}')">
                                ${val.value}
                            </button>`;
                        }
                    });
                    
                    optionsHTML += `</div></div>`;
                });
                optionsHTML += `</div>`;
            }

            return `
                <div class="product-card" data-category="${p.vendor}">
                    <div class="product-image-wrapper">
                        <img id="img-${p.id}" src="${imageUrl}" alt="${p.title}">
                    </div>
                    <div class="product-meta">
                        <span class="product-tag">${p.productType || p.vendor || 'MYOOZ'}</span>
                        <h3 class="product-name">${p.title}</h3>
                        <div class="product-price" id="price-${p.id}">
                            <small>USD</small> $${parseFloat(price).toFixed(2)}
                        </div>
                        
                        ${optionsHTML}

                        <button class="add-to-cart-btn" onclick="addShopifyToCart('${p.id}')" style="margin-top:auto;">
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

function updateShopifyOption(productId, optionName, optionValue) {
    // 1. Actualizar estado de opciones seleccionadas
    activeOptions[productId][optionName] = optionValue;
    
    // 2. Encontrar variante que coincide con TODAS las opciones
    const product = shopifyProducts.find(p => p.id === productId);
    const newVariant = product.variants.find(v => {
        return v.selectedOptions.every(opt => activeOptions[productId][opt.name] === opt.value);
    });

    if (newVariant) {
        selectedVariants[productId] = newVariant;
        
        // Actualizar precio
        const priceEl = document.getElementById(`price-${productId}`);
        if(priceEl) priceEl.innerHTML = `<small>USD</small> $${parseFloat(newVariant.price.amount).toFixed(2)}`;

        // Actualizar imagen suavemente
        if(newVariant.image) {
            const img = document.getElementById(`img-${productId}`);
            if (img && img.src !== newVariant.image.src) {
                img.style.opacity = '0';
                setTimeout(() => {
                    img.src = newVariant.image.src;
                    img.style.opacity = '1';
                }, 200);
            }
        }
    }

    // 3. Actualizar UI de botones y puntos manualmente (para no recargar toda la grilla)
    const card = document.querySelector(`.product-card img[id="img-${productId}"]`).closest('.product-card');
    if (card) {
        const isColor = optionName.toLowerCase().includes('color');
        
        // Encontrar el grupo de opciones específico que fue clickeado
        // Usamos title o textContent para encontrar el correcto y actualizar 'active'
        const optionGroups = card.querySelectorAll('.option-group');
        optionGroups.forEach(group => {
            const groupName = group.querySelector('span').innerText;
            if (groupName.toLowerCase() === optionName.toLowerCase()) {
                const buttons = group.querySelectorAll(isColor ? '.variant-dot' : '.size-pill');
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    
                    if (isColor) {
                        if (btn.title === optionValue) btn.classList.add('active');
                    } else {
                        if (btn.innerText.trim() === optionValue) {
                            btn.classList.add('active');
                            btn.style.borderColor = '#8B3FCC';
                            btn.style.background = 'rgba(139,63,204,0.1)';
                        } else {
                            btn.style.borderColor = 'rgba(255,255,255,0.1)';
                            btn.style.background = 'transparent';
                        }
                    }
                });
            }
        });
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
