package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.SubmissionDTO;
import com.eci.iagen.api_gateway.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignmentId(@PathVariable Long assignmentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentId(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByTeamId(@PathVariable Long teamId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByTeamId(teamId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/team/{teamId}")
    public ResponseEntity<SubmissionDTO> getSubmissionByAssignmentAndTeam(
            @PathVariable Long assignmentId, @PathVariable Long teamId) {
        return submissionService.getSubmissionByAssignmentAndTeam(assignmentId, teamId)
                .map(submission -> ResponseEntity.ok(submission))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByUserId(@PathVariable Long userId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByUserId(userId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/between")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/ordered")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssignmentOrderByDate(@PathVariable Long assignmentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssignmentOrderByDate(assignmentId);
        return ResponseEntity.ok(submissions);
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
