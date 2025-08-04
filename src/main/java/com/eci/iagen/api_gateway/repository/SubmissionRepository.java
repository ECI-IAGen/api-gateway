package com.eci.iagen.api_gateway.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eci.iagen.api_gateway.entity.Submission;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    // Método optimizado para cargar todas las entregas con sus relaciones
    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.assignment LEFT JOIN FETCH s.team")
    List<Submission> findAllWithAssignmentAndTeam();
    
    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId AND s.team.id = :teamId")
    Optional<Submission> findByAssignmentIdAndTeamId(@Param("assignmentId") Long assignmentId, 
                                                    @Param("teamId") Long teamId);
    
    @Query("SELECT s FROM Submission s LEFT JOIN FETCH s.assignment LEFT JOIN FETCH s.team WHERE s.assignment.id = :assignmentId")
    List<Submission> findByAssignmentId(@Param("assignmentId") Long assignmentId);
}
