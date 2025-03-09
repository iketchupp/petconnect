package org.petconnect.backend.config.helper;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;
import org.springframework.lang.Nullable;

public class YamlPropertySourceFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(@Nullable String name, EncodedResource encodedResource)
            throws IOException {
        
        Resource resource = encodedResource.getResource();
        if (!resource.exists()) {
            throw new FileNotFoundException("YAML resource not found: " + resource.getDescription());
        }
        
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(resource);
        factory.afterPropertiesSet();
        
        Properties properties = factory.getObject();
        String sourceName = name != null ? name : resource.getFilename();
        
        return new PropertiesPropertySource(sourceName, properties);
    }
} 