package com.eci.iagen.api_gateway.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LLMChatRequest {
    private String sessionId;
    private String message;
    private String userRole; // "coordinador" o "profesor"
    private List<String> previousMessages; // Lista de mensajes anteriores del historial
    private String callbackUrl; // URL donde el LLM enviará las actualizaciones
}
