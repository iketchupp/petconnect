package org.petconnect.backend.controller;

import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.service.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageController {
    private final StorageService storageService;

    @PostConstruct
    public void init() {
        storageService.initBucket();
    }

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        String objectName = storageService.uploadFile(file);
        
        FileResponse response = FileResponse.builder()
                .filename(file.getOriginalFilename())
                .objectName(objectName)
                .size(file.getSize())
                .contentType(file.getContentType())
                .build();
                
        return ResponseEntity.ok(response);
    }
}
