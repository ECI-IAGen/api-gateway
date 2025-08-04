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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long id) {
        if (classService.deleteClass(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
