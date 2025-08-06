package com.eci.iagen.api_gateway.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ClassDTO {
    private Long id;
    private String name;
    private String description;
    private Long professorId;
    private String professorName;
    private Long laboratoryProfessorId;
    private String laboratoryProfessorName;
    private LocalDateTime createdAt;
    private String semester;
    private List<Long> teamIds = new ArrayList<>();
    private List<String> teamNames = new ArrayList<>();
    
    // Constructor para asegurar que las listas no sean null
    public ClassDTO(Long id, String name, String description, Long professorId, String professorName, 
                   Long laboratoryProfessorId, String laboratoryProfessorName,
                   LocalDateTime createdAt, String semester) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.professorId = professorId;
        this.professorName = professorName;
        this.laboratoryProfessorId = laboratoryProfessorId;
        this.laboratoryProfessorName = laboratoryProfessorName;
        this.createdAt = createdAt;
        this.semester = semester;
        this.teamIds = new ArrayList<>();
        this.teamNames = new ArrayList<>();
    }
    
    // Constructor completo con equipos
    public ClassDTO(Long id, String name, String description, Long professorId, String professorName, 
                   Long laboratoryProfessorId, String laboratoryProfessorName,
                   LocalDateTime createdAt, String semester, List<Long> teamIds, List<String> teamNames) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.professorId = professorId;
        this.professorName = professorName;
        this.laboratoryProfessorId = laboratoryProfessorId;
        this.laboratoryProfessorName = laboratoryProfessorName;
        this.createdAt = createdAt;
        this.semester = semester;
        this.teamIds = teamIds != null ? teamIds : new ArrayList<>();
        this.teamNames = teamNames != null ? teamNames : new ArrayList<>();
    }
}
