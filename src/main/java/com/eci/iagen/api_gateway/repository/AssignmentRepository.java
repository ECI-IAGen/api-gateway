package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    // Búsquedas básicas
    @Query("SELECT a FROM Assignment a WHERE a.title LIKE %:title%")
    List<Assignment> findByTitleContaining(@Param("title") String title);
    
    @Query("SELECT a FROM Assignment a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    List<Assignment> findByTitleOrDescriptionContaining(@Param("title") String title, @Param("description") String description);
    
    // Búsquedas por fechas
    @Query("SELECT a FROM Assignment a WHERE a.dueDate >= :currentDate ORDER BY a.dueDate ASC")
    List<Assignment> findUpcomingAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT a FROM Assignment a WHERE a.dueDate < :currentDate ORDER BY a.dueDate DESC")
    List<Assignment> findPastAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT a FROM Assignment a WHERE a.startDate <= :currentDate AND a.dueDate >= :currentDate")
    List<Assignment> findActiveAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT a FROM Assignment a WHERE a.startDate BETWEEN :startDate AND :endDate ORDER BY a.startDate ASC")
    List<Assignment> findAssignmentsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT a FROM Assignment a WHERE a.dueDate BETWEEN :currentDate AND :futureDate ORDER BY a.dueDate ASC")
    List<Assignment> findAssignmentsDueWithin(@Param("currentDate") LocalDateTime currentDate, @Param("futureDate") LocalDateTime futureDate);
    
    // Búsquedas por prioridad temporal
    @Query("SELECT a FROM Assignment a WHERE a.dueDate <= :deadline ORDER BY a.dueDate ASC")
    List<Assignment> findAssignmentsDueBefore(@Param("deadline") LocalDateTime deadline);
    
    @Query("SELECT a FROM Assignment a WHERE a.startDate >= :startTime ORDER BY a.startDate ASC")
    List<Assignment> findAssignmentsStartingAfter(@Param("startTime") LocalDateTime startTime);
    
    // Estadísticas y conteos
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.dueDate >= :currentDate")
    Long countUpcomingAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.dueDate < :currentDate")
    Long countPastAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.startDate <= :currentDate AND a.dueDate >= :currentDate")
    Long countActiveAssignments(@Param("currentDate") LocalDateTime currentDate);
    
    // Validaciones de existencia
    boolean existsByTitle(String title);
    
    @Query("SELECT a FROM Assignment a WHERE a.title = :title AND a.id != :id")
    Optional<Assignment> findByTitleAndIdNot(@Param("title") String title, @Param("id") Long id);
    
    // Operaciones de limpieza
    @Modifying
    @Query("DELETE FROM Assignment a WHERE a.dueDate < :cutoffDate")
    int deleteOldAssignments(@Param("cutoffDate") LocalDateTime cutoffDate);
}
