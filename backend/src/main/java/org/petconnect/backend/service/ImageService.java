package org.petconnect.backend.service;

import org.petconnect.backend.config.helper.YamlConfig;
import org.petconnect.backend.dto.file.FileResponse;
import org.petconnect.backend.model.Image;
import org.petconnect.backend.repository.ImageRepository;
import org.petconnect.backend.validator.FileTypeValidator;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final ImageRepository imageRepository;
    private final StorageService storageService;
    private final YamlConfig yamlConfig;

    private String getBucketName() {
        return yamlConfig.getStorage().getS3().getBucket();
    }

    public FileResponse uploadImage(MultipartFile file) {
        validateFile(file);
        String objectName = storageService.uploadFile(file);
        return createImageRecord(file, objectName);
    }

    public FileResponse uploadImage(MultipartFile file, String objectName) {
        validateFile(file);
        objectName = storageService.uploadFileWithObjectName(file, objectName);
        return createImageRecord(file, objectName);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (!FileTypeValidator.isValidFileType(file)) {
            throw new IllegalArgumentException(
                "Invalid file type. Allowed types are: " + 
                String.join(", ", FileTypeValidator.getAllowedContentTypes())
            );
        }
    }

    private FileResponse createImageRecord(MultipartFile file, String objectName) {
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

    /**
     * Delete an image from both storage and database
     */
    public void deleteImage(String key) {
        try {
            // Delete from S3/MinIO first
            storageService.deleteFile(key);
            
            // Then delete from database if exists
            imageRepository.findByKey(key).ifPresent(image -> {
                imageRepository.delete(image);
                log.info("Image record deleted from database for key: {}", key);
            });
        } catch (Exception e) {
            log.error("Error deleting image with key {}: {}", key, e.getMessage());
            throw new RuntimeException("Failed to delete image", e);
        }
    }
}
