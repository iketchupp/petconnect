package org.petconnect.backend.config;

import org.petconnect.backend.config.helper.YamlConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class StorageConfig {

    private final YamlConfig yamlConfig;

    @Bean
    public MinioClient minioClient() {
        YamlConfig.Storage.S3 s3Config = yamlConfig.getStorage().getS3();

        return MinioClient
            .builder()
            .endpoint(s3Config.getEndpoint())
            .credentials(s3Config.getAccessKey(), s3Config.getSecretKey())
            .build();
    }
}
