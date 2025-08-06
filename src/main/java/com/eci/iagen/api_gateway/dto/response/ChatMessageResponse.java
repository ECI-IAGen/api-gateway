package com.eci.iagen.api_gateway.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String sessionId;
    private String message;
    private String messageType; // "user", "assistant", "status", "error"
    private LocalDateTime timestamp;
    private boolean isComplete; // indica si es el mensaje final
    
    public static ChatMessageResponse userMessage(String sessionId, String message) {
        return new ChatMessageResponse(sessionId, message, "user", LocalDateTime.now(), false);
    }
    
    public static ChatMessageResponse assistantMessage(String sessionId, String message, boolean isComplete) {
        return new ChatMessageResponse(sessionId, message, "assistant", LocalDateTime.now(), isComplete);
    }
    
    public static ChatMessageResponse statusMessage(String sessionId, String message) {
        return new ChatMessageResponse(sessionId, message, "status", LocalDateTime.now(), false);
    }
    
    public static ChatMessageResponse errorMessage(String sessionId, String message) {
        return new ChatMessageResponse(sessionId, message, "error", LocalDateTime.now(), true);
    }
}
