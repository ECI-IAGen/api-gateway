package com.eci.iagen.api_gateway.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eci.iagen.api_gateway.entity.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    @Query("SELECT a FROM Assignment a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    List<Assignment> findByTitleOrDescriptionContaining(@Param("title") String title, @Param("description") String description);
    
    // Validaciones de existencia
    boolean existsByTitle(String title);

    @Query("SELECT a FROM Assignment a WHERE a.title = :title AND a.id != :id")
    Optional<Assignment> findByTitleAndIdNot(@Param("title") String title, @Param("id") Long id);
}
