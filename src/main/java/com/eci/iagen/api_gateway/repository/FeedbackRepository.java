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
    
    Optional<Feedback> findBySubmissionId(Long submissionId);

    @Query("SELECT f FROM Feedback f WHERE f.submission.assignment.id = :assignmentId")
    List<Feedback> findByAssignmentId(@Param("assignmentId") Long assignmentId);
    
}
