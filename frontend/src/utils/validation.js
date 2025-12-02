/**
 * Функції валідації для форм проекту
 */

// Константи для обмежень БД
export const DB_LIMITS = {
  // VARCHAR lengths
  USERNAME_MAX: 50,
  EMAIL_MAX: 100,
  ACCOUNT_NAME_MAX: 50,
  CATEGORY_NAME_MAX: 50,
  CURRENCY_MAX: 3,
  COLOR_MAX: 7,
  
  // DECIMAL(15,2) - максимум 9999999999999.99
  AMOUNT_MAX: 9999999999999.99,
  AMOUNT_MIN: 0.01,
  
  // TEXT field - практично без обмежень, але обмежимо до розумного значення
  DESCRIPTION_MAX: 5000,
}

/**
 * Валідація імені користувача
 * @param {string} username - Ім'я користувача
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return 'Введіть ім\'я користувача'
  }
  
  if (username.length > DB_LIMITS.USERNAME_MAX) {
    return `Ім'я користувача не може перевищувати ${DB_LIMITS.USERNAME_MAX} символів`
  }
  
  // Перевірка на допустимі символи (літери, цифри, підкреслення, дефіс)
  if (!/^[a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ_-]+$/.test(username)) {
    return 'Ім\'я користувача може містити тільки літери, цифри, підкреслення та дефіс'
  }
  
  return null
}

/**
 * Валідація email
 * @param {string} email - Email адреса
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Введіть email'
  }
  
  if (email.length > DB_LIMITS.EMAIL_MAX) {
    return `Email не може перевищувати ${DB_LIMITS.EMAIL_MAX} символів`
  }
  
  // Регулярний вираз для перевірки email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Введіть коректний email'
  }
  
  return null
}

/**
 * Валідація пароля
 * @param {string} password - Пароль
 * @param {number} minLength - Мінімальна довжина пароля (за замовчуванням 6)
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password || password.trim() === '') {
    return 'Введіть пароль'
  }
  
  if (password.length < minLength) {
    return `Пароль повинен містити мінімум ${minLength} символів`
  }
  
  if (password.length > 255) {
    return 'Пароль занадто довгий'
  }
  
  return null
}

/**
 * Валідація назви рахунку
 * @param {string} name - Назва рахунку
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateAccountName = (name) => {
  if (!name || name.trim() === '') {
    return 'Введіть назву рахунку'
  }
  
  if (name.length > DB_LIMITS.ACCOUNT_NAME_MAX) {
    return `Назва рахунку не може перевищувати ${DB_LIMITS.ACCOUNT_NAME_MAX} символів`
  }
  
  return null
}

/**
 * Валідація назви категорії
 * @param {string} name - Назва категорії
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateCategoryName = (name) => {
  if (!name || name.trim() === '') {
    return 'Введіть назву категорії'
  }
  
  if (name.length > DB_LIMITS.CATEGORY_NAME_MAX) {
    return `Назва категорії не може перевищувати ${DB_LIMITS.CATEGORY_NAME_MAX} символів`
  }
  
  return null
}

/**
 * Валідація коду валюти
 * @param {string} currency - Код валюти
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateCurrency = (currency) => {
  if (!currency || currency.trim() === '') {
    return 'Введіть код валюти'
  }
  
  if (currency.length !== 3) {
    return 'Код валюти повинен містити 3 символи (наприклад, UAH, USD, EUR)'
  }
  
  if (!/^[A-Z]+$/.test(currency)) {
    return 'Код валюти повинен містити тільки великі літери'
  }
  
  return null
}

/**
 * Валідація кольору (HEX)
 * @param {string} color - Колір у форматі HEX
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateColor = (color) => {
  if (!color || color.trim() === '') {
    return 'Виберіть колір'
  }
  
  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return 'Неправильний формат кольору (використовуйте формат #RRGGBB)'
  }
  
  return null
}

/**
 * Валідація суми (грошової)
 * @param {string|number} amount - Сума
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateAmount = (amount) => {
  const numAmount = parseFloat(amount)
  
  if (!amount || isNaN(numAmount)) {
    return 'Введіть суму'
  }
  
  if (numAmount <= 0) {
    return 'Сума повинна бути більше нуля'
  }
  
  if (numAmount > DB_LIMITS.AMOUNT_MAX) {
    return `Сума не може перевищувати ${DB_LIMITS.AMOUNT_MAX.toLocaleString('uk-UA')}`
  }
  
  // Перевірка формату (максимум 2 знаки після коми)
  const amountStr = amount.toString()
  if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
    return 'Неправильний формат суми (максимум 2 знаки після коми)'
  }
  
  return null
}

/**
 * Валідація опису
 * @param {string} description - Опис
 * @param {boolean} required - Чи є поле обов'язковим
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateDescription = (description, required = false) => {
  if (required && (!description || description.trim() === '')) {
    return 'Введіть опис'
  }
  
  if (description && description.length > DB_LIMITS.DESCRIPTION_MAX) {
    return `Опис не може перевищувати ${DB_LIMITS.DESCRIPTION_MAX} символів`
  }
  
  return null
}

/**
 * Валідація дати
 * @param {string} date - Дата у форматі YYYY-MM-DD
 * @param {boolean} allowFuture - Чи дозволяти дати в майбутньому
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateDate = (date, allowFuture = true) => {
  if (!date || date.trim() === '') {
    return 'Виберіть дату'
  }
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) {
    return 'Неправильний формат дати'
  }
  
  if (!allowFuture && dateObj > new Date()) {
    return 'Дата не може бути в майбутньому'
  }
  
  // Перевірка що дата не занадто давня (наприклад, не раніше 1900 року)
  const minDate = new Date('1900-01-01')
  if (dateObj < minDate) {
    return 'Дата занадто давня'
  }
  
  // Перевірка що дата не занадто далеко в майбутньому (наприклад, не більше 10 років)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 10)
  if (dateObj > maxDate) {
    return 'Дата не може бути більше ніж через 10 років'
  }
  
  return null
}

/**
 * Валідація діапазону дат
 * @param {string} startDate - Початкова дата
 * @param {string} endDate - Кінцева дата
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateDateRange = (startDate, endDate) => {
  const startError = validateDate(startDate)
  if (startError) {
    return startError
  }
  
  const endError = validateDate(endDate)
  if (endError) {
    return endError
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (end <= start) {
    return 'Кінцева дата повинна бути пізніше початкової'
  }
  
  return null
}

/**
 * Валідація ID (повинен бути позитивним числом)
 * @param {string|number} id - ID
 * @param {string} fieldName - Назва поля для повідомлення про помилку
 * @returns {string|null} Повідомлення про помилку або null
 */
export const validateId = (id, fieldName = 'ID') => {
  const numId = parseInt(id)
  
  if (!id || isNaN(numId)) {
    return `Виберіть ${fieldName}`
  }
  
  if (numId <= 0) {
    return `Неправильне значення ${fieldName}`
  }
  
  return null
}

/**
 * Універсальна функція для валідації форми
 * @param {object} formData - Дані форми
 * @param {object} validators - Об'єкт з валідаторами для кожного поля
 * @returns {object} Об'єкт з помилками (порожній, якщо помилок немає)
 */
export const validateForm = (formData, validators) => {
  const errors = {}
  
  Object.keys(validators).forEach(field => {
    const validator = validators[field]
    const error = validator(formData[field])
    
    if (error) {
      errors[field] = error
    }
  })
  
  return errors
}
