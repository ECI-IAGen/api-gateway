package com.eci.iagen.api_gateway.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleComplianceResponse {
    private BigDecimal penalizedScore;
    private BigDecimal originalScore;
    private int lateDays;
    private BigDecimal penaltyApplied;
    private boolean isLate;
    private String evaluationCriteria;
    private LocalDateTime evaluationDate;
    private List<Map<String, Object>> commitDetails;
}
