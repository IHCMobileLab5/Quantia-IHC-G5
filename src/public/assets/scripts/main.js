function setupNavAndHero() {
    const btnToggle = document.getElementById('btn-toggle');
    const nav = document.getElementById('nav');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section[id]');
    const aboutCards = document.querySelectorAll('.about-card');

    if (!nav) return;

    function openMenu() {
        nav.classList.add('open');
        if (overlay) overlay.classList.add('active');
        if (btnToggle) {
            btnToggle.classList.add('open');
            btnToggle.setAttribute('aria-expanded', 'true');
            btnToggle.setAttribute('aria-label', 'Cerrar menú');
        }
    }

    function closeMenu() {
        nav.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        if (btnToggle) {
            btnToggle.classList.remove('open');
            btnToggle.setAttribute('aria-expanded', 'false');
            btnToggle.setAttribute('aria-label', 'Abrir menú');
        }
    }

    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            if (nav.classList.contains('open')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Scroll suave al hacer clic en los links del nav
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');

            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const section = document.querySelector(targetId);
                if (section) {
                    const headerOffset = header ? header.offsetHeight : 0;
                    const elementTop = section.offsetTop;
                    const offsetTop = elementTop - headerOffset;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            closeMenu();
        });
    });

    // Cambiar link activo según scroll
    function updateActiveLinkOnScroll() {
        const headerHeight = header ? header.offsetHeight : 0;
        const scrollPos = window.scrollY + headerHeight + 10;

        let currentId = 'hero';

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                currentId = section.id;
            }
        });

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.slice(1) === currentId) {
                link.classList.add('active');
            } else if (href && href.startsWith('#')) {
                link.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLinkOnScroll);
    updateActiveLinkOnScroll();

    // Animación tarjetas "Misión / Visión / Valores"
    if ('IntersectionObserver' in window && aboutCards.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        aboutCards.forEach(card => observer.observe(card));
    } else {
        aboutCards.forEach(card => card.classList.add('show'));
    }
}
// FEAT 2: configuración supabase + toggle password
function setupSupabaseFeatures() {
    if (typeof supabase === 'undefined') {
        console.warn('Supabase SDK no está cargado; se deshabilitan las funciones de auth.');
        return;
    }

    const SUPABASE_URL = 'https://trwfkxsvzhhgibkwxjpl.supabase.co';
    const SUPABASE_ANON_KEY = 'TU_PUBLIC_ANON_KEY_AQUI';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    setupTogglePassword();
    setupAuthRedirect(supabaseClient);
    setupSignupForm(supabaseClient);
    setupLoginForm(supabaseClient);
    setupOAuthButtons(supabaseClient);
    setupProfilePage(supabaseClient);
}

function setupTogglePassword() {
    const toggles = document.querySelectorAll('.toggle-password');
    if (!toggles.length) return;

    toggles.forEach(icon => {
        icon.addEventListener('click', () => {
            const targetId = icon.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        });
    });
}