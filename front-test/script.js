// Configuração
const API_URL = 'http://localhost:8080/api/radar/dados';
const UPDATE_INTERVAL = 200; // ms
let alertMode = false;

// Elementos DOM
const statusText = document.getElementById('status-text');
const angleValue = document.getElementById('angle-value');
const distanceValue = document.getElementById('distance-value');
const timestamp = document.getElementById('timestamp');
const sweepLine = document.getElementById('sweep-line');
const distanceFill = document.getElementById('distance-fill');
const radarScreen = document.querySelector('.radar-screen');
const container = document.querySelector('.container');

// Atualizar a interface
async function updateRadar() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // Atualizar dados
        const angle = data.angle || 0;
        const distance = data.distance || 0;
        const isAlert = data.alert || false;
        
        // Atualizar elementos
        angleValue.textContent = `${angle}°`;
        distanceValue.textContent = `${distance.toFixed(1)} cm`;
        timestamp.textContent = data.timestamp || '--:--:--';
        
        // Atualizar linha do radar
        sweepLine.style.transform = `rotate(${angle}deg)`;
        
        // Atualizar barra de distância (0-400cm)
        const fillPercentage = Math.min((distance / 400) * 100, 100);
        distanceFill.style.width = `${fillPercentage}%`;
        
        // Gerenciar modo de alerta
        if (isAlert && !alertMode) {
            enterAlertMode();
        } else if (!isAlert && alertMode) {
            exitAlertMode();
        }
        
        // Cor da barra baseada na distância
        if (distance <= 10) {
            distanceFill.style.background = 'linear-gradient(90deg, #ff0000, #cc0000)';
        } else if (distance <= 50) {
            distanceFill.style.background = 'linear-gradient(90deg, #ffff00, #cccc00)';
        } else {
            distanceFill.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
        }
        
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        statusText.textContent = 'ERRO';
        statusText.className = 'status-alert';
    }
}

// Entrar em modo de alerta
function enterAlertMode() {
    alertMode = true;
    statusText.textContent = 'ALERTA!';
    statusText.className = 'status-alert';
    radarScreen.classList.add('alert-mode');
    container.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
    
    // Efeito de piscar
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
        statusText.style.opacity = statusText.style.opacity === '0.5' ? '1' : '0.5';
        blinkCount++;
        
        if (blinkCount > 20) { // Limitar piscadas
            clearInterval(blinkInterval);
        }
    }, 300);
}

// Sair do modo de alerta
function exitAlertMode() {
    alertMode = false;
    statusText.textContent = 'NORMAL';
    statusText.className = 'status-normal';
    radarScreen.classList.remove('alert-mode');
    container.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.3)';
    statusText.style.opacity = '1';
}

// Iniciar atualização periódica
function startUpdating() {
    updateRadar(); // Primeira atualização
    setInterval(updateRadar, UPDATE_INTERVAL);
}

// Simulação de dados para teste (remover em produção)
function simulateData() {
    if (!window.location.hostname.includes('localhost')) {
        return;
    }
    
    // Simular resposta da API
    window.fetch = async function() {
        const angle = Math.floor(Math.random() * 181);
        const distance = Math.random() * 400;
        const alert = distance <= 10;
        
        return {
            json: async () => ({
                angle: angle,
                distance: distance,
                alert: alert,
                timestamp: new Date().toLocaleTimeString()
            })
        };
    };
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    // simulateData(); // Descomentar para testar sem API
    startUpdating();
});