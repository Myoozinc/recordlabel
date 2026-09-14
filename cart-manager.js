// Shared Cart Management for MYOOZ InC
// Pagos Directos con PayPal Business + Pedidos a Printful + Notificaciones

// Credencial de PayPal Business (Modo En Vivo)
const PAYPAL_CLIENT_ID = 'BAAbCe7Zx61uFdJGTQWbOSlYgdDKBL8r4Q-G3eUOjZ1GpqaVkm4c4LQRsqKHJBXUzrGiNmd207OkgiAyPg';

let cart = JSON.parse(localStorage.getItem('myooz_cart')) || [];
let paypalButtonsRendered = false;
let lastRenderedTotal = 0;

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
        // Un solo servicio o paquete activo a la vez
        const existingServiceIndex = cart.findIndex(item => item.isService);
        const servicePayload = {
            uniqueId: 'services-bundle-' + Date.now(),
            id: product.id,
            name: product.name,
            price: product.price,
            variantId: variant ? variant.id : 'service-std',
            variantName: variant ? variant.label : 'Servicio',
            image: product.image || '/images/myooz-inc-logo.png',
            isService: true,
            details: product.details || product.name
        };

        if (existingServiceIndex > -1) {
            cart[existingServiceIndex] = servicePayload;
        } else {
            cart.push(servicePayload);
        }
    } else {
        // Producto de Merchandising
        cart.push({
            uniqueId: (Date.now() + Math.random()).toString(),
            id: product.id,
            name: product.name,
            price: product.price,
            variantId: variant ? variant.id : 'default',
            variantName: variant ? variant.label : 'Estándar',
            image: product.image,
            isService: false
        });
    }
    
    saveCart();
    
    // Feedback visual en botón que lo originó
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
            
            const drawer = document.getElementById('cart-drawer');
            if (drawer && !drawer.classList.contains('open')) {
                toggleCart();
            }
        }, 600);
    } else {
        const drawer = document.getElementById('cart-drawer');
        if (drawer && !drawer.classList.contains('open')) {
            toggleCart();
        }
    }
};

window.removeFromCart = function(uniqueId) {
    cart = cart.filter(item => String(item.uniqueId) !== String(uniqueId));
    saveCart();
    renderCart();
};

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total-display');
    const paypalContainer = document.getElementById('paypal-button-container');
    const checkoutBtn = document.getElementById('checkout-continue-btn');
    const statusMsg = document.getElementById('order-status-msg');

    if (!container || !totalDisplay) return;

    if (statusMsg) {
        statusMsg.style.display = 'none';
        statusMsg.innerText = '';
    }

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.5; margin-top:3rem;">Tu carrito está vacío</p>';
        totalDisplay.innerText = '$0.00';
        if (paypalContainer) paypalContainer.innerHTML = '';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        paypalButtonsRendered = false;
        lastRenderedTotal = 0;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-img" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-variant">${item.variantName || ''}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                ${item.isService ? `<div style="font-size:0.65rem; color:rgba(255,255,255,0.5); margin-top:4px;">${item.details || ''}</div>` : ''}
            </div>
            <div class="remove-item" data-action="remove-item" data-unique-id="${item.uniqueId}" style="cursor:pointer;">Eliminar</div>
        </div>
    `).join('');

    container.onclick = function(e) {
        const removeBtn = e.target.closest('[data-action="remove-item"]');
        if (removeBtn) removeFromCart(removeBtn.dataset.uniqueId);
    };

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDisplay.innerText = '$' + total.toFixed(2);

    // Renderiza o refresca los botones de PayPal
    if (paypalContainer) {
        if (!paypalButtonsRendered || lastRenderedTotal !== total) {
            initPayPalButtons(paypalContainer, total);
        }
    }
}

// Inicialización de Botones de PayPal Smart
function initPayPalButtons(container, total) {
    if (typeof paypal === 'undefined') {
        // Carga dinámica del SDK de PayPal si no está en la página
        if (!document.getElementById('paypal-sdk-script')) {
            const s = document.createElement('script');
            s.id = 'paypal-sdk-script';
            s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&components=buttons`;
            s.onload = () => initPayPalButtons(container, total);
            document.head.appendChild(s);
        }
        return;
    }

    container.innerHTML = '';
    paypalButtonsRendered = true;
    lastRenderedTotal = total;

    const hasMerch = cart.some(i => !i.isService);

    paypal.Buttons({
        style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'pill',
            label: 'pay'
        },
        createOrder: function(data, actions) {
            const currentTotalStr = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
            
            const items = cart.map(i => ({
                name: (i.name + (i.variantName ? ' - ' + i.variantName : '')).substring(0, 120),
                unit_amount: { currency_code: 'USD', value: i.price.toFixed(2) },
                quantity: '1'
            }));

            return actions.order.create({
                purchase_units: [{
                    description: 'MYOOZ InC - Pedido',
                    amount: {
                        currency_code: 'USD',
                        value: currentTotalStr,
                        breakdown: {
                            item_total: { currency_code: 'USD', value: currentTotalStr }
                        }
                    },
                    items: items
                }],
                application_context: {
                    shipping_preference: hasMerch ? 'GET_FROM_FILE' : 'NO_SHIPPING'
                }
            });
        },
        onApprove: function(data, actions) {
            const statusMsg = document.getElementById('order-status-msg');
            if (statusMsg) {
                statusMsg.style.display = 'block';
                statusMsg.innerText = 'PROCESANDO PAGO Y CREANDO ORDEN...';
            }

            return actions.order.capture().then(async function(orderData) {
                const payer = orderData.payer || {};
                const purchaseUnit = (orderData.purchase_units && orderData.purchase_units[0]) ? orderData.purchase_units[0] : {};
                const shipping = purchaseUnit.shipping || {};
                const transactionId = (purchaseUnit.payments && purchaseUnit.payments.captures && purchaseUnit.payments.captures[0]) 
                    ? purchaseUnit.payments.captures[0].id 
                    : orderData.id;

                const recipientName = (shipping.name && shipping.name.full_name) || 
                                      (payer.name ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() : 'Cliente');

                const payload = {
                    orderId: orderData.id,
                    transactionId: transactionId,
                    payer: {
                        name: recipientName,
                        email: payer.email_address || ''
                    },
                    shippingAddress: shipping.address || null,
                    recipientName: recipientName,
                    cart: [...cart],
                    total: cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)
                };

                // 1. Enviar a Vercel Serverless Function (/api/process-order)
                try {
                    await fetch('/api/process-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                } catch (apiErr) {
                    console.warn('Backend serverless error, fallback activo:', apiErr);
                }

                // 2. Respaldo por Web3Forms (Asegura entrega garantizada de correo a Myooz InC)
                await sendBackupEmailNotification(payload);

                // 3. Limpiar carrito y mostrar modal de éxito
                const orderSummaryText = cart.map(i => `${i.name} (${i.variantName})`).join(', ');
                cart = [];
                saveCart();
                renderCart();

                if (typeof showModal === 'function') {
                    showModal('¡PAGO EXITOSO!', `Muchas gracias por tu compra. Tu pedido #${transactionId.substring(0, 10)} está confirmado. Recibirás todos los detalles en tu correo.`);
                } else {
                    alert(`¡Pago completado con éxito!\nID de Transacción: ${transactionId}\nRecibirás la confirmación en tu correo.`);
                }
            });
        },
        onError: function(err) {
            console.error('PayPal Checkout Error:', err);
            const statusMsg = document.getElementById('order-status-msg');
            if (statusMsg) {
                statusMsg.style.display = 'block';
                statusMsg.style.color = '#ff4444';
                statusMsg.innerText = 'Hubo un error procesando el pago. Por favor intenta de nuevo.';
            }
        }
    }).render(container);
}

// Respaldo inmediato por Web3Forms
async function sendBackupEmailNotification(payload) {
    try {
        const itemsList = payload.cart.map(i => `- ${i.name} [${i.variantName}] x 1: $${i.price} USD`).join('\n');
        const addr = payload.shippingAddress;
        const shippingDetails = addr ? `
DIRECCIÓN DE ENVÍO:
- Destinatario: ${payload.recipientName}
- Dirección: ${addr.address_line_1 || ''} ${addr.address_line_2 || ''}
- Ciudad: ${addr.admin_area_2 || addr.city || ''}
- Estado/Provincia: ${addr.admin_area_1 || addr.state || ''}
- Código Postal: ${addr.postal_code || ''}
- País: ${addr.country_code || ''}
` : 'NO REQUIERE ENVÍO FÍSICO (Servicios)';

        const bodyMsg = `
¡NUEVO PAGO CONFIRMADO EN MYOOZ INC!
========================================
ID de Transacción PayPal: ${payload.transactionId}
Total Pagado: $${payload.total} USD

CLIENTE:
- Nombre: ${payload.payer.name}
- Email: ${payload.payer.email}

${shippingDetails}

PRODUCTOS / SERVICIOS CONTRATADOS:
${itemsList}

Fecha: ${new Date().toLocaleString()}
========================================
`;

        await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key: 'b91241a6-e5bd-482b-b19b-7d1f707121fa',
                subject: `💰 ¡NUEVO PEDIDO PAGADO! - $${payload.total} USD - ${payload.payer.name}`,
                from_name: 'MYOOZ InC Tienda',
                message: bodyMsg
            })
        });
    } catch (e) {
        console.error('Error enviando notificación de respaldo:', e);
    }
}

// Inicialización Global
window.addEventListener('load', () => {
    updateCartUI();
});

window.addEventListener('pageshow', () => {
    const btn = document.getElementById('checkout-continue-btn');
    if (btn) {
        btn.innerText = 'PAGAR';
        btn.disabled = false;
        btn.style.opacity = '1';
    }
});
