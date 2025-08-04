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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.service.EvaluationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EvaluationController {

    private final EvaluationService evaluationService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(EvaluationController.class);


    @GetMapping
    public ResponseEntity<List<EvaluationDTO>> getAllEvaluations() {
        List<EvaluationDTO> evaluations = evaluationService.getAllEvaluations();
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvaluationDTO> getEvaluationById(@PathVariable Long id) {
        return evaluationService.getEvaluationById(id)
                .map(evaluation -> ResponseEntity.ok(evaluation))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EvaluationDTO> createEvaluation(@RequestBody EvaluationDTO evaluationDTO) {
        try {
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvaluation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EvaluationDTO> updateEvaluation(@PathVariable Long id,
            @RequestBody EvaluationDTO evaluationDTO) {
        try {
            return evaluationService.updateEvaluation(id, evaluationDTO)
                    .map(evaluation -> ResponseEntity.ok(evaluation))
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvaluation(@PathVariable Long id) {
        if (evaluationService.deleteEvaluation(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/auto/scheduler/{submissionId}/{evaluatorId}")
    public ResponseEntity<EvaluationDTO> autoEvaluateGitHubCommits(
            @PathVariable Long submissionId,
            @PathVariable Long evaluatorId) {
        try {
            logger.info("Auto-evaluating GitHub commits for submission {} by evaluator {}", submissionId, evaluatorId);
            EvaluationDTO evaluation = evaluationService.evaluateGitHubCommits(submissionId, evaluatorId);
            return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/auto/good-practice/{submissionId}/{evaluatorId}")
    public ResponseEntity<EvaluationDTO> autoEvaluateGoodPractices(
            @PathVariable Long submissionId,
            @PathVariable Long evaluatorId,
            @RequestParam(name = "using-ia", defaultValue = "false") boolean usingIA) {
        try {
            logger.info("Auto-evaluating good practices for submission {} by evaluator {} using {}",
                       submissionId, evaluatorId, usingIA ? "LLM Analysis" : "Checkstyle Analysis");
            EvaluationDTO evaluation = evaluationService.evaluateGoodPractices(submissionId, evaluatorId, usingIA);
            return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
}
