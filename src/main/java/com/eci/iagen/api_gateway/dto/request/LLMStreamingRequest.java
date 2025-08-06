package com.eci.iagen.api_gateway.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LLMStreamingRequest {
    private String sessionId;
    private String partialMessage;
    private String status; // "processing", "partial", "complete", "error"
    private boolean isComplete;
}
