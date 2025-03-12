package org.petconnect.backend.config;

import javax.sql.DataSource;

import org.petconnect.backend.config.helper.YamlConfig;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DatabaseConfig {

    private final YamlConfig yamlConfig;

    @Bean
    @Primary
    public DataSource dataSource() {
        YamlConfig.Database.Postgres postgresConfig = yamlConfig.getDatabase().getPostgres();

        String url = String.format("jdbc:postgresql://%s:%d/%s",
                postgresConfig.getHost(),
                postgresConfig.getPort(),
                postgresConfig.getDatabase());

        return DataSourceBuilder.create()
                .url(url)
                .username(postgresConfig.getUsername())
                .password(postgresConfig.getPassword())
                .build();
    }
}