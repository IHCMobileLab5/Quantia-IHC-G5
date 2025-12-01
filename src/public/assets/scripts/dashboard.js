const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");

const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");

const profileBtn = document.getElementById("profileBtn");
const drawerProfileBtn = document.getElementById("drawerProfileBtn");

function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
}

function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.add("is-open");
    drawerBackdrop.classList.add("is-show");
}

function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("is-open");
    drawerBackdrop.classList.remove("is-show");
}

function getUserName() {
    const raw = localStorage.getItem("quantia_user");
    if (!raw) return "Usuario";

    try {
        const parsed = JSON.parse(raw);
        let name =
            parsed?.name ||
            parsed?.fullName ||
            parsed?.username ||
            parsed?.email ||
            parsed?.user?.name ||
            parsed?.user?.fullName ||
            "";

        name = String(name).trim();
        return name || "Usuario";
    } catch {
        const name = String(raw).trim();
        return name || "Usuario";
    }
}

(function renderUserName() {
    const el = document.getElementById("userName");
    if (!el) return;
    el.textContent = getUserName();
})();

(function initTheme() {
    const saved = localStorage.getItem("quantia_theme");
    if (saved === "dark") document.body.classList.add("theme-dark");
    themeBtn?.setAttribute(
        "aria-pressed",
        document.body.classList.contains("theme-dark") ? "true" : "false"
    );
})();

themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    const isDark = document.body.classList.contains("theme-dark");
    localStorage.setItem("quantia_theme", isDark ? "dark" : "light");
    themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
});

backBtn?.addEventListener("click", () => history.back());

menuBtn?.addEventListener("click", () => {
    if (!isMobile()) return;
    if (drawer?.classList.contains("is-open")) closeDrawer();
    else openDrawer();
});

drawerBackdrop?.addEventListener("click", closeDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
});

function setActiveByHref(href) {
    document.querySelectorAll(".nav__btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".drawer__btn").forEach((b) => b.classList.remove("is-active"));

    document.querySelector(`.nav__btn[data-href="${href}"]`)?.classList.add("is-active");
    document.querySelector(`.drawer__btn[data-href="${href}"]`)?.classList.add("is-active");
}

function go(href) {
    if (!href) return;
    setActiveByHref(href);
    if (isMobile()) closeDrawer();
    window.location.href = href;
}

document.querySelectorAll(".nav__btn").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.getAttribute("data-href")));
});

document.querySelectorAll(".drawer__btn").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.getAttribute("data-href")));
});

(function initActiveFromUrl() {
    const file = (location.pathname.split("/").pop() || "").trim();
    if (!file) return;
    setActiveByHref(file);
})();

profileBtn?.addEventListener("click", () => go("profile.html"));
drawerProfileBtn?.addEventListener("click", () => go("profile.html"));

window.addEventListener("resize", () => {
    if (!isMobile()) closeDrawer();
});

const barsChartBtn = document.getElementById("barsChartBtn");
barsChartBtn?.addEventListener("click", () => go("portfolio-performance.html"));

// 1. Datos simulados del portafolio (Mock Data)
const mockPortfolio = {
    totalValue: 15230,
    dailyChange: 1.8,
    currency: "USD",
    riskProfile: "Moderado"
};

// 2. Elementos del DOM
const voiceBtn = document.getElementById('voiceBtn');
const voiceTooltip = document.getElementById('voiceTooltip');
const voiceWrapper = document.querySelector('.voice-wrapper');
const aiCard = document.getElementById('aiCard');
const aiResponseText = document.getElementById('aiResponseText');
const aiActions = document.getElementById('aiActions');
const closeAiCard = document.getElementById('closeAiCard');

// 3. Configuración de API de Voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Idioma español
    recognition.continuous = false;

    // Evento: Al empezar a hablar
    recognition.onstart = () => {
        voiceWrapper.classList.add('active'); // Muestra tooltip
        voiceBtn.classList.add('is-listening');
        voiceTooltip.textContent = "Escuchando...";
    };

    // Evento: Al terminar de hablar
    recognition.onend = () => {
        voiceBtn.classList.remove('is-listening');
        voiceWrapper.classList.remove('active');
    };

    // Evento: Al recibir resultado
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log("Usuario dijo:", transcript);

        // Simular tiempo de procesamiento (UI Feedback)
        voiceBtn.classList.add('is-processing');
        voiceTooltip.textContent = "Analizando...";
        voiceWrapper.classList.add('active');

        setTimeout(() => {
            voiceBtn.classList.remove('is-processing');
            voiceWrapper.classList.remove('active');
            processCommand(transcript);
        }, 1500); // 1.5 segundos de "pensamiento"
    };
} else {
    alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
}

// 4. Lógica de Negocio (El cerebro de la IA)
function processCommand(text) {
    let response = "";
    let buttonsHTML = "";

    // 1. ESTADO DEL PORTAFOLIO
    if (text.includes("portafolio") || text.includes("estado") || text.includes("cuánto tengo")) {
        response = `Tu portafolio tiene un valor de ${mockPortfolio.currency} ${mockPortfolio.totalValue.toLocaleString()} y hoy subió +${mockPortfolio.dailyChange}%.`;
        buttonsHTML = `
            <button class="btn-ai btn-secondary" onclick="triggerVoice()">Nueva Consulta</button>
            <button class="btn-ai btn-primary" onclick="showRecommendations()">Recomendaciones</button>
        `;
    }
    // 2. RECOMENDACIONES (Llamada directa)
    else if (text.includes("recomendación") || text.includes("consejo") || text.includes("invertir")) {
        showRecommendations();
        return; // Salimos porque showRecommendations ya maneja la UI
    }
    // 3. NAVEGACIÓN POR VOZ
    else if (text.includes("ir a") || text.includes("ver") || text.includes("navegar")) {
        if (text.includes("mercado")) {
            speak("Navegando a Mercados.");
            setTimeout(() => go("market.html"), 1000);
        }
        else if (text.includes("perfil") || text.includes("cuenta")) {
            speak("Abriendo tu perfil.");
            setTimeout(() => go("profile.html"), 1000);
        }
        else if (text.includes("transferencia")) {
            speak("Vamos a la sección de transferencias.");
            setTimeout(() => go("transfer.html"), 1000);
        }
        else {
            response = "Puedo llevarte a Mercados, Perfil o Transferencias. ¿A dónde quieres ir?";
            showCard(response, "");
            speak(response);
        }
        return; // Salimos para no ejecutar el código final doble vez
    }
    // 4. GLOSARIO / DEFINICIONES
    else if (text.includes("qué es") || text.includes("significa") || text.includes("definición")) {
        let explicacion = "";

        if (text.includes("etf")) {
            explicacion = "Un ETF es un fondo que cotiza en bolsa, como si fuera una acción. Te permite invertir en muchas empresas a la vez con bajo riesgo.";
        }
        else if (text.includes("stop loss") || text.includes("stop-loss")) {
            explicacion = "El Stop-Loss es una orden automática para vender tu activo si el precio baja demasiado, protegiéndote de pérdidas mayores.";
        }
        else {
            explicacion = "Puedo explicarte términos como ETF, Stop-Loss o ROI. ¿Cuál necesitas?";
        }

        const btnEdu = `<button class="btn-ai btn-primary" onclick="window.location.href='education.html'">Ver curso completo</button>`;
        showCard(explicacion, btnEdu);
        speak(explicacion);
        return; // Salimos aquí
    }
    // 5. CASO POR DEFECTO (No entendió)
    else {
        response = "No entendí bien. Intenta decir: 'Estado de mi portafolio' o 'Dame un consejo'.";
        buttonsHTML = `<button class="btn-ai btn-primary" onclick="triggerVoice()">Intentar de nuevo</button>`;
    }

    // Ejecución final (Solo para casos 1 y 5 que no tienen return)
    showCard(response, buttonsHTML);
    speak(response);
}

// Función específica para mostrar la recomendación (Drill-down)
function showRecommendations() {
    const response = `Diversificar en ETFs de renta variable USA. Basado en tu perfil ${mockPortfolio.riskProfile}, la IA recomienda asignar un 30-40% a ETFs del S&P 500.`;
    const buttonsHTML = `
        <button class="btn-ai btn-secondary">Simular impacto</button>
        <button class="btn-ai btn-primary">Agregar al portafolio</button>
    `;
    showCard(response, buttonsHTML);
    speak(response);
}

// 5. Funciones de UI
function showCard(text, buttons) {
    aiResponseText.innerText = text;
    aiActions.innerHTML = buttons;
    aiCard.classList.add('is-visible');
}

function closeCard() {
    aiCard.classList.remove('is-visible');
    window.speechSynthesis.cancel(); // Detener voz si cierra
}

// 6. Síntesis de voz (Text-to-Speech)
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

// 7. Event Listeners
voiceBtn?.addEventListener('click', () => {
    if (recognition) recognition.start();
});

closeAiCard?.addEventListener('click', closeCard);

// Exponer triggerVoice globalmente para usarlo en los botones HTML inyectados
window.triggerVoice = () => {
    closeCard();
    if (recognition) recognition.start();
};
let primerSaludo = true;

voiceBtn?.addEventListener('click', () => {
    if (primerSaludo) {
        // Simular que la IA te da un dato antes de escucharte
        const saludo = "Hola. Hoy el Bitcoin subió un 5%. ¿En qué te ayudo?";
        showCard(saludo, "");
        speak(saludo);
        primerSaludo = false;

        // Activar el micrófono automáticamente después de que hable (aprox 3 seg)
        setTimeout(() => {
            if (recognition) recognition.start();
        }, 3500);
    } else {
        // Si ya no es el primer saludo, escucha directo
        if (recognition) recognition.start();
    }
});


