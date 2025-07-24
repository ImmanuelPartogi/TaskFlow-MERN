# TaskFlow - Aplikasi Manajemen Tugas Kolaboratif

![TaskFlow Banner](https://via.placeholder.com/1200x300/0ea5e9/ffffff?text=TaskFlow+MERN+Stack)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.16.3-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📝 Deskripsi

TaskFlow adalah aplikasi manajemen tugas kolaboratif yang memungkinkan tim untuk mengelola proyek dan tugas secara efisien. Aplikasi ini dibangun dengan MERN Stack (MongoDB, Express.js, React.js, Node.js) dan menggunakan TailwindCSS untuk styling.

## ✨ Fitur Utama

- 🔐 **Autentikasi Pengguna**: Sistem login dan registrasi aman dengan JWT
- 🖱️ **Antarmuka Drag-and-Drop**: Kelola tugas dengan mudah menggunakan antarmuka kanban intuitif
- 🔔 **Notifikasi Real-time**: Dapatkan pembaruan instan menggunakan WebSockets
- 📊 **Dashboard Interaktif**: Pantau kemajuan proyek dengan visualisasi grafik
- 👥 **Manajemen Tim**: Undang anggota tim dan tetapkan tugas
- 🏷️ **Kategori Prioritas**: Atur tugas berdasarkan prioritas (rendah, sedang, tinggi)
- 📱 **Responsif**: Tampilan yang optimal di semua perangkat

## 🛠️ Teknologi

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Database NoSQL
- **Mongoose** - ODM untuk MongoDB
- **JWT** - Autentikasi token
- **Socket.IO** - Komunikasi real-time

### Frontend
- **React** - Library UI
- **React Router** - Navigasi
- **TailwindCSS** - Styling
- **Axios** - HTTP client
- **DND Kit** - Fungsionalitas drag-and-drop
- **Socket.IO Client** - Koneksi real-time dengan server

## 🗄️ Struktur Database

Aplikasi menggunakan MongoDB dengan 3 skema utama:

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

### Relasi Database

- User memiliki banyak Project (one-to-many)
- Project memiliki banyak Task (one-to-many)
- Project memiliki banyak User sebagai member (many-to-many)
- Task dimiliki oleh satu Project (many-to-one)
- Task dibuat oleh satu User (many-to-one)
- Task dapat ditugaskan ke satu User (many-to-one)

## 🏗️ Arsitektur Aplikasi

### Backend

```
server/
├── config/
│   ├── db.js         # Koneksi MongoDB
│   └── default.js    # Konfigurasi aplikasi
├── models/
│   ├── User.js       # Skema user
│   ├── Project.js    # Skema project
│   └── Task.js       # Skema task
├── middleware/
│   └── auth.js       # Middleware autentikasi JWT
├── controllers/
│   ├── authController.js    # Handler autentikasi
│   ├── userController.js    # Handler user
│   ├── projectController.js # Handler project
│   └── taskController.js    # Handler task
├── routes/
│   ├── auth.js       # Endpoint autentikasi
│   ├── users.js      # Endpoint user
│   ├── projects.js   # Endpoint project
│   └── tasks.js      # Endpoint task
├── utils/
│   └── socketEvents.js # Konfigurasi Socket.IO
└── server.js         # Entry point aplikasi
```

### Frontend

```
client/
├── src/
│   ├── services/
│   │   ├── api.js          # Konfigurasi Axios
│   │   ├── authService.js  # Layanan autentikasi
│   │   ├── projectService.js # Layanan project
│   │   └── taskService.js  # Layanan task
│   ├── contexts/
│   │   ├── AuthContext.js  # Context autentikasi
│   │   └── NotificationContext.js # Context notifikasi
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js    # Form login
│   │   │   └── Register.js # Form registrasi
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.js # Halaman dashboard
│   │   │   └── ProjectProgress.js # Grafik progress
│   │   ├── Projects/
│   │   │   ├── ProjectList.js # Daftar project
│   │   │   ├── ProjectForm.js # Form project
│   │   │   └── ProjectDetail.js # Detail project
│   │   ├── Tasks/
│   │   │   ├── TaskBoard.js # Papan kanban
│   │   │   ├── TaskCard.js  # Komponen task
│   │   │   └── TaskForm.js  # Form task
│   │   └── Layout/
│   │       ├── Header.js    # Header aplikasi
│   │       ├── Sidebar.js   # Sidebar navigasi
│   │       └── Notification.js # Komponen notifikasi
│   └── App.js              # Komponen utama
```

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js (versi 18.x atau lebih baru)
- MongoDB (lokal atau Atlas)
- npm atau yarn

### Instalasi

1. Clone repositori ini

```bash
git clone https://github.com/ImmanuelPartogi/taskflow-mern.git
cd taskflow-mern
```

2. Instal dependensi server

```bash
cd server
npm install
```

3. Buat file config untuk koneksi MongoDB

```bash
# Buat file config/default.js
module.exports = {
  mongoURI: 'mongodb://localhost:27017/taskflow',
  jwtSecret: 'your_jwt_secret'
};
```

4. Instal dependensi client

```bash
cd ../client
npm install
```

### Menjalankan Aplikasi

1. Jalankan server (dari folder server)

```bash
npm run dev
```

2. Jalankan client (dari folder client)

```bash
npm run dev
```

3. Buka aplikasi di browser: `http://localhost:5173`

## 📸 Screenshot

![Dashboard](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Dashboard)
![Task Board](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Task+Board)
![Project Detail](https://via.placeholder.com/800x450/0ea5e9/ffffff?text=Project+Detail)

## 👨‍💻 Pembuat

- **Immanuel Partogi Pardede** - [GitHub](https://github.com/ImmanuelPartogi)

---

<p align="center">
  MERN Stack
</p>
