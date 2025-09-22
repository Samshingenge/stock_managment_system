# 🗄️ Stock Management System

A comprehensive, production-ready stock management solution with modern web technologies. Built with **FastAPI**, **React.js**, **PostgreSQL**, and **Docker**.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18.2+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 🌟 Features Implemented

### ✅ **Backend (FastAPI)**
- **Complete RESTful API** with authentication (JWT)
- **Database Models**: Products, Suppliers, Stock Transactions
- **Advanced Filtering & Pagination** on all endpoints
- **Database Migrations** with Alembic
- **Comprehensive Validation** with Pydantic
- **Error Handling & Logging**
- **API Documentation** (Swagger/OpenAPI)

### ✅ **Frontend (React.js + TypeScript)**
- **Modern React 18** with TypeScript
- **Authentication System** with context and protected routes  
- **Responsive Design** with Tailwind CSS
- **Complete Routing** with React Router v6
- **API Integration** with React Query
- **Form Handling** with React Hook Form
- **Toast Notifications** and loading states

### ✅ **Database & Infrastructure**
- **PostgreSQL** with proper schema design
- **Docker Compose** for full-stack development
- **Database Migrations** and sample data
- **Performance Indexes** and constraints
- **VS Code Workspace** configuration

## 🚀 Quick Start Guide

### Option 1: Docker Development (Recommended)

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd stock-management-system
   ```

2. **Start Everything with Docker**
   ```bash
   docker-compose up -d
   ```

3. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

4. **Login with Demo Credentials**
   - **Email**: admin@stockmanager.com
   - **Password**: admin123

### Option 2: Manual Setup (For Development)

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Run database migrations
alembic upgrade head

# Load sample data (optional)
psql -h localhost -U stockman -d stock_management -f ../database/sample_data.sql

# Start backend server
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### Database Setup (PostgreSQL)
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE stock_management;
CREATE USER stockman WITH PASSWORD 'stockpass123';
GRANT ALL PRIVILEGES ON DATABASE stock_management TO stockman;
\q

# Initialize schema
psql -h localhost -U stockman -d stock_management -f database/init.sql
```

## 🏗️ Project Structure

```
stock-management-system/
├── 🐍 backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/               # API Routes
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── products.py    # Products CRUD
│   │   │   ├── suppliers.py   # Suppliers CRUD
│   │   │   ├── transactions.py # Transactions CRUD
│   │   │   └── dashboard.py   # Dashboard Analytics
│   │   ├── models/            # SQLAlchemy Models
│   │   ├── database.py        # Database Connection
│   │   ├── config.py          # Configuration
│   │   └── main.py           # FastAPI App
│   ├── alembic/              # Database Migrations
│   ├── requirements.txt       # Python Dependencies
│   └── Dockerfile            # Backend Container
├── ⚛️ frontend/               # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   ├── pages/            # Page Components
│   │   ├── services/         # API Services
│   │   ├── contexts/         # React Contexts
│   │   ├── types/           # TypeScript Types
│   │   └── App.tsx          # Main App Component
│   ├── package.json         # Node Dependencies
│   └── Dockerfile           # Frontend Container
├── 🐘 database/              # Database Files
│   ├── init.sql             # Schema Definition
│   └── sample_data.sql      # Sample Data
├── 🐳 docker-compose.yml    # Full Stack Orchestration
└── 📋 README_SETUP.md       # Detailed Setup Guide
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - List products (with filtering)
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/{id}` - Get transaction details
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics
- `GET /api/dashboard/stats/inventory-value` - Inventory breakdown
- `GET /api/dashboard/stats/transaction-trends` - Transaction trends

## 🛠️ VS Code Setup

1. **Open the workspace file:**
   ```bash
   code stock-management-system.code-workspace
   ```

2. **Install recommended extensions** when prompted

3. **Use built-in tasks:**
   - `Ctrl/Cmd + Shift + P` → "Tasks: Run Task"
   - Select from available tasks:
     - 🚀 Start Development Environment
     - 🛑 Stop Development Environment  
     - 🐍 Start Backend (Local)
     - ⚛️ Start Frontend (Local)

## 🧪 Testing & Quality

### Backend Testing
```bash
cd backend
pytest                          # Run all tests
pytest --cov=app               # Run with coverage
pytest -v tests/test_products.py # Run specific tests
```

### Frontend Testing
```bash
cd frontend
npm test                       # Run React tests
npm run lint                   # ESLint check
npm run type-check            # TypeScript check
npm run format                # Prettier format
```

### Code Quality
```bash
# Backend
black app/                     # Format Python code
flake8 app/                   # Lint Python code
mypy app/                     # Type checking

# Frontend  
npm run lint:fix              # Fix ESLint issues
npm run format               # Format with Prettier
```

## 📊 Database Schema

### Core Tables
- **suppliers** - Supplier information and contacts
- **products** - Product catalog with pricing and stock levels  
- **stock_transactions** - All stock movements (in/out/adjustments)

### Key Features
- **UUID Primary Keys** for better scalability
- **Proper Foreign Key Relationships**
- **Automatic Timestamps** with triggers
- **Performance Indexes** on frequently queried fields
- **Data Validation** with constraints

## 🔧 Environment Configuration

### Backend Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://stockman:stockpass123@localhost:5432/stock_management

# Security
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### Frontend Environment Variables (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_APP_NAME=Stock Management System
```

## 🚢 Deployment Options

### Production Docker Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Production Setup
1. **Setup PostgreSQL** with production credentials
2. **Build React app** with `npm run build`
3. **Configure reverse proxy** (Nginx/Apache)  
4. **Run FastAPI** with Gunicorn
5. **Setup SSL certificates**

## 📈 Performance Features

- **Database Connection Pooling**
- **API Response Caching** with appropriate headers
- **Optimized Database Queries** with indexes
- **Lazy Loading** and pagination
- **Image Optimization** and CDN-ready
- **Gzip Compression** enabled

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** with bcrypt
- **Input Validation** and sanitization  
- **SQL Injection Protection** with SQLAlchemy ORM
- **CORS Configuration** for cross-origin requests
- **Security Headers** in responses

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Future Enhancements

### Planned Features
- [ ] **Advanced Analytics** with Chart.js integration
- [ ] **Excel Import/Export** functionality  
- [ ] **Real-time Notifications** with WebSocket
- [ ] **Barcode Generation** and scanning
- [ ] **Multi-location Inventory** management
- [ ] **Advanced Reporting** with PDF generation
- [ ] **Mobile App** with React Native

### Technical Improvements
- [ ] **Redis Caching** for better performance
- [ ] **Background Tasks** with Celery
- [ ] **API Rate Limiting** and throttling
- [ ] **Automated Testing** CI/CD pipeline
- [ ] **Monitoring & Logging** with ELK stack
- [ ] **Multi-tenant Architecture**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web development best practices
- Follows REST API design principles
- Implements clean architecture patterns
- Uses industry-standard security practices

---

**Ready to run in VS Code locally!** 🎉

Open the workspace file and start coding immediately with full IntelliSense, debugging, and integrated terminals.