import { useState, useEffect } from 'react'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../../services/transactions'
import { getCategories } from '../../services/categories'
import { formatDate, formatCurrency } from '../../utils/helpers'
import TransactionForm from './TransactionForm'

const TransactionList = () => {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    start_date: '',
    end_date: ''
  })

  // Завантаження транзакцій та категорій
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Завантаження транзакцій з фільтрами
        const transactionsData = await getTransactions(filters)
        setTransactions(transactionsData)
        
        // Завантаження всіх категорій
        const allCategories = await getCategories()
        setCategories(allCategories)
      } catch (err) {
        setError(err.toString())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  // Обробка зміни фільтрів
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({ ...filters, [name]: value })
  }

  // Скидання фільтрів
  const resetFilters = () => {
    setFilters({
      type: '',
      category_id: '',
      start_date: '',
      end_date: ''
    })
  }

  // Додавання нової транзакції
  const handleAddTransaction = async (formData) => {
    try {
      const newTransaction = await createTransaction(formData)
      setTransactions([newTransaction, ...transactions])
      setShowForm(false)
    } catch (err) {
      throw err
    }
  }

  // Оновлення існуючої транзакції
  const handleUpdateTransaction = async (formData) => {
    try {
      const updatedTransaction = await updateTransaction(editingTransaction.id, formData)
      
      setTransactions(
        transactions.map(transaction => 
          transaction.id === editingTransaction.id ? updatedTransaction : transaction
        )
      )
      
      setEditingTransaction(null)
      setShowForm(false)
    } catch (err) {
      throw err
    }
  }

  // Видалення транзакції
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю транзакцію?')) {
      return
    }

    try {
      await deleteTransaction(id)
      setTransactions(transactions.filter(transaction => transaction.id !== id))
    } catch (err) {
      setError(err.toString())
    }
  }

  // Відкриття форми для редагування
  const openEditForm = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  // Закриття форми
  const closeForm = () => {
    setShowForm(false)
    setEditingTransaction(null)
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Транзакції</h1>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          Додати транзакцію
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Форма для створення/редагування транзакції */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingTransaction ? 'Редагувати транзакцію' : 'Нова транзакція'}
          </h2>
          <TransactionForm 
            transaction={editingTransaction}
            onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
            onCancel={closeForm}
          />
        </div>
      )}
      
      {/* Фільтри */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Тип
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">Всі типи</option>
              <option value="income">Доходи</option>
              <option value="expense">Витрати</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Категорія
            </label>
            <select
              id="category_id"
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">Всі категорії</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              Початкова дата
            </label>
            <input
              id="start_date"
              name="start_date"
              type="date"
              value={filters.start_date}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
              Кінцева дата
            </label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              value={filters.end_date}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="btn btn-secondary"
          >
            Скинути фільтри
          </button>
        </div>
      </div>

      {/* Список транзакцій */}
      {transactions.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-gray-500">Транзакції не знайдено. Спробуйте змінити фільтри або додайте нову транзакцію.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Опис</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сума</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'income' ? 'Дохід' : 'Витрата'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="h-4 w-4 rounded-full mr-2" 
                        style={{ backgroundColor: transaction.category_color || '#808080' }}
                      ></div>
                      <span className="text-sm text-gray-700">{transaction.category_name || 'Без категорії'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.description || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openEditForm(transaction)}
                      className="text-primary-600 hover:text-primary-800 mr-3"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default TransactionList