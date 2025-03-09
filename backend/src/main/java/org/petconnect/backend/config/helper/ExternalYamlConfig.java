package org.petconnect.backend.config.helper;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.PropertySources;

@Configuration
@PropertySources({
    // External file locations (for production and custom paths)
    @PropertySource(value = "file:${CONFIG_PATH:config.yml}", factory = YamlPropertySourceFactory.class, ignoreResourceNotFound = true),
    @PropertySource(value = "file:/opt/app/config.yml", factory = YamlPropertySourceFactory.class, ignoreResourceNotFound = true),
    
    // Classpath resource locations (for development in resources directory)
    @PropertySource(value = "classpath:config.yml", factory = YamlPropertySourceFactory.class, ignoreResourceNotFound = true),
})
public class ExternalYamlConfig {
    // This class serves as a container for the PropertySource annotations
    // No additional code is needed here
} 