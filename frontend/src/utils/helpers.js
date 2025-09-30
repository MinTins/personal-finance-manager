/**
 * Набір допоміжних функцій для проекту
 */

/**
 * Форматує дату у зручний для відображення формат
 * @param {Date|string|number} date - Дата для форматування
 * @param {string} format - Формат виведення (за замовчуванням 'dd.MM.yyyy')
 * @returns {string} Відформатована дата
 */
export const formatDate = (date, format = 'dd.MM.yyyy') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Недійсна дата';
  }
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  let result = format;
  result = result.replace('dd', day);
  result = result.replace('MM', month);
  result = result.replace('yyyy', year);
  
  return result;
};

/**
 * Обрізає текст до вказаної довжини та додає три крапки в кінці
 * @param {string} text - Текст для обрізання
 * @param {number} length - Максимальна довжина тексту
 * @returns {string} Обрізаний текст
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return text.slice(0, length) + '...';
};

/**
 * Генерує унікальний ідентифікатор
 * @returns {string} Унікальний ідентифікатор
 */
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Форматує число у грошовий формат
 * @param {number} amount - Сума для форматування
 * @param {string} currency - Валюта (за замовчуванням 'UAH')
 * @returns {string} Відформатована сума
 */
export const formatMoney = (amount, currency = 'UAH') => {
  if (typeof amount !== 'number') {
    return '0 ' + currency;
  }
  
  return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ') + ' ' + currency;
};

/**
 * Форматує число у грошовий формат (аліас для formatMoney)
 * @param {number} amount - Сума для форматування
 * @param {string} currency - Валюта (за замовчуванням 'UAH')
 * @returns {string} Відформатована сума
 */
export const formatCurrency = (amount, currency = 'UAH') => {
  return formatMoney(amount, currency);
};

/**
 * Затримка виконання на вказаний час
 * @param {number} ms - Час затримки у мілісекундах
 * @returns {Promise} Проміс, який вирішується після затримки
 */
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Перевіряє, чи є рядок валідним email
 * @param {string} email - Email для перевірки
 * @returns {boolean} Результат перевірки
 */
export const isValidEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Отримує значення з localStorage з перевіркою на помилки
 * @param {string} key - Ключ для отримання значення
 * @param {any} defaultValue - Значення за замовчуванням, якщо ключ не знайдено
 * @returns {any} Збережене значення або значення за замовчуванням
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Помилка при отриманні даних з localStorage:', error);
    return defaultValue;
  }
};

/**
 * Зберігає значення у localStorage з перевіркою на помилки
 * @param {string} key - Ключ для збереження значення
 * @param {any} value - Значення для збереження
 * @returns {boolean} Результат операції
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Помилка при збереженні даних у localStorage:', error);
    return false;
  }
};

/**
 * Перетворює перший символ рядка на великий
 * @param {string} str - Рядок для перетворення
 * @returns {string} Перетворений рядок
 */
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Перетворює об'єкт на URL параметри
 * @param {object} params - Об'єкт з параметрами
 * @returns {string} Рядок URL параметрів
 */
export const objectToQueryParams = (params) => {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};

/**
 * Розраховує прогрес бюджету
 * @param {number} spent - Витрачена сума
 * @param {number} total - Загальна сума бюджету
 * @returns {number} Прогрес у відсотках
 */
export const calculateBudgetProgress = (spent, total) => {
  if (typeof spent !== 'number' || typeof total !== 'number' || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (spent / total) * 100));
};

/**
 * Отримує колір для прогресу бюджету
 * @param {number} progress - Прогрес у відсотках
 * @returns {string} Колір ('green', 'yellow' або 'red')
 */
export const getBudgetProgressColor = (progress) => {
  if (typeof progress !== 'number') return 'gray';
  if (progress < 50) return 'green';
  if (progress < 80) return 'yellow';
  return 'red';
};

/**
 * Генерує кольори для діаграми
 * @param {number} count - Кількість кольорів для генерації
 * @returns {string[]} Масив кольорів у форматі HEX
 */
export const generateChartColors = (count = 5) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }
  return colors;
};