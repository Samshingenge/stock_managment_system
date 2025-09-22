/**
 * Utility Functions for Stock Management System
 */

// Loading Spinner
function showSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('hidden');
    }
}

function hideSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('hidden');
    }
}

// Toast Notifications
let toastTimeout;

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastIcon || !toastMessage) {
        console.warn('Toast elements not found');
        return;
    }

    // Clear existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    // Set message
    toastMessage.textContent = message;

    // Set icon and color based on type
    let iconClass = 'fas fa-info-circle text-blue-500';
    let borderClass = 'border-blue-500';

    switch (type) {
        case 'success':
            iconClass = 'fas fa-check-circle text-green-500';
            borderClass = 'border-green-500';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle text-red-500';
            borderClass = 'border-red-500';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle text-yellow-500';
            borderClass = 'border-yellow-500';
            break;
        default:
            iconClass = 'fas fa-info-circle text-blue-500';
            borderClass = 'border-blue-500';
    }

    toastIcon.className = iconClass;
    
    // Update border color
    const toastDiv = toast.querySelector('div');
    if (toastDiv) {
        toastDiv.className = toastDiv.className.replace(/border-l-\w+-\d+/, borderClass);
    }

    // Show toast
    toast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    toastTimeout = setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('hidden');
    }
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
}

// Form Validation
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        throw new Error(`${fieldName} is required`);
    }
    return value.trim();
}

function validateNumber(value, fieldName, min = null, max = null) {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
        throw new Error(`${fieldName} must be a valid number`);
    }
    
    if (min !== null && num < min) {
        throw new Error(`${fieldName} must be at least ${min}`);
    }
    
    if (max !== null && num > max) {
        throw new Error(`${fieldName} must not exceed ${max}`);
    }
    
    return num;
}

function validateEmail(email) {
    if (!email) return '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
    }
    
    return email.toLowerCase();
}

function validatePhone(phone) {
    if (!phone) return '';
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
        throw new Error('Please enter a valid phone number');
    }
    
    return phone;
}

// Form Helper Functions
function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

function populateForm(formElement, data) {
    if (!formElement || !data) return;
    
    Object.keys(data).forEach(key => {
        const field = formElement.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else if (field.type === 'radio') {
                const radioButton = formElement.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radioButton) {
                    radioButton.checked = true;
                }
            } else {
                field.value = data[key] || '';
            }
        }
    });
}

function clearForm(formElement) {
    if (!formElement) return;
    
    formElement.reset();
    
    // Clear any error messages
    const errorElements = formElement.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    // Remove error styling
    const inputElements = formElement.querySelectorAll('.border-red-500');
    inputElements.forEach(el => {
        el.classList.remove('border-red-500');
        el.classList.add('border-gray-300');
    });
}

function showFieldError(fieldElement, message) {
    if (!fieldElement) return;
    
    // Remove existing error
    clearFieldError(fieldElement);
    
    // Add error styling
    fieldElement.classList.remove('border-gray-300');
    fieldElement.classList.add('border-red-500');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-red-500 text-sm mt-1';
    errorElement.textContent = message;
    
    // Insert error message after the field
    fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
}

function clearFieldError(fieldElement) {
    if (!fieldElement) return;
    
    // Remove error styling
    fieldElement.classList.remove('border-red-500');
    fieldElement.classList.add('border-gray-300');
    
    // Remove error message
    const errorElement = fieldElement.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

// Date and Time Utilities
function formatDateTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDateRangeTimestamps(days = 7) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    // Set to start of day
    start.setHours(0, 0, 0, 0);
    // Set to end of day
    end.setHours(23, 59, 59, 999);
    
    return {
        start: start.getTime(),
        end: end.getTime()
    };
}

function getTodayTimestamps() {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    
    return {
        start: start.getTime(),
        end: end.getTime()
    };
}

// Number and Currency Utilities
function formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatNumber(number, decimals = 0) {
    if (number === null || number === undefined) return '0';
    
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    
    // Remove currency symbols and spaces, then parse
    const cleaned = currencyString.replace(/[$,\s]/g, '');
    const number = parseFloat(cleaned);
    
    return isNaN(number) ? 0 : number;
}

// Array and Object Utilities
function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(item);
        return groups;
    }, {});
}

function sortBy(array, key, direction = 'asc') {
    return [...array].sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        
        // Handle null/undefined values
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        // Convert to string for comparison if needed
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (direction === 'desc') {
            return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        } else {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
    });
}

function filterBy(array, filters) {
    return array.filter(item => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key];
            const itemValue = item[key];
            
            if (filterValue === '' || filterValue === null || filterValue === undefined) {
                return true;
            }
            
            if (typeof filterValue === 'string') {
                return String(itemValue || '').toLowerCase().includes(filterValue.toLowerCase());
            }
            
            return itemValue === filterValue;
        });
    });
}

function sumBy(array, key) {
    return array.reduce((sum, item) => {
        const value = parseFloat(item[key]) || 0;
        return sum + value;
    }, 0);
}

function countBy(array, key) {
    return array.reduce((counts, item) => {
        const value = item[key] || 'Unknown';
        counts[value] = (counts[value] || 0) + 1;
        return counts;
    }, {});
}

// Local Storage Utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Debounce function for search inputs
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Generate random colors for charts
function generateRandomColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    
    return colors;
}

// File size formatting
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// URL utilities
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    
    for (let [key, value] of params.entries()) {
        result[key] = value;
    }
    
    return result;
}

function updateURL(params) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    
    window.history.replaceState(null, '', url.toString());
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
        }
        
        showToast('Copied to clipboard', 'success');
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        showToast('Failed to copy to clipboard', 'error');
        return false;
    }
}

// Print utilities
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showToast('Element not found for printing', 'error');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .no-print { display: none !important; }
                </style>
            </head>
            <body>
                ${element.innerHTML}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Export global utility functions
window.utils = {
    showSpinner,
    hideSpinner,
    showToast,
    hideToast,
    validateRequired,
    validateNumber,
    validateEmail,
    validatePhone,
    getFormData,
    populateForm,
    clearForm,
    showFieldError,
    clearFieldError,
    formatDateTime,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
    parseCurrency,
    groupBy,
    sortBy,
    filterBy,
    sumBy,
    countBy,
    saveToLocalStorage,
    loadFromLocalStorage,
    removeFromLocalStorage,
    debounce,
    generateRandomColors,
    formatFileSize,
    getQueryParams,
    updateURL,
    copyToClipboard,
    printElement,
    getDateRangeTimestamps,
    getTodayTimestamps
};