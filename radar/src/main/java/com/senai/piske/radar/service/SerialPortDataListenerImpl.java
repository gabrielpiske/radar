package com.senai.piske.radar.service;

import java.util.function.Consumer;

import com.fazecast.jSerialComm.SerialPort;
import com.fazecast.jSerialComm.SerialPortDataListener;
import com.fazecast.jSerialComm.SerialPortEvent;

public class SerialPortDataListenerImpl implements SerialPortDataListener{
    
    private final Consumer<String> callback;

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
            String recebido = new String(buffer).trim();
            callback.accept(recebido);
        }
    }
}
