package com.eci.iagen.api_gateway.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private String message;
    private String sessionId;
    private String userRole; // "coordinador" o "profesor"
    private List<String> previousMessages; // Lista de mensajes anteriores del historial
}
