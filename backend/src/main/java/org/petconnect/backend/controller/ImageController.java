package org.petconnect.backend.controller;

import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.service.ImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/image")
@RequiredArgsConstructor
public class ImageController {
    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@RequestParam("file") MultipartFile file) {               
        return ResponseEntity.ok(imageService.uploadImage(file));
    }
}
