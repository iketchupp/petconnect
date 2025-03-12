package org.petconnect.backend.config;

import org.petconnect.backend.config.helper.YamlConfig;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class ServerConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    private final YamlConfig yamlConfig;

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        if (yamlConfig.getServer() != null && yamlConfig.getServer().getPort() > 0) {
            factory.setPort(yamlConfig.getServer().getPort());
        }
    }
}