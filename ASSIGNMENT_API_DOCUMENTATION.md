# Assignment CRUD API Documentation

Esta documentación cubre todos los endpoints disponibles para la gestión de Assignment (Tareas/Asignaciones) en el API Gateway.

## Tabla de Contenidos
- [Estructura de Datos](#estructura-de-datos)
- [CRUD Básico](#crud-básico)
- [Operaciones con Schedule](#operaciones-con-schedule)
- [Búsquedas](#búsquedas)
- [Estadísticas](#estadísticas)
- [Operaciones de Limpieza](#operaciones-de-limpieza)

## Estructura de Datos

### AssignmentDTO
```json
{
  "id": 1,
  "title": "Tarea de programación",
  "description": "Implementar sistema de autenticación",
  "scheduleId": 5,
  "startDate": "2025-07-06T09:00:00",
  "dueDate": "2025-07-13T23:59:59"
}
```

## CRUD Básico

### 1. Obtener todas las asignaciones
**GET** `/api/assignments`

**Respuesta:**
```json
[
  {
    "id": 1,
    "title": "Tarea 1",
    "description": "Descripción de la tarea 1",
    "scheduleId": 1,
    "startDate": "2025-07-06T09:00:00",
    "dueDate": "2025-07-13T23:59:59"
  }
]
```

### 2. Obtener asignación por ID
**GET** `/api/assignments/{id}`

**Ejemplo:** `GET /api/assignments/1`

### 3. Crear nueva asignación
**POST** `/api/assignments`

**Cuerpo de la petición:**
```json
{
  "title": "Nueva Tarea",
  "description": "Descripción de la nueva tarea",
  "scheduleId": 1
}
```

**Validaciones:**
- `title`: Obligatorio, máximo 255 caracteres
- `description`: Opcional, máximo 1000 caracteres
- `scheduleId`: Obligatorio, debe existir en la base de datos

### 4. Actualizar asignación
**PUT** `/api/assignments/{id}`

**Cuerpo de la petición:**
```json
{
  "title": "Tarea Actualizada",
  "description": "Nueva descripción",
  "scheduleId": 2
}
```

### 5. Eliminar asignación
**DELETE** `/api/assignments/{id}`

**Respuesta:** `204 No Content` si se elimina correctamente.

## Operaciones con Schedule

### 1. Crear asignación con nuevo schedule
**POST** `/api/assignments/with-schedule`

**Cuerpo de la petición:**
```json
{
  "title": "Tarea con Schedule",
  "description": "Tarea que crea su propio schedule",
  "startDate": "2025-07-06T09:00:00",
  "dueDate": "2025-07-13T23:59:59"
}
```

**Validaciones adicionales:**
- `startDate` y `dueDate`: Obligatorios
- `startDate` debe ser anterior a `dueDate`
- `dueDate` no puede estar más de 1 día en el pasado
- El período no puede exceder 365 días

### 2. Actualizar asignación y su schedule
**PUT** `/api/assignments/{id}/with-schedule`

**Cuerpo de la petición:**
```json
{
  "title": "Tarea Actualizada",
  "description": "Descripción actualizada",
  "startDate": "2025-07-07T10:00:00",
  "dueDate": "2025-07-14T23:59:59"
}
```

## Búsquedas

### 1. Por Schedule ID
**GET** `/api/assignments/schedule/{scheduleId}`

**Ejemplo:** `GET /api/assignments/schedule/1`

### 2. Búsqueda por título
**GET** `/api/assignments/search?title={titulo}`

**Ejemplo:** `GET /api/assignments/search?title=programacion`

### 3. Búsqueda avanzada (título y descripción)
**GET** `/api/assignments/search/advanced?searchTerm={termino}`

**Ejemplo:** `GET /api/assignments/search/advanced?searchTerm=base%20de%20datos`

### 4. Asignaciones por estado temporal

#### Próximas (upcoming)
**GET** `/api/assignments/upcoming`

Retorna asignaciones cuya fecha de vencimiento es mayor o igual a la fecha actual.

#### Pasadas
**GET** `/api/assignments/past`

Retorna asignaciones cuya fecha de vencimiento ya pasó.

#### Activas
**GET** `/api/assignments/active`

Retorna asignaciones que están dentro del período de ejecución (entre startDate y dueDate).

### 5. Búsquedas por rango de fechas

#### Por rango personalizado
**GET** `/api/assignments/date-range?startDate={fecha1}&endDate={fecha2}`

**Ejemplo:** `GET /api/assignments/date-range?startDate=2025-07-01T00:00:00&endDate=2025-07-31T23:59:59`

#### Que vencen en X días
**GET** `/api/assignments/due-within-days/{days}`

**Ejemplo:** `GET /api/assignments/due-within-days/7` (próximas a vencer en 7 días)

#### Que vencen en X horas
**GET** `/api/assignments/due-within-hours/{hours}`

**Ejemplo:** `GET /api/assignments/due-within-hours/24` (próximas a vencer en 24 horas)

## Estadísticas

### 1. Estadísticas completas
**GET** `/api/assignments/stats`

**Respuesta:**
```json
{
  "upcoming": 15,
  "past": 25,
  "active": 8
}
```

### 2. Contadores individuales

#### Contar próximas
**GET** `/api/assignments/count/upcoming`

#### Contar pasadas
**GET** `/api/assignments/count/past`

#### Contar activas
**GET** `/api/assignments/count/active`

## Operaciones de Limpieza

### Eliminar asignaciones antiguas
**DELETE** `/api/assignments/cleanup/{daysOld}`

**Ejemplo:** `DELETE /api/assignments/cleanup/30`

Elimina todas las asignaciones cuya fecha de vencimiento es anterior a X días.

**Respuesta:**
```json
{
  "deletedCount": 12
}
```

## Códigos de Respuesta HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **204 No Content**: Recurso eliminado exitosamente
- **400 Bad Request**: Error de validación o parámetros inválidos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Ejemplos de Uso

### Crear una tarea con fechas específicas
```bash
curl -X POST http://localhost:8080/api/assignments/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Final",
    "description": "Desarrollar sistema completo de gestión",
    "startDate": "2025-07-06T09:00:00",
    "dueDate": "2025-07-20T23:59:59"
  }'
```

### Buscar tareas que vencen en las próximas 24 horas
```bash
curl -X GET http://localhost:8080/api/assignments/due-within-hours/24
```

### Obtener estadísticas
```bash
curl -X GET http://localhost:8080/api/assignments/stats
```

### Limpiar tareas de más de 60 días
```bash
curl -X DELETE http://localhost:8080/api/assignments/cleanup/60
```

## Notas Importantes

1. **Transaccionalidad**: Todas las operaciones de escritura están envueltas en transacciones.

2. **Validaciones**: El sistema valida automáticamente:
   - Campos obligatorios
   - Longitud de strings
   - Coherencia de fechas
   - Existencia de relaciones

3. **Manejo de Errores**: Todos los endpoints incluyen manejo robusto de errores con logging detallado.

4. **Rendimiento**: Las consultas están optimizadas y algunas operaciones de lectura están marcadas como `readOnly = true`.

5. **Flexibilidad**: El sistema permite tanto trabajar con schedules existentes como crear nuevos schedules automáticamente.
