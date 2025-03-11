package org.petconnect.backend.config.helper;

import org.springframework.stereotype.Service;

@Service
public class ConfigService {

    private final YamlConfig yamlConfig;

    public ConfigService(YamlConfig yamlConfig) {
        this.yamlConfig = yamlConfig;
    }

    public YamlConfig getConfig() {
        return yamlConfig;
    }
} 