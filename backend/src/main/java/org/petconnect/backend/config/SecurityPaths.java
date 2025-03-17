package org.petconnect.backend.config;

import org.springframework.http.HttpMethod;
import java.util.Arrays;
import java.util.List;

public final class SecurityPaths {
    private SecurityPaths() {
        // Private constructor to prevent instantiation
    }

    public record PublicEndpoint(String path, HttpMethod method) {
        public static PublicEndpoint get(String path) {
            return new PublicEndpoint(path, HttpMethod.GET);
        }

        public static PublicEndpoint any(String path) {
            return new PublicEndpoint(path, null);
        }
    }

    public static final List<PublicEndpoint> PUBLIC_ENDPOINTS = Arrays.asList(
            // Auth endpoints - allow all methods
            PublicEndpoint.any("/api/v1/auth/**"),

            // Read-only endpoints
            PublicEndpoint.get("/api/v1/pets"),
            PublicEndpoint.get("/api/v1/pets/species"),
            PublicEndpoint.get("/api/v1/pets/breeds"),
            PublicEndpoint.get("/api/v1/pets/genders"),
            PublicEndpoint.get("/api/v1/pets/{id}/owner"),
            PublicEndpoint.get("/api/v1/shelters"),
            PublicEndpoint.get("/api/v1/shelters/{id}"),
            PublicEndpoint.get("/api/v1/shelters/{id}/pets"),

            // Swagger UI paths - allow all methods
            PublicEndpoint.any("/v3/api-docs/**"),
            PublicEndpoint.any("/scalar.html"));

    // Helper method to get all paths regardless of method
    public static String[] getAllPublicPaths() {
        return PUBLIC_ENDPOINTS.stream()
                .map(PublicEndpoint::path)
                .distinct()
                .toArray(String[]::new);
    }
}