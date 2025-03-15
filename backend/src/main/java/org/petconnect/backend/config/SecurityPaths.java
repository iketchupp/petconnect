package org.petconnect.backend.config;

import java.util.Arrays;
import java.util.List;

public final class SecurityPaths {
    private SecurityPaths() {
        // Private constructor to prevent instantiation
    }

    public static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/v1/auth/**"
    );

    public static final String[] PUBLIC_PATHS_ARRAY = PUBLIC_PATHS.toArray(new String[0]);
} 