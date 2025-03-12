package org.petconnect.backend.service;

import org.petconnect.backend.config.helper.YamlConfig;
import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.repository.ImageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final ImageRepository imageRepository;
    private final StorageService storageService;
    private final YamlConfig yamlConfig;

    private String getBucketName() {
        return yamlConfig.getStorage().getS3().getBucket();
    }

    public FileResponse uploadImage(MultipartFile file) {
        String objectName = storageService.uploadFile(file);

        FileResponse response = FileResponse.builder()
                .filename(file.getOriginalFilename())
                .objectName(objectName)
                .size(file.getSize())
                .contentType(file.getContentType())
                .build();

        var image = Image.builder()
            .url(String.format("%s/%s/%s", yamlConfig.getStorage().getS3().getEndpoint(), getBucketName(), objectName))
            .key(objectName) 
            .bucket(getBucketName())
            .fileSize(response.getSize())
            .fileType(file.getContentType())
            .build();

        imageRepository.save(image);

        return response;
    }
}
