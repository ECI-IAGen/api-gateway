# Importación de Datos desde Excel

## Funcionalidad Implementada

Se ha agregado la funcionalidad para importar estudiantes, profesores y cursos desde archivos Excel (.xlsx, .xls) al sistema ECI IAGen.

## Ubicación de la Funcionalidad

- **Frontend**: Botón "Importar Excel" en la sección de Gestión de Usuarios
- **Endpoint**: `POST /api/excel/import`
- **Información del formato**: `GET /api/excel/format-info`

## Formato Esperado del Excel

El sistema espera un formato específico basado en las listas de clases de la Escuela Colombiana de Ingeniería:

### Información del Profesor y Curso
- **Fila 11, Columna D**: Nombre del profesor
- **Fila 13, Columna B**: Nombre de la asignatura/materia
- **Fila 14, Columna D**: Código del grupo

### Información de Estudiantes (desde fila 17)
- **Columna A**: ID del estudiante
- **Columna B**: Nombre completo del estudiante
- **Columna C**: Programa académico
- **Columna O**: Correo electrónico (opcional, se genera automáticamente si no está presente)

## Características de la Importación

### ✅ Lo que hace el sistema:
1. **Extrae información del profesor** y lo crea con rol "PROFESOR"
2. **Crea la materia como un equipo/grupo** en el sistema
3. **Procesa todos los estudiantes** con rol "ESTUDIANTE"
4. **Genera emails automáticamente** si no están presentes (formato: nombre.apellido@escuelaing.edu.co)
5. **Evita duplicados** basándose en el email del usuario
6. **Crea roles automáticamente** si no existen
7. **Proporciona estadísticas detalladas** de la importación

### 📊 Estadísticas de Importación
- Usuarios creados
- Usuarios actualizados
- Equipos creados
- Total de registros procesados
- Lista de errores/advertencias

### 🔧 Configuración
- Tamaño máximo de archivo: 10MB
- Formatos soportados: .xlsx, .xls
- Procesamiento transaccional (todo o nada)

## Ejemplo de Uso

1. **Navegar** a la sección "Gestión de Usuarios"
2. **Hacer clic** en "Importar Excel"
3. **Seleccionar** el archivo Excel con el formato correcto
4. **Hacer clic** en "Importar"
5. **Revisar** las estadísticas y resultados

## Manejo de Errores

El sistema maneja varios tipos de errores:
- Archivo vacío o formato incorrecto
- Datos faltantes o inconsistentes
- Errores de base de datos
- Archivos demasiado grandes

## Seguridad y Validaciones

- Validación de formato de archivo
- Validación de estructura de datos
- Transacciones para consistencia de datos
- Logging detallado para auditoría
- Generación automática de emails seguros
