package com.eci.iagen.api_gateway.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

import com.eci.iagen.api_gateway.dto.EvaluationDTO;
import com.eci.iagen.api_gateway.dto.SubmissionDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamFeedbackRequest {
    private SubmissionDTO submission;
    private List<EvaluationDTO> evaluations;
}
