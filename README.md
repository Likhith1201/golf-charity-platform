# Digital Heroes Charity Golf Platform ⛳

A full-stack Next.js application built to manage charity golf tournaments, user subscriptions, and global leaderboards.

## Core Features
* **Secure Authentication:** Protected user login, registration, and session management.
* **Subscription Engine:** Tiered Stripe integration (Monthly/Yearly) with secure checkout and self-serve billing portals.
* **Dynamic Leaderboard:** Real-time global ranking calculated using a rolling 5-score Stableford algorithm.
* **Admin Dashboard:** A role-based, secure financial hub for platform management, charity allocation, and prize pool distribution.
* **Asynchronous Webhooks:** Cryptographic verification for real-time database updates upon payment success.

## Tech Stack
* **Framework:** Next.js (App Router)
* **Database:** PostgreSQL (Hosted on Neon)
* **ORM:** Prisma
* **Payments:** Stripe
* **Authentication:** NextAuth.js

## Developer
Developed by Pullela Likhith.