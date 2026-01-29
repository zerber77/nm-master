// --- Маска и валидация поля телефона ---
function formatPhone(value) {
    // Оставляем только цифры
    value = value.replace(/\D/g, '');
    // +7 всегда присутствует в начале
    if (value.startsWith('7')) {
        value = value.substring(1);
    }
    value = value.padEnd(10, '_').substring(0, 10); // максимум 10 цифр после +7
    return `+7-${value.substring(0,3)}-${value.substring(3,6)}-${value.substring(6,8)}-${value.substring(8,10)}`;
}

export function phoneValidation() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    let prevValid = '';
    if (phoneInput) phoneInput.addEventListener('input', function(e) {
        const selectionStart = this.selectionStart;
        const rawValue = this.value;
        let digits = rawValue.replace(/\D/g,'');
        if (digits.startsWith('7')) digits = digits.slice(1); // убираем лишнюю 7
        // Проверка: если вводится не цифра
        if (/[^\d]/.test(e.data) && e.data !== null) {
            this.style.borderColor = 'red';
            phoneError.style.display = 'block';
            return;
        }
        // Запоминаем, сколько было цифр слева от курсора
        let leftDigits = rawValue.slice(0, selectionStart).replace(/\D/g,'').replace(/^7/, '');
        // Форматируем
        let masked = formatPhone(digits);
        this.value = masked;
        // Восстанавливаем позицию курсора: ищем N-ю цифру (N=leftDigits.length) в новой строке
        let pos = 0;
        let count = 0;
        for (; pos < masked.length; pos++) {
            if (masked[pos].match(/\d|_/)) count++;
            if (count >= leftDigits.length+2) break;
        }
        this.setSelectionRange(pos, pos);
        // Проверка длины (должно быть 10 цифр после +7)
        if (digits.length !== 10) {
            // Здесь this ссылается на сам input (поле ввода телефона), потому что функция-обработчик назначена вот так:
            // phoneInput.addEventListener('input', function(e) { ... }) Т.е. внутри этой функции this всегда будет phoneInput.
            this.style.borderColor = 'red';
            phoneError.style.display = 'block';
        } else {
            this.style.borderColor = '';
            phoneError.style.display = 'none';
            prevValid = masked;
        }
    })
}

// Запрет на некорректные символы при вставке
export function phonePaste() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (phoneInput) phoneInput.addEventListener('paste', function(e) {
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        if (/[^\d]/.test(paste.replace(/\D/g,''))) {
            e.preventDefault();
            this.style.borderColor = 'red';
            phoneError.style.display = 'block';
        }
    })
}

// Сброс визуала при фокусе
export function phoneFocus() {
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phone-error');
    if (phoneInput) phoneInput.addEventListener('focus', function() {
        this.style.borderColor = '';
        phoneError.style.display = 'none';
    })
}