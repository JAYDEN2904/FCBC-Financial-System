# FCBC Financial System

A comprehensive church management system built with React, TypeScript, Node.js, and Supabase.

## 🏗️ Project Structure

This repository contains both frontend and backend components:

- **`frontend/`** - React + TypeScript frontend application
- **`backend/`** - Node.js + TypeScript backend API

## 🌟 Features

### Frontend
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Authentication**: Secure login/logout with JWT tokens
- **Dashboard**: Real-time statistics and analytics
- **Member Management**: Complete CRUD operations for church members
- **Payment Tracking**: Record and manage member payments
- **Financial Management**: Budget tracking, expenses, and financial goals
- **SMS Reminders**: Payment reminder system for Ghana members
- **Reports & Analytics**: Comprehensive financial reports

### Backend
- **RESTful API**: Express.js with TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT-based authentication
- **Real-time Features**: WebSocket support with Socket.IO
- **File Storage**: Supabase Storage for document management
- **Security**: CORS, Helmet, Rate limiting, Input validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JAYDEN2904/FCBC-Financial-System.git
   cd FCBC-Financial-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your Supabase credentials in .env
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure API URL in .env
   npm run dev
   ```

### Environment Variables

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3001/api
```

## 📱 Default Login

- **Email**: `admin@youthministry.org`
- **Password**: `admin123`

## 🏗️ Branch Structure

- **`main`** - Complete monorepo with both frontend and backend (development)
- **`frontend-setup`** - Frontend-only branch for Vercel deployment
- **`backend-setup`** - Backend-only branch for Render deployment

## 🛠️ Development

### Monorepo Commands (Root Level)
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run install:all  # Install dependencies for all packages
npm run clean        # Clean all node_modules
npm run lint         # Lint both applications
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - System users and authentication
- `members` - Church members
- `payments` - Member payment records
- `donations` - Donation tracking
- `expenses` - Expense management
- `budget_categories` - Budget categorization
- `financial_goals` - Financial goal tracking
- `reminders` - SMS reminder system

## 🔧 Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- Supabase (PostgreSQL)
- Socket.IO
- JWT Authentication
- Multer (File uploads)
- Express Validator

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

**Built with ❤️ for FCBC Youth Ministry**
