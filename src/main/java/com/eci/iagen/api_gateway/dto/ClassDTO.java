package com.eci.iagen.api_gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassDTO {
    private Long id;
    private String name;
    private String description;
    private Long professorId;
    private String professorName;
    private LocalDateTime createdAt;
    private String semester;
    private List<Long> teamIds = new ArrayList<>();
    private List<String> teamNames = new ArrayList<>();
    
    // Constructor para asegurar que las listas no sean null
    public ClassDTO(Long id, String name, String description, Long professorId, String professorName, 
                   LocalDateTime createdAt, String semester) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.professorId = professorId;
        this.professorName = professorName;
        this.createdAt = createdAt;
        this.semester = semester;
        this.teamIds = new ArrayList<>();
        this.teamNames = new ArrayList<>();
    }
}
