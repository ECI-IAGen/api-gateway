# Chat WebSocket API Documentation

## Descripción del Flujo

Este sistema implementa un chat con streaming en tiempo real usando WebSockets. El flujo es el siguiente:

1. **Frontend** → Conecta a WebSocket y envía mensaje
2. **Backend** → Hace petición asíncrona al LLM backend
3. **LLM Backend** → Procesa y envía actualizaciones vía HTTP POST
4. **Backend** → Retransmite actualizaciones vía WebSocket a los suscritos

## Configuración WebSocket

### Conexión
- **Endpoint WebSocket**: `/ws`
- **Protocolo**: STOMP over WebSocket con SockJS fallback
- **Prefijo de aplicación**: `/app`
- **Prefijo de suscripción**: `/topic`

### Ejemplo de conexión JavaScript
```javascript
// Usando SockJS + STOMP
const socket = new SockJS('/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    console.log('Connected: ' + frame);
    
    // Suscribirse al tópico de la sesión
    const sessionId = 'user-session-123';
    stompClient.subscribe(`/topic/chat/${sessionId}`, function(message) {
        const response = JSON.parse(message.body);
        console.log('Received:', response);
        // Procesar mensaje recibido
        handleChatMessage(response);
    });
});
```

## Endpoints

### 1. Envío de Mensaje (WebSocket)
**Destino**: `/app/chat.sendMessage`

**Payload**:
```json
{
    "sessionId": "user-session-123",
    "message": "¿Cómo le fue a la clase con id 5 en sus últimas evaluaciones?",
    "userRole": "coordinador"
}
```

**Ejemplo JavaScript**:
```javascript
const message = {
    sessionId: 'user-session-123',
    message: '¿Cómo mejorar el rendimiento de los estudiantes?',
    userRole: 'profesor'
};

stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
```

### 2. Recepción de Actualizaciones LLM (HTTP POST)
**URL**: `POST /api/chat/llm-update`

**Request Body**:
```json
{
    "sessionId": "user-session-123",
    "partialMessage": "Basándome en los datos de la clase...",
    "status": "partial",
    "isComplete": false
}
```

**Response**: 
```json
"Update processed successfully"
```

### 3. Health Check
**URL**: `GET /api/chat/health`

**Response**: 
```json
"Chat service is running"
```

## Tipos de Mensajes WebSocket

### Mensaje del Usuario
```json
{
    "sessionId": "user-session-123",
    "message": "¿Cómo le fue a la clase?",
    "messageType": "user",
    "timestamp": "2025-08-04T00:15:30",
    "isComplete": false
}
```

### Mensaje del Asistente
```json
{
    "sessionId": "user-session-123",
    "message": "Basándome en los datos de evaluación...",
    "messageType": "assistant",
    "timestamp": "2025-08-04T00:15:32",
    "isComplete": false
}
```

### Mensaje de Estado
```json
{
    "sessionId": "user-session-123",
    "message": "Procesando tu consulta...",
    "messageType": "status",
    "timestamp": "2025-08-04T00:15:31",
    "isComplete": false
}
```

### Mensaje de Error
```json
{
    "sessionId": "user-session-123",
    "message": "Error procesando la consulta: Connection timeout",
    "messageType": "error",
    "timestamp": "2025-08-04T00:15:35",
    "isComplete": true
}
```

## Estados del LLM Streaming

- **`processing`**: El LLM está procesando la consulta
- **`partial`**: Mensaje parcial/streaming en progreso
- **`complete`**: Mensaje final completo
- **`error`**: Error en el procesamiento

## Configuración del Backend LLM

El backend LLM debe hacer llamadas HTTP POST al endpoint `/api/chat/llm-update` para enviar actualizaciones.

### Ejemplo de implementación en el LLM Backend:
```python
import requests
import json

def send_update(session_id, partial_message, status="partial", is_complete=False):
    url = "http://localhost:8080/api/chat/llm-update"
    payload = {
        "sessionId": session_id,
        "partialMessage": partial_message,
        "status": status,
        "isComplete": is_complete
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Update sent: {response.status_code}")
    except Exception as e:
        print(f"Error sending update: {e}")

# Ejemplo de uso durante streaming
def process_streaming_response(session_id, user_message):
    send_update(session_id, "", "processing")
    
    # Simular streaming
    partial_response = ""
    for chunk in generate_response_stream(user_message):
        partial_response += chunk
        send_update(session_id, partial_response, "partial", False)
    
    # Mensaje final
    send_update(session_id, partial_response, "complete", True)
```

## URLs de los Endpoints LLM

El sistema llamará a estos endpoints en el backend LLM:

- **Coordinador**: `POST {team.feedback.service.url}/feedback/coordinador/chat`
- **Profesor**: `POST {team.feedback.service.url}/feedback/profesor/chat`

**Payload enviado al LLM**:
```json
{
    "sessionId": "user-session-123",
    "message": "¿Cómo le fue a la clase con id 5?",
    "userRole": "coordinador",
    "callbackUrl": "http://localhost:8080/api/chat/llm-update"
}
```

## Ejemplo Completo Frontend

```html
<!DOCTYPE html>
<html>
<head>
    <title>Chat Test</title>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="Escribe tu mensaje...">
    <button onclick="sendMessage()">Enviar</button>

    <script>
        const sessionId = 'session-' + Date.now();
        let stompClient = null;

        // Conectar
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function(frame) {
            console.log('Connected: ' + frame);
            
            // Suscribirse al tópico
            stompClient.subscribe(`/topic/chat/${sessionId}`, function(message) {
                const response = JSON.parse(message.body);
                displayMessage(response);
            });
        });

        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = {
                sessionId: sessionId,
                message: messageInput.value,
                userRole: 'profesor'
            };

            stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
            messageInput.value = '';
        }

        function displayMessage(response) {
            const messagesDiv = document.getElementById('messages');
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `
                <strong>${response.messageType}:</strong> ${response.message}
                <small>(${response.timestamp})</small>
            `;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    </script>
</body>
</html>
```

## Configuración Adicional

### application.properties
```properties
# URL del servicio LLM
team.feedback.service.url=http://localhost:8001

# Configuración de WebSocket (opcional)
spring.websocket.sockjs.heartbeat.time=25000
```

### CORS para WebSocket
La configuración actual permite conexiones desde cualquier origen (`*`). En producción, especifica los orígenes permitidos:

```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins("http://localhost:3000", "https://tu-frontend.com")
            .withSockJS();
}
```
