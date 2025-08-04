package com.eci.iagen.api_gateway.controller;

import com.eci.iagen.api_gateway.dto.response.ExcelImportResponseDTO;
import com.eci.iagen.api_gateway.service.ExcelImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ExcelImportController {

    private final ExcelImportService excelImportService;

    /**
     * Endpoint para importar datos desde un archivo Excel
     * 
     * @param file Archivo Excel a procesar
     * @return Respuesta con estadísticas de la importación
     */
    @PostMapping("/import")
    public ResponseEntity<ExcelImportResponseDTO> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Iniciando importación de archivo Excel: {}", file.getOriginalFilename());

            ExcelImportResponseDTO response = excelImportService.importExcel(file);

            if (response.isSuccess()) {
                log.info("Importación exitosa: {}", response.getMessage());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Importación falló: {}", response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error inesperado durante la importación", e);

            ExcelImportResponseDTO errorResponse = new ExcelImportResponseDTO(
                    false,
                    "Error interno del servidor",
                    new ExcelImportResponseDTO.ImportStats(),
                    java.util.List.of("Error interno: " + e.getMessage()));

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint para verificar el formato esperado del Excel
     * 
     * @return Información sobre el formato esperado
     */
    @GetMapping("/format-info")
    public ResponseEntity<ExcelFormatInfo> getFormatInfo() {
        ExcelFormatInfo formatInfo = new ExcelFormatInfo();
        formatInfo.setDescription("Formato esperado para importación de estudiantes y profesores");
        formatInfo.setProfessorNameCell("H10");
        formatInfo.setGroupCodeCell("B12");
        formatInfo.setStudentsStartRow(18);
        formatInfo.setStudentColumns(new String[] {
                "B: Nombre del Estudiante (desde fila 18)",
                "O: Correo Electrónico (desde fila 18)"
        });

        return ResponseEntity.ok(formatInfo);
    }

    // DTO auxiliar para información del formato
    public static class ExcelFormatInfo {
        private String description;
        private String professorNameCell;
        private String groupCodeCell;
        private int studentsStartRow;
        private String[] studentColumns;

        // Getters y setters
        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getProfessorNameCell() {
            return professorNameCell;
        }

        public void setProfessorNameCell(String professorNameCell) {
            this.professorNameCell = professorNameCell;
        }

        public String getGroupCodeCell() {
            return groupCodeCell;
        }

        public void setGroupCodeCell(String groupCodeCell) {
            this.groupCodeCell = groupCodeCell;
        }

        public int getStudentsStartRow() {
            return studentsStartRow;
        }

        public void setStudentsStartRow(int studentsStartRow) {
            this.studentsStartRow = studentsStartRow;
        }

        public String[] getStudentColumns() {
            return studentColumns;
        }

        public void setStudentColumns(String[] studentColumns) {
            this.studentColumns = studentColumns;
        }
    }
}
