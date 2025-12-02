#include <Servo.h>

#define rele 2
#define trigPin 12
#define echoPin 11

#define LED_R 6   // LED Vermelho
#define LED_G 3   // LED Verde
#define LED_B 5   // LED Azul

Servo radar;

int currentPos = 0;
int stepDirection = 1;

unsigned long previousServoMillis = 0;
unsigned long previousSensorMillis = 0;
unsigned long objetoSaiuMillis = 0;
unsigned long piscaMillis = 0;

// INTERVALOS
const int servoInterval = 15;
const int sensorInterval = 60;
const int distanciaAlvo = 10;

// FILTRO ANTI-RUÍDO
int contadorEntrada = 0;
int contadorSaida = 0;
const int leiturasNecessarias = 4;

float lastDistance = 0;

// ESTADOS
bool objetoDetectado = false;
bool aguardandoRetorno = false;
bool ledEstado = false;

void setup() {
  Serial.begin(9600);
  pinMode(rele, OUTPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);

  radar.attach(7);

  controleRele(true);
  backHome(0);
  setColor(0, 1, 0);  // LED verde

  delay(2000);
}

void loop() {
  atualizarSensor();

  if (!objetoDetectado && !aguardandoRetorno) {
    atualizarServo();
  } 
  else if (objetoDetectado) {
    piscarVermelho();
  } 
  else if (aguardandoRetorno) {
    // Espera 2 segundos para retomar
    if (millis() - objetoSaiuMillis >= 2000) {
      aguardandoRetorno = false;
      setColor(0, 1, 0); // volta para verde
    }
  }
}

/*---------------------- SERVO -------------------------*/

void atualizarServo() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousServoMillis >= servoInterval) {
    previousServoMillis = currentMillis;

    radar.write(currentPos);
    currentPos += stepDirection;

    if (currentPos >= 180 || currentPos <= 0) {
      stepDirection = -stepDirection;
    }
  }
}

/*---------------------- SENSOR -------------------------*/

void atualizarSensor() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousSensorMillis < sensorInterval)
    return;

  previousSensorMillis = currentMillis;

  // DISPARA O TRIG
  digitalWrite(trigPin, LOW);
  delayMicroseconds(3);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // MEDIR TEMPO DO PULSO
  unsigned long duracao = pulseIn(echoPin, HIGH, 30000);

  if (duracao == 0) {
    lastDistance = 400;  // sem eco = muito longe
  } else {
    lastDistance = duracao * 0.0343 / 2.0;
  }

  Serial.print("Distância: ");
  Serial.println(lastDistance);

  /*---------------------- FILTRO DE DETECÇÃO -------------------------*/

  if (lastDistance <= distanciaAlvo) {
    contadorEntrada++;
    contadorSaida = 0;

    if (!objetoDetectado && contadorEntrada >= leiturasNecessarias) {
      objetoDetectado = true;
      contadorEntrada = 0;
      aguardandoRetorno = false;
      setColor(1, 0, 0);
      controleRele(false);
      Serial.println(">>> OBJETO DETECTADO CONFIRMADO!");
    }
  }
  else {
    contadorSaida++;
    contadorEntrada = 0;

    if (objetoDetectado && contadorSaida >= leiturasNecessarias) {
      objetoDetectado = false;
      contadorSaida = 0;
      aguardandoRetorno = true;
      objetoSaiuMillis = millis();
      controleRele(true);
      Serial.println(">>> OBJETO REALMENTE SAIU!");
    }
  }
}

/*---------------------- FEEDBACK VISUAL -------------------------*/

void piscarVermelho() {
  unsigned long currentMillis = millis();

  if (currentMillis - piscaMillis >= 300) {
    piscaMillis = currentMillis;
    ledEstado = !ledEstado;
    setColor(ledEstado, 0, 0);
  }
}

void setColor(bool r, bool g, bool b) {
  digitalWrite(LED_R, r);
  digitalWrite(LED_G, g);
  digitalWrite(LED_B, b);
}

/*---------------------- SERVO HOME -------------------------*/

void backHome(int position) {
  int step = (currentPos > position) ? -1 : 1;

  for (int i = currentPos; i != position; i += step) {
    radar.write(i);
    delay(20);
  }

  currentPos = position;
}

/*---------------------- RELE -------------------------*/

void controleRele(bool ligar) {
  digitalWrite(rele, ligar ? HIGH : LOW);
}