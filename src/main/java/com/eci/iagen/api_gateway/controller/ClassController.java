package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.ClassDTO;
import com.eci.iagen.api_gateway.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public ResponseEntity<List<ClassDTO>> getAllClasses() {
        List<ClassDTO> classes = classService.getAllClasses();
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassDTO> getClassById(@PathVariable Long id) {
        return classService.getClassById(id)
                .map(classDto -> ResponseEntity.ok(classDto))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ClassDTO> getClassByName(@PathVariable String name) {
        return classService.getClassByName(name)
                .map(classDto -> ResponseEntity.ok(classDto))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<ClassDTO>> getClassesByProfessorId(@PathVariable Long professorId) {
        List<ClassDTO> classes = classService.getClassesByProfessorId(professorId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<ClassDTO>> getClassesByTeamId(@PathVariable Long teamId) {
        List<ClassDTO> classes = classService.getClassesByTeamId(teamId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<ClassDTO>> getClassesBySemester(@PathVariable String semester) {
        List<ClassDTO> classes = classService.getClassesBySemester(semester);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClassDTO>> getClassesByNameContaining(@RequestParam String name) {
        List<ClassDTO> classes = classService.getClassesByNameContaining(name);
        return ResponseEntity.ok(classes);
    }

    @PostMapping
    public ResponseEntity<ClassDTO> createClass(@RequestBody ClassDTO classDTO) {
        try {
            ClassDTO createdClass = classService.createClass(classDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdClass);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassDTO> updateClass(@PathVariable Long id, @RequestBody ClassDTO classDTO) {
        try {
            return classService.updateClass(id, classDTO)
                    .map(classDto -> ResponseEntity.ok(classDto))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{classId}/teams/{teamId}")
    public ResponseEntity<ClassDTO> addTeamToClass(@PathVariable Long classId, @PathVariable Long teamId) {
        try {
            ClassDTO classDto = classService.addTeamToClass(classId, teamId);
            return ResponseEntity.ok(classDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{classId}/teams/{teamId}")
    public ResponseEntity<ClassDTO> removeTeamFromClass(@PathVariable Long classId, @PathVariable Long teamId) {
        try {
            ClassDTO classDto = classService.removeTeamFromClass(classId, teamId);
            return ResponseEntity.ok(classDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{classId}/teams")
    public ResponseEntity<ClassDTO> updateClassTeams(@PathVariable Long classId, @RequestBody List<Long> teamIds) {
        try {
            ClassDTO classDto = classService.updateClassTeams(classId, teamIds);
            return ResponseEntity.ok(classDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        if (classService.deleteClass(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
