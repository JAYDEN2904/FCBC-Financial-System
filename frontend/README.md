# Frontend - Church Management System

This is the frontend application for the Church Management System built with React, TypeScript, and Vite.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Shadcn/ui** - UI component library
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   └── ui/              # Reusable UI components
│   ├── contexts/            # React contexts (Theme, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and mock data
│   ├── pages/               # Page components
│   └── main.tsx             # Application entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Features

- **Dashboard** - Overview of church activities and statistics
- **Members Management** - Add, edit, and manage church members
- **Finance** - Track donations, expenses, and financial reports
- **Payments** - Manage payment processing and records
- **Reminders** - Set up and manage church reminders
- **Reports** - Generate various church reports
- **Settings** - Configure system settings
- **Authentication** - Login system (ready for backend integration)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Backend Integration

The frontend is ready for backend integration. The following areas need API endpoints:

- Authentication (login/logout)
- Members CRUD operations
- Financial data management
- Payment processing
- Reminder management
- Report generation
- Settings management

All API calls are currently using mock data and can be easily replaced with actual API calls.
