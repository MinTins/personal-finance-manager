import { useState, useEffect } from 'react'
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../services/budgets'
import { formatDate, formatCurrency, calculateBudgetProgress, getBudgetProgressColor } from '../../utils/helpers'
import BudgetForm from './BudgetForm'
import { FiAlertCircle, FiCheckCircle, FiFilter, FiPlus } from 'react-icons/fi'

const BudgetList = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [period, setPeriod] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Завантаження бюджетів
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        setError('')
        const budgetsData = await getBudgets(period)
        setBudgets(budgetsData)
      } catch (err) {
        setError(err.toString())
      } finally {
        setLoading(false)
      }
    }

    fetchBudgets()
  }, [period])

  // Показати повідомлення про успіх
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  // Додавання нового бюджету
  const handleAddBudget = async (formData) => {
    try {
      const newBudget = await createBudget(formData)
      setBudgets([newBudget, ...budgets])
      setShowForm(false)
      showSuccess('Бюджет успішно створено!')
    } catch (err) {
      throw err
    }
  }

  // Оновлення існуючого бюджету
  const handleUpdateBudget = async (formData) => {
    try {
      const updatedBudget = await updateBudget(editingBudget.id, formData)
      
      setBudgets(
        budgets.map(budget => 
          budget.id === editingBudget.id ? updatedBudget : budget
        )
      )
      
      setEditingBudget(null)
      setShowForm(false)
      showSuccess('Бюджет успішно оновлено!')
    } catch (err) {
      throw err
    }
  }

  // Видалення бюджету
  const handleDeleteBudget = async (id, categoryName) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити бюджет для категорії "${categoryName}"?`)) {
      return
    }

    try {
      await deleteBudget(id)
      setBudgets(budgets.filter(budget => budget.id !== id))
      showSuccess('Бюджет успішно видалено!')
    } catch (err) {
      setError(err.toString())
    }
  }

  // Відкриття форми для редагування
  const openEditForm = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  // Закриття форми
  const closeForm = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  // Функція для зміни фільтра періоду
  const handlePeriodChange = (newPeriod) => {
    // Якщо клікнули на той самий період, скидаємо фільтр
    setPeriod(period === newPeriod ? '' : newPeriod)
  }

  // Компонент для відображення статусу бюджету
  const BudgetStatus = ({ percent, remaining }) => {
    if (percent >= 100) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <FiAlertCircle />
          <span className="text-sm font-medium">Перевищено</span>
        </div>
      )
    } else if (percent >= 80) {
      return (
        <div className="flex items-center gap-2 text-yellow-600">
          <FiAlertCircle />
          <span className="text-sm font-medium">Майже вичерпано</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <FiCheckCircle />
          <span className="text-sm font-medium">У межах норми</span>
        </div>
      )
    }
  }

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бюджети</h1>
          <p className="text-sm text-gray-500 mt-1">
            Керуйте своїми фінансовими лімітами та відстежуйте витрати
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <FiPlus />
          Створити бюджет
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in">
          <FiCheckCircle className="text-green-600" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <FiAlertCircle className="text-red-600" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Форма для створення/редагування бюджету */}
      {showForm && (
        <div className="card animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingBudget ? 'Редагувати бюджет' : 'Новий бюджет'}
            </h2>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <BudgetForm 
            budget={editingBudget}
            onSubmit={editingBudget ? handleUpdateBudget : handleAddBudget}
            onCancel={closeForm}
          />
        </div>
      )}
      
      {/* Фільтр за періодом */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Фільтр за періодом</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'week' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Тиждень
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'month' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Місяць
          </button>
          <button
            onClick={() => handlePeriodChange('year')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              period === 'year' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Рік
          </button>
          {period && (
            <button
              onClick={() => setPeriod('')}
              className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Скинути фільтр
            </button>
          )}
        </div>
      </div>

      {/* Індикатор завантаження при фільтрації */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {period ? 'Немає бюджетів для обраного періоду' : 'Бюджети не знайдено'}
          </h3>
          <p className="text-gray-500 mb-4">
            {period 
              ? 'Спробуйте інший період або створіть новий бюджет' 
              : 'Створіть свій перший бюджет, щоб почати контролювати витрати'
            }
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <FiPlus />
            Створити бюджет
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = calculateBudgetProgress(budget.spent, budget.amount)
            const progressColor = getBudgetProgressColor(progress)
            const progressColorClass = {
              'green': 'bg-green-500',
              'yellow': 'bg-yellow-500',
              'red': 'bg-red-500'
            }[progressColor] || 'bg-gray-500'
            
            return (
              <div 
                key={budget.id} 
                className="card hover:shadow-xl transition-all duration-300 border-l-4"
                style={{ borderLeftColor: budget.category_color || '#808080' }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: budget.category_color || '#808080' }}
                    >
                      {budget.category_name ? budget.category_name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category_name || 'Без категорії'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                      </p>
                    </div>
                  </div>
                  <BudgetStatus percent={progress} remaining={budget.remaining} />
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Витрачено
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${progressColorClass} h-3 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-sm font-medium ${
                      budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {budget.remaining >= 0 ? 'Залишилося' : 'Перевитрата'}: {formatCurrency(Math.abs(budget.remaining))}
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditForm(budget)}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id, budget.category_name)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default BudgetList
