package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.entity.Role;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.RoleRepository;
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
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserDTO> getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRoleId(Long roleId) {
        return userRepository.findByRoleId(roleId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByNameContaining(String name) {
        return userRepository.findByNameContaining(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("User with email '" + userDTO.getEmail() + "' already exists");
        }

        Role role = roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role with id " + userDTO.getRoleId() + " not found"));

        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setRole(role);

        User savedUser = userRepository.save(user);
        
        // Manejar la asignación de equipos
        if (userDTO.getTeamIds() != null && !userDTO.getTeamIds().isEmpty()) {
            updateUserTeams(savedUser.getId(), userDTO.getTeamIds());
        }
        
        return convertToDTO(userRepository.findById(savedUser.getId()).orElse(savedUser));
    }

    @Transactional
    public Optional<UserDTO> updateUser(Long id, UserDTO userDTO) {
        return userRepository.findById(id)
                .map(user -> {
                    if (!user.getEmail().equals(userDTO.getEmail()) && 
                        userRepository.existsByEmail(userDTO.getEmail())) {
                        throw new IllegalArgumentException("User with email '" + userDTO.getEmail() + "' already exists");
                    }

                    Role role = roleRepository.findById(userDTO.getRoleId())
                            .orElseThrow(() -> new IllegalArgumentException("Role with id " + userDTO.getRoleId() + " not found"));

                    user.setName(userDTO.getName());
                    user.setEmail(userDTO.getEmail());
                    user.setRole(role);

                    User savedUser = userRepository.save(user);
                    
                    // Actualizar la asignación de equipos
                    updateUserTeams(savedUser.getId(), userDTO.getTeamIds());

                    return convertToDTO(userRepository.findById(savedUser.getId()).orElse(savedUser));
                });
    }

    /**
     * Actualiza los equipos de un usuario
     */
    @Transactional
    private void updateUserTeams(Long userId, List<Long> teamIds) {
        // Verificar que todos los teams existen si se proporcionaron
        if (teamIds != null && !teamIds.isEmpty()) {
            List<Team> teams = teamRepository.findAllById(teamIds);
            if (teams.size() != teamIds.size()) {
                throw new IllegalArgumentException("One or more teams not found");
            }
        }
        
        // Usar queries nativas para evitar problemas con Hibernate lazy loading
        // Primero eliminar todas las relaciones existentes del usuario
        userRepository.deleteUserTeamRelationships(userId);
        
        // Luego agregar las nuevas relaciones
        if (teamIds != null && !teamIds.isEmpty()) {
            for (Long teamId : teamIds) {
                userRepository.addUserTeamRelationship(userId, teamId);
            }
        }
    }

    @Transactional
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private UserDTO convertToDTO(User user) {
        List<Team> teams = teamRepository.findTeamsByUserId(user.getId());
        
        return new UserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getId(),
                user.getRole().getName(),
                teams.stream().map(Team::getId).collect(Collectors.toList()),
                teams.stream().map(Team::getName).collect(Collectors.toList())
        );
    }
}
