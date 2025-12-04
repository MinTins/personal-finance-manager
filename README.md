# Personal Finance Manager 💰

**Student:** Roman Flakey, PZS-1  
**Course:** Development and Use of Information Networks  
**GitHub:** https://github.com/MinTins/personal-finance-manager

---

## Application Screenshots

### Dashboard
![Dashboard Screenshot](https://i.ibb.co/b5t9yh7N/2025-10-07-095200762.png)
*Main dashboard with financial overview, charts, and exchange rates*

### Transactions Management
![Transactions Screenshot](https://i.ibb.co/qLMWzR18/2025-10-07-093924429.png)
*Transaction list with filtering and CRUD operations*

### Budget Tracking
![Budget Screenshot](https://i.ibb.co/Gvc09Vnp/2025-10-07-094017018.png)
*Budget management and spending tracking*

---

## Project Description

Personal Finance Manager is a comprehensive full-stack web application for managing personal finances with the ability to track income, expenses, create budgets, visualize financial activity, and includes a complete admin panel for system management.

### Laboratory Work Progress:

✅ **Lab #1** - Backend Development (Flask, MySQL, REST API, Admin Panel) - **COMPLETED**  
✅ **Lab #2** - Frontend Development (React, Dynamic Interface) - **COMPLETED**  
✅ **Lab #3** - Web API (REST endpoints, JWT Authentication) - **COMPLETED**  
✅ **Lab #4** - Deployment and Performance Testing - **COMPLETED**  
✅ **Lab #5** - Web Application Security Testing - **COMPLETED**

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
- **bcrypt** - Password hashing

### Frontend:
- **React 18** - UI library
- **Vite 5** - Build tool and development server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Chart.js** with **react-chartjs-2** - Data visualization
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library

### DevOps & Deployment:
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server for production

### External APIs:
- **ExchangeRate-API** - Real-time currency exchange rates

---

## Quick Start Options

### Option 1: Windows Batch Scripts (Recommended)

1. **Clone the repository:**
```bash
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager
```

2. **Start servers:**
```bash
start.bat
```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

4. **Stop servers:**
```bash
stop.bat
```

### Option 2: Docker (Production)

1. **Clone the repository:**
```bash
git clone https://github.com/MinTins/personal-finance-manager.git
cd personal-finance-manager
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env file with your settings
```

3. **Start with Docker Compose:**
```bash
docker-compose up -d --build
```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - Database: localhost:3306

### Option 3: Manual Setup

**Prerequisites:**
- Python 3.10+
- Node.js 18+
- MySQL 8.0

**Backend Setup:**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env file
python run.py
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

---

## Database Structure

The application uses a comprehensive MySQL database schema with the following entities:

### Core Tables:
- **users** - User accounts with role-based access (user/admin)
- **accounts** - Financial accounts with multi-currency support
- **categories** - Transaction categories with color coding
- **transactions** - Financial transactions with categorization
- **budgets** - Budget planning by categories and time periods
- **admin_logs** - Admin activity logging for audit trails

### Advanced Features:
- **Stored Procedures** - `get_system_statistics()` for admin dashboard
- **Views** - `user_statistics` for comprehensive user analytics
- **Triggers** - Automatic logging of user deletions
- **Foreign Key Constraints** - Data integrity and cascade operations
- **Indexes** - Optimized queries for better performance

---

## Core Functionality

### User Features:
- **Authentication & Authorization** - JWT-based secure login system
- **Account Management** - Multiple accounts with different currencies
- **Transaction Management** - Complete CRUD with advanced filtering
- **Category System** - Custom categories with visual color coding
- **Budget Planning** - Create and track budgets with progress visualization
- **Financial Dashboard** - Real-time charts and statistics
- **Currency Exchange** - Live exchange rates integration

### Admin Features:
- **User Management** - View, edit, and delete users
- **System Dashboard** - Comprehensive system statistics
- **Activity Logging** - Track all admin actions
- **Database Analytics** - User statistics and system health
- **Bulk Operations** - Manage multiple users efficiently

### Data Visualization:
- **Interactive Charts** - Income vs. expense analysis
- **Category Breakdown** - Pie charts for spending distribution
- **Budget Progress** - Visual budget tracking with color-coded alerts
- **Financial Trends** - Time-based financial analysis

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### User Operations
- `GET /api/accounts` - Get all user accounts
- `POST /api/accounts` - Create new account
- `GET/PUT/DELETE /api/accounts/:id` - Account CRUD operations
- `GET /api/transactions` - Get transactions with filtering
- `POST /api/transactions` - Create new transaction
- `GET/PUT/DELETE /api/transactions/:id` - Transaction CRUD operations
- `GET /api/transactions/summary` - Financial statistics
- `GET/POST/PUT/DELETE /api/categories` - Category management
- `GET/POST/PUT/DELETE /api/budgets` - Budget management
- `GET /api/exchange-rates` - Currency exchange rates

### Admin Operations
- `GET /api/admin/dashboard` - System statistics
- `GET /api/admin/users` - User management with pagination
- `GET/PUT/DELETE /api/admin/users/:id` - User operations
- `GET /api/admin/logs` - Admin activity logs
- `GET /api/admin/system-info` - System information

---

## Security Features

### Implemented Security Measures:
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - ORM-based queries
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Proper cross-origin resource sharing
- **Role-Based Access Control** - Admin and user roles
- **Rate Limiting Ready** - Infrastructure for API rate limiting

### Security Testing:
The application includes a comprehensive security testing suite (`security-test/security_test.py`) that checks for:
- SQL Injection vulnerabilities
- Cross-Site Scripting (XSS)
- Broken Authentication
- Insecure Direct Object References (IDOR)
- Weak Password Policies
- Brute Force Protection
- Security Headers
- Sensitive Data Exposure

---

## Performance Testing

The application includes automated performance testing (`deploy-performance/performance_test.py`):

### Test Coverage:
- **Load Testing** - Multiple concurrent users
- **Response Time Analysis** - API endpoint performance
- **Stress Testing** - System behavior under load
- **Database Performance** - Query optimization testing
- **Memory Usage** - Resource consumption analysis

### Performance Metrics:
- Response times for all API endpoints
- Database query execution times
- Memory and CPU usage under load
- Concurrent user handling capacity
- Error rates under stress conditions

---

## Development Scripts

### Windows Batch Scripts:
- `start.bat` - Start both frontend and backend servers
- `stop.bat` - Stop all running servers
- `restart.bat` - Restart servers
- `run-tests.bat` - Execute performance tests

### Key Features:
- Automatic dependency installation
- Environment setup
- Process management
- Colored console output
- Error handling

---

## Project Structure

```
personal-finance-manager/
│
├── 📁 backend/                 # Flask Backend
│   ├── 📁 app/
│   │   ├── __init__.py        # Flask app factory
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── config.py          # Configuration classes
│   │   └── 📁 routes/         # API blueprints
│   │       ├── auth.py        # Authentication
│   │       ├── transactions.py # Transactions
│   │       ├── categories.py  # Categories
│   │       ├── budgets.py     # Budgets
│   │       ├── accounts.py    # Accounts
│   │       ├── admin.py       # Admin panel
│   │       └── exchange_rates.py # Currency API
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Application entry point
│
├── 📁 frontend/                # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/     # React components
│   │   │   ├── Auth/          # Authentication forms
│   │   │   ├── Dashboard/     # Main dashboard
│   │   │   ├── Transactions/  # Transaction management
│   │   │   ├── Categories/    # Category management
│   │   │   ├── Budgets/       # Budget management
│   │   │   ├── Accounts/      # Account management
│   │   │   ├── Admin/         # Admin panel components
│   │   │   └── common/        # Shared components
│   │   ├── 📁 services/       # API services
│   │   ├── 📁 utils/          # Utility functions
│   │   └── App.jsx            # Main app component
│   ├── package.json           # Node dependencies
│   └── tailwind.config.js     # Styling configuration
│
├── 📁 deploy-performance/      # Performance Testing
│   ├── performance_test.py    # Automated performance tests
│   └── requirements.txt       # Testing dependencies
│
├── 📁 security-test/          # Security Testing
│   ├── security_test.py       # Security vulnerability tests
│   └── requirements.txt       # Security testing dependencies
│
├── 📄 database.sql            # Complete database schema
├── 📄 docker-compose.yml      # Docker orchestration
├── 📄 Dockerfile.backend      # Backend container
├── 📄 Dockerfile.frontend     # Frontend container
├── 📄 start.bat              # Windows start script
├── 📄 stop.bat               # Windows stop script
├── 📄 restart.bat            # Windows restart script
├── 📄 run-tests.bat          # Windows testing script
└── 📄 README.md              # Project documentation
```

---

## Laboratory Work Achievements

### Lab #1 - Backend Development ✅
- Complete Flask application with modular blueprint structure
- MySQL database with normalized schema design
- RESTful API with CRUD operations
- JWT-based authentication system
- Admin panel with user management capabilities
- Database relationships and constraints
- Input validation and error handling
- Comprehensive API documentation

### Lab #2 - Frontend Development ✅
- Modern React 18 application with hooks
- Responsive design using Tailwind CSS
- Dynamic component architecture
- Real-time data visualization with Chart.js
- User-friendly forms with validation
- Protected route system
- State management for authentication
- Admin interface for system management

### Lab #3 - Web API Integration ✅
- Complete REST API implementation
- JWT token management with refresh capability
- External API integration (ExchangeRate-API)
- CORS configuration for cross-origin requests
- Axios interceptors for request/response handling
- Comprehensive error handling
- API documentation and testing
- JSON request/response handling

### Lab #4 - Deployment & Performance ✅
- Docker containerization with multi-stage builds
- Docker Compose for orchestration
- Automated deployment scripts for Windows
- Comprehensive performance testing suite
- Load testing with multiple concurrent users
- Response time analysis and optimization
- Database query performance monitoring
- Memory and resource usage analysis

### Lab #5 - Security Testing ✅
- Automated security vulnerability scanning
- SQL injection testing and prevention
- XSS vulnerability assessment
- Authentication and authorization testing
- IDOR (Insecure Direct Object Reference) testing
- Password policy evaluation
- Security header analysis
- Comprehensive security reporting

---

## Test Accounts

**Regular User:**
- Email: `test@example.com`
- Password: `password123`

**Administrator:**
- Email: `admin@example.com`
- Password: `admin123`

---

## Deployment Options

### Development (Local):
```bash
# Using Windows scripts (recommended)
start.bat

# Manual setup
# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

### Production (Docker):
```bash
# Copy environment template
cp .env.example .env

# Start production environment
docker-compose up -d --build

# Access:
# Frontend: http://localhost
# Backend: http://localhost:5000
```

---

## Testing

### Security Testing:
```bash
# Run security tests
cd security-test
python security_test.py
```

---

## Contributing

This is an academic project demonstrating modern web development practices:
- **Clean Architecture** - Separation of concerns
- **RESTful Design** - Standard API conventions
- **Security Best Practices** - Comprehensive security measures
- **Performance Optimization** - Efficient database queries and caching
- **Testing Strategy** - Automated testing for security and performance
- **Documentation** - Comprehensive project documentation

---

## License

This project is created for educational purposes as part of the "Development and Use of Information Networks" course at the university. All code is available for learning and educational use.