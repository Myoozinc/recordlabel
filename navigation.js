// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            const noHeaderPages = ['rasta-mia', 'joss', 'prodbycarrot', 'ggbbeats', 'mnimalbeats', 'patanegra'];
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const currentPage = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'index';
            if (!noHeaderPages.includes(currentPage)) {
                document.body.insertAdjacentHTML('afterbegin', data);
                setActiveNavLink();
            }
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => console.error('Error loading footer:', error));

    // Load cart drawer ONLY on shop-enabled pages
    const shopPages = ['servicios', 'tienda', 'joss', 'rasta-mia', 'ggbbeats'];
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'index';

    if (shopPages.includes(currentPage)) {
        fetch('/cart-drawer.html')
            .then(response => response.text())
            .then(data => {
                document.body.insertAdjacentHTML('beforeend', data);
                
                // Re-sync cart UI if cart-manager is present
                if (typeof updateCartUI === 'function') {
                    updateCartUI();
                }
            })
            .catch(error => console.error('Error loading cart drawer:', error));
    }

    // ── Cart Event Delegation (CSP-compliant) ──
    // Handles clicks on dynamically-injected cart-drawer buttons
    document.body.addEventListener('click', function(e) {
        const toggle = e.target.closest('[data-action="toggle-cart"]');
        if (toggle && typeof toggleCart === 'function') {
            toggleCart();
            return;
        }
        const checkout = e.target.closest('[data-action="checkout"]');
        if (checkout && typeof processUnifiedCheckout === 'function') {
            processUnifiedCheckout();
            return;
        }
    });
});

// Set active state on navigation links
function setActiveNavLink() {
    // Get current page directory
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentPageMatch = pathSegments.length > 0 ? `/${pathSegments[pathSegments.length - 1]}/` : '/';
    
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Set active class on current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPageMatch) {
            link.classList.add('active');
        }
    });
}

// --- GTM Spotify Tracking ---
document.addEventListener('click', function(e) {
    const spotifyLink = e.target.closest('a[href*="spotify.com"]');
    if (spotifyLink && window.dataLayer) {
        window.dataLayer.push({
            'event': 'spotify_click',
            'spotify_url': spotifyLink.href,
            'spotify_artist': spotifyLink.closest('.talent-content') || spotifyLink.closest('.hero-content') ? document.title.split('|')[0].trim() : 'General'
        });
    }
});
