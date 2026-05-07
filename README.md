# FoodHaven Restaurant Demo

A MERN stack restaurant website for FoodHaven with customer ordering, authentication, menu management, and a functional admin dashboard.

## Setup

### Backend
1. Open a terminal in `backend`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Update `MONGO_URI` and `JWT_SECRET` as needed
5. Run `npm run dev`

### Frontend
1. Open a terminal in `frontend`
2. Run `npm install`
3. Run `npm run dev`

### Open in browser
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Admin panel

1. Register a user with email and password
2. In MongoDB, update that user record and set `role: "admin"`
3. Log in with the admin account
4. Click `Admin` in the top navigation

The admin dashboard now includes:
- Menu management: add, edit, delete items
- Image upload for menu items (local file upload)
- Order management: view orders, update status, and manage payment status
- User list: review registered users

## How to manage the backend

- `backend/server.js` starts the API and connects MongoDB
- `backend/routes/auth.js` handles login/register
- `backend/routes/menu.js` handles item CRUD
- `backend/routes/orders.js` handles order creation and status updates
- `backend/routes/admin.js` provides admin statistics and listings

## How to manage the admin panel

Use the admin section in the frontend to:
- add new dishes with title, category, price, description, image URL, and availability
- edit existing menu items
- delete outdated menu items
- view all orders and update each order's status
- review registered users

## Notes
- The frontend proxies API calls to `http://localhost:5000`
- Make sure MongoDB is running locally or use an Atlas URI
- If you want image upload rather than URL links, I can add file upload support next
