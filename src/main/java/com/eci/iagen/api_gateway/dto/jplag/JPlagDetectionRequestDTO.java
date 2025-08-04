package com.eci.iagen.api_gateway.dto.jplag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JPlagDetectionRequestDTO {
    private Long assignmentId;
    private String assignmentTitle;
    private List<JPlagSubmissionDTO> submissions;
}
