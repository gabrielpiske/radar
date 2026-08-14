# Radar

O Arduino envia uma leitura por linha no formato `ANGLE:<0-180>;DIST:<centimetros>`.
A API Spring lê a porta configurada em `radar/src/main/resources/application.properties`
e disponibiliza o último valor em `http://localhost:8080/api/radar/dados`.

Antes de iniciar, ajuste `radar.serial.port` para a porta COM exibida pela IDE do
Arduino e envie o sketch em `sensor/sensor.ino` para a placa. O monitor serial e
a aplicação devem usar 9600 baud.

Os limites são os mesmos em toda a solução: vermelho/alerta abaixo de 20 cm,
laranja de 20 a 50 cm e verde acima de 50 cm.
