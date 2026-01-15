package com.gestioneventos.cofira;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CofiraApplication {

    public static void main(String[] args) {
        SpringApplication.run(CofiraApplication.class, args);
    }

}
