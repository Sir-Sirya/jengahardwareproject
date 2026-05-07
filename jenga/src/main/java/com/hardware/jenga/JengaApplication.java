package com.hardware.jenga;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Entry Point for Jenga Marketplace.
 * Added @EnableScheduling to support Objective I: Automated Inventory Alerts.
 */
@SpringBootApplication
@EnableScheduling 
public class JengaApplication {

    public static void main(String[] args) {
        SpringApplication.run(JengaApplication.class, args);
    }

}