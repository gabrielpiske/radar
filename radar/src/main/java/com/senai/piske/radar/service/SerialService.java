package com.senai.piske.radar.service;

import com.fazecast.jSerialComm.SerialPort;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class SerialService {

    private SerialPort porta;
    private volatile String ultimaLeitura = "";

    @PostConstruct
    public void iniciar(){
        porta = SerialPort.getCommPort("COM9"); // <-- ALTERE PARA A PORTA CERTA!
        porta.setBaudRate(9600);

        if (!porta.openPort()) {
            System.out.println("ERRO: Não foi possível abrir a porta serial");
            return;
        }

        System.out.println("Porta serial aberta com sucesso.");

        porta.addDataListener(new SerialPortDataListenerImpl(data -> {
            ultimaLeitura = data;
            System.out.println("Recebido: " + data);
        }));
    }

    public String getUltimaLeitura() {
        return ultimaLeitura;
    }
}
