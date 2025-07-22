// Utilidades compartidas entre todos los componentes
class ComponentUtils {
    // Función helper para convertir fechas del backend
    static parseBackendDate(dateValue) {
        if (!dateValue) return null;
        
        // Si es un array [year, month, day, hour, minute]
        if (Array.isArray(dateValue) && dateValue.length >= 3) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
            return new Date(year, month - 1, day, hour, minute, second);
        }
        
        // Si es un string ISO
        if (typeof dateValue === 'string') {
            return new Date(dateValue);
        }
        
        // Si es un objeto Date
        if (dateValue instanceof Date) {
            return dateValue;
        }
        
        return null;
    }

    // Función para formatear fechas de manera consistente
    static formatDate(date, includeTime = false) {
        if (!date) return 'N/A';
        
        const parsedDate = this.parseBackendDate(date);
        if (!parsedDate) return 'N/A';
        
        if (includeTime) {
            return parsedDate.toLocaleString();
        } else {
            return parsedDate.toLocaleDateString();
        }
    }

    // Función para escapar valores CSV
    static escapeCSV(value) {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    // Función para validar JSON
    static isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Función para truncar texto
    static truncateText(text, maxLength = 200) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Función para crear elementos de tabla de manera consistente
    static createTableRow(data, columns) {
        const row = document.createElement('tr');
        
        columns.forEach(column => {
            const cell = document.createElement('td');
            
            if (column.className) {
                cell.className = column.className;
            }
            
            if (column.title && data[column.field]) {
                cell.title = data[column.field];
            }
            
            if (column.render) {
                cell.innerHTML = column.render(data);
            } else {
                cell.textContent = data[column.field] || '';
            }
            
            row.appendChild(cell);
        });
        
        return row;
    }

    // Función para mostrar modales de confirmación
    static async showConfirmModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
        return new Promise((resolve) => {
            const modalHtml = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <p>${message}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancelBtn">${cancelText}</button>
                    <button type="button" class="btn btn-danger" id="confirmBtn">${confirmText}</button>
                  </div>
                </div>
              </div>
            </div>`;

            // Crear contenedor temporal si no existe
            let container = document.getElementById('temp-modal-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'temp-modal-container';
                document.body.appendChild(container);
            }

            container.innerHTML = modalHtml;
            const modal = new bootstrap.Modal(document.getElementById('confirmModal'));

            document.getElementById('confirmBtn').onclick = () => {
                modal.hide();
                resolve(true);
            };

            document.getElementById('cancelBtn').onclick = () => {
                modal.hide();
                resolve(false);
            };

            modal.show();

            // Limpiar cuando se cierre
            document.getElementById('confirmModal').addEventListener('hidden.bs.modal', () => {
                container.innerHTML = '';
            });
        });
    }

    // Función para descargar archivos
    static downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type: type + ';charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Función para validar formularios
    static validateForm(formElement, customValidations = {}) {
        let isValid = true;
        const errors = {};

        // Validaciones HTML5 básicas
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                errors[input.name] = input.validationMessage;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });

        // Validaciones personalizadas
        Object.keys(customValidations).forEach(fieldName => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                const validation = customValidations[fieldName];
                const value = field.value;
                
                if (!validation.validator(value)) {
                    isValid = false;
                    errors[fieldName] = validation.message;
                    field.classList.add('is-invalid');
                    
                    // Mostrar mensaje personalizado
                    let feedback = field.parentNode.querySelector('.invalid-feedback');
                    if (!feedback) {
                        feedback = document.createElement('div');
                        feedback.className = 'invalid-feedback';
                        field.parentNode.appendChild(feedback);
                    }
                    feedback.textContent = validation.message;
                } else {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                }
            }
        });

        return { isValid, errors };
    }

    // Función para limpiar formularios
    static clearForm(formElement) {
        formElement.reset();
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Limpiar mensajes de error personalizados
        const feedbacks = formElement.querySelectorAll('.invalid-feedback');
        feedbacks.forEach(feedback => feedback.remove());
    }

    // Función para copiar texto al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    // Función para formatear números
    static formatNumber(number, decimals = 2) {
        if (isNaN(number)) return 'N/A';
        return Number(number).toFixed(decimals);
    }

    // Función para formatear porcentajes
    static formatPercentage(value, total, decimals = 1) {
        if (isNaN(value) || isNaN(total) || total === 0) return 'N/A';
        const percentage = (value / total) * 100;
        return this.formatNumber(percentage, decimals) + '%';
    }
}

// Hacer disponible globalmente
window.ComponentUtils = ComponentUtils;
