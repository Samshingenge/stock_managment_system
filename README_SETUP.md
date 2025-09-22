# 🚀 Stock Management System - Local Development Setup

## Complete Setup Guide for VS Code

This guide will help you run the complete stock management system locally in VS Code.

---

## 📋 Prerequisites

Before starting, make sure you have these installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download here](https://python.org/)
- **Docker Desktop** - [Download here](https://docker.com/products/docker-desktop)
- **VS Code** - [Download here](https://code.visualstudio.com/)
- **Git** - [Download here](https://git-scm.com/)

### Recommended VS Code Extensions
- Python
- Docker
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client (for API testing)
- GitLens

---

## 🏗️ Project Structure

```
stock-management-system/
├── README.md
├── README_SETUP.md
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .env
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   ├── services/
│   │   └── utils/
│   ├── alembic/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── styles/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
└── database/
    ├── init.sql
    └── sample_data.sql
```

---

## 🚀 Quick Start (Recommended)

### Option 1: Using Docker (Easiest)

1. **Clone/Download the project**
   ```bash
   # If you have git, clone it:
   git clone <repository-url>
   
   # Or download and extract the ZIP file
   ```

2. **Open in VS Code**
   ```bash
   cd stock-management-system
   code .
   ```

3. **Setup Environment**
   ```bash
   # Copy environment file
   cp .env.example .env
   ```

4. **Start with Docker**
   ```bash
   # Start all services (database, backend, frontend)
   docker-compose up --build
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **Database**: localhost:5432

### Option 2: Manual Setup (For Development)

If you prefer to run services individually:

#### 1. Database Setup
```bash
# Start only PostgreSQL
docker-compose up postgres -d

# Or install PostgreSQL locally and create database
createdb stock_management
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with backend URL

# Start development server
npm start
```

---

## 🔧 VS Code Development Setup

### 1. Open Project in VS Code
```bash
# Open the entire project
code stock-management-system/

# Or open backend and frontend in separate windows
code backend/
code frontend/
```

### 2. Configure VS Code Workspace

Create `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "./backend/.venv/bin/python",
  "python.terminal.activateEnvironment": true,
  "eslint.workingDirectories": ["frontend"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 3. Configure Launch Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/backend/.venv/bin/uvicorn",
      "args": ["app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/backend/.env"
    },
    {
      "name": "React App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ],
  "compounds": [
    {
      "name": "Launch Full Stack",
      "configurations": ["Python: FastAPI", "React App"]
    }
  ]
}
```

### 4. Tasks Configuration

Create `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "uvicorn",
      "args": ["app.main:app", "--reload"],
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      }
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm",
      "args": ["start"],
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      }
    },
    {
      "label": "Docker Up",
      "type": "shell",
      "command": "docker-compose",
      "args": ["up", "--build"],
      "group": "build"
    }
  ]
}
```

---

## 🐛 Debugging in VS Code

### Backend Debugging
1. Set breakpoints in Python files
2. Press `F5` and select "Python: FastAPI"
3. API will start in debug mode
4. Make requests to trigger breakpoints

### Frontend Debugging
1. Install "Debugger for Chrome" extension
2. Set breakpoints in TypeScript/JavaScript files
3. Start React app with `npm start`
4. Use Chrome DevTools or VS Code debugger

### Full Stack Debugging
1. Press `F5` and select "Launch Full Stack"
2. Both backend and frontend will start
3. Set breakpoints in both applications

---

## 📊 Database Management

### Using pgAdmin (Web Interface)
```bash
# Start pgAdmin with Docker
docker-compose --profile tools up pgadmin -d

# Access at: http://localhost:5050
# Email: admin@stockmanagement.com
# Password: admin123
```

### Using VS Code Extensions
1. Install "PostgreSQL" extension
2. Connect to database:
   - Host: localhost
   - Port: 5432
   - Database: stock_management
   - Username: stockuser
   - Password: stockpass123

### Command Line Access
```bash
# Connect to database
docker-compose exec postgres psql -U stockuser -d stock_management

# Or if PostgreSQL is installed locally
psql -h localhost -U stockuser -d stock_management
```

---

## 🔍 Testing & API Development

### Backend API Testing
1. **Swagger UI**: http://localhost:8000/docs
2. **ReDoc**: http://localhost:8000/redoc
3. **Thunder Client Extension**: Test APIs directly in VS Code

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### End-to-End Testing
```bash
# Install Playwright
npm install -g playwright

# Run E2E tests
playwright test
```

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Kill processes on ports
npx kill-port 3000
npx kill-port 8000
npx kill-port 5432

# Or change ports in .env files
```

#### 2. Docker Issues
```bash
# Reset Docker completely
docker-compose down -v
docker system prune -a
docker-compose up --build
```

#### 3. Python Virtual Environment Issues
```bash
cd backend
rm -rf .venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

#### 4. Node Modules Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 5. Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up postgres -d
```

---

## 📝 Development Workflow

### Daily Development Routine

1. **Start Development Environment**
   ```bash
   # Using Docker (recommended)
   docker-compose up
   
   # Or manually
   # Terminal 1: Start database
   docker-compose up postgres -d
   
   # Terminal 2: Start backend
   cd backend && uvicorn app.main:app --reload
   
   # Terminal 3: Start frontend
   cd frontend && npm start
   ```

2. **Code Changes**
   - Backend changes auto-reload with `--reload` flag
   - Frontend changes auto-reload with React dev server
   - Database schema changes require migration

3. **Database Migrations**
   ```bash
   cd backend
   
   # Create migration
   alembic revision --autogenerate -m "Description of changes"
   
   # Apply migration
   alembic upgrade head
   ```

4. **Testing**
   ```bash
   # Backend tests
   cd backend && python -m pytest
   
   # Frontend tests
   cd frontend && npm test
   ```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to repository
git push origin feature/your-feature-name
```

---

## 📚 Additional Resources

### Documentation
- **API Documentation**: http://localhost:8000/docs (when running)
- **React Documentation**: https://react.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

### VS Code Extensions (Optional but Helpful)
- **Python Docstring Generator**: Auto-generate docstrings
- **Auto Rename Tag**: Rename HTML/JSX tags automatically
- **Bracket Pair Colorizer**: Color matching brackets
- **indent-rainbow**: Visualize indentation
- **Material Icon Theme**: Better file icons

### Useful Commands
```bash
# Backend
cd backend
pip freeze > requirements.txt          # Update requirements
alembic current                        # Check migration status
python -m pytest -v                   # Run tests with verbose output

# Frontend
cd frontend
npm audit                             # Check for vulnerabilities
npm run build                         # Create production build
npm run analyze                       # Analyze bundle size

# Docker
docker-compose logs -f backend        # Follow backend logs
docker-compose exec backend bash     # Access backend container
docker-compose exec postgres psql -U stockuser -d stock_management  # Access database
```

---

## 🎯 Next Steps

1. **Start the application** using Docker or manual setup
2. **Explore the API** at http://localhost:8000/docs
3. **Use the frontend** at http://localhost:3000
4. **Check sample data** - products, suppliers, and transactions are pre-loaded
5. **Start developing** - make changes and see them live reload
6. **Run tests** to ensure everything works
7. **Deploy to production** when ready

This setup gives you a complete development environment that matches the exact design and functionality of the current system while being ready for production deployment!

## 🆘 Need Help?

If you encounter any issues:
1. Check the troubleshooting section above
2. Look at the logs: `docker-compose logs`
3. Verify all prerequisites are installed
4. Ensure ports 3000, 8000, and 5432 are available
5. Try the Docker reset commands if things get messy

Happy coding! 🚀