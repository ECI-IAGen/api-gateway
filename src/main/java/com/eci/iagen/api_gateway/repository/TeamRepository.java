package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByName(String name);
    boolean existsByName(String name);
    
    @Query("SELECT t FROM User u JOIN u.teams t WHERE u.id = :userId")
    List<Team> findTeamsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT t FROM Team t WHERE t.name LIKE %:name%")
    List<Team> findByNameContaining(@Param("name") String name);
}
