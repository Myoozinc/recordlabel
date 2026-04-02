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
                    tags
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
            const tags = (product.tags || []).map(t => t.toLowerCase());
            const title = product.title.toLowerCase();
            
            // Specific artists first, then generic label brand
            const checkOrder = ['ggb beats logo', 'ggb beats', 'joss', 'rasta mia', 'myooz inc'];
            
            // 1. Check tags (Primary Truth)
            for (const brand of checkOrder) {
                const compactBrand = brand.replace(/\s/g, ''); 
                if (tags.some(t => t.includes(brand) || t.replace(/\s/g, '').includes(compactBrand))) {
                    return brand;
                }
            }
            
            // 2. Check title (Fallback if tags were forgotten)
            for (const brand of checkOrder) {
                const compactBrand = brand.replace(/\s/g, ''); 
                if (title.includes(brand) || title.replace(/\s/g, '').includes(compactBrand)) {
                    return brand;
                }
            }

            // 3. Unidentified products default to the general label store
            return 'myooz inc'; 
        }

        function matchesFilter(product, target) {
            const t = target.toLowerCase().trim();
            const brand = getProductBrand(product);
            
            if (t === 'ggb beats logo') return brand === 'ggb beats logo';
            if (t === 'myooz inc' || t === 'myooz') return brand === 'myooz inc';
            if (t === 'ggb beats' || t === 'ggb') return brand === 'ggb beats';
            if (t === 'rasta mia') return brand === 'rasta mia';
            if (t === 'joss') return brand === 'joss';
            
            return false;
        }

        let filtered;
        const brandDisplayOrder = ['myooz inc', 'ggb beats logo', 'joss', 'rasta mia', 'ggb beats'];

        const sortWithinBrand = (a, b) => {
            const aBrand = getProductBrand(a);
            if (aBrand === 'ggb beats logo') {
                const aIsHat = a.title.toLowerCase().includes('hat') || a.title.toLowerCase().includes('cap');
                const bIsHat = b.title.toLowerCase().includes('hat') || b.title.toLowerCase().includes('cap');
                if (aIsHat && !bIsHat) return -1;
                if (!aIsHat && bIsHat) return 1;
            }
            return a.title.localeCompare(b.title);
        };

        if (filterCategory === 'all') {
            filtered = [...merchProducts].sort((a, b) => {
                const aBrand = getProductBrand(a);
                const bBrand = getProductBrand(b);
                const aIdx = brandDisplayOrder.indexOf(aBrand);
                const bIdx = brandDisplayOrder.indexOf(bBrand);
                
                if (aIdx !== bIdx) return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
                return sortWithinBrand(a, b);
            });
        } else {
            filtered = merchProducts.filter(p => matchesFilter(p, filterCategory));
            filtered.sort(sortWithinBrand);
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
                // Use the explicit option order defined in Shopify (which respects the user's manual sorting)
                p.options.forEach(opt => {
                    activeOptions[p.id][opt.name] = opt.values[0];
                });

                // SPECIAL OVERRIDES -> Force specific default colors visually requested by user
                const defaultColorMap = {
                    'DJ BARBIE CROP TOP': ['ORCHID', 'PINK', 'ROSADO'],
                    'GGB BEATS HAT': ['WHITE', 'BLANCO'],
                    'VOLVERÉ HOODIE': ['MAROON', 'RED', 'ROJO'],
                    'DANCING IN THE SHADOWS': ['STORM', 'DARK GREY', 'CHARCOAL'],
                    'VOLVERÉ TANK': ['TEAM ROYAL', 'ROYAL', 'BLUE', 'AZUL'],
                    'MYOOZ INC HOODIE': ['BLACK', 'NEGRO'],
                    'GAMEPLAY': ['NAVY BLAZER', 'NAVY', 'DARK BLUE'],
                    'GGB BEATS ADIDAS': ['BLACK', 'NEGRO'],
                    'GGB BEATS HOODIE': ['BLACK', 'NEGRO'],
                    'DJ BARBIE CROP HOODIE': ['BLACK', 'NEGRO'],
                    'FANTASMA REMIX': ['MILITARY GREEN', 'OLIVE', 'GREEN', 'VERDE'],
                    'GGB BEATS SWEATSHIRT': ['BLACK', 'NEGRO'],
                    'GG PAD': ['INDIGO BLUE', 'INDIGO', 'DENIM', 'BLUE'],
                    'URBAN X CROP': ['MILITARY GREEN', 'OLIVE', 'GREEN', 'VERDE'],
                    '90S RAGLAN': ['WHITE', 'WHITE/BLACK', 'BLANCO'],
                    'OLDIES\' SUMMER': ['NAVY BLAZER', 'NAVY'],
                    'LAST URBAN X': ['VINTAGE BLACK', 'BLACK', 'CHARCOAL'],
                    'GGB BEATS JERSEY': ['WHITE', 'BLANCO'],
                    'MYOOZ INC JERSEY': ['BLACK', 'NEGRO']
                };

                const titleUpper = p.title.toUpperCase().trim();
                let matchingOverrideKeys = Object.keys(defaultColorMap).filter(k => titleUpper.includes(k));
                
                if (matchingOverrideKeys.length > 0) {
                    const fallbackColors = defaultColorMap[matchingOverrideKeys[0]];
                    const colorOpt = p.options.find(o => o.name.toLowerCase().includes('color'));
                    if (colorOpt) {
                        for (const fallback of fallbackColors) {
                            const exactValueMatch = colorOpt.values.find(v => v.toUpperCase() === fallback);
                            if (exactValueMatch) {
                                activeOptions[p.id][colorOpt.name] = exactValueMatch;
                                break;
                            }
                        }
                    }
                }

                // Find the specific variant that matches these default options
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

                    if (isColor) {
                        optionsHTML += `<select class="color-select" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 6px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.85rem; outline: none; margin-bottom: 5px; width: 100%;" onchange="updateShopifyOption('${p.id}', '${opt.name}', this.value)">`;
                        opt.values.forEach(val => {
                            const isSelected = activeOptions[p.id][opt.name] === val;
                            optionsHTML += `<option value="${val.replace(/'/g, "\\'")}" style="color: #000; background: #fff;" ${isSelected ? 'selected' : ''}>${val}</option>`;
                        });
                        optionsHTML += `</select>`;
                    } else {
                        const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL', '4XL'];
                        const sortedValues = [...opt.values].sort((a, b) => {
                            let aIdx = sizeOrder.indexOf(a.toUpperCase().trim());
                            let bIdx = sizeOrder.indexOf(b.toUpperCase().trim());
                            if (aIdx === -1) aIdx = 999;
                            if (bIdx === -1) bIdx = 999;
                            return aIdx - bIdx;
                        });

                        sortedValues.forEach(val => {
                            const isActive = activeOptions[p.id][opt.name] === val;
                            optionsHTML += `<button class="size-pill ${isActive ? 'active' : ''}"
                                style="padding:4px 12px; border:1px solid ${isActive ? '#8B3FCC' : 'rgba(255,255,255,0.1)'}; background:${isActive ? 'rgba(139,63,204,0.1)' : 'transparent'}; color:#fff; border-radius:4px; cursor:pointer; font-size:0.8rem;"
                                onclick="updateShopifyOption('${p.id}', '${opt.name}', '${val.replace(/'/g, "\\'")}')">
                                ${val}
                            </button>`;
                        });
                    }

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
    if (!isColor) {
        // Only update pill states manually (dropdown <select> handles its own state)
        const optionGroups = card.querySelectorAll('.option-group');
        optionGroups.forEach(group => {
            const groupName = group.querySelector('span').innerText;
            if (groupName.toLowerCase() === optionName.toLowerCase()) {
                const buttons = group.querySelectorAll('.size-pill');
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.innerText.trim() === optionValue) {
                        btn.classList.add('active');
                        btn.style.borderColor = '#8B3FCC';
                        btn.style.background = 'rgba(139,63,204,0.1)';
                    } else {
                        btn.style.borderColor = 'rgba(255,255,255,0.1)';
                        btn.style.background = 'transparent';
                    }
                });
            }
        });
    }
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
