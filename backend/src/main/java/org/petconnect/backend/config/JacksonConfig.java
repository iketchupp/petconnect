package org.petconnect.backend.config;

import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfig {

    private static final ZoneId UTC = ZoneId.of("UTC");

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Configure Java 8 time module
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // Ensure all timestamps are serialized with UTC zone
        objectMapper.registerModule(javaTimeModule);

        // Disable writing dates as timestamps (use ISO format instead)
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Don't include the zone ID in the output, just use Z suffix for UTC
        objectMapper.configure(SerializationFeature.WRITE_DATES_WITH_ZONE_ID, false);

        return objectMapper;
    }
}