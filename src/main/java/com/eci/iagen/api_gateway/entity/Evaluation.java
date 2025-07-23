package com.eci.iagen.api_gateway.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private User evaluator;
    
    @Column(name = "evaluation_type", nullable = false)
    private String evaluationType;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "criteria_json", columnDefinition = "text")
    private String criteriaJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // One feedback per evaluation
    @OneToOne(mappedBy = "evaluation", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private Feedback feedback;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
