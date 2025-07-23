package com.eci.iagen.api_gateway.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false, unique = true)
    private Evaluation evaluation;
    
    @Column(name = "feedback_type", nullable = false)
    private String feedbackType;
    
    @Column(columnDefinition = "text")
    private String content;
    
    @Column(name = "feedback_date")
    private LocalDateTime feedbackDate;
    
    // Keep legacy fields for backward compatibility
    @Column(columnDefinition = "text")
    private String strengths;

    @Column(columnDefinition = "text")
    private String improvements;

    @Column(columnDefinition = "text")
    private String comments;
}
