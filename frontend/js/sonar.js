class SonarRadar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Configurações do radar
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.8;
        this.radius = Math.min(this.centerX, this.centerY) * 0.9;
        
        // Estado do radar
        this.angle = 0;
        this.scanDirection = 1;
        this.scanSpeed = 0.02;
        this.maxDistance = 5;
        this.detections = [];
        this.alertMode = false;
        
        // Cores
        this.colors = {
            radarGreen: '#00ff00',
            radarDarkGreen: '#003300',
            alertRed: '#ff0000',
            gridLines: '#002200',
            scanLine: '#00ff00',
            scanLineAlert: '#ff0000'
        };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height * 0.8;
        this.radius = Math.min(this.centerX, this.centerY) * 0.9;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawRadarBackground();
        this.drawRadarGrid();
        this.updateScan();
        this.drawScanLine();
        this.drawDetections();
        requestAnimationFrame(() => this.animate());
    }
    
    drawRadarBackground() {
        // Fundo gradiente
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.radius
        );
        
        if (this.alertMode) {
            gradient.addColorStop(0, 'rgba(102, 0, 0, 0.7)');
            gradient.addColorStop(1, 'rgba(10, 0, 0, 0.1)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 40, 0, 0.7)');
            gradient.addColorStop(1, 'rgba(0, 10, 0, 0.1)');
        }
        
        // Desenhar meia-lua
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, Math.PI, 0, false);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Borda
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, Math.PI, 0, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.alertMode ? this.colors.alertRed : this.colors.radarGreen;
        this.ctx.stroke();
    }
    
    drawRadarGrid() {
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeStyle = this.colors.gridLines;
        
        // Arcos de distância
        for (let i = 1; i <= 4; i++) {
            const r = (this.radius / 4) * i;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, r, Math.PI, 0, false);
            this.ctx.stroke();
        }
        
        // Linhas de ângulo
        for (let angle = 0; angle <= 180; angle += 30) {
            const rad = (angle * Math.PI) / 180;
            const x = this.centerX + this.radius * Math.cos(rad);
            const y = this.centerY - this.radius * Math.sin(rad);
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }
    
    updateScan() {
        this.angle += this.scanSpeed * this.scanDirection;
        if (this.angle <= 0 || this.angle >= Math.PI) {
            this.scanDirection *= -1;
        }
    }
    
    drawScanLine() {
        const x = this.centerX + this.radius * Math.cos(this.angle);
        const y = this.centerY - this.radius * Math.sin(this.angle);
        
        // Linha de varredura
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(x, y);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.alertMode ? this.colors.scanLineAlert : this.colors.scanLine;
        this.ctx.stroke();
        
        // Ponto no final
        this.ctx.beginPath();
        this.ctx.arc(x, y, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.alertMode ? this.colors.alertRed : this.colors.radarGreen;
        this.ctx.fill();
        
        // Efeito de brilho
        if (!this.alertMode) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.lineWidth = 8;
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
            this.ctx.stroke();
        }
    }
    
    drawDetections() {
        const now = Date.now();
        this.detections = this.detections.filter(d => now - d.time < 8000);
        
        this.detections.forEach(detection => {
            const { distance, angle, alert } = detection;
            const normalizedDistance = Math.min(distance / this.maxDistance, 1);
            const radius = normalizedDistance * this.radius;
            const radAngle = (angle * Math.PI) / 180;
            
            const x = this.centerX + radius * Math.cos(radAngle);
            const y = this.centerY - radius * Math.sin(radAngle);
            
            // Ponto de detecção
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            
            if (alert) {
                const blink = Math.sin(now / 200) > 0;
                this.ctx.fillStyle = blink ? this.colors.alertRed : 'rgba(255, 0, 0, 0.5)';
                
                // Anel pulsante
                this.ctx.beginPath();
                this.ctx.arc(x, y, 12 + Math.sin(now / 300) * 4, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            } else {
                this.ctx.fillStyle = this.colors.radarGreen;
            }
            
            this.ctx.fill();
            
            // Brilho interno
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        });
    }
    
    addDetection(distance, angle, alert = false) {
        const clampedDistance = Math.min(distance, this.maxDistance);
        
        this.detections.push({
            distance: clampedDistance,
            angle: angle,
            alert: alert,
            time: Date.now()
        });
        
        if (alert) {
            this.alertMode = true;
            setTimeout(() => {
                this.alertMode = false;
            }, 3000);
        }
        
        if (this.detections.length > 15) {
            this.detections.shift();
        }
    }
    
    setAlertMode(active) {
        this.alertMode = active;
    }
    
    clearDetections() {
        this.detections = [];
    }
    
    setMaxDistance(distance) {
        this.maxDistance = distance;
    }
}