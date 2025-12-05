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
        porta = SerialPort.getCommPort("COM6");
        porta.setBaudRate(9600);

        if (!porta.openPort()) {
            System.out.println("ERRO: Não foi possível abrir a porta serial");
            return;
        }

        System.out.println("Porta serial aberta com sucesso.");

        porta.addDataListener(new SerialPortDataListenerImpl(data -> {
            ultimaLeitura = data;
            System.out.println("Recebido: " + data);
            
            // Formato: ANGLE:128;DIST:177.11
            if (data.contains("ANGLE:") && data.contains("DIST:")) {
                try {
                    String[] partes = data.split(";");
                    if (partes.length >= 1) {
                        // Extrair ângulo
                        String anguloPart = partes[0];
                        if (anguloPart.contains("ANGLE:")) {
                            String anguloStr = anguloPart.replace("ANGLE:", "").trim();
                            ultimoAngulo = Integer.parseInt(anguloStr);
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Erro ao extrair ângulo: " + e.getMessage());
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