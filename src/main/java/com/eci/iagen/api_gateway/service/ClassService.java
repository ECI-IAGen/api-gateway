package com.eci.iagen.api_gateway.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eci.iagen.api_gateway.dto.ClassDTO;
import com.eci.iagen.api_gateway.entity.Class;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.ClassRepository;
import com.eci.iagen.api_gateway.repository.TeamRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;

    @Transactional(readOnly = true)
    public List<ClassDTO> getAllClasses() {
        return classRepository.findAllWithTeamsAndProfessor().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ClassDTO> getClassById(Long id) {
        return classRepository.findByIdWithTeamsAndProfessor(id)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Optional<ClassDTO> getClassByName(String name) {
        return classRepository.findByName(name)
                .map(this::convertToDTO);
    }
    
    @Transactional
    public ClassDTO createClass(ClassDTO classDTO) {
        if (classRepository.existsByName(classDTO.getName())) {
            throw new IllegalArgumentException("Class with name '" + classDTO.getName() + "' already exists");
        }

        User professor = userRepository.findById(classDTO.getProfessorId())
                .orElseThrow(() -> new IllegalArgumentException("Professor with id " + classDTO.getProfessorId() + " not found"));
        
        // Validar profesor de laboratorio si se proporciona
        User laboratoryProfessor = null;
        if (classDTO.getLaboratoryProfessorId() != null) {
            laboratoryProfessor = userRepository.findById(classDTO.getLaboratoryProfessorId())
                    .orElseThrow(() -> new IllegalArgumentException("Laboratory professor with id " + classDTO.getLaboratoryProfessorId() + " not found"));
        }

        Class classEntity = new Class();
        classEntity.setName(classDTO.getName());
        classEntity.setDescription(classDTO.getDescription());
        classEntity.setProfessor(professor);
        classEntity.setLaboratoryProfessor(laboratoryProfessor);
        classEntity.setSemester(classDTO.getSemester());
        classEntity.setCreatedAt(LocalDateTime.now());

        Class savedClass = classRepository.save(classEntity);
        
        // Manejar la asignación inicial de equipos
        if (classDTO.getTeamIds() != null && !classDTO.getTeamIds().isEmpty()) {
            updateClassTeams(savedClass.getId(), classDTO.getTeamIds());
        }
        
        return convertToDTO(classRepository.findById(savedClass.getId()).orElse(savedClass));
    }

    @Transactional
    public Optional<ClassDTO> updateClass(Long id, ClassDTO classDTO) {
        return classRepository.findById(id)
                .map(classEntity -> {
                    if (!classEntity.getName().equals(classDTO.getName()) && 
                        classRepository.existsByName(classDTO.getName())) {
                        throw new IllegalArgumentException("Class with name '" + classDTO.getName() + "' already exists");
                    }

                    User professor = userRepository.findById(classDTO.getProfessorId())
                            .orElseThrow(() -> new IllegalArgumentException("Professor with id " + classDTO.getProfessorId() + " not found"));
                    
                    // Validar profesor de laboratorio si se proporciona
                    User laboratoryProfessor = null;
                    if (classDTO.getLaboratoryProfessorId() != null) {
                        laboratoryProfessor = userRepository.findById(classDTO.getLaboratoryProfessorId())
                                .orElseThrow(() -> new IllegalArgumentException("Laboratory professor with id " + classDTO.getLaboratoryProfessorId() + " not found"));
                    }

                    classEntity.setName(classDTO.getName());
                    classEntity.setDescription(classDTO.getDescription());
                    classEntity.setProfessor(professor);
                    classEntity.setLaboratoryProfessor(laboratoryProfessor);
                    classEntity.setSemester(classDTO.getSemester());

                    Class savedClass = classRepository.save(classEntity);
                    
                    // Actualizar la asignación de equipos
                    updateClassTeams(savedClass.getId(), classDTO.getTeamIds());
                    
                    return convertToDTO(classRepository.findById(savedClass.getId()).orElse(savedClass));
                });
    }

    @Transactional
    public boolean deleteClass(Long id) {
        if (classRepository.existsById(id)) {
            classRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Actualiza los equipos de una clase
     */
    @Transactional
    public ClassDTO updateClassTeams(Long classId, List<Long> teamIds) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class with id " + classId + " not found"));
        
        // Verificar que todos los equipos existen si se proporcionaron
        if (teamIds != null && !teamIds.isEmpty()) {
            for (Long teamId : teamIds) {
                if (!teamRepository.existsById(teamId)) {
                    throw new IllegalArgumentException("Team with id " + teamId + " not found");
                }
            }
        }
        
        // Obtener la colección actual de equipos de forma segura
        Set<Team> currentTeams = new HashSet<>(classEntity.getTeams());
        
        // Crear nuevo conjunto con los equipos deseados
        Set<Team> newTeams = new HashSet<>();
        if (teamIds != null && !teamIds.isEmpty()) {
            for (Long teamId : teamIds) {
                Team team = teamRepository.findById(teamId)
                        .orElseThrow(() -> new IllegalArgumentException("Team with id " + teamId + " not found"));
                newTeams.add(team);
            }
        }
        
        // Remover equipos que ya no están en la nueva lista
        for (Team currentTeam : currentTeams) {
            if (!newTeams.contains(currentTeam)) {
                classEntity.getTeams().remove(currentTeam);
            }
        }
        
        // Agregar equipos que no estaban en la lista actual
        for (Team newTeam : newTeams) {
            if (!currentTeams.contains(newTeam)) {
                classEntity.getTeams().add(newTeam);
            }
        }
        
        classRepository.save(classEntity);
        return convertToDTO(classEntity);
    }

    /**
     * Agrega un equipo específico a una clase
     * 
     * @param classId ID de la clase
     * @param teamId ID del equipo a agregar
     * @throws IllegalArgumentException si la clase o el equipo no existen, o si el equipo ya está en la clase
     */
    @Transactional
    public void addTeamToClass(Long classId, Long teamId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class with id " + classId + " not found"));
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team with id " + teamId + " not found"));
        
        // Verificar si el equipo ya está asignado a esta clase
        if (classEntity.getTeams().contains(team)) {
            throw new IllegalArgumentException("Team with id " + teamId + " is already assigned to class " + classId);
        }
        
        // Agregar el equipo a la clase
        classEntity.getTeams().add(team);
        classRepository.save(classEntity);
    }

    /**
     * Remueve un equipo específico de una clase
     * 
     * @param classId ID de la clase
     * @param teamId ID del equipo a remover
     * @throws IllegalArgumentException si la clase o el equipo no existen, o si el equipo no está en la clase
     */
    @Transactional
    public void removeTeamFromClass(Long classId, Long teamId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class with id " + classId + " not found"));
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team with id " + teamId + " not found"));
        
        // Verificar si el equipo está asignado a esta clase
        if (!classEntity.getTeams().contains(team)) {
            throw new IllegalArgumentException("Team with id " + teamId + " is not assigned to class " + classId);
        }
        
        // Remover el equipo de la clase
        classEntity.getTeams().remove(team);
        classRepository.save(classEntity);
    }

    private ClassDTO convertToDTO(Class classEntity) {
        return new ClassDTO(
                classEntity.getId(),
                classEntity.getName(),
                classEntity.getDescription(),
                classEntity.getProfessor().getId(),
                classEntity.getProfessor().getName(),
                classEntity.getLaboratoryProfessor() != null ? classEntity.getLaboratoryProfessor().getId() : null,
                classEntity.getLaboratoryProfessor() != null ? classEntity.getLaboratoryProfessor().getName() : null,
                classEntity.getCreatedAt(),
                classEntity.getSemester(),
                classEntity.getTeams().stream().map(Team::getId).collect(Collectors.toList()),
                classEntity.getTeams().stream().map(Team::getName).collect(Collectors.toList())
        );
    }
}
