package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Class, Long> {
    Optional<Class> findByName(String name);
    boolean existsByName(String name);
    
    // Método optimizado para cargar clases con sus equipos y profesores
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.teams LEFT JOIN FETCH c.professor")
    List<Class> findAllWithTeamsAndProfessor();
    
    @Query("SELECT c FROM Class c LEFT JOIN FETCH c.teams LEFT JOIN FETCH c.professor WHERE c.id = :id")
    Optional<Class> findByIdWithTeamsAndProfessor(@Param("id") Long id);
    
}
