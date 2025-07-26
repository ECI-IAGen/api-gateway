package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDTO {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long teamId;
    private String teamName;
    private LocalDateTime submittedAt;
    private String fileUrl;
    private Long classId;
    private String className;
    
    // Constructor para compatibilidad con código existente
    public SubmissionDTO(Long id, Long assignmentId, String assignmentTitle, 
                        Long teamId, String teamName, LocalDateTime submittedAt, String fileUrl) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.assignmentTitle = assignmentTitle;
        this.teamId = teamId;
        this.teamName = teamName;
        this.submittedAt = submittedAt;
        this.fileUrl = fileUrl;
    }
}
