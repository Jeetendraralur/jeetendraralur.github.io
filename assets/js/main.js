// Apply theme immediately before rendering to prevent flash of light theme
(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
    // Determine path depth (root vs subfolders like /blog/)
    const isSubfolder = window.location.pathname.includes('/blog/');
    const prefix = isSubfolder ? '../' : './';

    // Inject Background Canvas
    if (!document.getElementById('bgCanvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'bgCanvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    // Load Simulation Script dynamically if not already loaded
    if (!document.querySelector(`script[src*="simulation.js"]`)) {
        const script = document.createElement('script');
        script.src = `${prefix}assets/js/simulation.js`;
        document.body.appendChild(script);
    }

    // 1. Inject Header (if container exists - not on individual posts)
    const headerContainer = document.getElementById('header-container');
    if (headerContainer) {
        headerContainer.innerHTML = `
            <header>
                <h1><a href="${prefix}index.html" style="text-decoration: none; color: inherit;">Jeetendra</a></h1>
                <p class="description">Physics | Computation | Optimistic fatalist</p>
            </header>
        `;
    }

    // 2. Inject Navigation (with dynamic path prefixes and theme toggle)
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        navContainer.innerHTML = `
            <nav class="nav-bar">
                <div class="nav-links">
                    <a href="${prefix}index.html" class="nav-link" id="nav-home">Home</a>
                    <a href="${prefix}blog/index.html" class="nav-link" id="nav-blog">Blog</a>
                    <a href="https://github.com/Jeetendraralur" target="_blank" class="nav-link">GitHub</a>
                    <a href="https://www.linkedin.com/in/jeetendraralur/" target="_blank" class="nav-link">LinkedIn</a>
                    <a href="https://letterboxd.com/Jeetsu07/" target="_blank" class="nav-link">Letterboxd</a>
                </div>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
                    <svg class="sun-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <svg class="moon-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </button>
            </nav>
        `;

        // Highlight active nav item
        const homeNav = document.getElementById('nav-home');
        const blogNav = document.getElementById('nav-blog');
        const path = window.location.pathname;
        if (path.includes('/blog/')) {
            if (blogNav) blogNav.classList.add('active');
        } else {
            if (homeNav) homeNav.classList.add('active');
        }
    }

    // 3. Inject Footer
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = `
            <footer>
                <p class="description">&copy; 2026 Jeetendra R. Built with simplicity in mind.</p>
            </footer>
        `;
    }

    // 4. Setup Theme Toggle Functionality
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});
