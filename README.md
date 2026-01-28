# Repair System (React + TypeScript)

ระบบบริหารจัดการแจ้งซ่อม ทรัพย์สิน และผู้ใช้งาน พัฒนาด้วย Next.js 16, TypeScript, React และ PostgreSQL

## 📋 Features

### 🎫 Ticket Management
- สร้างและจัดการใบแจ้งซ่อม (Repair Tickets)
- ติดตามสถานะงาน (Pending, In Progress, Completed)
- แสดงประวัติการซ่อม
- ระบบแจ้งเตือน LINE Notify
- Export ข้อมูลเป็น Excel

### 💼 Asset Management
- จัดการทรัพย์สิน (Computer, Notebook, Printer)
- ระบุข้อมูลละเอียด (CPU, RAM, HDD, IP, MAC Address)
- Import/Export ข้อมูลจาก Excel
- ตรวจสอบ Asset Code ซ้ำ
- กำหนดสาขา แผนก บริษัท
- DataTable พร้อม Pagination, Sorting, Filtering

### 👥 User Management
- จัดการข้อมูลผู้ใช้ (Admin/User)
- Import ผู้ใช้จาก Excel
- กำหนดสาขาที่ Admin รับผิดชอบ
- ดูทรัพย์สินของผู้ใช้
- DataTable พร้อม Search, Filter, Pagination

### ✅ MA Checklist (Maintenance)
- ระบบ Checklist บำรุงรักษาอุปกรณ์
- แยก Checklist ตามประเภท (Computer, Printer)
- บันทึกประวัติการทำ MA
- ตรวจสอบการทำ MA ซ้ำในรอบ 2 เดือน
- แจ้งซ่อมได้ทันทีหากพบปัญหา

### 📊 Dashboard & Reports
- แสดงสถิติงานซ่อม
- กราฟวิเคราะห์ข้อมูล
- รายงานตามสาขา แผนก
- Export รายงานเป็น Excel

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React Framework with App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **TanStack Table** - Data Tables
- **SweetAlert2** - Dialogs & Alerts
- **XLSX** - Excel Import/Export
- **Recharts** - Charts & Graphs

### Backend
- **Next.js API Routes** - Backend API
- **PostgreSQL** - Database
- **node-postgres (pg)** - Database Driver

### Development Tools
- **pnpm** - Package Manager
- **ESLint** - Code Linting
- **PM2** - Process Manager

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- pnpm

### 1. Clone Repository
```bash
git clone https://github.com/bigbossa/react-tsx-repair-system.git
cd react-tsx-repair-system
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup

Create PostgreSQL databases:
```sql
-- Repair System Database
CREATE DATABASE repair_system;

-- Dashboard Database  
CREATE DATABASE dashboard;
```

Import schema:
```bash
psql -U postgres -d repair_system < schema/repair_system.sql
psql -U postgres -d dashboard < schema/dashboard.sql
```

### 4. Environment Variables

Create `.env.local`:
```env
# Database - Repair System
DB_REPAIR_HOST=localhost
DB_REPAIR_PORT=5432
DB_REPAIR_USER=postgres
DB_REPAIR_PASSWORD=your_password
DB_REPAIR_DATABASE=repair_system

# Database - Dashboard
DB_DASHBOARD_HOST=localhost
DB_DASHBOARD_PORT=5432
DB_DASHBOARD_USER=postgres
DB_DASHBOARD_PASSWORD=your_password
DB_DASHBOARD_DATABASE=dashboard

# LINE Notify (Optional)
LINE_NOTIFY_TOKEN=your_line_token
```

### 5. Build & Run

Development:
```bash
pnpm dev
# Runs on http://localhost:1002
```

Production:
```bash
pnpm build
pnpm start
```

With PM2:
```bash
pm2 start ecosystem.config.js --only repair-frontend
```

## 🗂 Project Structure

```
react-tsx-repair-system/
├── app/
│   ├── api/                    # API Routes
│   │   ├── assets/            # Assets API
│   │   │   ├── route.ts       # GET, POST assets
│   │   │   ├── [id]/route.ts  # PUT, DELETE asset
│   │   │   └── export/route.ts # Export all assets
│   │   ├── tickets/           # Tickets API
│   │   ├── users/             # Users API
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── import/route.ts # Import users from Excel
│   │   └── maintenance-records/ # MA Checklist API
│   ├── assets/                # Assets Page
│   ├── checklist/             # MA Checklist Page
│   ├── dashboard/             # Dashboard Page
│   ├── tickets/               # Tickets Page
│   ├── users/                 # Users Page
│   ├── auth-context.tsx       # Authentication Context
│   └── layout.tsx             # Root Layout
├── components/
│   ├── ui/                    # shadcn/ui Components
│   ├── app-header.tsx         # App Header
│   ├── assets-data-table.tsx  # Assets DataTable
│   └── users-data-table.tsx   # Users DataTable
├── lib/
│   ├── db.ts                  # Database Connection
│   ├── api.ts                 # API Fetch Helper
│   └── utils.ts               # Utility Functions
├── public/                    # Static Files
└── styles/                    # Global Styles
```

## 🔌 API Endpoints

### Assets
```
GET    /api/assets              # List assets (with pagination, filters)
POST   /api/assets              # Create asset
GET    /api/assets/export       # Export all assets
GET    /api/assets/[id]         # Get asset by ID
PUT    /api/assets/[id]         # Update asset
DELETE /api/assets/[id]         # Delete asset
```

### Users
```
GET    /api/users               # List users
POST   /api/users               # Create user
POST   /api/users/import        # Import users from Excel
GET    /api/users/[id]          # Get user by ID
PUT    /api/users/[id]          # Update user
DELETE /api/users/[id]          # Delete user
```

### Tickets
```
GET    /api/tickets             # List tickets
POST   /api/tickets             # Create ticket
GET    /api/tickets/[id]        # Get ticket
PUT    /api/tickets/[id]        # Update ticket
DELETE /api/tickets/[id]        # Delete ticket
```

### MA Checklist
```
GET    /api/maintenance-records # List MA records
POST   /api/maintenance-records # Create MA record
```

## 🚀 Development

### Run Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Run Production Server
```bash
pnpm start
```

### Lint Code
```bash
pnpm lint
```

## 📱 Features Detail

### Import from Excel

**Assets Import**
- Support .xlsx, .xls files
- Auto-detect duplicate Asset Code
- Preview before import
- Show import results (success/failed)

**Users Import**
- Support .xlsx, .xls files  
- Auto-update if username exists
- Role mapping (admin/user)
- Template download available

Required columns:
- Assets: `asset_code`, `user_id`, `user_name`, `company`, `site`, `department`, `device_name`, etc.
- Users: `username`, `password`, `name`, `role`, `site`, `department`

### DataTable Features
- ✅ Sorting (multi-column)
- ✅ Pagination (10/20/30/50/100 per page)
- ✅ Global Search
- ✅ Column Filtering
- ✅ Column Visibility Toggle
- ✅ Responsive Design

### Authentication
- Login with username/password
- Role-based access (Admin/User)
- Session management
- Protected routes

## 🔧 Configuration

### Database Tables

**Main Tables:**
- `Assets` - Asset information
- `useryc` - Users
- `tickets` - Repair tickets
- `maintenance_records` - MA checklist records

### PM2 Configuration

`ecosystem.config.js`:
```javascript
{
  name: 'repair-frontend',
  script: 'pnpm',
  args: 'start',
  cwd: './app/react-tsx-repair-system',
  instances: 1,
  autorestart: true,
  watch: false,
  env: {
    NODE_ENV: 'production',
    PORT: 1002
  }
}
```

## 🌐 Deployment

### With PM2
```bash
# Start
pm2 start ecosystem.config.js --only repair-frontend

# Restart
pm2 restart repair-frontend

# Stop
pm2 stop repair-frontend

# Logs
pm2 logs repair-frontend
```

### Access URLs
- Development: http://localhost:1002
- Production: http://192.168.19.37:3000/repair (via proxy)

## 📝 Notes

### Excel Import Format
Make sure Excel files follow the correct format:
- First row must be headers
- Required fields must not be empty
- Date format: YYYY-MM-DD
- Numbers should be in number format (not text)

### MA Checklist Cycle
- Computer/Notebook: 2 months cycle
- Printer: 2 months cycle
- System warns if MA already done within 2 months

### LINE Notify
Configure LINE_NOTIFY_TOKEN in `.env.local` to enable notifications for:
- New tickets
- Ticket status changes
- MA completion

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software.

## 👨‍💻 Authors

- Development Team - YC Corporation

## 📞 Support

For support, contact IT Department or create an issue in the repository.

---

**Version:** 1.0.0  
**Last Updated:** January 2026
