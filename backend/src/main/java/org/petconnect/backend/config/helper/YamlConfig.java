package org.petconnect.backend.config.helper;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties
@Data
public class YamlConfig {

    private Database database;
    private Storage storage;
    private Server server;
    private Frontend frontend;
    private Jwt jwt;

    @Data
    public static class Database {

        private Postgres postgres;

        @Data
        public static class Postgres {

            private String host;
            private int port;
            private String username;
            private String password;
            private String database;
        }
    }

    @Data
    public static class Storage {

        private S3 s3;

        @Data
        public static class S3 {
            private String endpoint;
            private String region;
            private String accessKey;
            private String secretKey;
            private String bucket;
        }
    }

    @Data
    public static class Server {

        private int port;
    }

    @Data
    public static class Frontend {

        private String url;
        private String callback;
    }

    @Data
    public static class Jwt {

        private String secret;
        private long expirationMs = 86400000; // 24 hours by default
    }
}
