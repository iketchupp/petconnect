package org.petconnect.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.petconnect.backend.config.helper.YamlConfig;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "image")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = { "avatarImage", "petImage" })
@EqualsAndHashCode(exclude = { "avatarImage", "petImage" })
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "key", length = 255, nullable = false, unique = true)
    private String key;

    @Column(name = "bucket", length = 100, nullable = false)
    private String bucket;

    @Column(name = "file_type", length = 50, nullable = false)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    // Relationships
    @OneToOne(mappedBy = "image", cascade = CascadeType.ALL, orphanRemoval = true)
    private AvatarImage avatarImage;

    @OneToOne(mappedBy = "image", cascade = CascadeType.ALL, orphanRemoval = true)
    private PetImage petImage;

    // Static helper to be used in services
    private static YamlConfig yamlConfig;

    // Use static injection method that can be called from a configuration class
    @Autowired
    public static void setYamlConfig(YamlConfig config) {
        Image.yamlConfig = config;
    }

    @Transient
    public String getUrl() {
        if (yamlConfig == null || yamlConfig.getStorage() == null || yamlConfig.getStorage().getS3() == null) {
            // Return the combination without the endpoint to avoid errors
            return String.format("%s/%s", bucket, key);
        }
        String endpoint = yamlConfig.getStorage().getS3().getEndpoint();
        // Remove trailing slash from endpoint if present
        endpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        return String.format("%s/%s/%s", endpoint, bucket, key);
    }
}