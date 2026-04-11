# SuperMart E-Commerce Platform

A fully functional, modern, full-stack e-commerce project built with React, Node.js, Express, and MongoDB.

## Features Included
- **Frontend**: React (Vite), React Router v6, Context API for global state management.
- **Backend**: Node.js, Express, strict API endpoints.
- **Database**: MongoDB & Mongoose.
- **Authentication**: Custom JWT Middleware & bcryptjs.
- **UI Design**: Premium glassmorphism design, responsive CSS Grid layout, hover animations, responsive Navbar.
- **Shopping Flow**: Home page product grid, search functionality, Product detail pages, Add to Cart logic, and Cart Summary.

## Steps to Run the Code

### 1. Prerequisites
Ensure you have **Node.js** and **MongoDB** installed on your machine. 
Make sure your local MongoDB server is running. By default, the app looks for `mongodb://127.0.0.1:27017/ecommerce`.

### 2. Seed the Database (Important)
To populate your store with initial dummy products and an admin user, run the seeder script:
```bash
cd backend
node seeder.js
```
*Note: If it says "Data Imported!", the database is ready.*

### 3. Start the Backend API
In the `backend` directory, run:
```bash
node server.js
```
The backend API server will start on `http://localhost:5000`. Leave this terminal window running.

### 4. Start the Frontend Application
Open a **new** terminal window, navigate to the `frontend` directory, and start the Vite dev server:
```bash
cd frontend
npm run dev
```
Click the local host link provided in the terminal (e.g., `http://localhost:5173`) to view your new E-Commerce website visually!

### Test Accounts
- **Admin User**: Email `admin@example.com` / Password `password`
- **Standard User**: Email `john@example.com` / Password `password`
