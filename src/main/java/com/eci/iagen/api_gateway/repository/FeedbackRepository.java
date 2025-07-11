package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByEvaluationId(Long evaluationId);
    
    Optional<Feedback> findByEvaluationIdAndId(Long evaluationId, Long feedbackId);
    
    @Query("SELECT f FROM Feedback f WHERE f.evaluation.submission.id = :submissionId")
    List<Feedback> findBySubmissionId(@Param("submissionId") Long submissionId);
    
    @Query("SELECT f FROM Feedback f WHERE f.evaluation.evaluator.id = :evaluatorId")
    List<Feedback> findByEvaluatorId(@Param("evaluatorId") Long evaluatorId);
    
    @Query("SELECT f FROM Feedback f WHERE f.evaluation.submission.team.id = :teamId")
    List<Feedback> findByTeamId(@Param("teamId") Long teamId);
    
    @Query("SELECT f FROM Feedback f WHERE f.evaluation.submission.assignment.id = :assignmentId")
    List<Feedback> findByAssignmentId(@Param("assignmentId") Long assignmentId);
    
    @Query("SELECT f FROM Feedback f WHERE f.strengths IS NOT NULL AND f.strengths != ''")
    List<Feedback> findFeedbackWithStrengths();
    
    @Query("SELECT f FROM Feedback f WHERE f.improvements IS NOT NULL AND f.improvements != ''")
    List<Feedback> findFeedbackWithImprovements();
}
