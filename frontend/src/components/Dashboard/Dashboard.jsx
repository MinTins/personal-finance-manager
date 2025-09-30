import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTransactionsSummary } from '../../services/transactions'
import { getExchangeRates } from '../../services/exchangeRates'
import { formatCurrency, generateChartColors } from '../../utils/helpers'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

// Реєструємо необхідні компоненти Chart.js
Chart.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exchangeRates, setExchangeRates] = useState(null)
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Початок поточного місяця
    end_date: new Date().toISOString().split('T')[0] // Поточна дата
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Отримуємо статистику по транзакціях
        const summaryData = await getTransactionsSummary(dateRange)
        setSummary(summaryData)
        
        // Отримуємо курси валют
        const rates = await getExchangeRates('UAH', 'USD,EUR,GBP')
        setExchangeRates(rates)
      } catch (err) {
        setError(err.toString())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Підготовка даних для графіку категорій витрат
  const prepareExpenseCategoriesChart = () => {
    if (!summary || !summary.expense_categories || summary.expense_categories.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: []
        }]
      }
    }

    const labels = summary.expense_categories.map(cat => cat.name)
    const data = summary.expense_categories.map(cat => cat.amount)
    const backgroundColor = summary.expense_categories.map(cat => cat.color || generateChartColors(1)[0])

    return {
      labels,
      datasets: [{
        data,
        backgroundColor,
        borderWidth: 1
      }]
    }
  }

  // Підготовка даних для графіку порівняння доходів і витрат
  const prepareIncomeExpenseChart = () => {
    if (!summary) {
      return {
        labels: ['Доходи', 'Витрати'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#10B981', '#EF4444']
        }]
      }
    }

    return {
      labels: ['Доходи', 'Витрати'],
      datasets: [{
        data: [summary.total_income, summary.total_expense],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 1
      }]
    }
  }

  // Опції для графіків
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.raw || 0
            return `${label}: ${formatCurrency(value)}`
          }
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Помилка:</p>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Фінансовий огляд</h1>
        
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            className="form-input"
          />
          <span className="self-center">-</span>
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            className="form-input"
          />
        </div>
      </div>
      
      {/* Загальна статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-green-50 border border-green-200">
          <h2 className="text-lg font-semibold text-green-800">Загальний дохід</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(summary?.total_income || 0)}
          </p>
        </div>
        
        <div className="card bg-red-50 border border-red-200">
          <h2 className="text-lg font-semibold text-red-800">Загальні витрати</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(summary?.total_expense || 0)}
          </p>
        </div>
        
        <div className="card bg-blue-50 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800">Баланс</h2>
          <p className={`text-3xl font-bold mt-2 ${summary?.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.balance || 0)}
          </p>
        </div>
      </div>

      {/* Графіки */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Витрати за категоріями</h2>
          <div className="h-64">
            <Pie data={prepareExpenseCategoriesChart()} options={chartOptions} />
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Доходи vs Витрати</h2>
          <div className="h-64">
            <Bar data={prepareIncomeExpenseChart()} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Курси валют */}
      {exchangeRates && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Курси валют</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(exchangeRates.rates).map(([currency, rate]) => (
              <div key={currency} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-xl font-bold">{currency}</p>
                <p className="text-gray-600">1 {exchangeRates.base_currency} = {rate.toFixed(2)} {currency}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Швидкі посилання */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/transactions" className="card bg-primary-50 hover:bg-primary-100 transition-colors flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-primary-800">Управління транзакціями</h2>
            <p className="text-primary-600">Переглядайте та редагуйте ваші доходи й витрати</p>
          </div>
          <span className="text-primary-500">→</span>
        </Link>
        
        <Link to="/budgets" className="card bg-primary-50 hover:bg-primary-100 transition-colors flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-primary-800">Бюджети</h2>
            <p className="text-primary-600">Встановлюйте ліміти витрат та відстежуйте їх виконання</p>
          </div>
          <span className="text-primary-500">→</span>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard