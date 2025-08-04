package com.eci.iagen.api_gateway.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleComplianceRequest {
    private String repositoryUrl;
    private LocalDateTime dueDate;
    private LocalDateTime submissionDate;
    private List<CommitInfo> commits;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommitInfo {
        private String sha;
        private String message;
        private LocalDateTime date;
    }

    @Override
    public String toString() {
        return "ScheduleComplianceRequest{" +
                "repositoryUrl='" + repositoryUrl + '\'' +
                ", dueDate=" + dueDate +
                ", submissionDate=" + submissionDate +
                ", commits=" + commits +
                '}';
    }
}
