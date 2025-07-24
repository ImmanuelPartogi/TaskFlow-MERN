# TaskFlow - Collaborative Task Management Application

![Image](https://github.com/user-attachments/assets/66843d46-7e66-40ca-85bd-c34ab48b101f)

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16.3-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📝 Description

TaskFlow is a collaborative task management application that enables teams to manage projects and tasks efficiently. This application is built with the MERN Stack (MongoDB, Express.js, React.js, Node.js) and uses TailwindCSS for styling.

## ✨ Key Features

- 🔐 **User Authentication**: Secure login and registration system with JWT
- 🖱️ **Drag-and-Drop Interface**: Easily manage tasks using an intuitive kanban interface
- 🔔 **Real-time Notifications**: Get instant updates using WebSockets
- 📊 **Interactive Dashboard**: Monitor project progress with graph visualizations
- 👥 **Team Management**: Invite team members and assign tasks
- 🏷️ **Priority Categories**: Organize tasks based on priority (low, medium, high)
- 📱 **Responsive**: Optimal display on all devices

## 🛠️ Technology

### Backend
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Token Authentication
- **Socket.IO** - Real-time Communication

### Frontend
- **React** - UI Library
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Axios** - HTTP Client
- **DND Kit** - Drag-and-drop Functionality
- **Socket.IO Client** - Real-time Connection with Server

## 🗄️ Database Structure

The application uses MongoDB with 3 main schemas:

### User Schema

```javascript
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});
```

### Project Schema

```javascript
const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});
```

### Task Schema

```javascript
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Database Relations

- User has many Projects (one-to-many)
- Project has many Tasks (one-to-many)
- Project has many Users as members (many-to-many)
- Task belongs to one Project (many-to-one)
- Task is created by one User (many-to-one)
- Task can be assigned to one User (many-to-one)

## 🏗️ Application Architecture

### Backend

```
server/
├── config/
│   ├── db.js         # MongoDB Connection
│   └── default.js    # Application Configuration
├── models/
│   ├── User.js       # User Schema
│   ├── Project.js    # Project Schema
│   └── Task.js       # Task Schema
├── middleware/
│   └── auth.js       # JWT Authentication Middleware
├── controllers/
│   ├── authController.js    # Authentication Handler
│   ├── userController.js    # User Handler
│   ├── projectController.js # Project Handler
│   └── taskController.js    # Task Handler
├── routes/
│   ├── auth.js       # Authentication Endpoint
│   ├── users.js      # User Endpoint
│   ├── projects.js   # Project Endpoint
│   └── tasks.js      # Task Endpoint
├── utils/
│   └── socketEvents.js # Socket.IO Configuration
└── server.js         # Application Entry Point
```

### Frontend

```
client/
├── src/
│   ├── services/
│   │   ├── api.js          # Axios Configuration
│   │   ├── authService.js  # Authentication Service
│   │   ├── projectService.js # Project Service
│   │   └── taskService.js  # Task Service
│   ├── contexts/
│   │   ├── AuthContext.js  # Authentication Context
│   │   └── NotificationContext.js # Notification Context
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js    # Login Form
│   │   │   └── Register.js # Registration Form
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js # Dashboard Page
│   │   │   └── ProjectProgress.js # Progress Graph
│   │   ├── Projects/
│   │   │   ├── ProjectList.js # Project List
│   │   │   ├── ProjectForm.js # Project Form
│   │   │   └── ProjectDetail.js # Project Detail
│   │   ├── Tasks/
│   │   │   ├── TaskBoard.js # Kanban Board
│   │   │   ├── TaskCard.js  # Task Component
│   │   │   └── TaskForm.js  # Task Form
│   │   └── Layout/
│   │       ├── Header.js    # Application Header
│   │       ├── Sidebar.js   # Navigation Sidebar
│   │       └── Notification.js # Notification Component
│   └── App.js              # Main Component
```

## 🚀 How to Run

### Prerequisites

- Node.js (version 18.x or newer)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone this repository

```bash
git clone https://github.com/ImmanuelPartogi/taskflow-mern.git
cd taskflow-mern
```

2. Install server dependencies

```bash
cd server
npm install
```

3. Create config file for MongoDB connection

```bash
# Create config/default.js file
module.exports = {
  mongoURI: 'mongodb://localhost:27017/taskflow',
  jwtSecret: 'your_jwt_secret'
};
```

4. Install client dependencies

```bash
cd ../client
npm install
```

### Running the Application

1. Run the server (from server folder)

```bash
npm run dev
```

2. Run the client (from client folder)

```bash
npm run dev
```

3. Open the application in browser: `http://localhost:5173`

## 📸 Screenshots

![Dashboard](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Dashboard)
![Task Board](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Task+Board)
![Project Detail](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Project+Detail)

## 👨‍💻 Creator

- **Immanuel Partogi Pardede** - [GitHub](https://github.com/ImmanuelPartogi)

---

<p align="center">
  MERN Stack
</p>
