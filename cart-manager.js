// Shared Cart Management for MYOOZ InC
let cart = JSON.parse(localStorage.getItem('myooz_cart')) || [];

function saveCart() {
    localStorage.setItem('myooz_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const counts = document.querySelectorAll('.cart-count');
    counts.forEach(c => c.innerText = cart.length);
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) {
        drawer.classList.toggle('open');
        renderCart();
    }
}

window.addItemToCart = function(product, variant, isService = false, triggerBtn = null) {
    if (isService) {
        // Handle services as a special bundle or update existing service item
        const existingServiceIndex = cart.findIndex(item => item.isService);
        if (existingServiceIndex > -1) {
            cart[existingServiceIndex] = {
                uniqueId: 'services-bundle',
                id: product.id,
                name: product.name,
                price: product.price,
                variantId: variant.id,
                variantName: variant.label,
                image: product.image,
                isService: true,
                details: product.details // attributes for Shopify
            };
        } else {
            cart.push({
                uniqueId: 'services-bundle',
                id: product.id,
                name: product.name,
                price: product.price,
                variantId: variant.id,
                variantName: variant.label,
                image: product.image,
                isService: true,
                details: product.details
            });
        }
    } else {
        // Standard merch item
        cart.push({
            uniqueId: (Date.now() + Math.random()).toString(),
            id: product.id,
            name: product.name,
            price: product.price,
            variantId: variant.id,
            variantName: variant.label,
            image: product.image,
            isService: false
        });
    }
    
    saveCart();
    
    // Feedback on trigger button if possible
    const _btn = triggerBtn || (typeof event !== 'undefined' && event && event.target && event.target.tagName === 'BUTTON' ? event.target : null);
    if (_btn && _btn.innerText) {
        const btn = _btn;
        const originalText = btn.innerText;
        btn.innerText = '¡AÑADIDO!';
        const originalBg = btn.style.background;
        btn.style.background = '#8B3FCC';
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = originalBg;
            
            // Auto open the cart drawer for better UX
            if (btn.innerText !== 'PROCESSING...') {
                const drawer = document.getElementById('cart-drawer');
                if (drawer && !drawer.classList.contains('open')) {
                    toggleCart();
                }
            }
        }, 800);
    } else {
        // Fallback open if no event
        const drawer = document.getElementById('cart-drawer');
        if (drawer && !drawer.classList.contains('open')) {
            toggleCart();
        }
    }
};

window.removeFromCart = function(uniqueId) {
    // String comparison to be safe
    cart = cart.filter(item => String(item.uniqueId) !== String(uniqueId));
    saveCart();
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total-display');
    if (!container || !totalDisplay) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:3rem;">Tu carrito está vacío</p>';
        totalDisplay.innerText = '$0.00';
        const checkoutBtn = document.getElementById('checkout-continue-btn');
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-variant">${item.variantName || ''}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                ${item.isService ? `<div style="font-size:0.6rem; color:rgba(255,255,255,0.4); margin-top:4px;">${item.details}</div>` : ''}
            </div>
            <div class="remove-item" data-action="remove-item" data-unique-id="${item.uniqueId}" style="cursor:pointer;">Eliminar</div>
        </div>
    `).join('');

    // ── Event Delegation (CSP-compliant — replaces inline onclick) ──
    container.onclick = function(e) {
        const removeBtn = e.target.closest('[data-action="remove-item"]');
        if (removeBtn) removeFromCart(removeBtn.dataset.uniqueId);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDisplay.innerText = '$' + total.toFixed(2);
    const checkoutBtn = document.getElementById('checkout-continue-btn');
    if (checkoutBtn) checkoutBtn.style.display = 'block';
}

async function processUnifiedCheckout() {
    const btn = document.getElementById('checkout-continue-btn');
    if (!btn) return;
    
    btn.innerText = 'PROCESSING...';
    btn.disabled = true;

    try {
        // Group items for Shopify
        // For services, we use the bridge product variant and quantity = total price
        // For merch, we use variant ID and quantity = count
        
        const lineItems = [];
        const attributes = [];
        
        // Find service bridge product variant ID if services are present
        const hasServices = cart.some(item => item.isService);
        let serviceVariantId = null;
        
        if (hasServices) {
            // We'll use the ID stored in the item or fetch it
            const serviceItem = cart.find(item => item.isService);
            serviceVariantId = serviceItem.variantId;
            
            lineItems.push({
                variantId: serviceVariantId,
                quantity: Math.round(serviceItem.price) // Price as quantity
            });
            
            attributes.push({
                key: "Detalle de Servicios Contratados",
                value: serviceItem.details
            });
        }
        
        // Process merch items
        const merchItems = cart.filter(item => !item.isService);
        const variantCounts = {};
        merchItems.forEach(item => {
            variantCounts[item.variantId] = (variantCounts[item.variantId] || 0) + 1;
        });
        
        for (const [vId, qty] of Object.entries(variantCounts)) {
            lineItems.push({
                variantId: vId,
                quantity: qty
            });
        }

        // Create the cart via Storefront API (merch-renderer.js should be loaded)
        if (typeof createCart !== 'function') {
            throw new Error('Shopify API not loaded');
        }
        
        const shopifyCart = await createCart(lineItems, attributes);
        
        // Final Redirect - MOBILE FRIENDLY
        if (shopifyCart && shopifyCart.checkoutUrl) {
            btn.innerText = 'REDIRECCIONANDO...';
            
            // Try direct location change first
            window.location.href = shopifyCart.checkoutUrl;
            
            // Fallback for some mobile browsers that block redirect after async
            setTimeout(() => {
                const fallbackLink = document.createElement('a');
                fallbackLink.href = shopifyCart.checkoutUrl;
                fallbackLink.innerText = 'Si no has sido redireccionado, haz clic aquí';
                fallbackLink.style.cssText = 'color: #8B3FCC; font-size: 0.8rem; display: block; margin-top: 1rem; text-align: center; text-decoration: underline;';
                btn.parentNode.insertBefore(fallbackLink, btn.nextSibling);
                btn.innerText = 'PAGAR';
                btn.disabled = false;
            }, 3000);
        } else {
            throw new Error('No checkout URL returned from Shopify');
        }
        
    } catch (err) {
        console.error("Error creating unified Shopify cart", err);
        btn.innerText = 'Error. Intenta de nuevo.';
        alert("Hubo un problema al conectar con Shopify: " + (err.message || 'Error desconocido'));
        
        setTimeout(() => {
            btn.innerText = 'PAGAR';
            btn.disabled = false;
            btn.style.opacity = '1';
        }, 3000);
    }
}

// Global initialization
window.addEventListener('load', () => {
    updateCartUI();
});

window.addEventListener('pageshow', (event) => {
    const btn = document.getElementById('checkout-continue-btn');
    if (btn) {
        btn.innerText = 'PAGAR';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
});
