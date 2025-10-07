# Personal Finance Manager 💰

**Student:** Roman Flakey, PZS-1  
**Course:** Development and Use of Information Networks  
**GitHub:** https://github.com/MinTins/personal-finance-manager

---

## Project Description

Personal Finance Manager is a full-stack web application for managing personal finances with the ability to track income, expenses, create budgets, and visualize financial activity.

### Laboratory Work Progress:

✅ **Lab #1** - Backend Development (Flask, MySQL, REST API) - **COMPLETED**  
✅ **Lab #2** - Frontend Development (React, Dynamic Interface) - **COMPLETED**  
✅ **Lab #3** - Web API (REST endpoints, JWT Authentication) - **COMPLETED**  
⏳ **Lab #4** - Deployment and Performance  
⏳ **Lab #5** - Web Application Security

---

## Technology Stack

### Backend:
- **Python 3.10+** - Programming language
- **Flask 3.0** - Web framework
- **Flask-SQLAlchemy** - ORM for database interactions
- **Flask-JWT-Extended** - JWT-based authentication
- **Flask-CORS** - CORS support for cross-origin requests
- **MySQL 8.0** - Relational database
- **PyMySQL** - MySQL driver for Python
- **python-dotenv** - Environment variable management

### Frontend:
- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Chart.js** with **react-chartjs-2** - Data visualization
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

### External API:
- **ExchangeRate-API** - Real-time currency exchange rates

---

## Database Structure

The application uses a relational MySQL database with the following entities:

### Main Tables:
- **users** - User accounts with authentication data
- **accounts** - Financial accounts (wallets, bank accounts, cards)
- **categories** - Transaction categories (income/expense)
- **transactions** - Financial transactions
- **budgets** - Budget planning by categories

### Database EER Diagram:
![Database EER Diagram](https://i.ibb.co/WvNHchw5/2025-10-07-092553059.png)

---

## Project Structure

```
personal-finance-manager/
│
├── backend/                    # Backend application
│   ├── app/
│   │   ├── __init__.py        # Flask app initialization
│   │   ├── models.py          # Database models (User, Account, Transaction, etc.)
│   │   ├── config.py          # Configuration classes
│   │   └── routes/            # API route blueprints
│   │       ├── __init__.py
│   │       ├── auth.py        # Authentication endpoints
│   │       ├── accounts.py    # Account management
│   │       ├── transactions.py # Transaction CRUD
│   │       ├── categories.py  # Category management
│   │       ├── budgets.py     # Budget endpoints
│   │       └── exchange_rates.py # Currency exchange rates
│   ├── venv/                  # Virtual environment
│   ├── run.py                 # Application entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/                  # Frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Auth/          # Login, Register
│   │   │   ├── Dashboard/     # Main dashboard
│   │   │   ├── Transactions/  # Transaction management
│   │   │   ├── Categories/    # Category management
│   │   │   ├── Budgets/       # Budget management
│   │   │   ├── Accounts/      # Account management
│   │   │   └── common/        # Navbar, Sidebar, etc.
│   │   ├── services/          # API service functions
│   │   │   ├── api.js         # Axios configuration
│   │   │   ├── auth.js        # Authentication API
│   │   │   ├── transactions.js
│   │   │   ├── categories.js
│   │   │   ├── budgets.js
│   │   │   └── accounts.js
│   │   ├── App.jsx            # Main application component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles (Tailwind)
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tailwind.config.js     # Tailwind CSS configuration
│
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

---

## Core Functionality

### Authentication & Authorization:
- User registration with email and password
- JWT-based login system
- Protected API routes requiring authentication
- Token-based session management

### Transaction Management:
- Add income and expense transactions
- Transaction categorization
- Edit and delete transactions
- Filter by date, category, and account
- Transaction history with detailed views

### Account Management:
- Create multiple accounts (wallets, bank accounts, cards)
- Track balance for each account
- Multi-currency support
- Active/inactive account status

### Categories:
- Create custom income and expense categories
- Color-coded categories for better visualization
- Category-based transaction filtering

### Budgets:
- Create budgets by category
- Track spending against budget limits
- Periodic budgets (weekly, monthly, yearly)
- Budget progress visualization

### Data Visualization:
- Income vs. expense charts
- Category distribution pie charts
- Period-based statistics
- Financial trends over time

### External API Integration:
- Real-time currency exchange rates
- Multi-currency conversion
- Automatic rate updates

---

## Quick Start

### Prerequisites:
- Python 3.10+
- Node.js 18+
- MySQL 8.0
- Git

### 1. Clone Repository
```bash
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager
```

### 2. Backend Setup

#### Create and activate virtual environment:
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

#### Install dependencies:
```bash
pip install -r requirements.txt
```

#### Configure environment variables:
Create `.env` file in the `backend` directory:
```env
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ACCESS_TOKEN_EXPIRES=3600

DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=personal_finance_manager

EXCHANGE_RATE_API_KEY=your_api_key
```

#### Create MySQL database:
```sql
CREATE DATABASE personal_finance_manager;
```

#### Run backend server:
```bash
python run.py
```
Backend will be available at: `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to frontend directory:
```bash
cd ../frontend
```

#### Install dependencies:
```bash
npm install
```

#### Configure API proxy:
Edit `vite.config.js` if needed (default proxies to `http://localhost:5000`)

#### Run development server:
```bash
npm run dev
```
Frontend will be available at: `http://localhost:5173`

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/:id` - Get specific account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction statistics

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get specific category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget
- `GET /api/budgets/:id` - Get specific budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Exchange Rates
- `GET /api/exchange-rates/:currency` - Get exchange rates for currency

---

## Key Features Implemented

### Lab #1 - Backend (✅ Completed):
- Flask application structure with blueprints
- MySQL database with proper schema design
- SQLAlchemy ORM models for all entities
- RESTful API endpoints for CRUD operations
- JWT-based authentication system
- Database relationships and cascade deletes
- Input validation and error handling

### Lab #2 - Frontend (✅ Completed):
- React application with modern component architecture
- React Router for navigation
- Responsive design with Tailwind CSS
- Dynamic forms for data entry
- Data visualization with Chart.js
- User-friendly interface with icons
- State management for authentication
- Protected routes for authenticated users

### Lab #3 - Web API (✅ Completed):
- Complete REST API implementation
- JWT token-based authentication
- Protected endpoints with `@jwt_required` decorator
- Request/response handling with JSON
- External API integration (ExchangeRate-API)
- CORS configuration for cross-origin requests
- Axios interceptors for automatic token handling
- Error handling and user feedback

---

## Future Development (Labs #4-5)

### Lab #4 - Deployment & Performance:
- Deploy application to production server
- Set up localhost deployment
- Performance testing and optimization
- Load testing with multiple users
- Database query optimization
- Caching strategies
- Production configuration

### Lab #5 - Security:
- Security vulnerability assessment
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CSRF token implementation
- Rate limiting
- Security headers
- Password strength requirements
- Account lockout mechanisms
- Security audit report

---

## Development Commands

### Backend:
```bash
# Activate virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Run development server
python run.py

# Install new package
pip install package_name
pip freeze > requirements.txt
```

### Frontend:
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package_name
```

---

## Contributing

This is an academic project for learning purposes. The implementation follows best practices for:
- RESTful API design
- React component architecture
- Database normalization
- Authentication and authorization
- Security considerations

---

## License

This project is created for educational purposes as part of the "Development and Use of Information Networks" course.