package org.petconnect.backend.dto.error;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private ZonedDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    @Builder.Default
    private List<ValidationError> validationErrors = new ArrayList<>();

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ValidationError {
        private String field;
        private String message;
    }
}