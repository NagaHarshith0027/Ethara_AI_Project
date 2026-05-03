# Team Task Manager — TaskFlow

A full-stack collaborative task management web application where users can create projects, assign tasks, and track progress. Built as a simplified version of tools like Trello or Asana.

## 🚀 Live Demo

- **Frontend**: [Your Railway frontend URL]
- **Backend**: [Your Railway backend URL]

## 🛠️ Tech Stack

### Backend
- **Java 21** + **Spring Boot 3.4.1**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** + **MySQL**
- **Lombok** for boilerplate reduction
- **Maven** for build management

### Frontend
- **React 19** (Vite)
- **React Router v7** for routing
- **Axios** for API calls
- **Recharts** for dashboard charts
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📋 Features

### 1. User Authentication
- Signup with Name, Email, Password
- Secure login with JWT token
- Protected routes and auto-redirect

### 2. Project Management
- Create projects (creator becomes Admin)
- Admin can add/remove members by email
- Members can view assigned projects

### 3. Task Management
- Create tasks with Title, Description, Due Date, Priority (Low/Medium/High)
- Assign tasks to project members
- Kanban board with 3 columns: To Do → In Progress → Done
- Click-to-move status updates
- Admin can edit/delete any task; Members can update status of assigned tasks

### 4. Dashboard
- Total tasks, tasks by status (pie chart), tasks per user (bar chart)
- Recent tasks list
- Overdue tasks highlighting
- Total projects count

### 5. Role-Based Access
- **Admin**: Full CRUD on tasks, manage members, delete project
- **Member**: View assigned tasks, update their status only

## 🏗️ Setup (Local Development)

### Prerequisites
- Java 21 (JDK)
- Node.js 18+
- MySQL 8+
- Maven

### Backend Setup

```bash
cd backend

# Configure database (create MySQL database or let Hibernate auto-create)
# Edit src/main/resources/application.properties if needed:
#   spring.datasource.username=root
#   spring.datasource.password=root

# Build and run
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start on `http://localhost:5173`.

## 🌐 Deployment (Railway)

### Backend Deployment

1. Create a new service on Railway from the `backend` directory
2. Add a MySQL database from Railway's marketplace
3. Set environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | `jdbc:mysql://HOST:PORT/DB_NAME?useSSL=false&allowPublicKeyRetrieval=true` |
| `DATABASE_USERNAME` | MySQL username from Railway |
| `DATABASE_PASSWORD` | MySQL password from Railway |
| `JWT_SECRET` | A 256-bit+ secret key |
| `CORS_ORIGINS` | Your frontend Railway URL (e.g., `https://your-frontend.up.railway.app`) |
| `PORT` | `8080` (Railway sets this automatically) |

### Frontend Deployment

1. Create a new service on Railway from the `frontend` directory
2. Set environment variable:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your backend Railway URL + `/api` (e.g., `https://your-backend.up.railway.app/api`) |

3. Build command: `npm run build`
4. Start command: `npx serve dist -s` (or use Railway's static site hosting)

## 📁 Project Structure

```
Ethara_AI_Project/
├── backend/
│   ├── src/main/java/com/ethara/taskmanager/
│   │   ├── config/          # Security, JWT, CORS
│   │   ├── controller/      # REST API endpoints
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── exception/       # Custom exceptions + global handler
│   │   ├── model/           # JPA entities (User, Project, Task)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   └── service/         # Business logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Shared UI (Sidebar, Modal, Layout)
│   │   ├── context/         # Auth context
│   │   └── pages/           # App pages (Login, Signup, Dashboard, Projects)
│   └── index.html
└── README.md
```

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member (admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (admin) |
| GET | `/api/projects/:id/members` | List members |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List project tasks |
| POST | `/api/projects/:id/tasks` | Create task (admin) |
| GET | `/api/projects/:id/tasks/:taskId` | Get task details |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task (admin) |
| PATCH | `/api/projects/:id/tasks/:taskId/status` | Update status |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard stats |

## 👤 Author

Built for the Ethara Full-Stack Coding Assignment.
