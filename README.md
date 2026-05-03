# TeamFlow | Project Management System 🚀

TeamFlow is a comprehensive, full-stack project management application designed to help teams organize, track, and manage their work efficiently. It provides a sleek interface for task management with real-time updates and professional analytics.

## 🔗 Live Demo
Check out the live application: [TeamFlow Live](https://project-management-system-production-96d2.up.railway.app)

---

## ✨ Key Features

- **User Authentication:** Secure Login and Signup system using **JWT (JSON Web Tokens)** to ensure data privacy.
- **Dynamic Kanban Board:** Intuitive drag-and-drop interface to manage tasks across different stages (Todo, In Progress, Done).
- **Interactive Dashboard:** Visual overview of project status, pending tasks, and team productivity.
- **Project Management:** Ability to create, update, and manage multiple projects simultaneously.
- **RESTful API:** Clean and structured backend architecture for seamless frontend-backend communication.
- **Responsive Design:** Fully optimized for desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

### **Frontend**
- **HTML5 & CSS3:** For semantic structure and custom responsive styling.
- **JavaScript (ES6+):** For dynamic logic and state management.
- **React.js:** Used for building a highly interactive and component-based user interface.
- **CoreUI:** For a professional-grade administrative layout and components.

### **Backend**
- **Node.js:** Scalable runtime for the server-side environment.
- **Express.js:** Minimal and flexible web framework for building robust **REST APIs**.
- **Prisma (ORM):** Modern database toolkit for type-safe database access and migrations.

### **Database**
- **PostgreSQL:** A powerful, open-source relational database for reliable data storage.

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- A PostgreSQL database instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guptadhruv780/Project-management-system.git
   cd Project-management-system
   ```

2. **Setup Backend:**
   ```bash
   cd teamflow/backend
   npm install
   # Create a .env file and add your DATABASE_URL and JWT_SECRET
   npx prisma db push
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd ../temp_frontend
   npm install
   # Create a .env file and add VITE_API_URL
   npm run dev
   ```

---

## 📈 Deployment
The application is deployed using **Railway** for both the frontend and the backend, ensuring high availability and seamless CI/CD integration.

--

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

---

Developed with ❤️ by **Dhruv Gupta**
