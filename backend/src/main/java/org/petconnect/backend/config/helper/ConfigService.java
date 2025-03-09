package org.petconnect.backend.config.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConfigService {

    private final YamlConfig yamlConfig;

    @Autowired
    public ConfigService(YamlConfig yamlConfig) {
        this.yamlConfig = yamlConfig;
    }

    public YamlConfig getConfig() {
        return yamlConfig;
    }
} 