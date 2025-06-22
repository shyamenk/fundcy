# Personal Finance Tracker 💰

A comprehensive personal finance management application built with Next.js 14+, TypeScript, and PostgreSQL. Track your income, expenses, savings, investments, and financial goals with detailed analytics and reporting.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📊 Dashboard Overview
- **Real-time Financial Summary**: Income, expenses, savings, and investments at a glance
- **Net Worth Calculation**: Automatic calculation of your financial position
- **Recent Transactions**: Quick view of your latest financial activities
- **Goal Progress Tracking**: Visual indicators for your financial goals
- **Quick Actions**: Easy access to add new transactions and goals

### 💰 Transaction Management
- **Multiple Transaction Types**: Income, expenses, savings, and investments
- **Comprehensive Categories**: Pre-defined categories with custom support
- **Advanced Filtering**: Search and filter transactions by date, category, amount
- **Bulk Operations**: Edit and delete multiple transactions efficiently
- **Form Validation**: Robust client and server-side validation

### 🎯 Goal Management
- **Financial Goal Setting**: Create targets with amounts and deadlines
- **Progress Tracking**: Visual progress bars and percentage completion
- **Goal Categories**: Emergency fund, vacation, house down payment, debt payoff
- **Milestone Tracking**: Set intermediate milestones within larger goals
- **Goal Completion**: Mark goals as completed with celebration feedback

### 📈 Advanced Analytics & Reports
- **Annual Reports**: Comprehensive yearly financial analysis
- **Monthly Breakdowns**: Detailed monthly spending and income patterns
- **Category Analysis**: Deep dive into spending patterns by category
- **Goal Statistics**: Success rates and completion timelines
- **Interactive Charts**: Beautiful data visualization with Recharts
- **Export Functionality**: Download reports in various formats

### 🏷️ Category Management
- **Pre-defined Categories**: Comprehensive set of financial categories
- **Custom Categories**: Create your own categories as needed
- **Category Colors**: Visual organization with color-coded categories
- **Category Icons**: Intuitive icon-based category identification

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend
- **Runtime**: Node.js (Next.js API routes)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit
- **Validation**: Zod schemas (shared between client and server)

### Development & Deployment
- **Package Manager**: pnpm (recommended) or npm
- **Deployment**: Vercel (recommended)
- **Database**: Neon (PostgreSQL serverless)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # App Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="Personal Finance Tracker"
   ```

4. **Set up the database**
   ```bash
   # Generate and run migrations
   pnpm db:generate
   pnpm db:migrate
   
   # (Optional) Seed with sample data
   pnpm db:seed
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
fin/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard routes
│   │   ├── page.tsx              # Main dashboard
│   │   ├── transactions/         # Transaction management
│   │   ├── goals/                # Goal management
│   │   ├── reports/              # Reports section
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── transactions/         # Transaction CRUD
│   │   ├── goals/                # Goal CRUD
│   │   ├── categories/           # Category management
│   │   └── reports/              # Report generation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # Dashboard components
│   ├── transactions/             # Transaction components
│   ├── goals/                    # Goal components
│   ├── reports/                  # Report components
│   └── layout/                   # Layout components
├── lib/                          # Utility functions
│   ├── db/                       # Database configuration
│   ├── validations/              # Zod schemas
│   ├── calculations/             # Financial calculations
│   └── utils.ts                  # Utility functions
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
└── drizzle.config.ts             # Drizzle configuration
```

## 🗄️ Database Schema

### Core Tables

- **transactions**: Store all financial transactions
- **categories**: Pre-defined and custom categories
- **goals**: Financial goals and targets
- **goal_contributions**: Track contributions to goals

### Key Features
- **Type Safety**: Full TypeScript coverage
- **Data Integrity**: Foreign key constraints and validations
- **Performance**: Optimized queries and indexing
- **Scalability**: Designed for growth

## 📊 API Endpoints

### Dashboard
- `GET /api/dashboard` - Dashboard overview data
- `GET /api/dashboard/net-worth` - Net worth calculation

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination)
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/[id]` - Get transaction by ID
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/[id]` - Get goal by ID
- `PUT /api/goals/[id]` - Update goal
- `DELETE /api/goals/[id]` - Delete goal
- `POST /api/goals/[id]/complete` - Mark goal as completed

### Reports
- `GET /api/reports/annual` - Annual report data
- `GET /api/reports/monthly` - Monthly breakdown
- `GET /api/reports/categories` - Category-wise analysis
- `GET /api/reports/goals` - Goal completion statistics

## 🎨 UI Components

Built with **shadcn/ui** and **Tailwind CSS** for a modern, accessible, and responsive design:

- **Cards**: Financial overview and statistics
- **Forms**: Transaction and goal creation/editing
- **Tables**: Transaction lists with sorting and filtering
- **Charts**: Interactive data visualization
- **Navigation**: Intuitive sidebar navigation
- **Modals**: Confirmation dialogs and forms

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # Run TypeScript type checking

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed with sample data

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality assurance

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Environment Variables for Production

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Personal Finance Tracker"
```

### Database Setup

1. **Create a PostgreSQL database** (Neon recommended)
2. **Run migrations** on production database
3. **Set up connection string** in environment variables

## 📈 Performance

- **Core Web Vitals**: Optimized for Google's performance standards
- **Bundle Size**: Code splitting and tree shaking implemented
- **Caching**: Strategic caching for optimal performance
- **Image Optimization**: Next.js Image component usage

## 🔒 Security

- **Input Validation**: All inputs validated with Zod schemas
- **SQL Injection Protection**: Drizzle ORM parameterized queries
- **Environment Variables**: Secure secret management
- **Type Safety**: Comprehensive TypeScript coverage

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Vercel** for the deployment platform
- **shadcn/ui** for the beautiful components
- **Drizzle Team** for the excellent ORM
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/personal-finance-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/personal-finance-tracker/discussions)
- **Email**: support@yourdomain.com

---

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**

*Last updated: June 2025*
