package com.eci.iagen.api_gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eci.iagen.api_gateway.dto.request.ChatMessageRequest;
import com.eci.iagen.api_gateway.dto.request.LLMStreamingRequest;
import com.eci.iagen.api_gateway.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ChatController {

    private final ChatService chatService;

    /**
     * Endpoint WebSocket para recibir mensajes del frontend
     * El frontend debe conectarse a /ws y enviar mensajes a /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageRequest request) {
        log.info("Received WebSocket message from session: {}", request.getSessionId());
        
        // Validaciones básicas
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            log.warn("Empty message received from session: {}", request.getSessionId());
            return;
        }
        
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            log.warn("No session ID provided in message");
            return;
        }

        chatService.processUserMessage(request);
    }

    /**
     * Endpoint HTTP para recibir actualizaciones del backend LLM
     * Este endpoint será llamado por el backend LLM para enviar actualizaciones streaming
     */
    @PostMapping("/llm-update")
    public ResponseEntity<String> receiveLLMUpdate(@RequestBody LLMStreamingRequest request) {
        log.info("Received LLM update for session: {} - status: {}", request.getSessionId(), request.getStatus());
        
        try {
            // Validaciones
            if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
                log.warn("No session ID in LLM update");
                return ResponseEntity.badRequest().body("Session ID is required");
            }

            chatService.handleLLMStreamingUpdate(
                request.getSessionId(),
                request.getPartialMessage(),
                request.getStatus(),
                request.isComplete()
            );

            return ResponseEntity.ok("Update processed successfully");
            
        } catch (Exception e) {
            log.error("Error processing LLM update: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error processing update");
        }
    }

    /**
     * Endpoint para obtener el estado de salud del chat
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running");
    }
}
