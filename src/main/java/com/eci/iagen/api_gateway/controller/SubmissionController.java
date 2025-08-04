package com.eci.iagen.api_gateway.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.service.SubmissionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    public ResponseEntity<List<SubmissionDTO>> getAllSubmissions() {
        List<SubmissionDTO> submissions = submissionService.getAllSubmissions();
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(submission -> ResponseEntity.ok(submission))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SubmissionDTO> createSubmission(@RequestBody SubmissionDTO submissionDTO) {
        try {
            SubmissionDTO createdSubmission = submissionService.createSubmission(submissionDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubmission);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubmissionDTO> updateSubmission(@PathVariable Long id, @RequestBody SubmissionDTO submissionDTO) {
        try {
            return submissionService.updateSubmission(id, submissionDTO)
                    .map(submission -> ResponseEntity.ok(submission))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        if (submissionService.deleteSubmission(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
