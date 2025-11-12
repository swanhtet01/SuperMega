# Yangon Tyre Factory - Remote Management System

**AI-powered production monitoring and analytics platform for tire manufacturing**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## 🎯 Overview

A comprehensive remote management system built for Yangon Tyre Factory to monitor and optimize production across two manufacturing plants (Plant A - Yangon, Plant B - Bilin). The system provides real-time insights, quality tracking, inventory management, and AI-powered analytics.

### Key Features

- **Real-time Production Monitoring** - Track A/B/R quality metrics, batch codes, and shift performance
- **Two-Plant Architecture** - Separate dashboards and data for Plant A and Plant B
- **AI-Powered Insights** - Automated defect detection, trend analysis, and predictive maintenance
- **Bilingual Support** - Full English and Myanmar (Burmese) language support
- **Mobile-First Design** - Optimized for production floor supervisors
- **Excel Integration** - Import historical data and export reports
- **Google Drive Auto-Sync** - Automatic data import from shared folders
- **Role-Based Access** - Supervisor, Manager, Executive, and Admin roles

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.x or higher
- pnpm 10.x or higher
- MySQL database (or TiDB Cloud)
- Google Workspace account (for OAuth)

### Installation

```bash
# Clone the repository
git clone https://github.com/swanhtet01/yangon-tyre-bms.git
cd yangon-tyre-bms

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Test Accounts

For development and testing:

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| supervisor | test123 | Supervisor | Data entry + basic view |
| manager | test123 | Manager | Department oversight + reports |
| executive | test123 | Executive | Full remote monitoring |
| admin | test123 | Admin | System settings |

---

## 📊 System Architecture

### Tech Stack

**Frontend**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui component library
- tRPC for type-safe APIs
- Wouter for routing

**Backend**
- Node.js 22 with Express 4
- tRPC 11 for API layer
- Drizzle ORM for database
- JWT + bcrypt for authentication
- Multer for file uploads

**Database**
- MySQL 8.0 (or TiDB Cloud)
- 17 tables covering production, quality, sales, inventory, finance

**AI & Integration**
- Anthropic Claude API for insights
- Google Drive API for auto-sync
- xlsx library for Excel parsing

### Database Schema

```
users                    → Role-based access control
productionRecords        → Daily production data (A/B/R system)
flapProductionRecords    → Tire inner tube production
qualityInspections       → Detailed quality checks
defects                  → Defect tracking and categorization
salesOrders              → Customer orders
dealers                  → Dealer management
inventory                → Raw materials + finished goods
financialTransactions    → Revenue and cost tracking
announcements            → Company-wide communications
schedules                → Work schedules and shifts
systemInsights           → AI-generated insights
systemAlerts             → Automated alerts
auditLogs                → System activity tracking
fileUploads              → Document management
dataSyncLogs             → Google Drive sync history
systemSettings           → Configuration management
```

---

## 🏭 Production Data Structure

### Quality System (A/B/R)

- **A (Approved)**: Tires meeting all quality standards
- **B (Defect B)**: Minor defects, can be sold as second-grade
- **R (Rejected)**: Major defects, cannot be sold

### Tire Sizes Supported

5.00-12, 6.00-12, 7.00-16, 8.25-16, 10.00-20, 11.00-20, 12.00-20, and more

### Batch Codes

711-R, 713-L, 723-Grip, 737-AG, 747-L, 555-AG, and custom codes

---

## 📱 Features by Role

### Supervisor
- Quick production data entry
- Shift handover reports
- Real-time quality metrics
- Mobile-optimized interface

### Manager
- Department dashboards
- Quality trend analysis
- Resource allocation
- Weekly/monthly reports

### Executive
- Cross-plant comparison
- AI-powered insights
- Financial overview
- Strategic analytics

### Admin
- User management
- System configuration
- Data import/export
- Audit logs

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Application
VITE_APP_TITLE=Yangon Tyre Factory
VITE_APP_ID=your-app-id

# AI Integration (Optional)
ANTHROPIC_API_KEY=your-anthropic-key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=devteam@supermega.dev
SMTP_PASSWORD=your-password
```

### Google Drive Auto-Sync

1. Enable Google Drive API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add credentials to `.env`
4. Configure folder IDs in `server/services/driveSync.ts`

---

## 📚 Documentation

- [System Status](docs/SYSTEM_STATUS.md) - Current features and progress
- [Infrastructure Plan](docs/INFRASTRUCTURE_PLAN.md) - Deployment architecture
- [YTF Processes](docs/YTF_ACTUAL_PROCESSES.md) - Real factory workflows
- [Complete System Spec](docs/COMPLETE_SYSTEM_SPEC.md) - Detailed requirements

---

## 🚢 Deployment

### AWS Deployment

```bash
# Build for production
pnpm build

# Deploy to AWS EC2
# (See docs/DEPLOYMENT.md for detailed instructions)
```

### Docker Deployment

```bash
# Build Docker image
docker build -t ytf-system .

# Run container
docker run -p 3000:3000 --env-file .env ytf-system
```

---

## 🤝 Contributing

This is a private system for Yangon Tyre Factory. For internal contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

**SuperMega Development Team**
- Email: devteam@supermega.dev
- Website: https://supermega.dev

**Project Owner**
- Swan Htet (swanhtet@supermega.dev)

---

## 🙏 Acknowledgments

Built with ❤️ for Yangon Tyre Factory

Special thanks to:
- The YTF production team for their insights
- Plant supervisors for data validation
- Management for their vision and support

---

**Status**: Active Development  
**Version**: 1.0.0  
**Last Updated**: November 13, 2025

