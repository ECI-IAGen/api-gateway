package com.eci.iagen.api_gateway.entity.excel;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para información del formato esperado en archivos Excel
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExcelFormatInfo {
    private String description;
    private String professorNameCell;
    private String groupCodeCell;
    private int studentsStartRow;
    private String[] studentColumns;
}
