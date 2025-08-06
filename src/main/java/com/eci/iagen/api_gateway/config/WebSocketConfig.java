package com.eci.iagen.api_gateway.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitar un broker simple en memoria para mensajes con destinos que empiecen con "/topic"
        config.enableSimpleBroker("/topic");
        // Los mensajes cuyo destino empiece con "/app" serán enrutados a métodos anotados con @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registrar el endpoint "/ws" para que los clientes se conecten
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permitir conexiones desde cualquier origen
                .withSockJS(); // Habilitar fallback SockJS para navegadores que no soporten WebSocket nativo
    }
}
