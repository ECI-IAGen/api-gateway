package com.eci.iagen.api_gateway.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "team")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Team {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @ManyToMany(mappedBy = "teams", fetch = FetchType.LAZY)
    private Set<User> users = new HashSet<>();
    
    // Relación muchos a muchos con clases
    @ManyToMany(mappedBy = "teams", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Class> classes = new HashSet<>();
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Team team = (Team) o;
        return Objects.equals(id, team.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
