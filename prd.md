# Product Requirements Document (PRD)

## Next.js Full-Stack Application

### 1. Project Overview

**Project Name:** Personal Finance Tracker  
**Version:** 1.0  
**Date:** June 2025  
**Document Status:** Draft

### 2. Executive Summary

This document outlines the requirements for building a comprehensive personal finance management application using Next.js 14+ with TypeScript. The application will provide users with manual entry capabilities for tracking income, expenses, savings, and investments, along with goal management, dashboard analytics, and annual reporting features.

### 3. Technology Stack

#### Frontend

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod resolver
- **Validation:** Zod schemas

#### Backend

- **Runtime:** Node.js (Next.js API routes)
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM with Drizzle Kit
- **Validation:** Zod (shared schemas)

#### Development & Deployment

- **Package Manager:** pnpm (recommended) or npm
- **Deployment:** Vercel (recommended for Next.js)
- **Environment:** TypeScript strict mode enabled

### 4. Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── page.tsx              # Main dashboard
│   │   ├── transactions/         # Transaction management
│   │   │   ├── page.tsx          # Transaction list
│   │   │   ├── add/              # Add transaction
│   │   │   └── [id]/             # Edit transaction
│   │   ├── goals/                # Goal management
│   │   │   ├── page.tsx          # Goals list
│   │   │   ├── add/              # Add goal
│   │   │   └── [id]/             # Edit goal
│   │   ├── reports/              # Reports section
│   │   │   ├── page.tsx          # Annual reports
│   │   │   └── monthly/          # Monthly breakdown
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── transactions/         # Transaction CRUD
│   │   ├── goals/                # Goal CRUD
│   │   ├── categories/           # Category management
│   │   ├── reports/              # Report generation
│   │   └── dashboard/            # Dashboard data
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   │   ├── overview-cards.tsx    # Income/Expense/Savings cards
│   │   ├── net-worth-display.tsx # Net worth calculation
│   │   ├── recent-transactions.tsx # Transaction preview
│   │   └── goal-progress.tsx     # Goal progress summary
│   ├── transactions/             # Transaction components
│   │   ├── transaction-form.tsx  # Add/edit transaction form
│   │   ├── transaction-list.tsx  # Transaction list view
│   │   └── transaction-filters.tsx # Filter components
│   ├── goals/                    # Goal components
│   │   ├── goal-form.tsx         # Add/edit goal form
│   │   ├── goal-card.tsx         # Individual goal display
│   │   └── progress-bar.tsx      # Progress visualization
│   ├── reports/                  # Report components
│   │   ├── annual-report.tsx     # Annual report view
│   │   ├── category-chart.tsx    # Category spending chart
│   │   └── monthly-breakdown.tsx # Monthly analysis
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── shared/                   # Shared components
├── lib/                          # Utility functions
│   ├── db/                       # Database configuration
│   │   ├── schema.ts             # Drizzle schemas
│   │   ├── migrations/           # Database migrations
│   │   └── index.ts              # Database connection
│   ├── validations/              # Zod schemas
│   │   ├── transaction.ts        # Transaction validation
│   │   ├── goal.ts               # Goal validation
│   │   └── category.ts           # Category validation
│   ├── calculations/             # Financial calculations
│   │   ├── net-worth.ts          # Net worth calculation
│   │   ├── goal-progress.ts      # Goal progress calculation
│   │   └── category-totals.ts    # Category summation
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants & categories
├── hooks/                        # Custom React hooks
│   ├── use-transactions.ts       # Transaction data hooks
│   ├── use-goals.ts              # Goal data hooks
│   └── use-dashboard-data.ts     # Dashboard data aggregation
├── types/                        # TypeScript type definitions
│   ├── transaction.ts            # Transaction types
│   ├── goal.ts                   # Goal types
│   └── dashboard.ts              # Dashboard types
├── middleware.ts                 # Next.js middleware
└── env.mjs                       # Environment validation
```

### 5. Core Features & Requirements

#### 5.1 Dashboard Overview 📊

- **Overview Cards:** Real-time totals for Income, Expenses, Savings, and Investments
- **Net Worth Calculation:** Automatic calculation (Assets - Liabilities)
- **Recent Transactions Preview:** Last 5-10 transactions with quick view
- **Goal Progress Summary:** Visual progress indicators for active goals
- **Quick Actions:** Easy access to add new transactions and goals

#### 5.2 Manual Entry System 💰

**Transaction Types:**

1. **Income Transactions**

   - Salary, freelance work, business income
   - Investment returns, dividends, interest
   - Side hustle earnings, gifts received

2. **Expense Transactions**

   - Food & dining, transportation, utilities
   - Entertainment, shopping, healthcare
   - Bills, subscriptions, insurance

3. **Savings Transactions**

   - Emergency fund contributions
   - Vacation fund, house fund, education fund
   - General savings deposits

4. **Investment Transactions**
   - Stocks, bonds, mutual funds
   - Cryptocurrency investments
   - Retirement contributions (401k, IRA)

**Transaction Features:**

- Amount, date, category, and description fields
- Pre-defined categories with custom category support
- Edit and delete functionality for all transactions
- Search and filter capabilities
- Bulk operations support

#### 5.3 Goal Management System 🎯

- **Goal Creation:** Set financial targets with amounts and target dates
- **Goal Categories:** Emergency fund, vacation, house down payment, debt payoff
- **Progress Tracking:** Visual progress bars showing percentage completion
- **Goal Types:** Savings goals, debt reduction goals, investment targets
- **Milestone Tracking:** Set intermediate milestones within larger goals
- **Goal Completion:** Mark goals as completed with celebration feedback

#### 5.4 Annual Reports & Analytics 📈

- **Monthly Breakdown:** Detailed view of income, expenses, and savings by month
- **Category Analysis:** Spending patterns across different expense categories
- **Trend Visualization:** Line charts showing financial trends over time
- **Goal Statistics:** Success rate and completion timeline for goals
- **Net Worth Tracking:** Historical net worth progression
- **Export Functionality:** Download reports in PDF or CSV format

#### 5.5 Category Management 🏷️

**Pre-defined Categories:**

_Income Categories:_

- Salary/Wages, Freelance, Business Income
- Investment Returns, Interest, Dividends
- Gifts, Bonuses, Other Income

_Expense Categories:_

- Food & Dining, Transportation, Housing
- Utilities, Healthcare, Insurance
- Entertainment, Shopping, Education
- Subscriptions, Personal Care, Travel

_Savings Categories:_

- Emergency Fund, Vacation Fund, House Fund
- Education Fund, General Savings

_Investment Categories:_

- Stocks, Bonds, Mutual Funds
- Cryptocurrency, Real Estate, Retirement

#### 5.6 User Interface Features

- **Responsive Design:** Optimized for desktop, tablet, and mobile devices
- **Real-time Updates:** Instant calculation updates across all views
- **Form Validation:** Comprehensive client and server-side validation
- **Loading States:** Skeleton loaders and progress indicators
- **Error Handling:** User-friendly error messages and recovery options
- **Accessibility:** Full keyboard navigation and screen reader support

### 6. Technical Requirements

#### 6.1 Performance

- **Core Web Vitals:** Meet Google's performance standards
- **Bundle Size:** Optimized code splitting and tree shaking
- **Caching:** Implement appropriate caching strategies
- **Image Optimization:** Next.js Image component usage

#### 6.2 Security

- **Input Validation:** All inputs validated with Zod schemas
- **SQL Injection Protection:** Drizzle ORM parameterized queries
- **Authentication:** Secure token management
- **Environment Variables:** Proper secret management

#### 6.3 Developer Experience

- **Type Safety:** Strict TypeScript configuration
- **Code Quality:** ESLint and Prettier configuration
- **Git Hooks:** Pre-commit hooks for code quality
- **Documentation:** Comprehensive README and inline docs

### 7. API Design

#### 7.1 RESTful Endpoints

```
# Dashboard
GET    /api/dashboard              # Dashboard overview data
GET    /api/dashboard/net-worth    # Net worth calculation

# Transactions
GET    /api/transactions           # Get all transactions (with pagination)
POST   /api/transactions           # Create new transaction
GET    /api/transactions/[id]      # Get transaction by ID
PUT    /api/transactions/[id]      # Update transaction
DELETE /api/transactions/[id]      # Delete transaction
GET    /api/transactions/recent    # Get recent transactions

# Goals
GET    /api/goals                  # Get all goals
POST   /api/goals                  # Create new goal
GET    /api/goals/[id]             # Get goal by ID
PUT    /api/goals/[id]             # Update goal
DELETE /api/goals/[id]             # Delete goal
POST   /api/goals/[id]/complete    # Mark goal as completed

# Categories
GET    /api/categories             # Get all categories
GET    /api/categories/[type]      # Get categories by type (income/expense/savings/investment)

# Reports
GET    /api/reports/annual         # Annual report data
GET    /api/reports/monthly        # Monthly breakdown
GET    /api/reports/categories     # Category-wise analysis
GET    /api/reports/goals          # Goal completion statistics
```

#### 7.2 Response Format

```typescript
// Success Response
{
  success: true,
  data: T,
  message?: string
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

### 8. Database Schema

#### 8.1 Core Tables

```sql
-- Transactions table
transactions (
  id: UUID PRIMARY KEY,
  type: ENUM('income', 'expense', 'savings', 'investment') NOT NULL,
  amount: DECIMAL(12,2) NOT NULL,
  description: VARCHAR(255) NOT NULL,
  category_id: UUID REFERENCES categories(id),
  date: DATE NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW()
)

-- Categories table
categories (
  id: UUID PRIMARY KEY,
  name: VARCHAR(100) NOT NULL,
  type: ENUM('income', 'expense', 'savings', 'investment') NOT NULL,
  color: VARCHAR(7), -- Hex color code
  icon: VARCHAR(50), -- Lucide icon name
  is_default: BOOLEAN DEFAULT false,
  created_at: TIMESTAMP DEFAULT NOW()
)

-- Goals table
goals (
  id: UUID PRIMARY KEY,
  title: VARCHAR(255) NOT NULL,
  description: TEXT,
  target_amount: DECIMAL(12,2) NOT NULL,
  current_amount: DECIMAL(12,2) DEFAULT 0,
  target_date: DATE,
  category: VARCHAR(100),
  status: ENUM('active', 'completed', 'paused') DEFAULT 'active',
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW(),
  completed_at: TIMESTAMP NULL
)

-- Goal contributions (optional - for tracking individual contributions)
goal_contributions (
  id: UUID PRIMARY KEY,
  goal_id: UUID REFERENCES goals(id) ON DELETE CASCADE,
  transaction_id: UUID REFERENCES transactions(id) ON DELETE CASCADE,
  amount: DECIMAL(12,2) NOT NULL,
  created_at: TIMESTAMP DEFAULT NOW()
)

-- Budget categories (future enhancement)
budgets (
  id: UUID PRIMARY KEY,
  category_id: UUID REFERENCES categories(id),
  monthly_limit: DECIMAL(12,2) NOT NULL,
  year: INTEGER NOT NULL,
  month: INTEGER NOT NULL,
  spent_amount: DECIMAL(12,2) DEFAULT 0,
  created_at: TIMESTAMP DEFAULT NOW()
)
```

### 9. Environment Configuration

#### 9.1 Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Personal Finance Tracker"

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### 10. Development Workflow

#### 10.1 Setup Process

1. Clone repository and install dependencies
2. Set up environment variables
3. Initialize database and run migrations
4. Start development server
5. Access application at `http://localhost:3000`

#### 10.2 Database Operations

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# View database in Drizzle Studio
npm run db:studio
```

### 11. Quality Assurance

#### 11.1 Testing Strategy

- **Unit Tests:** Component and utility function testing
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Critical user journey testing
- **Type Checking:** Comprehensive TypeScript coverage

#### 11.2 Code Quality Standards

- **ESLint:** Strict linting rules
- **Prettier:** Consistent code formatting
- **Husky:** Pre-commit hooks
- **TypeScript:** Strict mode enabled

### 12. Deployment Requirements

#### 12.1 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build optimization verified
- [ ] Security headers implemented
- [ ] Performance monitoring setup

#### 12.2 Deployment Configuration

- **Platform:** Vercel (recommended)
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### 13. Success Metrics

#### 13.1 Technical Metrics

- **Build Time:** < 2 minutes
- **Page Load Speed:** < 2 seconds for dashboard
- **Type Coverage:** > 95%
- **Test Coverage:** > 80%
- **Bundle Size:** < 1MB initial load

#### 13.2 User Experience Metrics

- **Accessibility Score:** > 95%
- **Performance Score:** > 90%
- **Mobile Responsiveness:** Perfect across all device sizes
- **Transaction Entry Speed:** < 30 seconds per transaction
- **Data Accuracy:** 100% calculation accuracy

#### 13.3 Functional Metrics

- **CRUD Operations:** All transaction and goal operations working seamlessly
- **Real-time Updates:** Instant recalculation of totals and progress
- **Data Persistence:** Zero data loss between sessions
- **Report Generation:** < 3 seconds for annual reports
- **Goal Tracking:** Accurate progress calculation and visual indicators

### 14. Risk Assessment

#### 14.1 Technical Risks

- **Database Performance:** Monitor query performance
- **Third-party Dependencies:** Keep dependencies updated
- **Security Vulnerabilities:** Regular security audits

#### 14.2 Mitigation Strategies

- **Monitoring:** Implement application monitoring
- **Backup Strategy:** Regular database backups
- **Error Tracking:** Comprehensive error logging

### 15. Timeline & Milestones

#### Phase 1: Foundation (Week 1-2)

- Project setup and configuration with Next.js 14+
- Database schema design and initial migrations
- Basic UI components with shadcn/ui setup
- Category system implementation with pre-defined categories

#### Phase 2: Core Transaction System (Week 3-4)

- Transaction CRUD operations (Create, Read, Update, Delete)
- Transaction form with React Hook Form and Zod validation
- Transaction list with filtering and search capabilities
- Basic dashboard with overview cards and recent transactions

#### Phase 3: Goals & Analytics (Week 5-6)

- Goal management system with progress tracking
- Net worth calculation and display
- Annual reports with category breakdowns
- Chart integration for visual data representation

#### Phase 4: Polish & Enhancement (Week 7-8)

- Mobile responsiveness optimization
- Performance optimization and caching
- Advanced filtering and sorting options
- Data export functionality
- Testing and bug fixes

#### Phase 5: Advanced Features (Week 9-10)

- Goal milestone tracking
- Advanced reporting and analytics
- Budget tracking (optional)
- Data backup and restore functionality
- Production deployment and monitoring

### 16. Maintenance & Support

#### 16.1 Ongoing Maintenance

- **Dependency Updates:** Monthly updates
- **Security Patches:** Immediate application
- **Performance Reviews:** Quarterly assessments
- **Feature Enhancements:** Based on user feedback

#### 16.2 Documentation

- **Technical Documentation:** Architecture and API docs
- **User Documentation:** Feature guides and tutorials
- **Deployment Guide:** Step-by-step deployment instructions

---

**Document Version:** 1.0  
**Last Updated:** June 21, 2025  
**Next Review:** July 21, 2025
