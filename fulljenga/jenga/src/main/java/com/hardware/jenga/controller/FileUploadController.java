package com.hardware.jenga.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid file name"));
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!extension.matches("jpg|jpeg|png|webp")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only .jpg, .jpeg, .png and .webp files are allowed"));
        }

        try {
            Path dirPath = Paths.get(uploadDir, "images");
            if (!Files.exists(dirPath)) {
                Files.createDirectories(dirPath);
            }

            String newFilename = UUID.randomUUID().toString() + "." + extension;
            Path filePath = dirPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String publicUrl = "/uploads/images/" + newFilename;
            return ResponseEntity.ok(Map.of("url", publicUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
}
