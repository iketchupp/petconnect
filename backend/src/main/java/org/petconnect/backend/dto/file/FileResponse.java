package org.petconnect.backend.dto.file;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FileResponse {
    private String filename;
    private String objectName;
    private Long size;
    private String contentType;
}