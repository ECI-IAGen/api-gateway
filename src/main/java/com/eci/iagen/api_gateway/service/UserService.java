package com.eci.iagen.api_gateway.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.entity.Role;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.RoleRepository;
import com.eci.iagen.api_gateway.repository.TeamRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;

import lombok.RequiredArgsConstructor;

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
    public Optional<UserDTO> getUserByCarnetId(String carnetId) {
        return userRepository.findByCarnetId(carnetId)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserDTO> getUserByName(String name) {
        return userRepository.findByName(name)
                .map(this::convertToDTO);
    }

    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userDTO.getEmail() != null && userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("User with email '" + userDTO.getEmail() + "' already exists");
        }
        
        // Validar carnetId único si se proporciona
        if (userDTO.getCarnetId() != null && userRepository.existsByCarnetId(userDTO.getCarnetId())) {
            throw new IllegalArgumentException("User with carnet ID '" + userDTO.getCarnetId() + "' already exists");
        }

        Role role = roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Role with id " + userDTO.getRoleId() + " not found"));

        User user = new User();
        
        // El ID se genera automáticamente, pero podemos asignar carnetId manualmente
        user.setCarnetId(userDTO.getCarnetId());
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
                .map(existingUser -> {
                    // Verificar email duplicado solo si ha cambiado
                    if (!existingUser.getEmail().equals(userDTO.getEmail()) && 
                        userRepository.existsByEmail(userDTO.getEmail())) {
                        throw new IllegalArgumentException("User with email '" + userDTO.getEmail() + "' already exists");
                    }
                    
                    // Verificar carnetId duplicado solo si ha cambiado
                    if (userDTO.getCarnetId() != null && 
                        !Objects.equals(existingUser.getCarnetId(), userDTO.getCarnetId()) && 
                        userRepository.existsByCarnetId(userDTO.getCarnetId())) {
                        throw new IllegalArgumentException("User with carnet ID '" + userDTO.getCarnetId() + "' already exists");
                    }

                    // Validar que el rol existe
                    Role role = roleRepository.findById(userDTO.getRoleId())
                            .orElseThrow(() -> new IllegalArgumentException("Role with id " + userDTO.getRoleId() + " not found"));

                    // Actualizar campos directamente en la entidad existente (NO crear nueva instancia)
                    existingUser.setCarnetId(userDTO.getCarnetId());
                    existingUser.setName(userDTO.getName());
                    existingUser.setEmail(userDTO.getEmail());
                    existingUser.setRole(role);

                    // Guardar cambios
                    User savedUser = userRepository.save(existingUser);
                    
                    // Actualizar equipos
                    updateUserTeams(savedUser.getId(), userDTO.getTeamIds());

                    // Sincronizar con la base de datos
                    userRepository.flush();
                    
                    return convertToDTO(savedUser);
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
                user.getCarnetId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getId(),
                user.getRole().getName(),
                teams.stream().map(Team::getId).collect(Collectors.toList()),
                teams.stream().map(Team::getName).collect(Collectors.toList())
        );
    }
}
