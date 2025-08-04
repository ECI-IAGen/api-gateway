package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.TeamDTO;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.TeamRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<TeamDTO> getTeamById(Long id) {
        return teamRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional
    public TeamDTO createTeam(TeamDTO teamDTO) {
        if (teamRepository.existsByName(teamDTO.getName())) {
            throw new IllegalArgumentException("Team with name '" + teamDTO.getName() + "' already exists");
        }

        Team team = new Team();
        team.setName(teamDTO.getName());

        Team savedTeam = teamRepository.save(team);
        
        // Manejar la asignación inicial de usuarios
        if (teamDTO.getUserIds() != null && !teamDTO.getUserIds().isEmpty()) {
            updateTeamUsers(savedTeam.getId(), teamDTO.getUserIds());
        }
        
        return convertToDTO(savedTeam);
    }

    @Transactional
    public Optional<TeamDTO> updateTeam(Long id, TeamDTO teamDTO) {
        return teamRepository.findById(id)
                .map(team -> {
                    if (!team.getName().equals(teamDTO.getName()) && 
                        teamRepository.existsByName(teamDTO.getName())) {
                        throw new IllegalArgumentException("Team with name '" + teamDTO.getName() + "' already exists");
                    }
                    team.setName(teamDTO.getName());
                    Team savedTeam = teamRepository.save(team);
                    
                    // Actualizar la asignación de usuarios del equipo
                    updateTeamUsers(savedTeam.getId(), teamDTO.getUserIds());
                    
                    return convertToDTO(savedTeam);
                });
    }

    @Transactional
    public boolean deleteTeam(Long id) {
        if (teamRepository.existsById(id)) {
            teamRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Actualiza los usuarios de un equipo
     */
    @Transactional
    public TeamDTO updateTeamUsers(Long teamId, List<Long> userIds) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team with id " + teamId + " not found"));
        
        // Verificar que todos los usuarios existen si se proporcionaron
        if (userIds != null && !userIds.isEmpty()) {
            for (Long userId : userIds) {
                if (!userRepository.existsById(userId)) {
                    throw new IllegalArgumentException("User with id " + userId + " not found");
                }
            }
        }
        
        // Obtener todos los usuarios actuales del equipo
        List<User> currentUsers = userRepository.findUsersByTeamId(teamId);
        
        // Remover el equipo de todos los usuarios actuales usando queries nativas
        for (User user : currentUsers) {
            userRepository.removeUserTeamRelationship(user.getId(), teamId);
        }
        
        // Agregar el equipo a los nuevos usuarios usando queries nativas
        if (userIds != null && !userIds.isEmpty()) {
            for (Long userId : userIds) {
                userRepository.addUserTeamRelationship(userId, teamId);
            }
        }
        
        return convertToDTO(team);
    }

    private TeamDTO convertToDTO(Team team) {
        List<User> users = userRepository.findUsersByTeamId(team.getId());
        
        return new TeamDTO(
                team.getId(),
                team.getName(),
                users.stream().map(User::getId).collect(Collectors.toList()),
                users.stream().map(User::getName).collect(Collectors.toList())
        );
    }
}
