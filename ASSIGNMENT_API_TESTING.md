# Assignment CRUD API - Ejemplos de Pruebas

Este archivo contiene ejemplos de comandos curl para probar todos los endpoints del Assignment CRUD API.

## Configuración Inicial

Asegúrate de que el servidor esté corriendo en `http://localhost:8080`

## Variables de Entorno (Opcional)
```bash
export API_BASE_URL="http://localhost:8080/api/assignments"
```

## 1. CRUD Básico

### 1.1 Obtener todas las asignaciones
```bash
curl -X GET $API_BASE_URL \
  -H "Content-Type: application/json"
```

### 1.2 Obtener asignación por ID
```bash
curl -X GET $API_BASE_URL/1 \
  -H "Content-Type: application/json"
```

### 1.3 Crear nueva asignación (requiere schedule existente)
```bash
curl -X POST $API_BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea de Base de Datos",
    "description": "Diseñar modelo ER para sistema de inventario",
    "scheduleId": 1
  }'
```

### 1.4 Actualizar asignación
```bash
curl -X PUT $API_BASE_URL/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea de Base de Datos - Actualizada",
    "description": "Diseñar e implementar modelo ER para sistema de inventario",
    "scheduleId": 1
  }'
```

### 1.5 Eliminar asignación
```bash
curl -X DELETE $API_BASE_URL/1 \
  -H "Content-Type: application/json"
```

## 2. Operaciones con Schedule

### 2.1 Crear asignación con nuevo schedule
```bash
curl -X POST $API_BASE_URL/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Final de Programación",
    "description": "Desarrollar aplicación web completa con Spring Boot y React",
    "startDate": "2025-07-06T09:00:00",
    "dueDate": "2025-07-20T23:59:59"
  }'
```

### 2.2 Actualizar asignación y su schedule
```bash
curl -X PUT $API_BASE_URL/1/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Final de Programación - Modificado",
    "description": "Desarrollar aplicación web completa con Spring Boot, React y base de datos PostgreSQL",
    "startDate": "2025-07-06T09:00:00",
    "dueDate": "2025-07-25T23:59:59"
  }'
```

## 3. Búsquedas

### 3.1 Asignaciones por Schedule ID
```bash
curl -X GET $API_BASE_URL/schedule/1 \
  -H "Content-Type: application/json"
```

### 3.2 Búsqueda por título
```bash
curl -X GET "$API_BASE_URL/search?title=programacion" \
  -H "Content-Type: application/json"
```

### 3.3 Búsqueda avanzada (título y descripción)
```bash
curl -X GET "$API_BASE_URL/search/advanced?searchTerm=base%20de%20datos" \
  -H "Content-Type: application/json"
```

### 3.4 Asignaciones próximas (upcoming)
```bash
curl -X GET $API_BASE_URL/upcoming \
  -H "Content-Type: application/json"
```

### 3.5 Asignaciones pasadas
```bash
curl -X GET $API_BASE_URL/past \
  -H "Content-Type: application/json"
```

### 3.6 Asignaciones activas
```bash
curl -X GET $API_BASE_URL/active \
  -H "Content-Type: application/json"
```

### 3.7 Asignaciones por rango de fechas
```bash
curl -X GET "$API_BASE_URL/date-range?startDate=2025-07-01T00:00:00&endDate=2025-07-31T23:59:59" \
  -H "Content-Type: application/json"
```

### 3.8 Asignaciones que vencen en 7 días
```bash
curl -X GET $API_BASE_URL/due-within-days/7 \
  -H "Content-Type: application/json"
```

### 3.9 Asignaciones que vencen en 24 horas
```bash
curl -X GET $API_BASE_URL/due-within-hours/24 \
  -H "Content-Type: application/json"
```

## 4. Estadísticas

### 4.1 Estadísticas completas
```bash
curl -X GET $API_BASE_URL/stats \
  -H "Content-Type: application/json"
```

### 4.2 Contar asignaciones próximas
```bash
curl -X GET $API_BASE_URL/count/upcoming \
  -H "Content-Type: application/json"
```

### 4.3 Contar asignaciones pasadas
```bash
curl -X GET $API_BASE_URL/count/past \
  -H "Content-Type: application/json"
```

### 4.4 Contar asignaciones activas
```bash
curl -X GET $API_BASE_URL/count/active \
  -H "Content-Type: application/json"
```

## 5. Operaciones de Limpieza

### 5.1 Eliminar asignaciones de más de 30 días
```bash
curl -X DELETE $API_BASE_URL/cleanup/30 \
  -H "Content-Type: application/json"
```

## 6. Ejemplos de Casos de Uso Completos

### 6.1 Crear múltiples asignaciones para un curso
```bash
# Asignación 1: Tarea corta
curl -X POST $API_BASE_URL/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tarea 1: Conceptos Básicos",
    "description": "Investigar y resumir conceptos fundamentales",
    "startDate": "2025-07-06T09:00:00",
    "dueDate": "2025-07-08T23:59:59"
  }'

# Asignación 2: Proyecto intermedio
curl -X POST $API_BASE_URL/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Intermedio: Prototipo",
    "description": "Desarrollar prototipo funcional de la aplicación",
    "startDate": "2025-07-09T09:00:00",
    "dueDate": "2025-07-15T23:59:59"
  }'

# Asignación 3: Proyecto final
curl -X POST $API_BASE_URL/with-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Final: Sistema Completo",
    "description": "Implementación completa del sistema con documentación",
    "startDate": "2025-07-16T09:00:00",
    "dueDate": "2025-07-30T23:59:59"
  }'
```

### 6.2 Monitoreo de asignaciones próximas a vencer
```bash
# Ver asignaciones que vencen hoy
curl -X GET $API_BASE_URL/due-within-hours/24

# Ver asignaciones que vencen esta semana
curl -X GET $API_BASE_URL/due-within-days/7

# Ver estadísticas generales
curl -X GET $API_BASE_URL/stats
```

### 6.3 Mantenimiento periódico
```bash
# Eliminar asignaciones de más de 90 días
curl -X DELETE $API_BASE_URL/cleanup/90

# Verificar estadísticas después de la limpieza
curl -X GET $API_BASE_URL/stats
```

## 7. Respuestas Esperadas

### Éxito (200/201):
```json
{
  "id": 1,
  "title": "Proyecto Final",
  "description": "Descripción del proyecto",
  "scheduleId": 1,
  "startDate": "2025-07-06T09:00:00",
  "dueDate": "2025-07-20T23:59:59"
}
```

### Estadísticas (200):
```json
{
  "upcoming": 5,
  "past": 15,
  "active": 2
}
```

### Error de Validación (400):
```json
{
  "error": "Bad Request",
  "message": "Assignment title is required"
}
```

### No Encontrado (404):
```json
{
  "error": "Not Found",
  "message": "Assignment not found"
}
```

## 8. Scripts de Automatización

### 8.1 Script para poblar datos de prueba
```bash
#!/bin/bash
# populate_test_data.sh

API_BASE_URL="http://localhost:8080/api/assignments"

echo "Creando asignaciones de prueba..."

# Crear 5 asignaciones de prueba
for i in {1..5}; do
    curl -X POST $API_BASE_URL/with-schedule \
      -H "Content-Type: application/json" \
      -d "{
        \"title\": \"Tarea de Prueba $i\",
        \"description\": \"Descripción de la tarea número $i\",
        \"startDate\": \"2025-07-0${i}T09:00:00\",
        \"dueDate\": \"2025-07-1${i}T23:59:59\"
      }"
    echo ""
done

echo "Datos de prueba creados exitosamente!"
```

### 8.2 Script para verificar el estado del sistema
```bash
#!/bin/bash
# check_system_status.sh

API_BASE_URL="http://localhost:8080/api/assignments"

echo "=== Estado del Sistema de Asignaciones ==="
echo ""

echo "Estadísticas generales:"
curl -s -X GET $API_BASE_URL/stats | jq .
echo ""

echo "Asignaciones activas:"
curl -s -X GET $API_BASE_URL/active | jq length
echo ""

echo "Asignaciones que vencen en 24 horas:"
curl -s -X GET $API_BASE_URL/due-within-hours/24 | jq length
echo ""
```

## Notas Importantes

1. **Formato de Fechas**: Usar formato ISO 8601: `YYYY-MM-DDTHH:mm:ss`
2. **Encoding**: Usar UTF-8 para caracteres especiales
3. **Headers**: Siempre incluir `Content-Type: application/json`
4. **Status Codes**: Verificar códigos de respuesta HTTP para manejar errores
5. **Paginación**: Para grandes conjuntos de datos, considerar implementar paginación
6. **Rate Limiting**: En producción, considerar límites de velocidad
