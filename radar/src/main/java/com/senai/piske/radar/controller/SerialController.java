package com.senai.piske.radar.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.senai.piske.radar.model.SerialData;
import com.senai.piske.radar.service.SerialService;

@RestController
public class SerialController {
    
    private final SerialService serialService;

    public SerialController(SerialService serialService) {
        this.serialService = serialService;
    }

    @GetMapping("/api/radar/dados")
    public SerialData getDados() {
        return new SerialData(serialService.getUltimaLeitura());
    }
}
