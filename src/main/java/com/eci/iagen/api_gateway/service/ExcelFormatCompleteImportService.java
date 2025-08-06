package com.eci.iagen.api_gateway.service;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.eci.iagen.api_gateway.dto.AssignmentDTO;
import com.eci.iagen.api_gateway.dto.ClassDTO;
import com.eci.iagen.api_gateway.dto.RoleDTO;
import com.eci.iagen.api_gateway.dto.TeamDTO;
import com.eci.iagen.api_gateway.dto.UserDTO;
import com.eci.iagen.api_gateway.dto.response.ExcelImportResponseDTO;
import com.eci.iagen.api_gateway.entity.Role;
import com.eci.iagen.api_gateway.repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Servicio para importación de archivos Excel con formato completo
 * Soporta múltiples hojas y tipos de procesamiento extensible
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelFormatCompleteImportService {

    private final RoleRepository roleRepository;
    private final UserService userService;
    private final ClassService classService;
    private final RoleService roleService;
    private final AssignmentService assignmentService;
    private final TeamService teamService;

    /**
     * Importa datos desde un archivo Excel con formato completo
     * Procesa múltiples hojas según su tipo
     */
    @Transactional
    public ExcelImportResponseDTO importCompleteExcel(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        ExcelImportResponseDTO.ImportStats stats = new ExcelImportResponseDTO.ImportStats();

        try {
            if (file.isEmpty()) {
                return new ExcelImportResponseDTO(false, "El archivo está vacío", stats,
                        List.of("El archivo no puede estar vacío"));
            }

            if (!isExcelFile(file)) {
                return new ExcelImportResponseDTO(false, "Formato de archivo inválido", stats,
                        List.of("Solo se permiten archivos Excel (.xlsx, .xls)"));
            }

            log.info("=== INICIANDO IMPORTACIÓN COMPLETA ===");
            log.info("Archivo: {}", file.getOriginalFilename());

            try (InputStream inputStream = file.getInputStream();
                    Workbook workbook = new XSSFWorkbook(inputStream)) {

                // PASO 1: Crear roles necesarios
                log.info("=== PASO 1: Creando roles necesarios ===");
                createRequiredRoles(stats);

                // PASO 2: Procesar hojas disponibles
                log.info("=== PASO 2: Procesando hojas del Excel ===");
                processWorkbookSheets(workbook, stats, errors);

                // PASO 3: Consolidar estadísticas
                stats.setTotalProcessed(stats.getUsersCreated() + stats.getUsersUpdated() + 
                                      stats.getClassesCreated() + stats.getClassesUpdated());

                String message = String.format(
                        "Importación completa finalizada. Roles: %d creados. Usuarios: %d creados, %d actualizados. Clases: %d creadas, %d actualizadas",
                        stats.getRolesCreated(), stats.getUsersCreated(), stats.getUsersUpdated(),
                        stats.getClassesCreated(), stats.getClassesUpdated());

                log.info("=== IMPORTACIÓN COMPLETA FINALIZADA ===");
                log.info(message);

                return new ExcelImportResponseDTO(true, message, stats, errors);
            }

        } catch (IOException e) {
            log.error("Error al procesar archivo Excel completo", e);
            return new ExcelImportResponseDTO(false, "Error al procesar el archivo", stats,
                    List.of("Error de E/O: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al importar Excel completo", e);
            return new ExcelImportResponseDTO(false, "Error inesperado", stats,
                    List.of("Error inesperado: " + e.getMessage()));
        }
    }

    /**
     * Valida el formato del archivo Excel sin procesar los datos
     */
    public ExcelImportResponseDTO validateExcelFormat(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        ExcelImportResponseDTO.ImportStats stats = new ExcelImportResponseDTO.ImportStats();

        try {
            if (file.isEmpty()) {
                return new ExcelImportResponseDTO(false, "El archivo está vacío", stats,
                        List.of("El archivo no puede estar vacío"));
            }

            if (!isExcelFile(file)) {
                return new ExcelImportResponseDTO(false, "Formato de archivo inválido", stats,
                        List.of("Solo se permiten archivos Excel (.xlsx, .xls)"));
            }

            try (InputStream inputStream = file.getInputStream();
                    Workbook workbook = new XSSFWorkbook(inputStream)) {

                // Validar estructura sin procesar datos
                boolean hasGroupsSheet = validateSheetsStructure(workbook, errors);

                if (hasGroupsSheet && errors.isEmpty()) {
                    return new ExcelImportResponseDTO(true, 
                            "Formato válido - Archivo listo para importación", stats, errors);
                } else {
                    return new ExcelImportResponseDTO(false,
                            String.format("Formato inválido - Revisar errores %s", errors.get(0)), stats, errors);
                }
            }

        } catch (IOException e) {
            log.error("Error validando formato Excel", e);
            return new ExcelImportResponseDTO(false, "Error de validación", stats,
                    List.of("Error de validación: " + e.getMessage()));
        }
    }

    /**
     * Procesa todas las hojas del workbook según su tipo
     */
    private void processWorkbookSheets(Workbook workbook, ExcelImportResponseDTO.ImportStats stats, 
                                     List<String> errors) {
        
        // Buscar y procesar hoja "Grupos"
        Sheet groupsSheet = workbook.getSheet("Grupos");
        List<ClassDTO> classes = new ArrayList<>();
        if (groupsSheet != null) {
            log.info("Procesando hoja: Grupos");
            classes = processGroupsSheet(groupsSheet, stats, errors);
        } else {
            String warning = "Hoja 'Grupos' no encontrada";
            errors.add(warning);
            log.warn(warning);
        }

        // Buscar y procesar hoja "Entregas"
        Sheet entregasSheet = workbook.getSheet("Entregas");
        if (entregasSheet != null && !classes.isEmpty()) {
            log.info("Procesando hoja: Entregas");
            processEntregasSheet(entregasSheet, classes, stats, errors);
        } else if (entregasSheet == null) {
            String warning = "Hoja 'Entregas' no encontrada";
            errors.add(warning);
            log.warn(warning);
        } else {
            String warning = "No se pueden procesar entregas sin clases creadas previamente";
            errors.add(warning);
            log.warn(warning);
        }

        // Buscar y procesar hoja "Estudiantes"
        Sheet studentsSheet = workbook.getSheet("Estudiantes");
        List<UserDTO> students = new ArrayList<>();
        if (studentsSheet != null && !classes.isEmpty()) {
            log.info("Procesando hoja: Estudiantes");
            students = processStudentsSheet(studentsSheet, classes, stats, errors);
        } else if (studentsSheet == null) {
            String warning = "Hoja 'Estudiantes' no encontrada";
            errors.add(warning);
            log.warn(warning);
        } else {
            String warning = "No se pueden procesar estudiantes sin clases creadas previamente";
            errors.add(warning);
            log.warn(warning);
        }

        // Buscar y procesar hoja "Equipos"
        Sheet teamsSheet = workbook.getSheet("Equipos");
        if (teamsSheet != null && !classes.isEmpty() && !students.isEmpty()) {
            log.info("Procesando hoja: Equipos");
            processTeamsSheet(teamsSheet, classes, students, stats, errors);
        } else if (teamsSheet == null) {
            String warning = "Hoja 'Equipos' no encontrada";
            errors.add(warning);
            log.warn(warning);
        } else if (classes.isEmpty()) {
            String warning = "No se pueden procesar equipos sin clases creadas previamente";
            errors.add(warning);
            log.warn(warning);
        } else if (students.isEmpty()) {
            String warning = "No se pueden procesar equipos sin estudiantes creados previamente";
            errors.add(warning);
            log.warn(warning);
        }

        log.info("Procesamiento de hojas completado");
    }

    /**
     * Procesa la hoja "Grupos" para crear clases
     * 
     * Estructura esperada:
     * - Fila 1: Encabezados (A1:F1) - Clase | Laboratorio | Grupo | Profesor Clase | Profesor Laboratorio | Semestre
     * - Fila 2 en adelante: Datos
     */
    private List<ClassDTO> processGroupsSheet(Sheet sheet, ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        log.info("=== PROCESANDO HOJA 'GRUPOS' ===");

        // Validar encabezados (fila 1)
        if (!validateGroupsHeaders(sheet, errors)) {
            log.error("Encabezados de la hoja 'Grupos' no son válidos");
            return Collections.emptyList();
        }

        List<ClassDTO> classes = new ArrayList<>();
        // Procesar datos desde la fila 2
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            try {
                GroupData groupData = extractGroupDataFromRow(row, rowIndex + 1);
                if (groupData == null) continue;

                // Procesar los datos extraídos
                ClassDTO classDTO = processGroupData(groupData, stats, errors);
                if (classDTO != null) {
                    classes.add(classDTO);
                }

            } catch (Exception e) {
                String error = String.format("Error procesando fila %d de 'Grupos': %s", rowIndex + 1, e.getMessage());
                errors.add(error);
                log.warn(error, e);
            }
        }

        log.info("=== PROCESAMIENTO DE 'GRUPOS' COMPLETADO ===");
        return classes;
    }

    /**
     * Procesa la hoja "Entregas" para crear asignaciones
     * 
     * Estructura esperada:
     * - Fila 1: Encabezados (A1:D1) - Responsable | Trabajo | Entrega | Fecha
     * - Fila 2 en adelante: Datos de entregas
     */
    private void processEntregasSheet(Sheet sheet, List<ClassDTO> classes, 
                                    ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        log.info("=== PROCESANDO HOJA 'ENTREGAS' ===");

        // Validar encabezados (fila 1)
        if (!validateEntregasHeaders(sheet, errors)) {
            log.error("Encabezados de la hoja 'Entregas' no son válidos");
            return;
        }

        // Procesar datos desde la fila 2
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            try {
                EntregaData entregaData = extractEntregaDataFromRow(row, rowIndex + 1);
                if (entregaData == null) continue;

                // Procesar los datos extraídos para cada clase creada
                processEntregaData(entregaData, classes, stats, errors);

            } catch (Exception e) {
                String error = String.format("Error procesando fila %d de 'Entregas': %s", rowIndex + 1, e.getMessage());
                errors.add(error);
                log.warn(error, e);
            }
        }

        log.info("=== PROCESAMIENTO DE 'ENTREGAS' COMPLETADO ===");
    }

    /**
     * Valida los encabezados de la hoja "Entregas"
     */
    private boolean validateEntregasHeaders(Sheet sheet, List<String> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add("Hoja 'Entregas': Fila de encabezados no encontrada");
            return false;
        }

        String[] expectedHeaders = {"Responsable", "Trabajo", "Entrega", "Fecha"};
        boolean isValid = true;

        for (int i = 0; i < expectedHeaders.length; i++) {
            Cell cell = headerRow.getCell(i);
            String cellValue = getCellValueAsString(cell);
            
            if (!expectedHeaders[i].equals(cellValue)) {
                errors.add(String.format("Hoja 'Entregas': Encabezado esperado '%s' en columna %s, pero se encontró '%s'", 
                         expectedHeaders[i], getColumnLetter(i), cellValue));
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Extrae los datos de una fila de la hoja "Entregas"
     */
    private EntregaData extractEntregaDataFromRow(Row row, int rowNumber) {
        try {
            String responsable = getCellValueAsString(row.getCell(0));  // Columna A
            String trabajo = getCellValueAsString(row.getCell(1));      // Columna B
            String entrega = getCellValueAsString(row.getCell(2));      // Columna C
            String fecha = getCellValueAsString(row.getCell(3));        // Columna D

            // Validar campos obligatorios
            if (isNullOrEmpty(trabajo)) {
                log.warn("Fila {} de 'Entregas': Campo 'Trabajo' vacío, saltando", rowNumber);
                return null;
            }

            return new EntregaData(responsable, trabajo, entrega, fecha);

        } catch (Exception e) {
            log.error("Error extrayendo datos de la fila {} de 'Entregas'", rowNumber, e);
            return null;
        }
    }

    /**
     * Procesa los datos de una entrega para crear asignaciones en todas las clases
     */
    private void processEntregaData(EntregaData data, List<ClassDTO> classes, 
                                  ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        try {
            log.info("Procesando entrega: {}", data.getTrabajo());

            // Crear una asignación para cada clase creada
            for (ClassDTO classDTO : classes) {
                try {
                    // Crear la asignación usando AssignmentService
                    String title = "%s - %s - %s - %s".formatted(classDTO.getId(), data.getResponsable(), data.getTrabajo(), data.getEntrega());
                    

                    AssignmentDTO assignmentDTO = new AssignmentDTO();
                    assignmentDTO.setTitle(title);
                    assignmentDTO.setDescription("%s - %s".formatted(title, data.getEntrega()));
                    assignmentDTO.setClassId(classDTO.getId());
                    assignmentDTO.setClassName(classDTO.getName());

                    // Configurar fechas basadas en la fecha de la entrega
                    if (!isNullOrEmpty(data.getFecha())) {
                        try {
                            LocalDate fechaEntrega = parseDateFromString(data.getFecha().trim());
                            
                            // Fecha de entrega: el día especificado a las 11:59 PM
                            LocalDateTime dueDateTime = fechaEntrega.atTime(23, 59);
                            
                            // Fecha de inicio: una semana antes de la fecha de entrega
                            LocalDateTime startDateTime = fechaEntrega.minusWeeks(1).atTime(0, 0);
                            
                            // Configurar las fechas en el DTO
                            assignmentDTO.setDueDate(dueDateTime);
                            assignmentDTO.setStartDate(startDateTime);
                            
                            log.debug("Fechas configuradas para '{}': Inicio={}, Entrega={}", 
                                    data.getTrabajo(), startDateTime, dueDateTime);
                            
                        } catch (DateTimeParseException e) {
                            String warning = String.format("Formato de fecha inválido '%s' para entrega '%s'. Formatos soportados: YYYY-MM-DD, fechas de Excel, etc.", 
                                    data.getFecha(), data.getTrabajo());
                            errors.add(warning);
                            log.warn(warning);
                        }
                    } else {
                        log.warn("Fecha no especificada para entrega '{}'", data.getTrabajo());
                    }
                    

                    // Crear la asignación
                    AssignmentDTO createdAssignment = assignmentService.createAssignment(assignmentDTO);
                    
                    if (createdAssignment != null) {
                        // Incrementar estadísticas (podríamos agregar un contador específico para asignaciones)
                        stats.setTotalProcessed(stats.getTotalProcessed() + 1);
                        log.debug("Asignación '{}' creada para clase ID: {}", data.getTrabajo(), classDTO.getId());
                    }

                } catch (Exception e) {
                    String error = String.format("Error creando asignación '%s' para clase ID %d: %s", 
                            data.getTrabajo(), classDTO.getId(), e.getMessage());
                    errors.add(error);
                    log.warn(error);
                }
            }

            log.info("Entrega procesada exitosamente: {}", data.getTrabajo());

        } catch (Exception e) {
            String error = String.format("Error procesando entrega '%s': %s", 
                    data.getTrabajo(), e.getMessage());
            errors.add(error);
            log.error(error, e);
        }
    }

    /**
     * Procesa la hoja "Estudiantes" para crear usuarios estudiantes
     * 
     * Estructura esperada:
     * - Fila 1: Encabezados (A1:E1) - Grupo | Id | Nombre | Programa | Correo
     * - Fila 2 en adelante: Datos de estudiantes
     */
    private List<UserDTO> processStudentsSheet(Sheet sheet, List<ClassDTO> classes, 
                                    ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        log.info("=== PROCESANDO HOJA 'ESTUDIANTES' ===");

        List<UserDTO> students = new ArrayList<>();

        // Validar encabezados (fila 1)
        if (!validateStudentsHeaders(sheet, errors)) {
            log.error("Encabezados de la hoja 'Estudiantes' no son válidos");
            return students;
        }

        // Procesar datos desde la fila 2
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            try {
                StudentData studentData = extractStudentDataFromRow(row, rowIndex + 1);
                if (studentData == null) continue;

                // Procesar los datos extraídos
                UserDTO student = processStudentData(studentData, classes, stats, errors);
                if (student != null) {
                    students.add(student);
                }

            } catch (Exception e) {
                String error = String.format("Error procesando fila %d de 'Estudiantes': %s", rowIndex + 1, e.getMessage());
                errors.add(error);
                log.warn(error, e);
            }
        }

        log.info("=== PROCESAMIENTO DE 'ESTUDIANTES' COMPLETADO ===");
        return students;
    }

    /**
     * Valida los encabezados de la hoja "Estudiantes"
     */
    private boolean validateStudentsHeaders(Sheet sheet, List<String> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add("Hoja 'Estudiantes': Fila de encabezados no encontrada");
            return false;
        }

        String[] expectedHeaders = {"Grupo", "Id", "Nombre", "Programa", "Correo"};
        boolean isValid = true;

        for (int i = 0; i < expectedHeaders.length; i++) {
            Cell cell = headerRow.getCell(i);
            String cellValue = getCellValueAsString(cell);
            
            if (!expectedHeaders[i].equals(cellValue)) {
                errors.add(String.format("Hoja 'Estudiantes': Encabezado esperado '%s' en columna %s, pero se encontró '%s'", 
                         expectedHeaders[i], getColumnLetter(i), cellValue));
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Extrae los datos de una fila de la hoja "Estudiantes"
     */
    private StudentData extractStudentDataFromRow(Row row, int rowNumber) {
        try {
            String grupo = getCellValueAsString(row.getCell(0));       // Columna A
            String id = getCellValueAsString(row.getCell(1));          // Columna B
            String nombre = getCellValueAsString(row.getCell(2));      // Columna C
            String programa = getCellValueAsString(row.getCell(3));    // Columna D
            String correo = getCellValueAsString(row.getCell(4));      // Columna E

            // Validar campos obligatorios
            if (isNullOrEmpty(grupo) || isNullOrEmpty(nombre)) {
                log.warn("Fila {} de 'Estudiantes': Campos obligatorios vacíos (Grupo y/o Nombre), saltando", rowNumber);
                return null;
            }

            return new StudentData(grupo, id, nombre, programa, correo);

        } catch (Exception e) {
            log.error("Error extrayendo datos de la fila {} de 'Estudiantes'", rowNumber, e);
            return null;
        }
    }

    /**
     * Procesa los datos de un estudiante para crear el usuario
     */
    private UserDTO processStudentData(StudentData data, List<ClassDTO> classes, 
                                  ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        try {
            log.info("Procesando estudiante: {} del grupo {}", data.getNombre(), data.getGrupo());

            // Buscar la clase correspondiente al grupo del estudiante
            ClassDTO targetClass = classes.stream()
                    .filter(classDTO -> String.valueOf(classDTO.getName().strip().charAt(0)).equals(data.getGrupo()))
                    .findFirst()
                    .orElse(null);

            if (targetClass == null) {
                String warning = String.format("No se encontró clase para el grupo '%s' del estudiante '%s'", 
                        data.getGrupo(), data.getNombre());
                errors.add(warning);
                log.warn(warning);
                return null;
            }

            // Obtener rol de estudiante
            Optional<RoleDTO> studentRole = roleService.findByName("ESTUDIANTE");
            Long roleId = studentRole.map(RoleDTO::getId).orElse(null);

            if (roleId == null) {
                String error = String.format("Rol 'ESTUDIANTE' no encontrado para estudiante '%s'", data.getNombre());
                errors.add(error);
                log.error(error);
                return null;
            }

            // Verificar si el estudiante ya existe (por nombre o correo)
            UserDTO student;
            UserDTO existingStudent;
            if (!isNullOrEmpty(data.getCorreo())) {
                existingStudent = userService.getUserByEmail(data.getCorreo()).orElse(null);
            } else {
                // Buscar solo por nombre
                existingStudent = userService.getUserByName(data.getNombre()).orElse(null);
            }

            if (existingStudent != null) {
                // Actualizar estudiante existente
                existingStudent.setRoleId(roleId);
                existingStudent.setEmail(data.getCorreo());
                existingStudent.setCarnetId(data.getId());
                existingStudent.setRoleId(roleId);

                student = userService.updateUser(roleId, existingStudent).orElse(null);

                stats.setUsersUpdated(stats.getUsersUpdated() + 1);
                log.debug("Estudiante actualizado: {}", data.getNombre());
            } else {
                // Crear nuevo estudiante
                UserDTO newStudent = new UserDTO();
                newStudent.setName(data.getNombre());
                newStudent.setRoleId(roleId);
                newStudent.setEmail(data.getCorreo());
                newStudent.setCarnetId(data.getId());
                
                UserDTO createdStudent = userService.createUser(newStudent);
                student = createdStudent;
                if (createdStudent != null) {
                    stats.setUsersCreated(stats.getUsersCreated() + 1);
                    log.debug("Estudiante creado: {}", data.getNombre());
                } else {
                    String error = String.format("Error creando estudiante '%s'", data.getNombre());
                    errors.add(error);
                    log.error(error);
                }
            }

            log.info("Estudiante procesado exitosamente: {}", data.getNombre());
            return student;
        } catch (Exception e) {
            String error = String.format("Error procesando estudiante '%s': %s", 
                    data.getNombre(), e.getMessage());
            errors.add(error);
            log.error(error, e);
            return null;
        }
    }

    /**
     * Procesa la hoja "Equipos" para crear teams
     * 
     * Estructura esperada:
     * - Fila 1: Encabezados (A1:C1) - Grupo | Equipo | Activo
     * - Fila 2 en adelante: Datos de equipos
     */
    private void processTeamsSheet(Sheet sheet, List<ClassDTO> classes, List<UserDTO> students, 
                                 ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        log.info("=== PROCESANDO HOJA 'EQUIPOS' ===");

        // Validar encabezados (fila 1)
        if (!validateTeamsHeaders(sheet, errors)) {
            log.error("Encabezados de la hoja 'Equipos' no son válidos");
            return;
        }

        // Procesar datos desde la fila 2
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            try {
                TeamData teamData = extractTeamDataFromRow(row, rowIndex + 1);
                if (teamData == null) continue;

                // Procesar los datos extraídos
                processTeamData(teamData, classes, students, stats, errors);

            } catch (Exception e) {
                String error = String.format("Error procesando fila %d de 'Equipos': %s", rowIndex + 1, e.getMessage());
                errors.add(error);
                log.warn(error, e);
            }
        }

        log.info("=== PROCESAMIENTO DE 'EQUIPOS' COMPLETADO ===");
    }

    /**
     * Valida los encabezados de la hoja "Equipos"
     */
    private boolean validateTeamsHeaders(Sheet sheet, List<String> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add("Hoja 'Equipos': Fila de encabezados no encontrada");
            return false;
        }

        String[] expectedHeaders = {"Grupo", "Equipo", "Activo"};
        boolean isValid = true;

        for (int i = 0; i < expectedHeaders.length; i++) {
            Cell cell = headerRow.getCell(i);
            String cellValue = getCellValueAsString(cell);
            
            if (!expectedHeaders[i].equals(cellValue)) {
                errors.add(String.format("Hoja 'Equipos': Encabezado esperado '%s' en columna %s, pero se encontró '%s'", 
                         expectedHeaders[i], getColumnLetter(i), cellValue));
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Extrae los datos de una fila de la hoja "Equipos"
     */
    private TeamData extractTeamDataFromRow(Row row, int rowNumber) {
        try {
            String grupo = getCellValueAsString(row.getCell(0));       // Columna A
            String equipo = getCellValueAsString(row.getCell(1));      // Columna B
            String activo = getCellValueAsString(row.getCell(2));      // Columna C

            // Validar campos obligatorios
            if (isNullOrEmpty(grupo) || isNullOrEmpty(equipo)) {
                log.warn("Fila {} de 'Equipos': Campos obligatorios vacíos (Grupo y/o Equipo), saltando", rowNumber);
                return null;
            }

            return new TeamData(grupo, equipo, activo);

        } catch (Exception e) {
            log.error("Error extrayendo datos de la fila {} de 'Equipos'", rowNumber, e);
            return null;
        }
    }

    /**
     * Procesa los datos de un equipo para crear el team
     */
    private void processTeamData(TeamData data, List<ClassDTO> classes, List<UserDTO> students,
                               ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        try {
            log.info("Procesando equipo: {} del grupo {}", data.getEquipo(), data.getGrupo());

            // Buscar la clase correspondiente al grupo del equipo
            ClassDTO targetClass = classes.stream()
                    .filter(classDTO -> String.valueOf(classDTO.getName().strip().charAt(0)).equals(data.getGrupo()))
                    .findFirst()
                    .orElse(null);

            if (targetClass == null) {
                String warning = String.format("No se encontró clase para el grupo '%s' del equipo '%s'", 
                        data.getGrupo(), data.getEquipo());
                errors.add(warning);
                log.warn(warning);
                return;
            }

            // Parsear los apellidos de los integrantes del equipo (separados por "-")
            String[] apellidos = data.getEquipo().trim().split("-");
            List<Long> memberIds = new ArrayList<>();

            // Buscar estudiantes por apellido
            for (String apellido : apellidos) {
                String apellidoTrimmed = apellido.trim();
                if (apellidoTrimmed.isEmpty()) continue;

                // Buscar estudiante que contenga este apellido en su nombre
                Optional<UserDTO> studentFound = students.stream()
                        .filter(student -> student.getName() != null && 
                                student.getName().toLowerCase().contains(apellidoTrimmed.toLowerCase()))
                        .findFirst();

                if (studentFound.isPresent()) {
                    memberIds.add(studentFound.get().getId());
                    log.debug("Estudiante encontrado para apellido '{}': {}", apellidoTrimmed, studentFound.get().getName());
                } else {
                    String warning = String.format("No se encontró estudiante con apellido '%s' para el equipo '%s'", 
                            apellidoTrimmed, data.getEquipo());
                    errors.add(warning);
                    log.warn(warning);
                }
            }

            if (memberIds.isEmpty()) {
                String warning = String.format("No se encontraron miembros para el equipo '%s'", data.getEquipo());
                errors.add(warning);
                log.warn(warning);
                return;
            }

            // Generar nombre del equipo: Grupo-Apellidos
            String teamName = String.format("%s-%s", data.getGrupo(), data.getEquipo());

            // Verificar si el equipo ya existe
            try {
                // Crear el equipo usando TeamService
                TeamDTO teamDTO = new TeamDTO();
                teamDTO.setName(teamName);
                teamDTO.setUserIds(memberIds);

                TeamDTO createdTeam = teamService.createTeam(teamDTO);
                
                if (createdTeam != null) {
                    stats.setTotalProcessed(stats.getTotalProcessed() + 1);
                    log.debug("Equipo creado: {} con {} miembros", teamName, memberIds.size());
                    
                    // Agregar el equipo a la clase correspondiente
                    try {
                        classService.addTeamToClass(targetClass.getId(), createdTeam.getId());
                        log.debug("Equipo {} agregado a la clase {}", teamName, targetClass.getName());
                    } catch (Exception e) {
                        String warning = String.format("Error agregando equipo '%s' a la clase '%s': %s", 
                                teamName, targetClass.getName(), e.getMessage());
                        errors.add(warning);
                        log.warn(warning);
                    }
                } else {
                    String error = String.format("Error creando equipo '%s'", teamName);
                    errors.add(error);
                    log.error(error);
                }

            } catch (IllegalArgumentException e) {
                // El equipo ya existe
                String warning = String.format("Equipo '%s' ya existe: %s", teamName, e.getMessage());
                errors.add(warning);
                log.warn(warning);
            }

            log.info("Equipo procesado exitosamente: {}", teamName);

        } catch (Exception e) {
            String error = String.format("Error procesando equipo '%s': %s", 
                    data.getEquipo(), e.getMessage());
            errors.add(error);
            log.error(error, e);
        }
    }

    /**
     * Valida los encabezados de la hoja "Grupos"
     */
    private boolean validateGroupsHeaders(Sheet sheet, List<String> errors) {
        Row headerRow = sheet.getRow(0);
        if (headerRow == null) {
            errors.add("Hoja 'Grupos': Fila de encabezados no encontrada");
            return false;
        }

        String[] expectedHeaders = {"Clase", "Laboratorio", "Grupo", "Profesor Clase", "Profesor Laboratorio", "Semestre"};
        boolean isValid = true;

        for (int i = 0; i < expectedHeaders.length; i++) {
            Cell cell = headerRow.getCell(i);
            String cellValue = getCellValueAsString(cell);
            
            if (!expectedHeaders[i].equals(cellValue)) {
                errors.add(String.format("Hoja 'Grupos': Encabezado esperado '%s' en columna %s, pero se encontró '%s'", 
                         expectedHeaders[i], getColumnLetter(i), cellValue));
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Extrae los datos de una fila de la hoja "Grupos"
     */
    private GroupData extractGroupDataFromRow(Row row, int rowNumber) {
        try {
            String clase = getCellValueAsString(row.getCell(0));      // Columna A
            String grupo = getCellValueAsString(row.getCell(2));       // Columna C
            String profesorClase = getCellValueAsString(row.getCell(3)); // Columna D
            String profesorLab = getCellValueAsString(row.getCell(4));   // Columna E
            String semestre = getCellValueAsString(row.getCell(5));      // Columna F

            // Validar campos obligatorios
            if (isNullOrEmpty(clase) || isNullOrEmpty(grupo) || isNullOrEmpty(profesorClase) || isNullOrEmpty(semestre)) {
                log.warn("Fila {} de 'Grupos': Campos obligatorios vacíos, saltando", rowNumber);
                return null;
            }

            return new GroupData(clase, grupo, profesorClase, profesorLab, semestre);

        } catch (Exception e) {
            log.error("Error extrayendo datos de la fila {} de 'Grupos'", rowNumber, e);
            return null;
        }
    }

    /**
     * Procesa los datos de un grupo para crear la clase y usuarios
     */
    private ClassDTO processGroupData(GroupData data, ExcelImportResponseDTO.ImportStats stats, List<String> errors) {
        try {
            // Generar nombre de la clase: Grupo-Clase-Semestre
            String className = String.format("%s-%s-%s", data.getGrupo(), data.getClase(), data.getSemestre());
            
            // Generar descripción: Grupo-Clase-Semestre - Profesor Clase: [nombre] - Profesor Lab: [nombre]
            String description = String.format("%s - Profesor Clase: %s", className, data.getProfesorClase());
            if (!isNullOrEmpty(data.getProfesorLab())) {
                description += " - Profesor Lab: " + data.getProfesorLab();
            }

            log.info("Procesando clase: {}", className);

            // Crear o actualizar profesor titular
            Optional<RoleDTO> professorRole = roleService.findByName("PROFESOR");
            Long roleId = professorRole.map(RoleDTO::getId).orElse(null);

            // Crear o actualizar usuario titular
            UserDTO professorTitular = userService.getUserByName(data.getProfesorClase())
                    .orElse(null);
            
            if (professorTitular != null) {
                stats.setUsersUpdated(stats.getUsersUpdated() + 1);
            } 
            else {
                professorTitular = new UserDTO();
                professorTitular.setName(data.getProfesorClase());
                professorTitular.setRoleId(roleId);
                professorTitular = userService.createUser(professorTitular);
                if (professorTitular != null) {
                    stats.setUsersCreated(stats.getUsersCreated() + 1);
                }
            }

            // Crear o actualizar profesor de laboratorio (si existe)
            UserDTO professorLaboratorio = userService.getUserByName(data.getProfesorLab())
                    .orElse(null);

            if (professorLaboratorio != null) {
                stats.setUsersUpdated(stats.getUsersUpdated() + 1);
            } 
            else {
                professorLaboratorio = new UserDTO();
                professorLaboratorio.setName(data.getProfesorLab());
                professorLaboratorio.setRoleId(roleId);
                professorLaboratorio = userService.createUser(professorLaboratorio);
                if (professorLaboratorio != null) {
                    stats.setUsersCreated(stats.getUsersCreated() + 1);
                }
            }

            // Crear o actualizar la clase
            ClassDTO classDTO = classService.getClassByName(className)
                    .orElse(null);
            if (classDTO != null) {
                stats.setClassesUpdated(stats.getClassesUpdated() + 1);
            } else {
                classDTO = new ClassDTO();
                classDTO.setName(className);
                classDTO.setDescription(description);
                classDTO.setProfessorId(professorTitular != null ? professorTitular.getId() : null);
                classDTO.setLaboratoryProfessorId(professorLaboratorio != null ? professorLaboratorio.getId() : null);
                classDTO.setSemester(data.getSemestre());
                classDTO = classService.createClass(classDTO);
                if (classDTO != null) {
                    stats.setClassesCreated(stats.getClassesCreated() + 1);
                }
            }

            log.info("Clase procesada exitosamente: {}", className);
            return classDTO;
        } catch (Exception e) {
            String error = String.format("Error procesando grupo %s-%s-%s: %s", 
                    data.getGrupo(), data.getClase(), data.getSemestre(), e.getMessage());
            errors.add(error);
            log.error(error, e);
            return null;
        }
    }

    /**
     * Valida la estructura de las hojas sin procesar datos
     */
    private boolean validateSheetsStructure(Workbook workbook, List<String> errors) {
        boolean hasValidSheets = false;

        // Validar hoja "Grupos"
        Sheet groupsSheet = workbook.getSheet("Grupos");
        if (groupsSheet != null) {
            if (validateGroupsHeaders(groupsSheet, errors)) {
                hasValidSheets = true;
                log.info("Hoja 'Grupos' encontrada y validada");
            }
        } else {
            errors.add("Hoja 'Grupos' no encontrada en el archivo");
        }

        // Validar hoja "Entregas"
        Sheet entregasSheet = workbook.getSheet("Entregas");
        if (entregasSheet != null) {
            if (validateEntregasHeaders(entregasSheet, errors)) {
                hasValidSheets = true;
                log.info("Hoja 'Entregas' encontrada y validada");
            }
        } else {
            errors.add("Hoja 'Entregas' no encontrada en el archivo");
        }

        // Validar hoja "Estudiantes"
        Sheet studentsSheet = workbook.getSheet("Estudiantes");
        if (studentsSheet != null) {
            if (validateStudentsHeaders(studentsSheet, errors)) {
                hasValidSheets = true;
                log.info("Hoja 'Estudiantes' encontrada y validada");
            }
        } else {
            errors.add("Hoja 'Estudiantes' no encontrada en el archivo");
        }

        // Validar hoja "Equipos"
        Sheet teamsSheet = workbook.getSheet("Equipos");
        if (teamsSheet != null) {
            if (validateTeamsHeaders(teamsSheet, errors)) {
                hasValidSheets = true;
                log.info("Hoja 'Equipos' encontrada y validada");
            }
        } else {
            errors.add("Hoja 'Equipos' no encontrada en el archivo");
        }

        return hasValidSheets;
    }

    // =========================
    // MÉTODOS AUXILIARES
    // =========================

    private boolean isExcelFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        return filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
    }

    private void createRequiredRoles(ExcelImportResponseDTO.ImportStats stats) {
        try {
            // Crear rol PROFESOR si no existe
            if (!roleRepository.existsByName("PROFESOR")) {
                Role professorRole = new Role();
                professorRole.setName("PROFESOR");
                roleRepository.save(professorRole);
                stats.setRolesCreated(stats.getRolesCreated() + 1);
                log.info("Rol creado: PROFESOR");
            } else {
                log.info("Rol PROFESOR ya existe");
            }

            // Crear rol ESTUDIANTE si no existe (para uso futuro)
            if (!roleRepository.existsByName("ESTUDIANTE")) {
                Role studentRole = new Role();
                studentRole.setName("ESTUDIANTE");
                roleRepository.save(studentRole);
                stats.setRolesCreated(stats.getRolesCreated() + 1);
                log.info("Rol creado: ESTUDIANTE");
            } else {
                log.info("Rol ESTUDIANTE ya existe");
            }
        } catch (Exception e) {
            log.error("Error creando roles requeridos", e);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING -> {
                return cell.getStringCellValue().trim();
            }
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    return String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> {
                return String.valueOf(cell.getBooleanCellValue());
            }
            case FORMULA -> {
                return cell.getCellFormula();
            }
            default -> {
                return null;
            }
        }
    }

    private boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    private String getColumnLetter(int columnIndex) {
        return String.valueOf((char) ('A' + columnIndex));
    }

    /**
     * Parsea una fecha desde diferentes formatos de string
     * Soporta múltiples formatos incluyendo fechas de Excel
     */
    private LocalDate parseDateFromString(String dateString) throws DateTimeParseException {
        if (isNullOrEmpty(dateString)) {
            throw new DateTimeParseException("Fecha vacía o nula", dateString, 0);
        }

        String trimmedDate = dateString.trim();
        
        // Lista de patrones de fecha soportados
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),           // 2025-02-15
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),           // 15/02/2025
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),           // 02/15/2025
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),           // 15-02-2025
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),           // 2025/02/15
        };

        // Intentar parsear con formatos estándar
        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(trimmedDate, formatter);
            } catch (DateTimeParseException e) {
                // Continuar con el siguiente formato
            }
        }

        // Si no funciona con formatos estándar, intentar parsear fecha completa de Excel/Java
        try {
            // Formato: "Sat Feb 15 00:00:00 COT 2025"
            if (trimmedDate.matches(".*\\w{3}\\s+\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2}.*\\d{4}.*")) {
                // Extraer las partes de la fecha usando regex
                String[] parts = trimmedDate.split("\\s+");
                if (parts.length >= 5) {
                    String month = parts[1];  // Feb
                    String day = parts[2];    // 15
                    String year = parts[4];   // 2025 (puede estar al final)
                    
                    // Si el año está al final después de la zona horaria
                    if (!year.matches("\\d{4}")) {
                        year = parts[parts.length - 1]; // Último elemento debería ser el año
                    }
                    
                    // Convertir mes abreviado a número
                    int monthNum = getMonthNumber(month);
                    
                    return LocalDate.of(Integer.parseInt(year), monthNum, Integer.parseInt(day));
                }
            }
            
            // Intentar como Date y convertir
            java.util.Date date = new java.text.SimpleDateFormat("EEE MMM dd HH:mm:ss zzz yyyy", java.util.Locale.ENGLISH).parse(trimmedDate);
            return date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            
        } catch (NumberFormatException | ParseException e) {
            // Último intento: si es un timestamp numérico o fecha de Excel
            try {
                // Intentar como timestamp de Excel (días desde 1900-01-01)
                double excelDate = Double.parseDouble(trimmedDate);
                return LocalDate.of(1900, 1, 1).plusDays((long) excelDate - 2); // Excel tiene un bug de 2 días
            } catch (NumberFormatException nfe) {
                // No es un número, fallar
            }
        }

        throw new DateTimeParseException("Formato de fecha no soportado", trimmedDate, 0);
    }

    /**
     * Convierte nombre de mes abreviado en inglés a número
     */
    private int getMonthNumber(String monthAbbrev) {
        return switch (monthAbbrev.toLowerCase()) {
            case "jan" -> 1;
            case "feb" -> 2;
            case "mar" -> 3;
            case "apr" -> 4;
            case "may" -> 5;
            case "jun" -> 6;
            case "jul" -> 7;
            case "aug" -> 8;
            case "sep" -> 9;
            case "oct" -> 10;
            case "nov" -> 11;
            case "dec" -> 12;
            default -> throw new IllegalArgumentException("Mes no válido: " + monthAbbrev);
        };
    }

    // =========================
    // CLASES AUXILIARES
    // =========================

    /**
     * Clase auxiliar para almacenar datos de un grupo extraídos del Excel
     */
    private static class GroupData {
        private final String clase;
        private final String grupo;
        private final String profesorClase;
        private final String profesorLab;
        private final String semestre;

        public GroupData(String clase, String grupo, String profesorClase, String profesorLab, String semestre) {
            this.clase = clase;
            this.grupo = grupo;
            this.profesorClase = profesorClase;
            this.profesorLab = profesorLab;
            this.semestre = semestre;
        }

        // Getters
        public String getClase() { return clase; }
        public String getGrupo() { return grupo; }
        public String getProfesorClase() { return profesorClase; }
        public String getProfesorLab() { return profesorLab; }
        public String getSemestre() { return semestre; }
    }

    /**
     * Clase auxiliar para almacenar datos de una entrega extraídos del Excel
     */
    private static class EntregaData {
        private final String responsable;
        private final String trabajo;
        private final String entrega;
        private final String fecha;

        public EntregaData(String responsable, String trabajo, String entrega, String fecha) {
            this.responsable = responsable;
            this.trabajo = trabajo;
            this.entrega = entrega;
            this.fecha = fecha;
        }

        // Getters
        public String getResponsable() { return responsable; }
        public String getTrabajo() { return trabajo; }
        public String getEntrega() { return entrega; }
        public String getFecha() { return fecha; }
    }

    /**
     * Clase auxiliar para almacenar datos de un estudiante extraídos del Excel
     */
    private static class StudentData {
        private final String grupo;
        private final String id;
        private final String nombre;
        private final String programa;
        private final String correo;

        public StudentData(String grupo, String id, String nombre, String programa, String correo) {
            this.grupo = grupo;
            this.id = id;
            this.nombre = nombre;
            this.programa = programa;
            this.correo = correo;
        }

        // Getters
        public String getGrupo() { return grupo; }
        public String getId() { return id; }
        public String getNombre() { return nombre; }
        public String getPrograma() { return programa; }
        public String getCorreo() { return correo; }
    }

    /**
     * Clase auxiliar para almacenar datos de un equipo extraídos del Excel
     */
    private static class TeamData {
        private final String grupo;
        private final String equipo;
        private final String activo;

        public TeamData(String grupo, String equipo, String activo) {
            this.grupo = grupo;
            this.equipo = equipo;
            this.activo = activo;
        }

        // Getters
        public String getGrupo() { return grupo; }
        public String getEquipo() { return equipo; }
        public String getActivo() { return activo; }
    }
}
