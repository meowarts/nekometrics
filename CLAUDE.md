# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (runs on port 4002)
pnpm dev

# Build for production
pnpm build

# Start production server (port 4001)
pnpm start

# Stage server (port 4003)
pnpm start-stg

# Analyze bundle size
pnpm analyze
```

## Architecture Overview

Nekometrics is a Next.js application for centralizing metrics and KPIs in customizable dashboards. It integrates with multiple external services (Google Analytics, Facebook/Instagram, Twitter, Mailchimp, WooCommerce, EDD) to fetch and display metrics.

### Key Architectural Components

1. **Service Integration Layer** (`libs/services/`): Each external service has its own module handling OAuth authentication and data fetching. The `Services` class in `libs/services.js` acts as a central registry mapping widget types to their respective data fetching functions.

2. **Widget System**: 
   - **WidgetsFactory** (`components/widgets/WidgetsFactory.js`): Central component that renders widgets based on their type and handles refresh intervals, error states, and settings modals
   - **WidgetsRepository** (`components/widgets/WidgetsRepository.js`): Maps widget types to their components and settings
   - Each widget type has a component and corresponding settings component (e.g., `google/AnalyticsVisits.js` and `google/AnalyticsVisitsSettings.js`)

3. **API Structure**: Next.js API routes in `pages/api/` handle:
   - Dashboard CRUD operations (`dashboard/[dashId].js`)
   - Widget management (`widget/[widgetId].js`)
   - OAuth callbacks (`oauth/[service].js`)
   - Metrics fetching (`metrics/[widgetId].js`)
   - Background jobs (`job/refresh.js`, `job/cleanup.js`)

4. **Data Flow**:
   - Widgets fetch data via the `/api/metrics/[widgetId]` endpoint
   - The API uses the Services layer to fetch from external APIs
   - Data is cached in MongoDB with refresh intervals
   - Widgets auto-refresh at randomized intervals to avoid simultaneous requests

5. **Authentication**: Custom authentication system using MongoDB for user storage and bcrypt for password hashing. Session management through cookies.

## Environment Setup

Copy `.env` to `.env.local` and configure:
- MongoDB connection (`DATABASE_URL`)
- SMTP settings for email functionality
- OAuth credentials for each service (Google, Facebook, Twitter, Mailchimp)
- `SECRET` for session management

## Database

MongoDB collections:
- `User`: User accounts and authentication
- `Dashboard`: Dashboard configurations
- `Widget`: Widget instances with settings and cached data
- `Service`: Connected external services per user

## Development Notes

- Node.js version must be <= 16.20.2 (specified in package.json)
- Uses Material-UI v4 for UI components
- Styled-components for additional styling
- React Grid Layout for dashboard drag-and-drop functionality
- PM2 commands in package.json suggest production deployment uses PM2