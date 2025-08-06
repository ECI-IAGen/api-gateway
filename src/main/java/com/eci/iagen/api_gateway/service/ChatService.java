package com.eci.iagen.api_gateway.service;

import java.util.concurrent.CompletableFuture;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.eci.iagen.api_gateway.client.TeamFeedbackClient;
import com.eci.iagen.api_gateway.dto.request.ChatMessageRequest;
import com.eci.iagen.api_gateway.dto.request.LLMChatRequest;
import com.eci.iagen.api_gateway.dto.response.ChatMessageResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;
    private final TeamFeedbackClient teamFeedbackClient;
    
    // URL base de este servicio para los callbacks
    private static final String CALLBACK_BASE_URL = "http://localhost:8080/api/chat/llm-update";

    public void processUserMessage(ChatMessageRequest request) {
        log.info("Processing chat message for session: {}", request.getSessionId());
        
        // Enviar confirmación de que el mensaje fue recibido
        ChatMessageResponse userMessage = ChatMessageResponse.userMessage(
            request.getSessionId(), 
            request.getMessage()
        );
        sendMessageToSession(request.getSessionId(), userMessage);
        
        // Enviar mensaje de estado
        ChatMessageResponse statusMessage = ChatMessageResponse.statusMessage(
            request.getSessionId(), 
            "Procesando tu consulta..."
        );
        sendMessageToSession(request.getSessionId(), statusMessage);
        
        // Procesar de forma asíncrona
        CompletableFuture.runAsync(() -> {
            try {
                // Crear request para el LLM backend con callback URL
                LLMChatRequest llmRequest = new LLMChatRequest(
                    request.getSessionId(),
                    request.getMessage(),
                    request.getUserRole(),
                    request.getPreviousMessages(),
                    CALLBACK_BASE_URL
                );
                
                // Determinar el endpoint según el rol
                if ("coordinador".equalsIgnoreCase(request.getUserRole())) {
                    teamFeedbackClient.generateCoordinatorFeedbackAsync(llmRequest);
                } else {
                    // Por defecto usar profesor
                    teamFeedbackClient.generateTeacherFeedbackAsync(llmRequest);
                }
                
            } catch (Exception e) {
                log.error("Error processing message for session {}: {}", request.getSessionId(), e.getMessage(), e);
                ChatMessageResponse errorMessage = ChatMessageResponse.errorMessage(
                    request.getSessionId(), 
                    "Error procesando tu consulta: " + e.getMessage()
                );
                sendMessageToSession(request.getSessionId(), errorMessage);
            }
        });
    }
    
    public void handleLLMStreamingUpdate(String sessionId, String partialMessage, String status, boolean isComplete) {
        log.debug("Received LLM update for session {}: status={}, isComplete={}", sessionId, status, isComplete);
        
        ChatMessageResponse response = ChatMessageResponse.assistantMessage(
            sessionId, 
            partialMessage, 
            isComplete
        );
        
        sendMessageToSession(sessionId, response);
    }
    
    private void sendMessageToSession(String sessionId, ChatMessageResponse message) {
        String destination = "/topic/chat/" + sessionId;
        messagingTemplate.convertAndSend(destination, message);
        log.debug("Message sent to {}: {}", destination, message.getMessage());
    }
}
