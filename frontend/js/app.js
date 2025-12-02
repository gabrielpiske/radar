const config = {
    apiUrl: 'http://localhost:8080/api/radar/dados',
    updateInterval: 100
};

let appState = {
    connected: false,
    lastDistance: 0,
    lastAngle: 0,
    radarState: 'NORMAL'
};

const radar = new SonarRadar('sonarCanvas');

const elements = {
    distanceValue: document.getElementById('distance-value'),
    angleValue: document.getElementById('angle-value'),
    radarState: document.getElementById('radar-state'),
    lastUpdate: document.getElementById('last-update'),
    connectionStatus: document.getElementById('connection-status'),
    status: document.getElementById('status')
};

function initApp() {
    console.log('Radar inicializado');
    startDataUpdate();
}

function startDataUpdate() {
    async function fetchData() {
        try {
            const response = await fetch(config.apiUrl);
            
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const data = await response.json();
            
            // Tratar diferentes formatos de resposta
            if (data && typeof data === 'object') {
                if (data.valor !== undefined) {
                    extractFromValor(data.valor);
                } else if (data.distance !== undefined) {
                    useDirectData(data.distance, data.angle);
                } else {
                    // Tentar extrair de qualquer propriedade
                    const anyValue = Object.values(data)[0];
                    if (typeof anyValue === 'string') {
                        extractFromValor(anyValue);
                    } else {
                        useSimulatedData();
                    }
                }
            } else {
                useSimulatedData();
            }
            
            appState.connected = true;
            updateConnectionStatus();
            
        } catch (error) {
            console.warn('Falha na conexão, usando dados simulados');
            appState.connected = false;
            updateConnectionStatus();
            useSimulatedData();
        }
    }
    
    setInterval(fetchData, config.updateInterval);
    fetchData();
}

function extractFromValor(valor) {
    if (!valor || typeof valor !== 'string') {
        useSimulatedData();
        return;
    }
    
    let distance = 0;
    
    // Tentar encontrar número no texto
    const numberMatch = valor.match(/\d+(\.\d+)?/);
    if (numberMatch) {
        distance = parseFloat(numberMatch[0]);
    }
    
    // Validar
    if (isNaN(distance) || distance > 400) distance = 0;
    
    const angle = getSimulatedAngle();
    const isAlert = distance > 0 && distance <= 10;
    
    updateAppState(distance, angle, isAlert);
}

function useDirectData(distance, angle) {
    const validDistance = isNaN(distance) ? 0 : Math.min(distance, 400);
    const validAngle = angle || getSimulatedAngle();
    const isAlert = validDistance > 0 && validDistance <= 10;
    
    updateAppState(validDistance, validAngle, isAlert);
}

function useSimulatedData() {
    const distance = Math.random() * 15;
    const angle = getSimulatedAngle();
    const isAlert = distance <= 2;
    
    updateAppState(distance, angle, isAlert);
}

function updateAppState(distance, angle, isAlert) {
    appState.lastDistance = distance;
    appState.lastAngle = angle;
    appState.radarState = isAlert ? 'ALERTA' : 'NORMAL';
    
    radar.addDetection(distance, angle, isAlert);
    radar.setAlertMode(isAlert);
    
    updateUI();
    updateTimestamp();
}

function getSimulatedAngle() {
    return Math.floor((Date.now() / 50) % 181);
}

function updateUI() {
    elements.distanceValue.textContent = appState.lastDistance > 0 ? 
        `${appState.lastDistance.toFixed(2)} m` : '--.-- m';
    
    elements.angleValue.textContent = `${appState.lastAngle}°`;
    
    elements.radarState.textContent = appState.radarState;
    elements.radarState.className = `data-value ${appState.radarState === 'ALERTA' ? 'state-alert' : 'state-normal'}`;
}

function updateConnectionStatus() {
    if (appState.connected) {
        elements.connectionStatus.textContent = '⚡ CONECTADO';
        elements.connectionStatus.className = 'status-connected';
        elements.status.textContent = '● ATIVO';
        elements.status.className = 'status-active';
    } else {
        elements.connectionStatus.textContent = '⚡ OFFLINE';
        elements.connectionStatus.className = 'status-disconnected';
        elements.status.textContent = '● OFFLINE';
        elements.status.className = 'status-disconnected';
    }
}

function updateTimestamp() {
    elements.lastUpdate.textContent = new Date().toLocaleTimeString();
}

document.addEventListener('DOMContentLoaded', initApp);