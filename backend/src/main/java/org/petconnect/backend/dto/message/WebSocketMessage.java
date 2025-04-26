package org.petconnect.backend.dto.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private MessageType type;
    private Object payload;

    public enum MessageType {
        NEW_MESSAGE,
        READ_RECEIPT,
        PET_STATUS_UPDATE,
        USER_TYPING,
        USER_STOPPED_TYPING
    }
}