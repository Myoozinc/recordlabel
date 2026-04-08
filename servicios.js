    const modal = document.getElementById('service-modal');
    const promosModal = document.getElementById('promos-modal');
    const hiddenServicesInput = document.getElementById('hidden-services');
    const checkboxes = document.querySelectorAll('.service-checkbox input[type="checkbox"]');
    const form = document.getElementById('service-form');
    let currentTotal = 0;
    let isPromoSelected = false;

    function openModal() {
        modal.classList.add('active');
        isPromoSelected = false;
        currentActivePromoServices = []; // Clear current promo items
        document.getElementById('services-checklist-group').style.display = 'block';

        // Remove any old promo summaries
        const existingNotice = document.getElementById('active-promo-notice');
        if(existingNotice) existingNotice.remove();
        
        const labels = document.querySelectorAll('.service-checkbox');
        labels.forEach(label => label.style.display = 'flex');

        resetCheckboxes();
        calculateTotal();
    }

    function closeModal() {
        modal.classList.remove('active');
        currentActivePromoServices = [];
    }

    function openPromosModal() {
        closeModal();
        promosModal.classList.add('active');
    }

    function closePromosModal() {
        promosModal.classList.remove('active');
    }

    function resetCheckboxes() {
        checkboxes.forEach(cb => cb.checked = false);
    }

    let currentActivePromoServices = [];

    function selectPromo(name, price, services, originalPrice) {
        closePromosModal();
        openModal();
        isPromoSelected = true;
        currentActivePromoServices = services.split(', ');
        
        document.getElementById('services-checklist-group').style.display = 'none';
        hiddenServicesInput.value = `PROMO: ${name} (${services})`;
        document.getElementById('total-display').textContent = '$' + price;
        currentTotal = price;
        
        const promoNotice = document.createElement('div');
        promoNotice.id = 'active-promo-notice';
        promoNotice.style.background = 'rgba(255, 255, 255, 0.04)';
        promoNotice.style.border = '1px solid #300359';
        promoNotice.style.borderRadius = '12px';
        promoNotice.style.padding = '2rem';
        promoNotice.style.marginBottom = '2rem';
        
        let servicesListHtml = currentActivePromoServices.map(s => `<div style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; opacity: 0.8; font-size: 0.9rem; color: #fff;">
            <span style="color: var(--purple-glow);">✓</span> ${s}
        </div>`).join('');

        promoNotice.innerHTML = `
            <div style="font-weight: 800; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: baseline;">
                <span style="text-transform: uppercase; letter-spacing: 1px;">PAQUETE: ${name}</span>
                <span style="color: var(--text-secondary); text-decoration: line-through; font-size: 0.9rem;">$${originalPrice}</span>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; margin-bottom: 1.5rem;">
                <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary); margin-bottom: 1rem;">Servicios Incluidos:</div>
                ${servicesListHtml}
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button type="button" onclick="openPromosModal()" style="background: transparent; color: var(--purple-glow); border: 1px solid var(--purple-glow); padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; cursor: pointer; transition: 0.3s;">← Volver a Promos</button>
            </div>
        `;
        
        const existingNotice = document.getElementById('active-promo-notice');
        if(existingNotice) existingNotice.remove();
        
        document.getElementById('service-form').prepend(promoNotice);
        updatePaymentVisibility();
    }

    function calculateTotal() {
        if(isPromoSelected) return;
        
        let total = 0;
        const selectedSet = new Set();
        let selectedNames = [];

        if(currentActivePromoServices.length > 0) {
            currentActivePromoServices.forEach(s => selectedSet.add(s));
        }

        checkboxes.forEach(cb => {
            if(cb.checked) {
                const price = parseInt(cb.getAttribute('data-price'), 10);
                const name = cb.getAttribute('data-service');
                total += price;
                selectedNames.push(name);
                selectedSet.add(name);
            }
        });

        if(selectedSet.has('Mix') && selectedSet.has('Master')) {
            total -= 100;
            const noticeHtml = `<div id="mix-master-discount-tag" style="color: #00ff88; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; text-align: right;">Descuento Mix+Master Aplicado: -$100 USD</div>`;
            const container = document.getElementById('smart-promo-container');
            if(container) container.innerHTML = noticeHtml;
        } else {
            const tag = document.getElementById('mix-master-discount-tag');
            if(tag) tag.remove();
        }

        document.getElementById('total-display').textContent = '$' + total;
        currentTotal = total;
        
        if(selectedNames.length > 0) {
            hiddenServicesInput.value = selectedNames.join(', ');
        } else {
            hiddenServicesInput.value = '';
        }
        
        checkForSmartPromos(selectedSet, total);
        updatePaymentVisibility();
    }

    function checkForSmartPromos(selectedSet, currentTotalValue) {
        const existingBanners = document.querySelectorAll('.smart-promo-banner');
        existingBanners.forEach(b => b.remove());

        const allPromos = [
            { id: 'upgrade-ia', name: 'Paquete Upgrade IA', price: 120, original: 200, services: ['Mix', 'Master', 'Mejora de Canción IA'] },
            { id: 'artiste-indie', name: 'Paquete Artista Independiente', price: 250, original: 400, services: ['Beat Exclusivo', 'Mix', 'Master'] },
            { id: 'audiovisual-pro', name: 'Paquete Audiovisual Pro', price: 350, original: 450, services: ['Beat Exclusivo', 'Mix', 'Master', 'Edición de Videoclip'] },
            { id: 'emprendedor-musical', name: 'Paquete Emprendedor Musical', price: 399, original: 600, services: ['Beat Exclusivo', 'Mix', 'Master', 'Campaña Viral 50 Reels'] },
            { id: 'millon-vibes', name: 'Código del Millón', price: 799, original: 1200, services: ['Beat Exclusivo', 'Mix', 'Master', 'Producción de Videoclip IA', 'Campaña Viral 50 Reels', 'Management Estratégico'] }
        ];

        let bestPromo = null;
        let highestMatchCount = 0;
        let maxSavings = -9999;

        allPromos.forEach(promo => {
            const matches = promo.services.filter(s => selectedSet.has(s));
            if(matches.length >= 1) {
                const savings = currentTotalValue - promo.price;
                if(matches.length > highestMatchCount) {
                    highestMatchCount = matches.length;
                    maxSavings = savings;
                    bestPromo = { ...promo, actualSavings: savings, matchedServices: matches };
                } else if (matches.length === highestMatchCount && savings > maxSavings) {
                    maxSavings = savings;
                    bestPromo = { ...promo, actualSavings: savings, matchedServices: matches };
                }
            }
        });

        if(bestPromo) {
            const banner = document.createElement('div');
            banner.className = 'smart-promo-banner';
            banner.style.background = 'rgba(255, 255, 255, 0.04)';
            banner.style.border = '1px solid #300359';
            banner.style.borderRadius = '12px';
            banner.style.padding = '1.5rem';
            banner.style.marginBottom = '2rem';
            banner.style.cursor = 'pointer';
            banner.style.transition = 'all 0.3s';
            
            const extraServices = bestPromo.services.filter(s => !selectedSet.has(s));
            const extraServicesHtml = extraServices.length > 0 
                ? `<div style="font-size: 0.75rem; color: #fff; opacity: 0.7; margin-top: 0.8rem;">
                    <strong style="color: var(--purple-glow);">TE LLEVAS EXTRA:</strong> ${extraServices.join(', ')}
                   </div>`
                : '';

            banner.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <div style="color: var(--purple-glow); font-weight: 800; font-size: 0.65rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 0.3rem;">TE CONVIENE ESTA PROMO</div>
                        <div style="color: #fff; font-weight: 900; font-size: 1.1rem; text-transform: uppercase;">${bestPromo.name}</div>
                        ${extraServicesHtml}
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #fff; font-weight: 800; font-size: 1.2rem;">$${bestPromo.price}</div>
                        <div style="color: #00ff88; font-weight: 700; font-size: 0.7rem; text-transform: uppercase;">AHORRAS $${bestPromo.actualSavings}</div>
                    </div>
                </div>
            `;
            
            banner.onclick = () => selectPromo(bestPromo.name, bestPromo.price, bestPromo.services.join(', '), bestPromo.original);
            document.getElementById('smart-promo-container').appendChild(banner);
        }
    }

    function updatePaymentVisibility() {
        const submitBtn = document.getElementById('btn-submit-form');

        if(currentTotal > 0) {
            submitBtn.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerText = 'AÑADIR AL CARRITO';
            submitBtn.onclick = addServicesToCart;
        } else {
            submitBtn.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.innerText = 'Selecciona un servicio para comenzar';
            submitBtn.onclick = null;
        }
    }

    async function addServicesToCart() {
        const btn = document.getElementById('btn-submit-form');
        const originalText = btn.innerText;
        btn.innerText = 'PROCESSING...';
        btn.disabled = true;

        try {
            // Fetch products to find bridge product (needed for variant ID)
            if (shopifyProducts.length === 0) {
                shopifyProducts = await fetchAllProducts();
            }
            const serviceProduct = shopifyProducts.find(p => p.title.toLowerCase().includes('servicios myooz'));
            if (!serviceProduct) throw new Error('Bridge product not found');

            const variantId = serviceProduct.variants[0].id;
            const trackingDetails = `Servicios: ${hiddenServicesInput.value} | Total: $${currentTotal}`;

            window.addItemToCart({
                id: serviceProduct.id,
                name: "SERVICIOS MYOOZ InC",
                price: currentTotal,
                image: 'images/myooz-inc-logo.png', // Fallback icon
                details: trackingDetails
            }, {
                id: variantId,
                label: "Servicios"
            }, true);

            btn.innerText = 'AÑADIDO';
            setTimeout(() => {
                closeModal();
                toggleCart();
            }, 800);

        } catch (e) {
            console.error('Error adding services to cart', e);
            btn.innerText = 'Error';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) closeModal();
        if (event.target == promosModal) closePromosModal();
    }

// Event Delegation for CSP Compliance
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        // Buttons
        if (e.target.closest('[data-action="open-promos"]')) openPromosModal();
        else if (e.target.closest('[data-action="open-modal"]')) openModal();
        else if (e.target.closest('[data-action="close-promos"]')) closePromosModal();
        else if (e.target.closest('[data-action="close-modal"]')) closeModal();
        
        // Promo Select
        const promoBtn = e.target.closest('[data-action="select-promo"]');
        if (promoBtn) {
            selectPromo(
                promoBtn.dataset.name, 
                parseInt(promoBtn.dataset.price), 
                promoBtn.dataset.services, 
                parseInt(promoBtn.dataset.original)
            );
        }
    });

    document.body.addEventListener('change', (e) => {
        if (e.target.closest('[data-action="calculate-total"]')) {
            calculateTotal();
        }
    });
});
