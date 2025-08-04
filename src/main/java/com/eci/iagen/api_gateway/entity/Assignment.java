package com.eci.iagen.api_gateway.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assignment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text", nullable = false)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    // The class this assignment belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    @JsonIgnore
    private Class classEntity;
    
    // Submissions for this assignment
    @OneToMany(mappedBy = "assignment", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Submission> submissions;
}
