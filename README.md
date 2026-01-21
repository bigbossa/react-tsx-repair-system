# Homecare Management System

A comprehensive web application for managing air conditioning and water maintenance services for homecare operations.

## Features

- **Account Management**: Manage customer accounts and service records
- **Maintenance Tracking**: Track air conditioning and water maintenance schedules
- **AI Chat Assistant**: Integrated AI support for queries and assistance
- **Reports**: Generate and view maintenance reports
- **Role-Based Access**: User authentication with role-based permissions
- **Mobile-Responsive**: Bottom navigation for mobile devices

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- CSS3

**Backend:**
- Node.js + Express
- MySQL Database

**Services:**
- Gemini AI Integration
- API Services

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd c:\bigboss\homecare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - See [HOMECARE_DB_SETUP.md](HOMECARE_DB_SETUP.md) for detailed database setup
   - See [DBHC_CONFIG.md](DBHC_CONFIG.md) for database configuration
   - See [AIR_MA_SETUP.md](AIR_MA_SETUP.md) for air maintenance table setup

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
homecare/
├── components/          # React components
│   ├── AccountManagement.tsx
│   ├── ACCard.tsx
│   ├── MaintenanceCard.tsx
│   ├── LoginPage.tsx
│   └── ...
├── server/             # Backend server
│   ├── index.js        # Express server
│   └── database/       # Database scripts
├── services/           # API and utility services
├── App.tsx             # Main application component
├── constants.ts        # Application constants
└── types.ts            # TypeScript type definitions
```

## Documentation

- **[SETUP.md](SETUP.md)** - General setup instructions
- **[LOGIN_UPDATE_SUMMARY.md](LOGIN_UPDATE_SUMMARY.md)** - Login system overview
- **[LOGIN_TROUBLESHOOTING.md](LOGIN_TROUBLESHOOTING.md)** - Login issues and fixes
- **[ACCOUNT_MANAGEMENT_UPDATE.md](ACCOUNT_MANAGEMENT_UPDATE.md)** - Account management features
- **[ROLE_PERMISSIONS_UPDATE.md](ROLE_PERMISSIONS_UPDATE.md)** - User roles and permissions
- **[DATE_FORMAT.md](DATE_FORMAT.md)** - Date formatting guidelines
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[VERIFY_DATA.md](VERIFY_DATA.md)** - Data verification procedures
- **[QUICK_FIX.md](QUICK_FIX.md)** - Quick fixes for common problems

## Database Management

The `server/database/` directory contains scripts for:
- Creating and setting up the database
- Managing tables (air_ma, checklist, etc.)
- Data verification and cleanup
- User management and role updates
- Date format fixes

Key scripts:
- `createHomecareDB.js` - Initialize the database
- `checkDatabase.js` - Verify database integrity
- `updateUserRoles.js` - Manage user permissions
- `checkData.js` - Verify data consistency

## Development

### Running the Backend
```bash
node server/index.js
```

### Running the Frontend
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Configuration

- **Database**: Configure in server files or environment variables
- **API Keys**: Set up Gemini API keys for AI features
- **Roles**: See [ROLE_PERMISSIONS_UPDATE.md](ROLE_PERMISSIONS_UPDATE.md) for configuring user roles

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## License

Proprietary - All rights reserved

## Support

For issues and troubleshooting, refer to:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [LOGIN_TROUBLESHOOTING.md](LOGIN_TROUBLESHOOTING.md)
- [QUICK_FIX.md](QUICK_FIX.md)
