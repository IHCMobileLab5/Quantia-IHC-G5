function goBack() {
    window.history.back();
}

function changeTimeFrame(frame) {
    const buttons = document.querySelectorAll(".time-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    document.querySelector(".time-btn[onclick=\"changeTimeFrame('" + frame + "')\"]")
        .classList.add("active");

    const datasets = {
        "1H": "0,120 50,110 100,90 150,100 200,70 250,40 300,80 350,75 400,85 450,80 500,70 550,60 600,80",
        "1D": "0,150 50,130 100,160 150,140 200,120 250,100 300,130 350,110 400,140 450,120 500,150 550,160 600,140",
        "1W": "0,180 100,150 200,170 300,130 400,160 500,140 600,180"
    };

    document.getElementById("chart-polyline").setAttribute("points", datasets[frame]);
}

function changeChartType(type) {
    const polyline = document.getElementById("chart-polyline");

    if (type === "area") {
        polyline.setAttribute("fill", "rgba(59,95,159,0.2)");
    } else {
        polyline.setAttribute("fill", "none");
    }

    if (type === "line") {
        polyline.setAttribute("stroke", "#3b5f9f");
        polyline.setAttribute("stroke-width", "3");
    }

    if (type === "bar") {
        polyline.setAttribute("points",
            "0,200 0,80 50,200 50,120 100,200 100,90 150,200 150,110 200,200 200,70"
        );
    }

    if (type === "candlestick") {
        polyline.setAttribute("points",
            "10,150 10,80 60,130 60,90 110,160 110,120 160,140 160,100 210,170 210,110"
        );
    }
}

function addToWatchlist() {
    alert("Activo añadido a tu lista de seguimiento ✔");
}

function updateGauge(value) {
    const angle = 180 * (value / 100);
    const rad = angle * Math.PI / 180;

    const cx = 100, cy = 80, r = 80;

    const endX = cx + r * Math.cos(Math.PI - rad);
    const endY = cy - r * Math.sin(Math.PI - rad);

    const progress = document.getElementById("gauge-progress");
    progress.setAttribute("d", `M 20 80 A 80 80 0 0 1 ${endX} ${endY}`);

    const needle = document.getElementById("gauge-needle");
    needle.setAttribute("x2", endX);
    needle.setAttribute("y2", endY);

    if (value <= 33) {
        progress.setAttribute("stroke", "#ff5e5e");
    } else if (value <= 66) {
        progress.setAttribute("stroke", "#fcd34d");
    } else {
        progress.setAttribute("stroke", "#4ecdc4");
    }
}

setInterval(() => {
    updateGauge(Math.floor(Math.random() * 100));
}, 2000);

setInterval(() => {
    const price = (101 + Math.random()).toFixed(2);
    document.getElementById("current-price").innerText = price;

    const bidIndicator = document.getElementById("bid-indicator");
    bidIndicator.style.color = Math.random() > 0.5 ? "green" : "red";
}, 2000);
