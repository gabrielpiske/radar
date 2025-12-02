package com.senai.piske.radar.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senai.piske.radar.model.SerialData;
import com.senai.piske.radar.service.SerialService;

@RestController
@CrossOrigin(origins = "*")
public class SerialController {

    private final SerialService serialService;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

    public SerialController(SerialService serialService) {
        this.serialService = serialService;
    }

    @GetMapping("/api/radar/dados")
    public SerialData getDados() {
        String leitura = serialService.getUltimaLeitura();
        
        // Processar a leitura para extrair distância
        double distancia = 0;
        boolean alerta = false;
        
        try {
            // Extrair número da string (ex: "Distância: 12.34")
            String[] partes = leitura.split(":");
            if (partes.length > 1) {
                String valorStr = partes[1].replaceAll("[^\\d.]", "").trim();
                distancia = Double.parseDouble(valorStr);
                alerta = distancia <= 10; // Alerta se objeto a 10cm ou menos
            }
        } catch (Exception e) {
            distancia = 0;
        }
        
        // Obter ângulo do serviço (você precisa adicionar essa funcionalidade)
        int angulo = serialService.getUltimoAngulo();
        
        return new SerialData(
            distancia, 
            angulo, 
            alerta, 
            LocalDateTime.now().format(formatter)
        );
    }
}
