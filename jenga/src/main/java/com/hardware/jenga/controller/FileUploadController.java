package com.hardware.jenga.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    // Handles both /api/upload/media and legacy /api/upload/image calls
    @PostMapping({"/media", "/image"})
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Please select a file to upload."));
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "media");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        boolean isImage = extension.matches("\\.(jpg|jpeg|png|webp)");
        boolean isVideo = extension.matches("\\.(mp4|mov|webm)");

        if (!isImage && !isVideo) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Only images (JPG, PNG, WEBP) or videos (MP4, MOV, WEBM) are supported."
            ));
        }

        try {
            Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            String savedFileName = UUID.randomUUID().toString() + extension;
            Path targetPath = targetDir.resolve(savedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String mediaUrl = "/uploads/" + savedFileName;

            return ResponseEntity.ok(Map.of(
                    "url", mediaUrl,
                    "type", isVideo ? "video" : "image"
            ));
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Could not save file: " + ex.getMessage()));
        }
    }
}