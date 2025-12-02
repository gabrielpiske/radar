package com.senai.piske.radar.service;

import com.fazecast.jSerialComm.SerialPort;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class SerialService {
    private SerialPort porta;
    private volatile String ultimaLeitura = "";
    private volatile int ultimoAngulo = 0;

    @PostConstruct
    public void iniciar(){
        porta = SerialPort.getCommPort("COM9");
        porta.setBaudRate(9600);

        if (!porta.openPort()) {
            System.out.println("ERRO: Não foi possível abrir a porta serial");
            return;
        }

        System.out.println("Porta serial aberta com sucesso.");

        porta.addDataListener(new SerialPortDataListenerImpl(data -> {
            ultimaLeitura = data;
            System.out.println("Recebido: " + data);
            
            // Extrair ângulo da posição do servo (você precisa enviar isso do Arduino)
            // Exemplo: "Distância: 12.34, Ângulo: 90"
            if (data.contains("Ângulo:")) {
                try {
                    String[] partes = data.split("Ângulo:");
                    if (partes.length > 1) {
                        String anguloStr = partes[1].replaceAll("[^\\d]", "").trim();
                        ultimoAngulo = Integer.parseInt(anguloStr);
                    }
                } catch (Exception e) {
                    // Ignorar erro de parsing
                }
            }
        }));
    }

    public String getUltimaLeitura() {
        return ultimaLeitura;
    }
    
    public int getUltimoAngulo() {
        return ultimoAngulo;
    }
}