```md
# 🛠️ Shopverse Server — Backend API for Shopverse E-Commerce Platform

Shopverse Server is the **backend REST API** powering the Shopverse e-commerce platform.  
It is built with **Node.js**, **Express**, and **MongoDB**, and is responsible for **authentication**, **authorization**, **product management**, **orders**, **payments**, and **admin operations**.

This repository contains the **backend only**.  
The frontend lives in a separate repository: **Shopverse (Frontend)**.

---

## 🚀 Live API

- **Base URL (Production):** https://shop-verse-server-teal.vercel.app/

---

## 🧠 Architecture Overview

```

Shopverse Server
│
├── Node.js + Express
├── MongoDB (Mongoose ODM)
├── JWT Authentication (HTTP-only Cookies)
├── Role-based Authorization (Admin / User)
├── Rate Limiting & Security Middleware
├── Modular Route Structure
└── REST API consumed by Shopverse Frontend

```

The backend is designed to be **stateless**, **secure**, and **scalable**, making it suitable for cloud deployment.

---

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT-based authentication using **HTTP-only cookies**
- Secure login and registration
- Middleware-based route protection
- Role-based access control (Admin vs User)

---

### 🧑‍💼 Admin Capabilities
- Admin access verification
- Product management APIs
- Order management APIs
- Feature toggle management
- Admin-only protected routes

---

### 🛍️ Shop Functionality
- Product listing APIs
- Product search
- Cart management
- Address management
- Order creation and tracking
- Product reviews

---

### 💳 Payments
- PayPal payment verification
- Secure order confirmation after payment
- Payment success and cancellation handling

---

### 🧪 Security & Reliability
- Global rate limiting
- Strict CORS configuration
- HTTP-only cookies
- Trust proxy enabled for cloud deployments
- Centralized error handling

---

## 🗂️ Project Structure

```

server/
│
├── controllers/
│   ├── admin/
│   ├── auth/
│   └── shop/
│
├── middlewares/
│   ├── auth.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── ...
│
├── routes/
│   ├── auth/
│   ├── admin/
│   ├── shop/
│   └── common/
│
├── server.js
└── .env

````

---

## 🧰 Tech Stack

- **Node.js**
- **Express**
- **MongoDB**
- **Mongoose**
- **JWT**
- **Cookie Parser**
- **CORS**
- **Express Rate Limit**
- **dotenv**

---

## ⚙️ Environment Variables

Create a `.env` file in the server root:

```env
PORT=5000

MONGODB_USER=your_mongo_username
MONGODB_PASS=your_mongo_password
MONGODB_CLUSTER=your_cluster_name

JWT_SECRET=your_jwt_secret
NODE_ENV=development
````

> ⚠️ Never commit your `.env` file to version control.

---

## 🌍 CORS Configuration

Allowed origins (production):

* [https://myshopverse.vercel.app](https://myshopverse.vercel.app)

In **development mode**, `http://localhost:5173` is also allowed.

The server supports:

* Credentialed requests
* Secure cookie-based authentication
* Browser and non-browser clients (Postman, curl)

---

## 🔐 Authentication Middleware

* `authenticate` — verifies JWT and attaches user to request
* `requireAdmin` — ensures the authenticated user has admin privileges

These are applied selectively to protect sensitive routes.

---

## 🛠️ Local Development

### Prerequisites

* Node.js (v18+ recommended)
* MongoDB Atlas or local MongoDB instance

### Setup

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Server runs on:

```
http://localhost:5000
```

---

## 🔗 Frontend Repository

👉 **Shopverse (Frontend)**
[https://github.com/Ninaaddd/Shopverse](https://github.com/Ninaaddd/Shopverse)

The frontend consumes this API for:

* Authentication
* Product & cart operations
* Orders and payments
* Admin management

---

## 🧪 Security Measures

* HTTP-only cookies (prevents XSS token theft)
* Rate limiting (prevents abuse)
* Strict CORS policies
* Admin authorization enforced server-side
* Secure production configuration

---

## 📦 Deployment

* **Backend Hosting:** Render
* **Database:** MongoDB Atlas
* **Environment:** Cloud-ready with proxy trust enabled

---

## 📌 Planned Improvements

* Refresh token rotation
* Webhook-based payment confirmation
* Centralized logging
* API documentation (OpenAPI / Swagger)
* Admin audit logs

---

## 🧑‍💻 Author

**Ninad**

---
