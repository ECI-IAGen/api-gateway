package com.eci.iagen.api_gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.eci.iagen.api_gateway.dto.response.ExcelImportResponseDTO;
import com.eci.iagen.api_gateway.entity.excel.ExcelFormatComplete;
import com.eci.iagen.api_gateway.entity.excel.ExcelFormatInfo;
import com.eci.iagen.api_gateway.service.ExcelFormatCompleteImportService;
import com.eci.iagen.api_gateway.service.ExcelImportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/excel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ExcelImportController {

    private final ExcelImportService excelImportService;
    private final ExcelFormatCompleteImportService completeImportService;

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

    // =========================
    // ENDPOINTS DE FORMATO COMPLETO
    // =========================

    /**
     * Endpoint para importar datos desde un archivo Excel con formato completo
     * Procesa múltiples hojas según el tipo de contenido
     * 
     * @param file Archivo Excel a procesar
     * @return Respuesta con estadísticas de la importación
     */
    @PostMapping("/import/complete")
    public ResponseEntity<ExcelImportResponseDTO> importCompleteExcel(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Iniciando importación de archivo Excel completo: {}", file.getOriginalFilename());

            ExcelImportResponseDTO response = completeImportService.importCompleteExcel(file);

            if (response.isSuccess()) {
                log.info("Importación completa exitosa: {}", response.getMessage());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Importación completa falló: {}", response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error inesperado durante la importación completa", e);

            ExcelImportResponseDTO errorResponse = new ExcelImportResponseDTO(
                    false,
                    "Error interno del servidor durante importación completa",
                    new ExcelImportResponseDTO.ImportStats(),
                    java.util.List.of("Error interno: " + e.getMessage()));

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint para obtener la información del formato completo esperado
     * Incluye detalles de todas las hojas soportadas
     * 
     * @return Información detallada sobre el formato esperado
     */
    @GetMapping("/format-info/complete")
    public ResponseEntity<ExcelFormatComplete> getCompleteFormatInfo() {
        try {
            ExcelFormatComplete formatInfo = ExcelFormatComplete.getDefaultGroupsFormat();
            log.debug("Información de formato completo solicitada");
            return ResponseEntity.ok(formatInfo);
        } catch (Exception e) {
            log.error("Error obteniendo información de formato completo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para obtener información específica de la hoja "Grupos"
     * 
     * @return Información específica del formato de grupos
     */
    @GetMapping("/format-info/groups")
    public ResponseEntity<ExcelFormatComplete.SheetFormatInfo> getGroupsFormatInfo() {
        try {
            ExcelFormatComplete completeFormat = ExcelFormatComplete.getDefaultGroupsFormat();
            ExcelFormatComplete.SheetFormatInfo groupsInfo = completeFormat.getSheets().stream()
                    .filter(sheet -> "Grupos".equals(sheet.getSheetName()))
                    .findFirst()
                    .orElse(null);

            if (groupsInfo != null) {
                log.debug("Información de formato de grupos solicitada");
                return ResponseEntity.ok(groupsInfo);
            } else {
                log.warn("No se encontró información de formato para la hoja 'Grupos'");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error obteniendo información de formato de grupos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para obtener información específica de la hoja "Entregas"
     * 
     * @return Información específica del formato de entregas
     */
    @GetMapping("/format-info/entregas")
    public ResponseEntity<ExcelFormatComplete.SheetFormatInfo> getEntregasFormatInfo() {
        try {
            ExcelFormatComplete completeFormat = ExcelFormatComplete.getDefaultGroupsFormat();
            ExcelFormatComplete.SheetFormatInfo entregasInfo = completeFormat.getSheets().stream()
                    .filter(sheet -> "Entregas".equals(sheet.getSheetName()))
                    .findFirst()
                    .orElse(null);

            if (entregasInfo != null) {
                log.debug("Información de formato de entregas solicitada");
                return ResponseEntity.ok(entregasInfo);
            } else {
                log.warn("No se encontró información de formato para la hoja 'Entregas'");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error obteniendo información de formato de entregas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para obtener información específica de la hoja "Estudiantes"
     * 
     * @return Información específica del formato de estudiantes
     */
    @GetMapping("/format-info/estudiantes")
    public ResponseEntity<ExcelFormatComplete.SheetFormatInfo> getStudentsFormatInfo() {
        try {
            ExcelFormatComplete completeFormat = ExcelFormatComplete.getDefaultGroupsFormat();
            ExcelFormatComplete.SheetFormatInfo studentsInfo = completeFormat.getSheets().stream()
                    .filter(sheet -> "Estudiantes".equals(sheet.getSheetName()))
                    .findFirst()
                    .orElse(null);

            if (studentsInfo != null) {
                log.debug("Información de formato de estudiantes solicitada");
                return ResponseEntity.ok(studentsInfo);
            } else {
                log.warn("No se encontró información de formato para la hoja 'Estudiantes'");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error obteniendo información de formato de estudiantes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint para obtener información específica de la hoja "Equipos"
     * 
     * @return Información específica del formato de equipos
     */
    @GetMapping("/format-info/equipos")
    public ResponseEntity<ExcelFormatComplete.SheetFormatInfo> getTeamsFormatInfo() {
        try {
            ExcelFormatComplete completeFormat = ExcelFormatComplete.getDefaultGroupsFormat();
            ExcelFormatComplete.SheetFormatInfo teamsInfo = completeFormat.getSheets().stream()
                    .filter(sheet -> "Equipos".equals(sheet.getSheetName()))
                    .findFirst()
                    .orElse(null);

            if (teamsInfo != null) {
                log.debug("Información de formato de equipos solicitada");
                return ResponseEntity.ok(teamsInfo);
            } else {
                log.warn("No se encontró información de formato para la hoja 'Equipos'");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error obteniendo información de formato de equipos", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Endpoint de validación para verificar si un archivo tiene el formato esperado
     * Sin procesar los datos, solo valida la estructura
     * 
     * @param file Archivo Excel a validar
     * @return Resultado de la validación
     */
    @PostMapping("/validate/complete")
    public ResponseEntity<ExcelImportResponseDTO> validateCompleteFormat(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Validando formato de archivo Excel: {}", file.getOriginalFilename());

            ExcelImportResponseDTO response = completeImportService.validateExcelFormat(file);

            if (response.isSuccess()) {
                log.info("Validación de formato exitosa: {}", response.getMessage());
                return ResponseEntity.ok(response);
            } else {
                log.warn("Validación de formato falló: {}", response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            log.error("Error inesperado durante la validación de formato", e);

            ExcelImportResponseDTO errorResponse = new ExcelImportResponseDTO(
                    false,
                    "Error interno del servidor durante validación",
                    new ExcelImportResponseDTO.ImportStats(),
                    java.util.List.of("Error interno: " + e.getMessage()));

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
