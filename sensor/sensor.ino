#include <Servo.h>

const int PIN_TRIG = 13;
const int PIN_ECHO = 12;
const int PIN_SERVO = 9;

const int LED_VERMELHO = 7;
const int LED_AZUL = 6;
const int LED_VERDE = 5;

Servo meuServo;

int anguloAtual = 0;

void setup() {
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  
  pinMode(LED_VERMELHO, OUTPUT);
  pinMode(LED_AZUL, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  
  meuServo.attach(PIN_SERVO, 544, 2400); 
  Serial.begin(9600);
}

long medirDistancia() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  
  long duracao = pulseIn(PIN_ECHO, HIGH);
  long distancia = duracao * 0.034 / 2;

  // Protocolo consumido pela API: uma leitura completa por linha.
  // Mantém o ângulo mesmo durante o travamento do alvo.
  Serial.print("ANGLE:");
  Serial.print(anguloAtual);
  Serial.print(";DIST:");
  Serial.println(distancia);
  return distancia;
}

void definirCorLED(int r, int g, int b) {
  analogWrite(LED_VERMELHO, r);
  analogWrite(LED_VERDE, g);
  analogWrite(LED_AZUL, b);
}

void piscarAlertaVermelho() {
  static unsigned long ultimaTroca = 0;
  static bool estadoLed = false;
  
  if (millis() - ultimaTroca >= 300) {
    ultimaTroca = millis();
    estadoLed = !estadoLed;
    if (estadoLed) {
      definirCorLED(255, 0, 0);
    } else {
      definirCorLED(0, 0, 0);
    }
  }
}

void travarAlvo() {
  bool objetoAindaPerto = true;
  
  while (objetoAindaPerto) {
    piscarAlertaVermelho();
    delay(25);
    
    long dist = medirDistancia();
    if (dist >= 20 || dist == 0) {
      objetoAindaPerto = false;
    }
  }
}

void processarLeitura(int angulo, long distancia) {
  if (distancia > 0 && distancia < 20) {
    travarAlvo();
  } else if (distancia >= 20 && distancia <= 50) {
    definirCorLED(255, 120, 0); 
  } else if (distancia > 50) {
    definirCorLED(0, 255, 0); 
  } else {
    definirCorLED(0, 0, 0);
  }
}

void loop() {
  for (anguloAtual = 0; anguloAtual <= 180; anguloAtual += 2) {
    meuServo.write(anguloAtual);
    delay(30);
    
    long dist = medirDistancia();
    processarLeitura(anguloAtual, dist);
  }
  
  for (anguloAtual = 180; anguloAtual >= 0; anguloAtual -= 2) {
    meuServo.write(anguloAtual);
    delay(30);
    
    long dist = medirDistancia();
    processarLeitura(anguloAtual, dist);
  }
}
