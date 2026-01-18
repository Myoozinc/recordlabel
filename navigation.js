// Navigation component - dynamically sets active state
document.addEventListener('DOMContentLoaded', function() {
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
});

// Load navigation HTML
function loadNavigation() {
    const nav = `
        <nav class="custom-header">
            <div class="logo-container">
                <img src="logo.png" alt="MYOOZ InC Logo" class="logo-img">
                <div class="logo-text">MYOOZ INC</div>
            </div>
            <div class="nav-links">
                <a href="index.html">Inicio</a>
                <a href="artistas.html">Artistas</a>
                <a href="ggbbeats.html">GGB Beats</a>
                <a href="tienda.html">Tienda</a>
            </div>
        </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', nav);
}

// Load footer HTML
function loadFooter() {
    const footer = `
        <footer>
            <div class="social-links">
                <a href="https://www.youtube.com/@myoozinc" class="social-icon" target="_blank">▶</a>
                <a href="https://www.instagram.com/myooz.inc/" class="social-icon" target="_blank">📷</a>
                <a href="https://www.facebook.com/myooz.inc/" class="social-icon" target="_blank">f</a>
            </div>
            <p>© 2024 MYOOZ InC</p>
            <p>
                <a href="#">Política de Privacidad</a> | 
                <a href="#">Política de Cookies</a>
            </p>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footer);
}
