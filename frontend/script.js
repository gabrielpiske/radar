const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;
const R = W / 2;

// lista de pontos detectados
let pontos = [];

async function buscarDados() {
    try {
        const resp = await fetch("http://localhost:8080/api/radar/dados");
        const dado = await resp.json();

        let angulo = parseFloat(dado.angulo);
        let dist = parseFloat(dado.distancia);

        if (isNaN(angulo) || isNaN(dist)) return;

        atualizarRadar(angulo, dist);

    } catch (e) {
        console.log("Erro API", e);
    }
}

function atualizarRadar(angulo, distancia) {
    ctx.clearRect(0, 0, W, H);

    // desenha círculos concêntricos
    for (let r = R; r > 0; r -= 60) {
        ctx.beginPath();
        ctx.arc(R, R, r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,0,0.3)";
        ctx.stroke();
    }

    // desenha linha de varredura
    let rad = angulo * Math.PI / 180;

    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.lineTo(R + Math.cos(rad) * R, R + Math.sin(rad) * R);
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // calcula posição do ponto
    if (distancia < 200) { // filtro
        let d = (distancia / 200) * R;

        let x = R + Math.cos(rad) * d;
        let y = R + Math.sin(rad) * d;

        pontos.push({ x, y, tempo: Date.now() });
    }

    // desenhar pontos que duram 1s
    let agora = Date.now();
    pontos = pontos.filter(p => agora - p.tempo < 1000);

    pontos.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,0,0,1)";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "red";
        ctx.fill();
    });
}

// Atualiza 20x por segundo
setInterval(buscarDados, 50);
