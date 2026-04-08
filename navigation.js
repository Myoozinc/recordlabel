// Load header and footer components
document.addEventListener('DOMContentLoaded', function() {
    // Load header
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            const noHeaderPages = ['rasta-mia.html', 'joss.html', 'prodbycarrot.html', 'ggbbeats.html', 'mnimalbeats.html', 'patanegra.html'];
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (!noHeaderPages.includes(currentPage)) {
                document.body.insertAdjacentHTML('afterbegin', data);
                setActiveNavLink();
            }
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => console.error('Error loading footer:', error));

    // Load cart drawer ONLY on shop-enabled pages
    const shopPages = ['servicios.html', 'tienda.html', 'joss.html', 'rasta-mia.html', 'ggbbeats.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (shopPages.includes(currentPage)) {
        fetch('cart-drawer.html')
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
});

// Set active state on navigation links
function setActiveNavLink() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Set active class on current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
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
