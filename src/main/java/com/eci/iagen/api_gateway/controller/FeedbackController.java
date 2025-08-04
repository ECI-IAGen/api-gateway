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

import com.eci.iagen.api_gateway.dto.FeedbackDTO;
import com.eci.iagen.api_gateway.dto.request.GeneralFeedbackRequest;
import com.eci.iagen.api_gateway.dto.response.GeneralFeedbackResponse;
import com.eci.iagen.api_gateway.service.FeedbackService;

import lombok.RequiredArgsConstructor;

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

    @PostMapping("/auto/equipo/{submissionId}")
    public ResponseEntity<FeedbackDTO> generateTeamFeedback(@PathVariable Long submissionId) {
        try {
            FeedbackDTO feedback = feedbackService.generateTeamFeedback(submissionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(feedback);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/auto/coordinador")
    public ResponseEntity<GeneralFeedbackResponse> generateCoordinatorFeedback(@RequestBody GeneralFeedbackRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            GeneralFeedbackResponse response = feedbackService.generateCoordinatorFeedback(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/auto/profesor")
    public ResponseEntity<GeneralFeedbackResponse> generateTeacherFeedback(@RequestBody GeneralFeedbackRequest request) {
        try {
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            GeneralFeedbackResponse response = feedbackService.generateTeacherFeedback(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
