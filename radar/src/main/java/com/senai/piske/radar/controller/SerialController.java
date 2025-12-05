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
        System.out.println("Leitura crua: " + leitura); 
        double distancia = 0;
        boolean alerta = false;
        int angulo = 0;

        try {
            // Formato: ANGLE:128;DIST:177.11
            if (leitura.contains(";")) {
                String[] partes = leitura.split(";");

                // Processar ângulo
                if (partes[0].contains("ANGLE:")) {
                    String anguloStr = partes[0].replace("ANGLE:", "").trim();
                    angulo = Integer.parseInt(anguloStr);
                }

                // Processar distância
                if (partes[1].contains("DIST:")) {
                    String distStr = partes[1].replace("DIST:", "").trim();
                    distancia = Double.parseDouble(distStr);
                    alerta = distancia <= 10; // Alerta se objeto a 10cm ou menos
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao processar leitura: " + e.getMessage());
            distancia = 0;
            angulo = 0;
            alerta = false;
        }

        return new SerialData(
                distancia,
                angulo,
                alerta,
                LocalDateTime.now().format(formatter));
    }
}
