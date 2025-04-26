package org.petconnect.backend.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpMethod;

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
            // Pets
            PublicEndpoint.get("/api/v1/pets"),
            PublicEndpoint.get("/api/v1/pets/species"),
            PublicEndpoint.get("/api/v1/pets/breeds"),
            PublicEndpoint.get("/api/v1/pets/genders"),
            PublicEndpoint.get("/api/v1/pets/{id}"),
            PublicEndpoint.get("/api/v1/pets/{id}/owner"),
            PublicEndpoint.get("/api/v1/pets/{id}/address"),

            // Shelters
            PublicEndpoint.get("/api/v1/shelters"),
            PublicEndpoint.get("/api/v1/shelters/{id}"),
            PublicEndpoint.get("/api/v1/shelters/{id}/pets"),
            PublicEndpoint.get("/api/v1/shelters/{id}/owner"),

            // Locations
            PublicEndpoint.get("/api/v1/locations/cities"),
            PublicEndpoint.get("/api/v1/locations/countries"),

            // WebSocket endpoint
            PublicEndpoint.get("/api/v1/messages/pets/{id}/owner"),

            // Swagger UI paths - allow all methods
            PublicEndpoint.any("/api/v1/docs/**"),
            PublicEndpoint.any("/api/v1/scalar.html"));

    // Helper method to get all paths regardless of method
    public static String[] getAllPublicPaths() {
        return PUBLIC_ENDPOINTS.stream()
                .map(PublicEndpoint::path)
                .distinct()
                .toArray(String[]::new);
    }
}