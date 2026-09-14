// Renderizador Oficial de Merchandising - MYOOZ InC
// Sin dependencia de Shopify - Rendimiento ultrarrápido y compatible con PayPal + Printful

let catalogProducts = [];
const selectedVariants = {};
const activeOptions = {};

function slugify(text) {
    if (!text) return "";
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// Carga el catálogo local desde merch-data.js
function loadCatalog() {
    if (typeof getStoreCatalog === 'function') {
        return getStoreCatalog();
    }
    if (typeof window !== 'undefined' && typeof window.getStoreCatalog === 'function') {
        return window.getStoreCatalog();
    }
    if (typeof merchProducts !== 'undefined') {
        // Fallback básico si getStoreCatalog no está disponible
        return merchProducts.map(p => ({
            id: p.id,
            title: p.name,
            vendor: p.category,
            productType: p.tag || p.category,
            tags: [p.category.toLowerCase(), p.name.toLowerCase()],
            images: p.variants.map(v => ({ src: v.image })),
            options: [{ name: 'Color', values: p.variants.map(v => v.label) }],
            variants: p.variants.map(v => ({
                id: `${p.id}-${v.id}`,
                title: v.label,
                price: { amount: p.price.toFixed(2), currencyCode: 'USD' },
                selectedOptions: [{ name: 'Color', value: v.label }],
                image: { src: v.image }
            }))
        }));
    }
    console.error('merchProducts no está disponible. Asegúrate de cargar merch-data.js antes de merch-renderer.js');
    return [];
}

// ========== QUICK VIEW LOGIC ==========
function initQuickView() {
    if (document.getElementById('quick-view-overlay')) return;
    
    const modalHTML = `
        <div id="quick-view-overlay" class="quick-view-overlay">
            <div class="quick-view-content">
                <button class="quick-view-close">&times;</button>
                <div class="quick-view-image-side">
                    <div class="zoom-container" id="qv-zoom-container">
                        <img id="qv-image" src="" alt="">
                        <div class="magnifier-lens" id="qv-magnifier"></div>
                    </div>
                </div>
                <div class="quick-view-info-side">
                    <button class="quick-view-share-btn" title="Compartir">
                        <svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                    </button>
                    <span id="qv-tag" class="product-tag"></span>
                    <h2 id="qv-name" class="quick-view-name"></h2>
                    <div id="qv-price" class="quick-view-price"></div>
                    <div id="qv-options" class="options-container"></div>
                    <button id="qv-add-btn" class="add-to-cart-btn" style="margin-top: 2rem;">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            </div>
        </div>
        <div id="share-toast" class="share-toast">¡Enlace copiado al portapapeles!</div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const overlay = document.getElementById('quick-view-overlay');
    const closeBtn = overlay.querySelector('.quick-view-close');
    const shareBtn = overlay.querySelector('.quick-view-share-btn');
    
    closeBtn.onclick = closeQuickView;
    overlay.onclick = (e) => { if (e.target === overlay) closeQuickView(); };
    
    shareBtn.onclick = () => {
        const productId = shareBtn.dataset.productId;
        shareProduct(productId);
    };

    const qvAddBtn = document.getElementById('qv-add-btn');
    if (qvAddBtn) {
        qvAddBtn.onclick = () => {
            if (shareBtn.dataset.productId) {
                addProductToCart(shareBtn.dataset.productId, qvAddBtn);
                closeQuickView();
            }
        };
    }
}

function openQuickView(productId) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    
    initQuickView();
    const variant = selectedVariants[productId] || product.variants[0];
    const overlay = document.getElementById('quick-view-overlay');
    
    document.getElementById('qv-image').src = variant.image ? variant.image.src : (product.images[0] ? product.images[0].src : '');
    document.getElementById('qv-tag').innerText = product.productType || product.vendor || 'MYOOZ';
    document.getElementById('qv-name').innerText = product.title;
    document.getElementById('qv-price').innerHTML = `<small>USD</small> $${parseFloat(variant.price.amount).toFixed(2)}`;
    
    const shareBtn = overlay.querySelector('.quick-view-share-btn');
    shareBtn.dataset.productId = productId;
    
    const qvOptions = document.getElementById('qv-options');
    qvOptions.innerHTML = renderOptionsHTML(product);
    
    // Bind events to QV options
    qvOptions.querySelectorAll('[data-action="update-option"]').forEach(el => {
        if (el.tagName === 'BUTTON') {
            el.onclick = () => {
                updateProductOption(productId, el.dataset.optionName, el.dataset.optionValue);
                openQuickView(productId); // Refresh
            };
        } else if (el.tagName === 'SELECT') {
            el.onchange = (e) => {
                updateProductOption(productId, el.dataset.optionName, e.target.value);
                openQuickView(productId); // Refresh
            };
        }
    });
    
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Magnifying Glass logic
    const zoomContainer = document.getElementById('qv-zoom-container');
    const zoomImg = document.getElementById('qv-image');
    const magnifier = document.getElementById('qv-magnifier');
    
    const handleMove = (e) => {
        const isTouch = e.type.startsWith('touch');
        const point = isTouch ? e.touches[0] : e;
        
        const { left, top, width, height } = zoomImg.getBoundingClientRect();
        const mouseX = point.clientX - left;
        const mouseY = point.clientY - top;
        
        if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
            magnifier.style.display = 'none';
            zoomContainer.style.cursor = 'default';
            return;
        }
        
        magnifier.style.display = 'block';
        zoomContainer.style.cursor = 'none';
        
        const containerRect = zoomContainer.getBoundingClientRect();
        let lensX = point.clientX - containerRect.left;
        let lensY = point.clientY - containerRect.top;

        if (isTouch) lensY -= 60; 
        
        magnifier.style.left = `${lensX - magnifier.offsetWidth / 2}px`;
        magnifier.style.top = `${lensY - magnifier.offsetHeight / 2}px`;
        
        const zoomLevel = 2.5;
        magnifier.style.backgroundImage = `url(${zoomImg.src})`;
        magnifier.style.backgroundSize = `${width * zoomLevel}px ${height * zoomLevel}px`;
        
        const bgX = (mouseX * zoomLevel) - magnifier.offsetWidth / 2;
        const bgY = (mouseY * zoomLevel) - magnifier.offsetHeight / 2;
        magnifier.style.backgroundPosition = `-${bgX}px -${bgY}px`;
        
        if (isTouch) e.preventDefault();
    };

    zoomContainer.addEventListener('mousemove', handleMove);
    zoomContainer.addEventListener('touchstart', handleMove, { passive: false });
    zoomContainer.addEventListener('touchmove', handleMove, { passive: false });
    
    const hideMagnifier = () => { magnifier.style.display = 'none'; };
    zoomContainer.addEventListener('mouseleave', hideMagnifier);
    zoomContainer.addEventListener('touchend', hideMagnifier);
    
    // Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('product', slugify(product.title));
    window.history.pushState({}, '', url);
}

function renderOptionsHTML(p) {
    let optionsHTML = '';
    if (p.options && p.options.length > 0) {
        optionsHTML = `<div class="options-container" style="margin: 15px 0; display: flex; flex-direction: column; gap: 10px;">`;

        p.options.forEach(opt => {
            const isColor = opt.name.toLowerCase().includes('color');

            optionsHTML += `<div class="option-group">
                <span style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:1px;">${opt.name}</span>
                <div class="option-values" style="display:flex; gap:8px; margin-top:5px; flex-wrap:wrap;">`;

            if (isColor) {
                optionsHTML += `<select class="color-select" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 6px; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 0.85rem; outline: none; margin-bottom: 5px; width: 100%;" data-action="update-option" data-product-id="${p.id}" data-option-name="${opt.name}">`;
                opt.values.forEach(val => {
                    const isSelected = activeOptions[p.id] && activeOptions[p.id][opt.name] === val;
                    optionsHTML += `<option value="${val.replace(/"/g, '&quot;')}" style="color: #000; background: #fff;" ${isSelected ? 'selected' : ''}>${val}</option>`;
                });
                optionsHTML += `</select>`;
            } else {
                const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', 'XXXL'];
                const sortedValues = [...opt.values].sort((a, b) => {
                    let aIdx = sizeOrder.indexOf(a.toUpperCase().trim());
                    let bIdx = sizeOrder.indexOf(b.toUpperCase().trim());
                    if (aIdx === -1) aIdx = 999;
                    if (bIdx === -1) bIdx = 999;
                    return aIdx - bIdx;
                });

                sortedValues.forEach(val => {
                    const isActive = activeOptions[p.id] && activeOptions[p.id][opt.name] === val;
                    optionsHTML += `<button class="size-pill ${isActive ? 'active' : ''}"
                        style="padding:4px 12px; border:1px solid ${isActive ? '#8B3FCC' : 'rgba(255,255,255,0.1)'}; background:${isActive ? 'rgba(139,63,204,0.1)' : 'transparent'}; color:#fff; border-radius:4px; cursor:pointer; font-size:0.8rem;"
                        data-action="update-option" data-product-id="${p.id}" data-option-name="${opt.name}" data-option-value="${val.replace(/"/g, '&quot;')}">
                        ${val}
                    </button>`;
                });
            }

            optionsHTML += `</div></div>`;
        });
        optionsHTML += `</div>`;
    }
    return optionsHTML;
}

function closeQuickView() {
    const overlay = document.getElementById('quick-view-overlay');
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        
        const url = new URL(window.location);
        url.searchParams.delete('product');
        window.history.pushState({}, '', url);
    }
}

async function shareProduct(productId) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;

    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${slugify(product.title)}`;
    const shareText = `¡Mira este producto en MYOOZ InC: ${product.title}!`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: product.title,
                text: shareText,
                url: shareUrl
            });
        } catch (err) {
            console.log('Share cancelled or failed');
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareUrl);
            const toast = document.getElementById('share-toast');
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        } catch (err) {
            alert('Enlace: ' + shareUrl);
        }
    }
}

// ========== RENDER GRID ==========
function renderMerchGrid(containerId, filterCategory = 'all', isCompact = false) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (isCompact) grid.classList.add('compact');
    else grid.classList.remove('compact');

    if (catalogProducts.length === 0) {
        catalogProducts = loadCatalog();
    }

    if (catalogProducts.length === 0) {
        grid.innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1; padding: 3rem;">Error: No se pudo cargar el catálogo de productos.</p>';
        return;
    }

    function getProductBrand(product) {
        const tags = (product.tags || []).map(t => t.toLowerCase());
        const title = product.title.toLowerCase();
        const checkOrder = ['ggb beats logo', 'ggb beats', 'joss', 'rasta mia', 'myooz inc'];
        
        for (const brand of checkOrder) {
            const compactBrand = brand.replace(/\s/g, ''); 
            if (tags.some(t => t.includes(brand) || t.replace(/\s/g, '').includes(compactBrand))) {
                return brand;
            }
        }
        for (const brand of checkOrder) {
            const compactBrand = brand.replace(/\s/g, ''); 
            if (title.includes(brand) || title.replace(/\s/g, '').includes(compactBrand)) {
                return brand;
            }
        }
        return 'myooz inc'; 
    }

    function matchesFilter(product, target) {
        const t = target.toLowerCase().trim();
        const brand = getProductBrand(product);
        
        if (t === 'ggb beats logo') return brand === 'ggb beats logo';
        if (t === 'myooz inc' || t === 'myooz') return brand === 'myooz inc';
        // Inclusive filter for main store GGB button (includes regular and logo merch)
        if (t === 'ggb beats' || t === 'ggb') return brand === 'ggb beats' || brand === 'ggb beats logo';
        if (t === 'rasta mia') return brand === 'rasta mia';
        if (t === 'joss') return brand === 'joss';
        
        return false;
    }

    const brandDisplayOrder = ['myooz inc', 'ggb beats logo', 'joss', 'rasta mia', 'ggb beats'];

    const sortWithinBrand = (a, b) => {
        const aBrand = getProductBrand(a);
        const bBrand = getProductBrand(b);
        
        // Special sorting for GGB Beats filter: Logo items first, then others
        if (filterCategory.toLowerCase().includes('ggb')) {
            if (aBrand === 'ggb beats logo' && bBrand !== 'ggb beats logo') return -1;
            if (aBrand !== 'ggb beats logo' && bBrand === 'ggb beats logo') return 1;
        }
        
        // Special case for hat/cap within GGB Beats Logo
        if (aBrand === 'ggb beats logo' && bBrand === 'ggb beats logo') {
            const aIsHat = a.title.toLowerCase().includes('hat') || a.title.toLowerCase().includes('cap');
            const bIsHat = b.title.toLowerCase().includes('hat') || b.title.toLowerCase().includes('cap');
            if (aIsHat && !bIsHat) return -1;
            if (!aIsHat && bIsHat) return 1;
        }
        
        return a.title.localeCompare(b.title);
    };

    let filtered;
    if (filterCategory === 'all') {
        filtered = [...catalogProducts].sort((a, b) => {
            const aBrand = getProductBrand(a);
            const bBrand = getProductBrand(b);
            const aIdx = brandDisplayOrder.indexOf(aBrand);
            const bIdx = brandDisplayOrder.indexOf(bBrand);
            
            if (aIdx !== bIdx) return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
            return sortWithinBrand(a, b);
        });
    } else {
        filtered = catalogProducts.filter(p => matchesFilter(p, filterCategory));
        filtered.sort(sortWithinBrand);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results-state" style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.03); border-radius: 24px; border: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.5;">🛍️</div>
                <h3 style="color: #fff; font-family: 'Outfit'; font-size: 1.8rem; margin-bottom: 1rem;">No hay productos en esta categoría</h3>
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

            // Set default color if specified
            if (p.defaultColor) {
                const colorOpt = p.options.find(o => o.name.toLowerCase().includes('color'));
                if (colorOpt && colorOpt.values.includes(p.defaultColor)) {
                    activeOptions[p.id][colorOpt.name] = p.defaultColor;
                }
            }

            // Find matching initial variant
            let initialVariant = p.variants.find(v =>
                v.selectedOptions.every(so => activeOptions[p.id][so.name] === so.value)
            );
            selectedVariants[p.id] = initialVariant || p.variants[0];
        }

        const variant = selectedVariants[p.id] || p.variants[0];
        const price = variant.price.amount;
        const imageUrl = variant.image ? variant.image.src : (p.images[0] ? p.images[0].src : '');

        const optionsHTML = renderOptionsHTML(p);

        return `
            <div class="product-card" data-id="${p.id}" data-category="${p.vendor}">
                <div class="product-image-wrapper" data-action="quick-view" data-product-id="${p.id}" style="cursor: zoom-in;">
                    <img id="img-${p.id}" src="${imageUrl}" alt="${p.title}" style="transition: opacity 0.2s;">
                </div>
                <div class="product-meta">
                    <span class="product-tag">${p.productType || p.vendor || 'MYOOZ'}</span>
                    <h3 class="product-name">${p.title}</h3>
                    <div class="product-price" id="price-${p.id}">
                        <small>USD</small> $${parseFloat(price).toFixed(2)}
                    </div>
                    ${optionsHTML}
                    <button class="add-to-cart-btn" data-action="add-to-cart" data-product-id="${p.id}" style="margin-top:auto;">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Event Delegation
    grid.onclick = function(e) {
        const qvTrigger = e.target.closest('[data-action="quick-view"]');
        if (qvTrigger) { openQuickView(qvTrigger.dataset.productId); return; }

        const addBtn = e.target.closest('[data-action="add-to-cart"]');
        if (addBtn) { addProductToCart(addBtn.dataset.productId, addBtn); return; }

        const sizeBtn = e.target.closest('[data-action="update-option"]');
        if (sizeBtn && sizeBtn.tagName === 'BUTTON') {
            updateProductOption(sizeBtn.dataset.productId, sizeBtn.dataset.optionName, sizeBtn.dataset.optionValue);
        }
    };

    grid.onchange = function(e) {
        const sel = e.target.closest('[data-action="update-option"]');
        if (sel && sel.tagName === 'SELECT') {
            updateProductOption(sel.dataset.productId, sel.dataset.optionName, e.target.value);
        }
    };

    checkUrlParams();
}

// ========== OPTION SWITCHING ==========
function updateProductOption(productId, optionName, optionValue) {
    if (!activeOptions[productId]) activeOptions[productId] = {};
    activeOptions[productId][optionName] = optionValue;

    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;

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

    // Update active states for size buttons in DOM
    const imgEl = document.getElementById(`img-${productId}`);
    if (!imgEl) return;
    const card = imgEl.closest('.product-card');
    if (!card) return;

    const isColor = optionName.toLowerCase().includes('color');
    if (!isColor) {
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
function addProductToCart(productId, btnEl) {
    const product = catalogProducts.find(p => p.id === productId);
    if (!product) return;
    const variant = selectedVariants[productId] || product.variants[0];

    if (typeof window.addItemToCart === 'function') {
        window.addItemToCart({
            id: product.id,
            name: product.title,
            price: parseFloat(variant.price.amount),
            image: variant.image ? variant.image.src : (product.images[0] ? product.images[0].src : ''),
        }, {
            id: variant.id,
            label: variant.title
        }, false, btnEl);
    } else {
        console.warn('addItemToCart no está disponible');
    }
}

// ========== DEEP LINKING ==========
function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const productRef = params.get('product');
    if (productRef && catalogProducts.length > 0) {
        const product = catalogProducts.find(p => slugify(p.title) === productRef) || 
                        catalogProducts.find(p => p.id === productRef);
        if (product) {
            openQuickView(product.id);
        }
    }
}

// Exponer globalmente
window.renderMerchGrid = renderMerchGrid;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
