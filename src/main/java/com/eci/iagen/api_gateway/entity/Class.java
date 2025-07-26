package com.eci.iagen.api_gateway.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "class")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Class {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // Ej: "Programación Avanzada 2025-1"
    
    @Column(columnDefinition = "text")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private User professor; // Usuario que es el profesor dueño de la clase
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "semester")
    private String semester; // Ej: "2025-1"
    
    // Relación con las asignaciones de esta clase
    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL)
    private List<Assignment> assignments = new ArrayList<>();
    
    // Relación muchos a muchos con equipos
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "class_team",
        joinColumns = @JoinColumn(name = "class_id"),
        inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    private Set<Team> teams = new HashSet<>();
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Class aClass = (Class) o;
        return Objects.equals(id, aClass.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
