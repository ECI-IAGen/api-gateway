package com.eci.iagen.api_gateway.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
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

import com.eci.iagen.api_gateway.dto.response.ExcelImportResponseDTO;
import com.eci.iagen.api_gateway.entity.Class;
import com.eci.iagen.api_gateway.entity.Role;
import com.eci.iagen.api_gateway.entity.User;
import com.eci.iagen.api_gateway.repository.ClassRepository;
import com.eci.iagen.api_gateway.repository.RoleRepository;
import com.eci.iagen.api_gateway.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExcelImportService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClassRepository classRepository;

    @Transactional
    public ExcelImportResponseDTO importExcel(MultipartFile file) {
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

                Sheet sheet = workbook.getSheetAt(0);

                // Extraer información del profesor desde las primeras filas
                ExcelClassInfo classInfo = extractClassInfo(sheet);

                if (classInfo == null) {
                    return new ExcelImportResponseDTO(false, "No se pudo extraer información de la clase", stats,
                            List.of("Error al leer la información del profesor y la materia"));
                }

                // PASO 1: Crear roles necesarios primero
                log.info("=== PASO 1: Creando roles necesarios ===");
                createRequiredRoles(stats);

                // PASO 2: Crear o actualizar profesor
                log.info("=== PASO 2: Creando profesor ===");
                User professor = createOrUpdateUser(classInfo.getProfessorName(), classInfo.getProfessorEmail(),
                        "PROFESOR");
                if (professor != null) {
                    stats.setUsersCreated(stats.getUsersCreated() + 1);
                    log.info("Profesor creado: {} - {}", professor.getName(), professor.getEmail());
                }

                // PASO 3: Crear la clase y asignar profesor
                log.info("=== PASO 3: Creando clase ===");
                String className = classInfo.getCourseName() + "-" + classInfo.getProfessorName();
                ClassCreationResult classResult = createOrUpdateClass(className, professor);
                if (classResult != null && classResult.getClassEntity() != null) {
                    if (classResult.isWasCreated()) {
                        stats.setClassesCreated(stats.getClassesCreated() + 1);
                        log.info("Clase creada: {}", classResult.getClassEntity().getName());
                    } else {
                        stats.setClassesUpdated(stats.getClassesUpdated() + 1);
                        log.info("Clase actualizada: {}", classResult.getClassEntity().getName());
                    }
                }

                // PASO 4: Procesar estudiantes
                log.info("=== PASO 4: Procesando estudiantes ===");
                Class courseClass = classResult != null ? classResult.getClassEntity() : null;
                processStudents(sheet, courseClass, stats, errors);

                stats.setTotalProcessed(stats.getUsersCreated() + stats.getUsersUpdated());

                String message = String.format(
                        "Importación completada. Roles: %d creados. Usuarios: %d creados, %d actualizados. Clases: %d creadas, %d actualizadas",
                        stats.getRolesCreated(), stats.getUsersCreated(), stats.getUsersUpdated(),
                        stats.getClassesCreated(), stats.getClassesUpdated());

                log.info("=== IMPORTACIÓN FINALIZADA ===");
                log.info(message);

                return new ExcelImportResponseDTO(true, message, stats, errors);

            }
        } catch (IOException e) {
            log.error("Error al procesar archivo Excel", e);
            return new ExcelImportResponseDTO(false, "Error al procesar el archivo", stats,
                    List.of("Error de E/O: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al importar Excel", e);
            return new ExcelImportResponseDTO(false, "Error inesperado", stats,
                    List.of("Error inesperado: " + e.getMessage()));
        }
    }

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

            // Crear rol ESTUDIANTE si no existe
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

    private ExcelClassInfo extractClassInfo(Sheet sheet) {
        try {
            ExcelClassInfo info = new ExcelClassInfo();

            // Buscar información del profesor (fila 10, columna H)
            Row professorRow = sheet.getRow(9); // Fila 10 en Excel (0-indexado)
            if (professorRow != null) {
                Cell nameCell = professorRow.getCell(7); // Columna H (índice 7)
                if (nameCell != null) {
                    info.setProfessorName(getCellValueAsString(nameCell));
                }
            }

            // Buscar código de grupo (fila 12, columna B)
            Row groupRow = sheet.getRow(11); // Fila 12 en Excel (0-indexado)
            if (groupRow != null) {
                Cell groupCell = groupRow.getCell(1); // Columna B (índice 1)
                if (groupCell != null) {
                    info.setCourseCode(getCellValueAsString(groupCell));
                    // Usamos el código del grupo como nombre del curso también
                    info.setCourseName("Grupo " + info.getCourseCode());
                }
            }

            // Generar email del profesor basado en el nombre si no se encuentra
            if (info.getProfessorName() != null && !info.getProfessorName().isEmpty()) {
                info.setProfessorEmail(generateEmailFromName(info.getProfessorName()));
            }

            return info;
        } catch (Exception e) {
            log.error("Error extrayendo información de la clase", e);
            return null;
        }
    }

    private void processStudents(Sheet sheet, Class courseClass, ExcelImportResponseDTO.ImportStats stats,
            List<String> errors) {
        // Los estudiantes empiezan en la fila 18 (índice 17)
        int startRow = 17;

        for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            try {
                // Columna B: Nombre del estudiante
                Cell nameCell = row.getCell(1); // Columna B (índice 1)
                // Columna O: Correo Electrónico
                Cell emailCell = row.getCell(14); // Columna O (índice 14)

                String studentName = getCellValueAsString(nameCell);
                String email = getCellValueAsString(emailCell);

                // Validar que tengamos al menos el nombre
                if (studentName == null || studentName.trim().isEmpty()) {
                    continue; // Saltar filas vacías
                }

                // Si no hay email, generarlo desde el nombre
                if (email == null || email.trim().isEmpty()) {
                    email = generateEmailFromName(studentName);
                }

                // Crear o actualizar estudiante
                User student = createOrUpdateUser(studentName, email, "ESTUDIANTE");
                if (student != null) {
                    boolean wasExisting = userRepository.existsByEmail(email);
                    if (wasExisting) {
                        stats.setUsersUpdated(stats.getUsersUpdated() + 1);
                    } else {
                        stats.setUsersCreated(stats.getUsersCreated() + 1);
                    }

                    // Agregar estudiante a la clase (sin equipo por ahora - relación directa no existe)
                    if (courseClass != null) {
                        log.info("Estudiante {} procesado para la clase {}", studentName, courseClass.getName());
                    }

                    log.info("Procesado estudiante: {} - {}", studentName, email);
                }

            } catch (Exception e) {
                String error = String.format("Error procesando fila %d: %s", i + 1, e.getMessage());
                errors.add(error);
                log.warn(error, e);
            }
        }
    }

    private User createOrUpdateUser(String name, String email, String roleName) {
        try {
            // Buscar rol (debe existir ya que los creamos al inicio)
            Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + roleName +
                            ". Los roles deben crearse antes de los usuarios."));

            // Buscar usuario existente por email
            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                // Actualizar usuario existente
                User user = existingUser.get();
                user.setName(name);
                user.setRole(role); // Actualizar rol también
                return userRepository.save(user);
            } else {
                // Crear nuevo usuario
                User newUser = new User();
                newUser.setName(name);
                newUser.setEmail(email);
                newUser.setRole(role);
                return userRepository.save(newUser);
            }
        } catch (Exception e) {
            log.error("Error creando/actualizando usuario: {} - {}", name, e.getMessage(), e);
            return null;
        }
    }

    private ClassCreationResult createOrUpdateClass(String name, User professor) {
        try {
            // Buscar clase existente por nombre
            Optional<Class> existingClass = classRepository.findByName(name);

            if (existingClass.isPresent()) {
                Class classEntity = existingClass.get();
                // Actualizar el profesor si es diferente
                if (professor != null) {
                    classEntity.setProfessor(professor);
                    Class savedClass = classRepository.save(classEntity);
                    return new ClassCreationResult(savedClass, false); // Actualizada
                }
                return new ClassCreationResult(classEntity, false); // Existente sin cambios
            } else {
                // Crear nueva clase
                Class newClass = new Class();
                newClass.setName(name);
                if (professor != null) {
                    newClass.setProfessor(professor);
                }
                newClass.setCreatedAt(java.time.LocalDateTime.now());
                Class savedClass = classRepository.save(newClass);
                return new ClassCreationResult(savedClass, true); // Creada
            }
        } catch (Exception e) {
            log.error("Error creando/actualizando clase: {}", name, e);
            return null;
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null)
            return null;

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

    private String generateEmailFromName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "usuario@escuelaing.edu.co";
        }

        // Convertir nombre a formato de email
        String email = name.toLowerCase()
                .replaceAll("\\s+", ".")
                .replaceAll("[áàäâ]", "a")
                .replaceAll("[éèëê]", "e")
                .replaceAll("[íìïî]", "i")
                .replaceAll("[óòöô]", "o")
                .replaceAll("[úùüû]", "u")
                .replaceAll("[ñ]", "n")
                .replaceAll("[^a-z0-9.]", "");

        return email + "@escuelaing.edu.co";
    }

    // Clase auxiliar para resultado de creación de clase
    private static class ClassCreationResult {
        private final Class classEntity;
        private final boolean wasCreated;

        public ClassCreationResult(Class classEntity, boolean wasCreated) {
            this.classEntity = classEntity;
            this.wasCreated = wasCreated;
        }

        public Class getClassEntity() {
            return classEntity;
        }

        public boolean isWasCreated() {
            return wasCreated;
        }
    }

    // Clase auxiliar para información de la clase
    private static class ExcelClassInfo {
        private String professorName;
        private String professorEmail;
        private String courseName;
        private String courseCode;

        // Getters y setters
        public String getProfessorName() {
            return professorName;
        }

        public void setProfessorName(String professorName) {
            this.professorName = professorName;
        }

        public String getProfessorEmail() {
            return professorEmail;
        }

        public void setProfessorEmail(String professorEmail) {
            this.professorEmail = professorEmail;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }
    }
}
