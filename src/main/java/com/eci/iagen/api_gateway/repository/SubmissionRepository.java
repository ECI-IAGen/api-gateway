package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    // Método optimizado para cargar todas las entregas con sus relaciones
    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.assignment LEFT JOIN FETCH s.team")
    List<Submission> findAllWithAssignmentAndTeam();
    
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByTeamId(Long teamId);
    
    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.team.id = :teamId")
    Optional<Submission> findByAssignmentIdAndTeamId(@Param("assignmentId") Long assignmentId, 
                                                    @Param("teamId") Long teamId);
    
    @Query("SELECT s FROM Submission s WHERE s.submittedAt BETWEEN :startDate AND :endDate")
    List<Submission> findSubmissionsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId ORDER BY s.submittedAt DESC")
    List<Submission> findByAssignmentIdOrderBySubmittedAtDesc(@Param("assignmentId") Long assignmentId);
    
    @Query("SELECT s FROM Submission s WHERE s.team.id IN (SELECT t.id FROM User u JOIN u.teams t WHERE u.id = :userId)")
    List<Submission> findSubmissionsByUserId(@Param("userId") Long userId);
}
