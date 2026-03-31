// Selection tracking
const selectedVariants = {};

// Merch Rendering Logic for MYOOZ InC Label
function renderMerchGrid(containerId, filterCategory = 'all', isCompact = false) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    if (isCompact) {
        grid.classList.add('compact');
    } else {
        grid.classList.remove('compact');
    }

    const filtered = filterCategory === 'all' 
        ? merchProducts 
        : merchProducts.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results-state" style="grid-column: 1/-1; text-align: center; padding: 6rem 2rem; background: rgba(255,255,255,0.03); border-radius: 24px; border: 1px dashed rgba(255,255,255,0.1);">
                <div style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.5;">🛍️</div>
                <h3 style="color: #fff; font-family: 'Outfit'; font-size: 1.8rem; margin-bottom: 1rem;">No se encontraron productos</h3>
                <p style="color: rgba(255,255,255,0.5); font-size: 1.1rem; max-width: 400px; margin: 0 auto;">Estamos actualizando el inventario de esta categoría. ¡Vuelve pronto para ver las novedades!</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        // Initialize selection if not exists
        if (!selectedVariants[p.id]) {
            selectedVariants[p.id] = p.variants[0];
        }
        
        const activeVariant = selectedVariants[p.id];

        return `
            <div class="product-card" data-category="${p.category}">
                <div class="product-image-wrapper">
                    <img id="img-${p.id}" src="${activeVariant.image}" alt="${p.name}" onerror="this.src='https://placehold.co/400x400/050505/8b3fcc?text=${p.name.replace(/ /g, '+')}'">
                </div>
                <div class="product-meta">
                    <span class="product-tag">${p.tag}</span>
                    <h3 class="product-name">${p.name}</h3>
                    <div class="product-price">
                        <small>USD</small> $${p.price.toFixed(2)}
                    </div>
                    
                    ${p.variants.length > 1 ? `
                        <div class="variant-selector">
                            ${p.variants.map((v, idx) => `
                                <div class="variant-dot ${activeVariant.id === v.id ? 'active' : ''}" 
                                     style="background-color: ${v.color}" 
                                     onclick="switchProductVariant('${p.id}', '${v.id}', this)">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
                        AÑADIR AL CARRITO
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function switchProductVariant(productId, variantId, dotEl) {
    const product = merchProducts.find(p => p.id === productId);
    const variant = product.variants.find(v => v.id === variantId);
    
    // Store selection
    selectedVariants[productId] = variant;

    // Update image
    const img = document.getElementById(`img-${productId}`);
    if (img) {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = variant.image;
            img.style.opacity = '1';
        }, 300);
    }

    // Update dots
    const dots = dotEl.parentElement.querySelectorAll('.variant-dot');
    dots.forEach(d => d.classList.remove('active'));
    dotEl.classList.add('active');
}

function addToCart(productId) {
    const product = merchProducts.find(p => p.id === productId);
    const variant = selectedVariants[productId] || product.variants[0];
    
    // Global cart logic (assumed to be in tienda.html or global)
    if (window.addItemToCart) {
        window.addItemToCart(product, variant);
    } else {
        console.warn('Cart logic not initialized');
    }
}
