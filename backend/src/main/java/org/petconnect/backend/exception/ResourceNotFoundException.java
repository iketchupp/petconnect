package org.petconnect.backend.exception;

/**
 * Exception thrown when a requested resource is not found in the system.
 * This will be translated to HTTP 404 Not Found responses.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}