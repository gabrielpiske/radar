package com.senai.piske.radar.service;

import java.nio.charset.StandardCharsets;
import java.util.function.Consumer;

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortDataListener;
import com.fazecast.jSerialComm.SerialPortEvent;

public class SerialPortDataListenerImpl implements SerialPortDataListener{
    
    private final Consumer<String> callback;
    private final StringBuilder pendente = new StringBuilder();

    public SerialPortDataListenerImpl(Consumer<String> callback) {
        this.callback = callback;
    }

    @Override
    public int getListeningEvents() {
        return SerialPort.LISTENING_EVENT_DATA_AVAILABLE;
    }

    @Override
    public void serialEvent(SerialPortEvent event) {
        SerialPort comPort = event.getSerialPort();

        byte[] buffer = new byte[comPort.bytesAvailable()];
        int numRead = comPort.readBytes(buffer, buffer.length);

        if (numRead > 0) {
            processarBytes(new String(buffer, 0, numRead, StandardCharsets.US_ASCII));
        }
    }

    private synchronized void processarBytes(String recebido) {
        pendente.append(recebido);

        int fimDaLinha;
        while ((fimDaLinha = pendente.indexOf("\n")) >= 0) {
            String linha = pendente.substring(0, fimDaLinha).trim();
            pendente.delete(0, fimDaLinha + 1);

            if (!linha.isEmpty()) {
                callback.accept(linha);
            }
        }
    }
}
