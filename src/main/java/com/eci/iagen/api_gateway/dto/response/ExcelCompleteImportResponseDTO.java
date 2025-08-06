package com.eci.iagen.api_gateway.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * DTO específico para respuestas de importación de formato completo
 * Extiende las funcionalidades básicas para incluir información específica
 * de procesamiento de múltiples hojas
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class ExcelCompleteImportResponseDTO extends ExcelImportResponseDTO {
    
    private List<SheetProcessingResult> sheetResults;
    private String formatVersion;
    private ProcessingSummary processingSummary;

    public ExcelCompleteImportResponseDTO(boolean success, String message, ImportStats stats, 
                                        List<String> errors, List<SheetProcessingResult> sheetResults,
                                        String formatVersion, ProcessingSummary processingSummary) {
        super(success, message, stats, errors);
        this.sheetResults = sheetResults;
        this.formatVersion = formatVersion;
        this.processingSummary = processingSummary;
    }

    /**
     * Resultado del procesamiento de una hoja específica
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SheetProcessingResult {
        private String sheetName;
        private String processingType;
        private boolean processed;
        private int rowsProcessed;
        private int recordsCreated;
        private int recordsUpdated;
        private List<String> warnings;
        private String processingTime;
    }

    /**
     * Resumen consolidado del procesamiento
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingSummary {
        private int totalSheetsFound;
        private int totalSheetsProcessed;
        private int totalRowsProcessed;
        private String totalProcessingTime;
        private List<String> skippedSheets;
        private boolean hasWarnings;
        private boolean hasErrors;
    }
}
