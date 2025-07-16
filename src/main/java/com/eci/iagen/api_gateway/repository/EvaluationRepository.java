package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Evaluation;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    List<Evaluation> findBySubmissionId(Long submissionId);

    List<Evaluation> findByEvaluatorId(Long evaluatorId);

    boolean existsBySubmissionIdAndEvaluatorId(Long submissionId, Long evaluatorId);

    @Query("SELECT e FROM Evaluation e WHERE e.submission.id = :submissionId AND e.evaluator.id = :evaluatorId")
    Optional<Evaluation> findBySubmissionIdAndEvaluatorId(@Param("submissionId") Long submissionId,
            @Param("evaluatorId") Long evaluatorId);

    @Query("SELECT e FROM Evaluation e WHERE e.score >= :minScore AND e.score <= :maxScore")
    List<Evaluation> findByScoreBetween(@Param("minScore") BigDecimal minScore,
            @Param("maxScore") BigDecimal maxScore);

    @Query("SELECT e FROM Evaluation e WHERE e.createdAt BETWEEN :startDate AND :endDate")
    List<Evaluation> findEvaluationsBetweenDates(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(e.score) FROM Evaluation e WHERE e.submission.assignment.id = :assignmentId")
    BigDecimal findAverageScoreByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT e FROM Evaluation e WHERE e.submission.team.id = :teamId ORDER BY e.createdAt DESC")
    List<Evaluation> findByTeamIdOrderByCreatedAtDesc(@Param("teamId") Long teamId);

    @Query("SELECT e FROM Evaluation e WHERE e.submission.assignment.id = :assignmentId")
    List<Evaluation> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT e FROM Evaluation e WHERE e.createdAt > e.submission.assignment.dueDate")
    List<Evaluation> findLateEvaluations();

    long countBySubmissionId(Long submissionId);

    @Query("SELECT COUNT(e) > 0 FROM Evaluation e WHERE e.submission.fileUrl = :repoUrl")
    boolean existsByRepositoryUrl(@Param("repoUrl") String repoUrl);

    @Query("SELECT e FROM Evaluation e WHERE e.submission.fileUrl = :repoUrl ORDER BY e.createdAt DESC")
    List<Evaluation> findLastEvaluationByRepoUrl(@Param("repoUrl") String repoUrl, Pageable pageable);
}
