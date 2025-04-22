package org.petconnect.backend.config;

import org.petconnect.backend.config.helper.YamlConfig;
import org.petconnect.backend.model.Image;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class ImageConfig {

    private final YamlConfig yamlConfig;

    @PostConstruct
    public void init() {
        // Set the YamlConfig in the Image class
        Image.setYamlConfig(yamlConfig);
    }
}