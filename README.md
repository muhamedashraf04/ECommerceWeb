![GitHub repo size](https://img.shields.io/github/repo-size/muhamedashraf04/ECommerceWeb)
![GitHub contributors](https://img.shields.io/github/contributors/muhamedashraf04/ECommerceWeb)
![GitHub stars](https://img.shields.io/github/stars/muhamedashraf04/ECommerceWeb?style=social)
![GitHub issues](https://img.shields.io/github/issues/muhamedashraf04/ECommerceWeb)
![GitHub license](https://img.shields.io/github/license/muhamedashraf04/ECommerceWeb)

# ECommerceWeb

ECommerceWeb is a full-stack e-commerce web application built with C#, ASP.NET Core, Entity Framework Core, and React (Vite). It provides browsing, shopping cart management, order processing, and a vendor management panel.

## Demo

Check out the live application here: [ECommerceWeb Live Demo](https://nile-store-swe.vercel.app/)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Docker Support](#docker-support)
- [License](#license)

## Features

- **User Authentication:** Registration and JWT Login for Customers & Vendors
- **Browse Products:** Category filtering, product search, and vendor items
- **Shopping Cart:** Real-time cart calculation and item management
- **Order Management:** Secure checkout, vendor order acceptance/rejection, and status tracking
- **Vendor Panel:** Product management and order management
- **Responsive Design:** Desktop & Mobile responsive UI

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | C#, ASP.NET Core 9, Entity Framework Core, SQL Server |
| Frontend | React 18, Vite, React Router v6, Axios |
| Containerization | Docker, Docker Compose, Nginx Alpine |
| CI/CD | GitHub Actions |
| Version Control | Git & GitHub |

## Getting Started

### Prerequisites

- Git
- .NET 9 SDK (or later)
- Node.js (v20+) & npm
- SQL Server (or LocalDB / In-Memory for testing)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/muhamedashraf04/ECommerceWeb.git
   cd ECommerceWeb
   ```

2. **Configure environment variables:**
   Copy `backend.env.example` to `backend.env` and update your database connection string and secret key:
   ```bash
   cp backend.env.example backend.env
   ```

3. **Run Backend API:**
   ```bash
   dotnet run --project Backend/ECommerceWeb/ECommerceWeb.csproj
   ```
   The API will start at `http://localhost:5193`.

4. **Run Frontend App:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

## Docker Support

Run the entire application (Backend API + Frontend Nginx) using Docker Compose:

```bash
docker compose up --build
```
- Frontend will be accessible at `http://localhost:5173`
- Backend API will be accessible at `http://localhost:5193`
