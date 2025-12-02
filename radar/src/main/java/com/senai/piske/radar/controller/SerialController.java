package com.senai.piske.radar.controller;

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

    public SerialController(SerialService serialService) {
        this.serialService = serialService;
    }

    @GetMapping("/api/radar/dados")
    public Map<String, String> getDados() {
        Map<String, String> dados = new HashMap<>();
        String[] partes = serialService.getUltimaLeitura().split(";");

        for (String p : partes) {
            if (p.startsWith("ANGLE:"))
                dados.put("angulo", p.replace("ANGLE:", ""));
            if (p.startsWith("DIST:"))
                dados.put("distancia", p.replace("DIST:", ""));
        }
        return dados;
    }
}
