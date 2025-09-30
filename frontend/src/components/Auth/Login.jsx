import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../services/auth'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(formData)
      onLogin(user)
      navigate('/')
    } catch (error) {
      setError(error.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Фінансовий Трекер
          </h1>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Увійдіть в обліковий запис
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Електронна пошта
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="form-input mt-1"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input mt-1"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex justify-center"
            >
              {loading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Увійти'
              )}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Не маєте облікового запису?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login