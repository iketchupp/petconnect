package org.petconnect.backend.service;

import java.util.UUID;

import org.petconnect.backend.config.helper.YamlConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final MinioClient minioClient;
    private final YamlConfig yamlConfig;

    public String getBucketName() {
        return yamlConfig.getStorage().getS3().getBucket();
    }

    @SuppressWarnings("UseSpecificCatch")
    public void initBucket() {
        try {
            boolean bucketExists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(getBucketName()).build());
            if (!bucketExists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(getBucketName()).build());
                log.info("Bucket '{}' created successfully", getBucketName());
            }
        } catch (Exception e) {
            log.error("Error initializing bucket: {}", e.getMessage());
            throw new RuntimeException("Error initializing MinIO bucket", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        try {
            // Generate a unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String objectName = UUID.randomUUID() + extension;

            return uploadFileWithObjectName(file, objectName);
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }

    @SuppressWarnings("UseSpecificCatch")
    public String uploadFileWithObjectName(MultipartFile file, String objectName) {
        try {
            // Upload the file
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(getBucketName())
                            .object(objectName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            return objectName;
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new RuntimeException("Error uploading file to MinIO", e);
        }
    }

    @SuppressWarnings("UseSpecificCatch")
    public void deleteFile(String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            throw new RuntimeException("Error deleting file from MinIO", e);
        }
    }
}
