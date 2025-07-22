package com.eci.iagen.api_gateway.service;

import com.eci.iagen.api_gateway.dto.ClassDTO;
import com.eci.iagen.api_gateway.entity.Class;
import com.eci.iagen.api_gateway.entity.Team;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.ClassRepository;
import com.eci.iagen.api_gateway.repository.TeamRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesByProfessorId(Long professorId) {
        return classRepository.findByProfessorId(professorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesByNameContaining(String name) {
        return classRepository.findByNameContaining(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesBySemester(String semester) {
        return classRepository.findBySemester(semester).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassDTO> getClassesByTeamId(Long teamId) {
        return classRepository.findByTeamId(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassDTO createClass(ClassDTO classDTO) {
        if (classRepository.existsByName(classDTO.getName())) {
            throw new IllegalArgumentException("Class with name '" + classDTO.getName() + "' already exists");
        }

        User professor = userRepository.findById(classDTO.getProfessorId())
                .orElseThrow(() -> new IllegalArgumentException("Professor with id " + classDTO.getProfessorId() + " not found"));

        Class classEntity = new Class();
        classEntity.setName(classDTO.getName());
        classEntity.setDescription(classDTO.getDescription());
        classEntity.setProfessor(professor);
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

                    classEntity.setName(classDTO.getName());
                    classEntity.setDescription(classDTO.getDescription());
                    classEntity.setProfessor(professor);
                    classEntity.setSemester(classDTO.getSemester());

                    Class savedClass = classRepository.save(classEntity);
                    
                    // Actualizar la asignación de equipos
                    updateClassTeams(savedClass.getId(), classDTO.getTeamIds());
                    
                    return convertToDTO(classRepository.findById(savedClass.getId()).orElse(savedClass));
                });
    }

    @Transactional
    public ClassDTO addTeamToClass(Long classId, Long teamId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + classId));
        
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

        // Verificar si la relación ya existe
        boolean alreadyEnrolled = classEntity.getTeams().stream()
                .anyMatch(t -> t.getId().equals(teamId));
        
        if (!alreadyEnrolled) {
            classEntity.getTeams().add(team);
            classRepository.save(classEntity);
        }

        return convertToDTO(classEntity);
    }

    @Transactional
    public ClassDTO removeTeamFromClass(Long classId, Long teamId) {
        Class classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + classId));
        
        // Verificar que el equipo existe
        if (!teamRepository.existsById(teamId)) {
            throw new IllegalArgumentException("Team not found with id: " + teamId);
        }

        classEntity.getTeams().removeIf(team -> team.getId().equals(teamId));
        classRepository.save(classEntity);

        return convertToDTO(classEntity);
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

    private ClassDTO convertToDTO(Class classEntity) {
        return new ClassDTO(
                classEntity.getId(),
                classEntity.getName(),
                classEntity.getDescription(),
                classEntity.getProfessor().getId(),
                classEntity.getProfessor().getName(),
                classEntity.getCreatedAt(),
                classEntity.getSemester(),
                classEntity.getTeams().stream().map(Team::getId).collect(Collectors.toList()),
                classEntity.getTeams().stream().map(Team::getName).collect(Collectors.toList())
        );
    }
}
