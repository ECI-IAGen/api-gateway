package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedbackDTO>> getAllFeedbacks() {
        List<FeedbackDTO> feedbacks = feedbackService.getAllFeedbacks();
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(@PathVariable Long id) {
        return feedbackService.getFeedbackById(id)
                .map(feedback -> ResponseEntity.ok(feedback))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/evaluation/{evaluationId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByEvaluationId(@PathVariable Long evaluationId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByEvaluationId(evaluationId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksBySubmissionId(@PathVariable Long submissionId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksBySubmissionId(submissionId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/evaluator/{evaluatorId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByEvaluatorId(@PathVariable Long evaluatorId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByEvaluatorId(evaluatorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByTeamId(@PathVariable Long teamId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByTeamId(teamId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksByAssignmentId(@PathVariable Long assignmentId) {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksByAssignmentId(assignmentId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/with-strengths")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksWithStrengths() {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksWithStrengths();
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/with-improvements")
    public ResponseEntity<List<FeedbackDTO>> getFeedbacksWithImprovements() {
        List<FeedbackDTO> feedbacks = feedbackService.getFeedbacksWithImprovements();
        return ResponseEntity.ok(feedbacks);
    }

    @PostMapping
    public ResponseEntity<FeedbackDTO> createFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        try {
            FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFeedback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDTO> updateFeedback(@PathVariable Long id, @RequestBody FeedbackDTO feedbackDTO) {
        try {
            return feedbackService.updateFeedback(id, feedbackDTO)
                    .map(feedback -> ResponseEntity.ok(feedback))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        if (feedbackService.deleteFeedback(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
