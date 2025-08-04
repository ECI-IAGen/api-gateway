package com.eci.iagen.api_gateway.dto.jplag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JPlagSubmissionDTO {
    private Long submissionId;
    private Long teamId;
    private String teamName;
    private String repositoryUrl;
    private List<String> memberNames;
}
