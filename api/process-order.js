// /api/process-order.js - Vercel Serverless Function
// Procesa órdenes pagadas por PayPal: envía a Printful API y notifica por email al administrador

export default async function handler(req, res) {
    // Permitir CORS básico si es necesario
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    try {
        const { orderId, transactionId, payer, shippingAddress, recipientName, cart, total } = req.body || {};

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Carrito vacío o inválido' });
        }

        const merchItems = cart.filter(i => !i.isService);
        const serviceItems = cart.filter(i => i.isService);

        // ── 1. Construir Notificación Detallada por Correo ──
        const itemsListText = cart.map(item => {
            const variantStr = item.variantName ? ` [${item.variantName}]` : '';
            return `• ${item.name}${variantStr} - $${item.price} USD`;
        }).join('\n');

        const shippingText = shippingAddress ? `
DIRECCIÓN DE ENTREGA (Vía PayPal):
- Destinatario: ${recipientName || payer?.name || 'Cliente'}
- Calle: ${shippingAddress.address_line_1 || ''} ${shippingAddress.address_line_2 || ''}
- Ciudad: ${shippingAddress.admin_area_2 || shippingAddress.city || ''}
- Estado/Provincia: ${shippingAddress.admin_area_1 || shippingAddress.state || ''}
- Código Postal: ${shippingAddress.postal_code || ''}
- País: ${shippingAddress.country_code || ''}
` : 'NO REQUIERE ENVÍO FÍSICO (Servicios Audiovisuales)';

        const fullMessage = `
¡NUEVO PAGO CONFIRMADO EN MYOOZ INC!
==================================================
ID Transacción PayPal: ${transactionId || orderId}
Total Pagado: $${total} USD

DATOS DEL CLIENTE:
- Nombre: ${payer?.name || recipientName || 'Cliente'}
- Email: ${payer?.email || 'No proporcionado'}

${shippingText}

ARTÍCULOS CONTRATADOS / COMPRADOS:
${itemsListText}

Tipo de Pedido: ${merchItems.length > 0 ? (serviceItems.length > 0 ? 'Merch + Servicios' : 'Merchandising Printful') : 'Servicios Audiovisuales'}
Fecha: ${new Date().toLocaleString()}
==================================================
`;

        // Envío de correo al administrador vía Web3Forms
        const web3formsKey = process.env.WEB3FORMS_KEY || 'b91241a6-e5bd-482b-b19b-7d1f707121fa';
        let emailSent = false;
        try {
            const emailRes = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: web3formsKey,
                    subject: `🛍️ ¡NUEVA ORDEN PAGADA! - $${total} USD - ${recipientName || payer?.name || 'Cliente'}`,
                    from_name: 'MYOOZ InC Tienda',
                    message: fullMessage
                })
            });
            emailSent = emailRes.ok;
        } catch (mailErr) {
            console.error('Error enviando notificación Web3Forms:', mailErr);
        }

        // ── 2. Despachar a Printful API (Si hay Merch y clave configurada) ──
        let printfulResult = null;
        const printfulApiKey = process.env.PRINTFUL_API_KEY;

        if (printfulApiKey && merchItems.length > 0 && shippingAddress) {
            try {
                // Preparamos items para Printful
                const printfulItems = merchItems.map(item => {
                    if (item.printfulSyncVariantId) {
                        return {
                            sync_variant_id: item.printfulSyncVariantId,
                            quantity: 1
                        };
                    }
                    // Creación como item descriptivo o borrador
                    return {
                        name: `${item.name} (${item.variantName || 'Estándar'})`,
                        retail_price: item.price.toString(),
                        quantity: 1
                    };
                });

                const printfulBody = {
                    recipient: {
                        name: recipientName || payer?.name || 'Cliente',
                        address1: shippingAddress.address_line_1,
                        address2: shippingAddress.address_line_2 || '',
                        city: shippingAddress.admin_area_2 || shippingAddress.city || '',
                        state_code: shippingAddress.admin_area_1 || shippingAddress.state || '',
                        country_code: shippingAddress.country_code,
                        zip: shippingAddress.postal_code,
                        email: payer?.email || ''
                    },
                    items: printfulItems,
                    retail_costs: {
                        currency: 'USD',
                        total: total.toString()
                    }
                };

                const pfRes = await fetch('https://api.printful.com/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${printfulApiKey}`
                    },
                    body: JSON.stringify(printfulBody)
                });

                printfulResult = await pfRes.json();
                console.log('Respuesta de Printful API:', printfulResult);
            } catch (pfErr) {
                console.error('Error llamando a la API de Printful:', pfErr);
                printfulResult = { error: pfErr.message };
            }
        }

        return res.status(200).json({
            success: true,
            transactionId: transactionId || orderId,
            emailNotified: emailSent,
            printful: printfulResult || { status: 'manual_or_pending_token' }
        });

    } catch (err) {
        console.error('Error en /api/process-order:', err);
        return res.status(500).json({ error: err.message });
    }
}
