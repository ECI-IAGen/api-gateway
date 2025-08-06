package com.eci.iagen.api_gateway.entity.excel;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para información del formato completo esperado en archivos Excel
 * Este formato incluye múltiples hojas de procesamiento
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelFormatComplete {
    private String description;
    private List<SheetFormatInfo> sheets;
    private String version;
    private String supportedExtensions;

    /**
     * Información del formato de una hoja específica
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SheetFormatInfo {
        private String sheetName;
        private String description;
        private int headerRow;
        private int dataStartRow;
        private List<ColumnInfo> columns;
        private String processingType; // "GROUPS", "STUDENTS", "ASSIGNMENTS", etc.
    }

    /**
     * Información de una columna específica
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColumnInfo {
        private String columnLetter;
        private int columnIndex;
        private String fieldName;
        private String description;
        private boolean required;
        private String dataType;
    }

    /**
     * Obtiene la información de formato por defecto para el procesamiento completo
     */
    public static ExcelFormatComplete getDefaultGroupsFormat() {
        ExcelFormatComplete format = new ExcelFormatComplete();
        format.setDescription("Formato completo para importación de clases y entregas");
        format.setVersion("1.0");
        format.setSupportedExtensions(".xlsx, .xls");

        // Configuración para la hoja "Grupos"
        SheetFormatInfo groupsSheet = new SheetFormatInfo();
        groupsSheet.setSheetName("Grupos");
        groupsSheet.setDescription("Hoja que contiene información de las clases");
        groupsSheet.setHeaderRow(1);
        groupsSheet.setDataStartRow(2);
        groupsSheet.setProcessingType("GROUPS");

        List<ColumnInfo> groupsColumns = List.of(
                new ColumnInfo("A", 0, "clase", "Clase", true, "STRING"),
                new ColumnInfo("B", 1, "laboratorio", "Laboratorio", false, "STRING"),
                new ColumnInfo("C", 2, "grupo", "Grupo", true, "STRING"),
                new ColumnInfo("D", 3, "profesorClase", "Profesor Clase", true, "STRING"),
                new ColumnInfo("E", 4, "profesorLaboratorio", "Profesor Laboratorio", false, "STRING"),
                new ColumnInfo("F", 5, "semestre", "Semestre", true, "STRING")
        );
        groupsSheet.setColumns(groupsColumns);

        // Configuración para la hoja "Entregas"
        SheetFormatInfo entregasSheet = new SheetFormatInfo();
        entregasSheet.setSheetName("Entregas");
        entregasSheet.setDescription("Hoja que contiene información de las entregas/asignaciones");
        entregasSheet.setHeaderRow(1);
        entregasSheet.setDataStartRow(2);
        entregasSheet.setProcessingType("ASSIGNMENTS");

        List<ColumnInfo> entregasColumns = List.of(
                new ColumnInfo("A", 0, "responsable", "Responsable", false, "STRING"),
                new ColumnInfo("B", 1, "trabajo", "Trabajo", true, "STRING"),
                new ColumnInfo("C", 2, "entrega", "Entrega", false, "STRING"),
                new ColumnInfo("D", 3, "fecha", "Fecha", false, "STRING")
        );
        entregasSheet.setColumns(entregasColumns);

        // Configuración para la hoja "Estudiantes"
        SheetFormatInfo studentsSheet = new SheetFormatInfo();
        studentsSheet.setSheetName("Estudiantes");
        studentsSheet.setDescription("Hoja que contiene información de los estudiantes");
        studentsSheet.setHeaderRow(1);
        studentsSheet.setDataStartRow(2);
        studentsSheet.setProcessingType("STUDENTS");

        List<ColumnInfo> studentsColumns = List.of(
                new ColumnInfo("A", 0, "grupo", "Grupo", true, "STRING"),
                new ColumnInfo("B", 1, "id", "Id", false, "STRING"),
                new ColumnInfo("C", 2, "nombre", "Nombre", true, "STRING"),
                new ColumnInfo("D", 3, "programa", "Programa", false, "STRING"),
                new ColumnInfo("E", 4, "correo", "Correo", false, "STRING")
        );
        studentsSheet.setColumns(studentsColumns);

        // Configuración para la hoja "Equipos"
        SheetFormatInfo teamsSheet = new SheetFormatInfo();
        teamsSheet.setSheetName("Equipos");
        teamsSheet.setDescription("Hoja que contiene información de los equipos");
        teamsSheet.setHeaderRow(1);
        teamsSheet.setDataStartRow(2);
        teamsSheet.setProcessingType("TEAMS");

        List<ColumnInfo> teamsColumns = List.of(
                new ColumnInfo("A", 0, "grupo", "Grupo", true, "STRING"),
                new ColumnInfo("B", 1, "equipo", "Equipo", true, "STRING"),
                new ColumnInfo("C", 2, "activo", "Activo", false, "STRING")
        );
        teamsSheet.setColumns(teamsColumns);

        format.setSheets(List.of(groupsSheet, entregasSheet, studentsSheet, teamsSheet));

        return format;
    }
}
