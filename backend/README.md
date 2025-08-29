# Church Management System - Backend

A comprehensive Node.js backend API for managing church members, finances, payments, and SMS reminders, built with Supabase integration and real-time features.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Members Management** - CRUD operations for church members
- **Financial Management** - Payments, donations, expenses, budgets, and goals
- **SMS Reminders** - Automated and manual reminder system for Ghana
- **Real-time Updates** - WebSocket integration for live data updates
- **Dashboard Analytics** - Comprehensive statistics and reporting
- **Database Integration** - PostgreSQL with Supabase
- **Security** - Rate limiting, CORS, helmet, input validation

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **Real-time**: Socket.IO
- **Validation**: Joi + Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Supabase account and project
- SMS provider account (Hubtel, Arkesel, or Nalo for Ghana)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# SMS Provider Configuration (Ghana)
SMS_PROVIDER=hubtel
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret
HUBTEL_SENDER_ID=your_hubtel_sender_id

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database-schema.sql` in your Supabase SQL editor
3. Enable Row Level Security (RLS) policies are included in the schema

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── notFound.js          # 404 handler
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── members.js           # Members management
│   │   ├── payments.js          # Payment processing
│   │   ├── donations.js         # Donation management
│   │   ├── expenses.js          # Expense tracking
│   │   ├── reminders.js         # SMS reminders
│   │   ├── dashboard.js         # Dashboard analytics
│   │   └── reports.js           # Report generation
│   ├── realtime/
│   │   └── handlers.js          # WebSocket event handlers
│   └── server.js                # Main server file
├── database-schema.sql          # PostgreSQL schema
├── package.json
└── README.md
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **admin**: Full access to all features
- **treasurer**: Access to financial features and member management
- **member**: Limited access (future feature)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh token

### Members
- `GET /api/members` - Get all members (with filtering)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member
- `GET /api/members/:id/payments` - Get member's payment history
- `GET /api/members/stats/overview` - Get members statistics

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record new payment
- `GET /api/payments/stats` - Get payment statistics

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Record new donation

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Record new expense

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders/send` - Send reminder to member
- `GET /api/reminders/settings` - Get reminder settings
- `PUT /api/reminders/settings` - Update reminder settings

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts/monthly-collections` - Monthly collections data
- `GET /api/dashboard/charts/payment-methods` - Payment methods breakdown

### Reports
- `GET /api/reports/financial` - Generate financial report
- `GET /api/reports/members` - Generate members report

## 🔄 Real-time Features

The API includes WebSocket support for real-time updates:

### Socket.IO Events

**Client → Server:**
- `join-user-room` - Join user-specific room
- `join-admin-room` - Join admin room for system updates

**Server → Client:**
- `members:changed` - Member data updated
- `payments:changed` - Payment recorded
- `donations:changed` - Donation recorded
- `expenses:changed` - Expense recorded
- `reminders:changed` - Reminder sent
- `dashboard:update` - Dashboard data updated
- `payment:notification` - Payment notification
- `reminder:notification` - Reminder notification

## 📊 Database Schema

### Core Tables

- **users** - System users (extends Supabase auth)
- **members** - Church members
- **payments** - Member dues payments
- **donations** - Donations and contributions
- **expenses** - Ministry expenses
- **budget_categories** - Budget categories
- **financial_goals** - Financial targets
- **reminders** - SMS reminder history
- **reminder_settings** - Reminder configuration
- **member_owing_months** - Track owing months
- **member_credit_months** - Track credit months
- **system_settings** - System configuration

## 🔒 Security Features

- **Rate Limiting** - Prevents API abuse
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Input Validation** - Request validation
- **JWT Authentication** - Secure token-based auth
- **Row Level Security** - Database-level security
- **SQL Injection Protection** - Parameterized queries

## 📱 SMS Integration

The system supports Ghanaian SMS providers:

- **Hubtel** - Primary provider
- **Arkesel** - Alternative provider
- **Nalo Solutions** - Alternative provider

### SMS Features

- Automated monthly reminders
- Manual reminder sending
- Bulk reminder campaigns
- Personalized message templates
- Delivery status tracking

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
JWT_SECRET=your_strong_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Options

1. **Vercel** - Serverless deployment
2. **Railway** - Container deployment
3. **DigitalOcean** - VPS deployment
4. **AWS EC2** - Cloud server deployment

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Error Logging**: Console and file logging
- **Performance**: Request timing with Morgan
- **Real-time**: Socket.IO connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review the API endpoints
3. Check Supabase documentation
4. Create an issue in the repository

## 🔄 API Versioning

Current API version: v1

All endpoints are prefixed with `/api/`

## 📝 Changelog

### v1.0.0
- Initial release
- Complete CRUD operations
- Real-time features
- SMS integration
- Dashboard analytics
- Report generation
