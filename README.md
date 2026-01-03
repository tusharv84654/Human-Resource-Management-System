# Dayflow - Human Resource Management System (HRMS)

Dayflow is a modern, full-stack Human Resource Management System designed to streamline HR operations, employee management, attendance tracking, and payroll processing. Built with Next.js 14, it features a responsive, aesthetically pleasing UI and robust role-based access control.

## 🚀 Features

### for Administrators
*   **Dashboard**: Real-time overview of total employees, attendance stats, and pending leave requests.
*   **Employee Management**: Add, edit, and view employee profiles with search and filter capabilities.
*   **Employee Status**: Real-time visual board showing who is Present (🟢), On Leave (🔵), or Absent (🟡).
*   **Attendance Tracking**: Monitor daily attendance, including check-in/check-out times.
*   **Leave Management**: frequent review and approve/reject leave applications with proper reasoning.
*   **Payroll Processing**: Generate and manage monthly payrolls, calculating allowances and deductions automatically.

### for Employees
*   **Self-Service Portal**: View personal stats, attendance history, and leave balance.
*   **Attendance**: Mark attendance (Check-in/Check-out) directly from the dashboard.
*   **Leave Requests**: Apply for leave (Paid, Sick, Casual) and track application status.
*   **Payroll**: View salary slips and payment history.
*   **Profile**: Manage personal details and view auto-generated Digital ID cards.

### 🔐 Authentication & Security
*   **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, HR, and Employees.
*   **Secure Authentication**: JWT-based session management.
*   **Password Security**: Password strength indicators and visibility toggles during signup.

## 🛠️ Technology Stack

*   **Frontend**: 
    *   **Next.js 14** (App Router)
    *   **React** for UI components
    *   **Tailwind CSS** for styling (with custom gradients and glassmorphism effects)
    *   **Lucide React** & **Heroicons** for SVG icons
*   **Backend**: 
    *   **Next.js API Routes** (Serverless functions)
    *   **Mongoose** for MongoDB object modeling
*   **Database**: 
    *   **MongoDB Atlas** (Cloud-hosted NoSQL database)
*   **Tools**:
    *   **TypeScript** for type safety
    *   **date-fns** for date manipulation

## � Project Structure

```bash
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin specific pages (Dashboard, Employees, Payroll, etc.)
│   ├── api/               # Backend API endpoints
│   ├── attendance/        # Employee attendance pages
│   ├── dashboard/         # Employee main dashboard
│   ├── leaves/            # Leave application pages
│   ├── login/             # Authentication pages
│   ├── signup/            # Registration page
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # Reusable UI components
│   ├── layout/            # Sidebar, Header, and Layout wrappers
│   └── ui/                # Buttons, Inputs, Cards, etc.
├── lib/                   # Utility functions (DB connection, Auth helpers)
├── models/                # Mongoose Database Schemas (User, Attendance, Leave, Payroll)
└── types/                 # TypeScript type definitions
```

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Connection String

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/tusharv84654/Human-Resource-Management-System.git
    cd Human-Resource-Management-System
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

4.  **Seed Database (Optional)**
    To populate the database with Indian demo data (Users, Attendance, Leaves):
    *   Visit `http://localhost:3000/api/seed` in your browser.

5.  **Run the application**
    ```bash
    npm run dev
    ```

6.  **Access the App**
    *   Open `http://localhost:3000`
    *   **Admin Login**: `admin@hrms.com` / `Admin@123`
    *   **Employee Login**: `amit@hrms.com` / `Employee@123`

## 🎨 UI/UX Highlights
*   **Modern Gradient Design**: Rich visual aesthetics using curated color palettes.
*   **Status Indicators**: Intuitive visual cues for employee status (Present/Leave/Absent).
*   **Responsive Layout**: Fully functional sidebar navigation and adaptive grids for mobile and desktop.

---
Developed for Odoo Hackathon.
