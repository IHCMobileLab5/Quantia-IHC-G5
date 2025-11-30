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
                    icon.textContent = 'Ocultar';
                } else {
                    input.type = 'password';
                    icon.textContent = 'Mostrar';
                }
            });
        });
    }

    function setupAuthRedirect(supabaseClient) {
        const isAuthPage =
            document.querySelector('#signup-form') ||
            document.querySelector('#login-form');

        if (!isAuthPage) return;

        supabaseClient.auth.getUser().then(({ data: { user } }) => {
            if (user) window.location.href = '/profile.html';
        });
    }

    function setupSignupForm(supabaseClient) {
        const form = document.querySelector('#signup-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.querySelector('#signup-email');
            const passwordInput = document.querySelector('#signup-password');
            const errorElement = document.querySelector('#password-error');

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // --- VALIDACIÓN US001 ---
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

            if (!passwordRegex.test(password)) {
                errorElement.textContent =
                    'La contraseña debe tener 8 o más caracteres e incluir letras y números.';
                passwordInput.focus();
                return;
            } else {
                errorElement.textContent = '';
            }
            // --- FIN VALIDACIÓN US001 ---


            // --- Registro en Supabase ---
            const { error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin + '/profile.html'
                }
            });

            if (error) {
                alert('Error al registrarse: ' + error.message);
            } else {
                alert('Registro exitoso. Revisa tu correo para confirmar la cuenta.');
            }
        });
    }



    function setupLoginForm(supabaseClient) {
        const form = document.querySelector('#login-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('#login-email').value;
            const password = document.querySelector('#login-password').value;

            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                alert('Error al iniciar sesión: ' + error.message);
            } else {
                window.location.href = '/profile.html';
            }
        });
    }


    function setupOAuthButtons(supabaseClient) {
        const providers = [
            { selector: '.btn-google', provider: 'google' },
            { selector: '.btn-facebook', provider: 'facebook' },
            { selector: '.btn-linkedin', provider: 'linkedin_oidc' }
        ];

        providers.forEach(({ selector, provider }) => {
            const btn = document.querySelector(selector);
            if (!btn) return;

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider,
                    options: { redirectTo: '/profile.html' }
                });
                if (error) {
                    alert(`Error al iniciar con ${provider}: ` + error.message);
                }
            });
        });
    }

    function setupProfilePage(supabaseClient) {
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const deleteBtn = document.getElementById('delete-btn');
        const signoutBtn = document.getElementById('signout-btn');

        if (!userName && !userEmail && !deleteBtn && !signoutBtn) return;

        async function loadUser() {
            const { data, error } = await supabaseClient.auth.getUser();
            if (error) {
                console.error(error);
                alert('Error obteniendo el usuario.');
                return;
            }

            const user = data.user;
            if (!user) {
                alert('No has iniciado sesión.');
                window.location.href = 'signup.html';
                return;
            }

            if (userName) {
                userName.textContent = user.user_metadata?.full_name || 'Sin nombre';
            }
            if (userEmail) {
                userEmail.textContent = user.email;
            }
        }

        loadUser();

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const { data, error } = await supabaseClient.auth.getUser();
                if (error) {
                    alert('Error obteniendo el usuario actual.');
                    return;
                }

                const user = data.user;
                if (!user) {
                    alert('Inicia sesión primero.');
                    return;
                }

                if (!confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) {
                    return;
                }

                try {
                    await fetch('/delete-user', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ user_id: user.id })
                    });

                    alert('Usuario y datos eliminados.');
                    await supabaseClient.auth.signOut();
                    window.location.href = 'signup.html';
                } catch (err) {
                    console.error(err);
                    alert('Error eliminando la cuenta.');
                }
            });
        }

        if (signoutBtn) {
            signoutBtn.addEventListener('click', async () => {
                await supabaseClient.auth.signOut();
                window.location.href = 'signup.html';
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupNavAndHero();
        setupSupabaseFeatures();
    });