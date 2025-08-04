package com.eci.iagen.api_gateway.repository;

import com.eci.iagen.api_gateway.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u JOIN u.teams t WHERE t.id = :teamId")
    List<User> findUsersByTeamId(@Param("teamId") Long teamId);
    
    @Modifying
    @Query(value = "DELETE FROM api_gateway.team_user WHERE user_id = :userId", nativeQuery = true)
    void deleteUserTeamRelationships(@Param("userId") Long userId);
    
    @Modifying
    @Query(value = "INSERT INTO api_gateway.team_user (user_id, team_id) VALUES (:userId, :teamId)", nativeQuery = true)
    void addUserTeamRelationship(@Param("userId") Long userId, @Param("teamId") Long teamId);
    
    @Modifying
    @Query(value = "DELETE FROM api_gateway.team_user WHERE user_id = :userId AND team_id = :teamId", nativeQuery = true)
    void removeUserTeamRelationship(@Param("userId") Long userId, @Param("teamId") Long teamId);
}
