# Sake Vienna - Next.js Restaurant Website

Modern restaurant website for **Sake** in Vienna, built with **Next.js App Router** and **Tailwind CSS**.

## Features

- Dark, elegant premium design with large hero layout
- Pages: Home, Menu, Order online, Contact, Reservation
- Digital menu with categories and dish images
- Bestseller and new dishes sections
- Order form (pickup or delivery)
- Contact and reservation forms
- Email submission API (no payment flow)
- English/German language switch (client-side)
- Responsive design

## Setup

1. Install Node.js (v20+ recommended)
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example` and fill SMTP values
4. Start dev server:
   - `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Email API

Forms submit to:

- `POST /api/order`
- `POST /api/contact`
- `POST /api/reservation`

Each route uses `nodemailer` with SMTP credentials from `.env`.
