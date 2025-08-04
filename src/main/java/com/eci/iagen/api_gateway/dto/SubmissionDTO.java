package com.eci.iagen.api_gateway.dto;

import com.eci.iagen.api_gateway.entity.Submission;
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
    
    public static SubmissionDTO fromEntity(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO(
                submission.getId(),
                submission.getAssignment().getId(),
                submission.getAssignment().getTitle(),
                submission.getTeam().getId(),
                submission.getTeam().getName(),
                submission.getSubmittedAt(),
                submission.getFileUrl()
        );
        
        // Agregar información de la clase
        if (submission.getAssignment().getClassEntity() != null) {
            dto.setClassId(submission.getAssignment().getClassEntity().getId());
            dto.setClassName(submission.getAssignment().getClassEntity().getName());
        }
        
        return dto;
    }
}
