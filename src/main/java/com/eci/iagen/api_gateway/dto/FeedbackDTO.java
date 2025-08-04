package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long submissionId;
    private String feedbackType;
    private String content;
    private LocalDateTime feedbackDate;
    
    private String strengths;
    private String improvements;
    
    // Helper fields for display
    private String teamName;
    private String assignmentTitle;
}
