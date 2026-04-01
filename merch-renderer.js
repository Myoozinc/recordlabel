// Configuración de Cliente Headless de Shopify (Cart API)
const SHOPIFY_DOMAIN = 'myooz-inc.myshopify.com';
const SHOPIFY_TOKEN = 'acd24150be762dc32d5801dbdf47b973';
const STOREFRONT_API_URL = `https://${SHOPIFY_DOMAIN}/api/2024-10/graphql.json`;

// Helper para hacer peticiones GraphQL directas
async function shopifyFetch(query, variables = {}) {
    const res = await fetch(STOREFRONT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) {
        console.error('Shopify GraphQL Errors:', json.errors);
        throw new Error(json.errors[0].message);
    }
    return json.data;
}

// Estado Global
let shopifyProducts = [];
const selectedVariants = {};
const activeOptions = {};

const colorMap = {
    'black': '#111', 'negro': '#111', 'white': '#f0f0f0', 'blanco': '#f0f0f0',
    'blue': '#0047ab', 'azul': '#0047ab', 'deep blue': '#0b132b', 'deep': '#0b132b',
    'grey': '#555', 'gris': '#555', 'gray': '#555',
    'purple': '#8B3FCC', 'morado': '#8B3FCC',
    'beige': '#f5f5dc', 'olive': '#3d3d22',
    'wine': '#722f37', 'vino': '#722f37',
    'green': '#004b23', 'verde': '#004b23',
    'red': '#8b0000', 'rojo': '#8b0000',
    'navy': '#001f3f', 'navy blazer': '#1c2541'
};

function getColorHex(name) {
    const key = name.toLowerCase().trim();
    return colorMap[key] || '#888';
}

// ========== FETCH PRODUCTS ==========
async function fetchAllProducts() {
    const query = `{
        products(first: 50) {
            edges {
                node {
                    id
                    title
                    vendor
                    productType
                    options {
                        name
                        values
                    }
                    images(first: 10) {
                        edges {
                            node {
                                src
                            }
                        }
                    }
                    variants(first: 50) {
                        edges {
                            node {
                                id
                                title
                                price {
                                    amount
                                    currencyCode
                                }
                                selectedOptions {
                                    name
                                    value
                                }
                                image {
                                    src
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;
    const data = await shopifyFetch(query);
    return data.products.edges.map(e => {
        const p = e.node;
        p.images = p.images.edges.map(ie => ie.node);
        p.variants = p.variants.edges.map(ve => ve.node);
        return p;
    });
}

// ========== CART API ==========
async function createCart(lineItems, customAttributes = []) {
    const lines = lineItems.map(li => ({
        merchandiseId: li.variantId,
        quantity: li.quantity
    }));

    const attrsInput = customAttributes.map(a => `{key: "${a.key}", value: "${a.value}"}`).join(', ');

    const query = `mutation {
        cartCreate(input: {
            lines: [${lines.map(l => `{merchandiseId: "${l.merchandiseId}", quantity: ${l.quantity}}`).join(', ')}]
            ${customAttributes.length > 0 ? `, attributes: [${attrsInput}]` : ''}
        }) {
            cart {
                id
                checkoutUrl
            }
            userErrors {
                field
                message
            }
        }
    }`;

    const data = await shopifyFetch(query);
    if (data.cartCreate.userErrors.length > 0) {
        console.error('Cart errors:', data.cartCreate.userErrors);
        throw new Error(data.cartCreate.userErrors[0].message);
    }
    return data.cartCreate.cart;
}

// ========== RENDER ==========
async function renderMerchGrid(containerId, filterCategory = 'all', isCompact = false) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (isCompact) grid.classList.add('compact');
    else grid.classList.remove('compact');

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: rgba(255,255,255,0.5); padding: 5rem;">Conectando con Shopify...</div>';

    try {
        if (shopifyProducts.length === 0) {
            shopifyProducts = await fetchAllProducts();
        }

        // Exclude the services bridge product from the merch grid
        const merchProducts = shopifyProducts.filter(p =>
            !p.title.toLowerCase().includes('servicios myooz')
        );

        // Custom sort order for "all" view
        const brandOrder = ['myooz inc', 'ggb beats', 'joss', 'rasta mia'];

        function getProductBrand(product) {
            const title = product.title.toLowerCase();
            const vendor = (product.vendor || '').toLowerCase();
            const pType = (product.productType || '').toLowerCase();
            // Check title first (most reliable since vendor may all be "myooz inc")
            for (const brand of brandOrder) {
                if (title.includes(brand.replace(/\s/g, ' '))) return brand;
            }
            // Then check vendor
            for (const brand of brandOrder) {
                if (vendor.includes(brand)) return brand;
            }
            // Then check productType
            for (const brand of brandOrder) {
                if (pType.includes(brand)) return brand;
            }
            return 'zzz'; // unknown goes last
        }

        function matchesFilter(product, target) {
            const t = target.toLowerCase().trim();
            const title = product.title.toLowerCase();
            const vendor = (product.vendor || '').toLowerCase();
            const pType = (product.productType || '').toLowerCase();
            return title.includes(t) || vendor.includes(t) || pType.includes(t);
        }

        let filtered;
        if (filterCategory === 'all') {
            filtered = [...merchProducts].sort((a, b) => {
                const aIdx = brandOrder.indexOf(getProductBrand(a));
                const bIdx = brandOrder.indexOf(getProductBrand(b));
                return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
            });
        } else {
            filtered = merchProducts.filter(p => matchesFilter(p, filterCategory));
        }

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
            if (!activeOptions[p.id]) {
                activeOptions[p.id] = {};
                p.options.forEach(opt => {
                    activeOptions[p.id][opt.name] = opt.values[0];
                });
                let initialVariant = p.variants.find(v =>
                    v.selectedOptions.every(so => activeOptions[p.id][so.name] === so.value)
                );
                selectedVariants[p.id] = initialVariant || p.variants[0];
            }

            const variant = selectedVariants[p.id];
            const price = variant.price.amount;
            const imageUrl = variant.image ? variant.image.src : (p.images[0] ? p.images[0].src : 'https://placehold.co/400x400/050505/8b3fcc?text=No+Image');

            let optionsHTML = '';
            if (p.options.length > 0 && p.options[0].name !== 'Title') {
                optionsHTML = `<div class="options-container" style="margin: 15px 0; display: flex; flex-direction: column; gap: 10px;">`;

                p.options.forEach(opt => {
                    const isColor = opt.name.toLowerCase().includes('color');

                    optionsHTML += `<div class="option-group">
                        <span style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px;">${opt.name}</span>
                        <div class="option-values" style="display:flex; gap:8px; margin-top:5px; flex-wrap:wrap;">`;

                    opt.values.forEach(val => {
                        const isActive = activeOptions[p.id][opt.name] === val;
                        if (isColor) {
                            optionsHTML += `<div class="variant-dot ${isActive ? 'active' : ''}"
                                style="background-color: ${getColorHex(val)}; cursor:pointer;"
                                onclick="updateShopifyOption('${p.id}', '${opt.name}', '${val.replace(/'/g, "\\'")}')"
                                title="${val}"></div>`;
                        } else {
                            optionsHTML += `<button class="size-pill ${isActive ? 'active' : ''}"
                                style="padding:4px 12px; border:1px solid ${isActive ? '#8B3FCC' : 'rgba(255,255,255,0.1)'}; background:${isActive ? 'rgba(139,63,204,0.1)' : 'transparent'}; color:#fff; border-radius:4px; cursor:pointer; font-size:0.8rem;"
                                onclick="updateShopifyOption('${p.id}', '${opt.name}', '${val.replace(/'/g, "\\'")}')">
                                ${val}
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
                        <img id="img-${p.id}" src="${imageUrl}" alt="${p.title}" style="transition: opacity 0.2s;">
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
        grid.innerHTML = `<p style="color:red; text-align:center; grid-column: 1/-1; padding: 3rem;">Error cargando catálogo: ${err.message}</p>`;
    }
}

// ========== OPTION SWITCHING ==========
function updateShopifyOption(productId, optionName, optionValue) {
    activeOptions[productId][optionName] = optionValue;

    const product = shopifyProducts.find(p => p.id === productId);
    const newVariant = product.variants.find(v =>
        v.selectedOptions.every(opt => activeOptions[productId][opt.name] === opt.value)
    );

    if (newVariant) {
        selectedVariants[productId] = newVariant;

        const priceEl = document.getElementById(`price-${productId}`);
        if (priceEl) priceEl.innerHTML = `<small>USD</small> $${parseFloat(newVariant.price.amount).toFixed(2)}`;

        if (newVariant.image) {
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

    // Update active states in DOM
    const imgEl = document.getElementById(`img-${productId}`);
    if (!imgEl) return;
    const card = imgEl.closest('.product-card');
    if (!card) return;

    const isColor = optionName.toLowerCase().includes('color');
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

// ========== ADD TO CART ==========
async function addShopifyToCart(productId) {
    const product = shopifyProducts.find(p => p.id === productId);
    const variant = selectedVariants[productId] || product.variants[0];

    // If global cart exists (tienda.html), use it
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

    // Quick Checkout for artist pages
    try {
        const btn = event.target || document.querySelector(`[onclick="addShopifyToCart('${productId}')"]`);
        const origText = btn.innerText;
        btn.innerText = 'CONECTANDO...';
        btn.style.opacity = '0.5';
        btn.disabled = true;

        const cart = await createCart([{ variantId: variant.id, quantity: 1 }]);
        window.location.href = cart.checkoutUrl;
    } catch(err) {
        console.error('Error Quick Checkout:', err);
        alert('Error conectando con Shopify. Intenta de nuevo.');
    }
}
