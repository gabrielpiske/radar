package com.senai.piske.radar.service;

import com.fazecast.jSerialComm.SerialPort;
import com.senai.piske.radar.model.SerialData;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SerialService {
    private static final Pattern LEITURA_RADAR = Pattern.compile("^ANGLE:(\\d{1,3});DIST:([0-9]+(?:[.,][0-9]+)?)$");
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Value("${radar.serial.port:COM6}")
    private String nomeDaPorta;

    private SerialPort porta;
    private volatile String ultimaLeitura = "";
    private volatile SerialData ultimoDado = new SerialData(0, 0, false, "--:--:--");

    @PostConstruct
    public void iniciar(){
        porta = SerialPort.getCommPort(nomeDaPorta);
        porta.setBaudRate(9600);

        if (!porta.openPort()) {
            System.out.println("ERRO: Não foi possível abrir a porta serial");
            return;
        }

        System.out.println("Porta serial " + nomeDaPorta + " aberta com sucesso.");

        porta.addDataListener(new SerialPortDataListenerImpl(data -> {
            ultimaLeitura = data;
            System.out.println("Recebido: " + data);
            processarLeitura(data);
        }));
    }

    private void processarLeitura(String leitura) {
        Matcher correspondencia = LEITURA_RADAR.matcher(leitura);
        if (!correspondencia.matches()) {
            System.err.println("Leitura serial ignorada: " + leitura);
            return;
        }

        try {
            int angulo = Integer.parseInt(correspondencia.group(1));
            double distancia = Double.parseDouble(correspondencia.group(2).replace(',', '.'));

            if (angulo > 180 || distancia < 0) {
                throw new IllegalArgumentException("valores fora da faixa esperada");
            }

            boolean alerta = distancia > 0 && distancia < 20;
            ultimoDado = new SerialData(distancia, angulo, alerta,
                    LocalDateTime.now().format(FORMATTER));
        } catch (RuntimeException erro) {
            System.err.println("Erro ao processar leitura serial: " + erro.getMessage());
        }
    }

    public String getUltimaLeitura() {
        return ultimaLeitura;
    }
    
    public SerialData getUltimoDado() {
        return ultimoDado;
    }

    @PreDestroy
    public void encerrar() {
        if (porta != null && porta.isOpen()) {
            porta.closePort();
        }
    }
}
