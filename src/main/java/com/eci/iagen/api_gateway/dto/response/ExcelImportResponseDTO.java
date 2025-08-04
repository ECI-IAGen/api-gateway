package com.eci.iagen.api_gateway.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResponseDTO {
    private boolean success;
    private String message;
    private ImportStats stats;
    private List<String> errors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImportStats {
        private int usersCreated;
        private int usersUpdated;
        private int classesCreated;
        private int classesUpdated;
        private int rolesCreated;
        private int totalProcessed;
    }
}
