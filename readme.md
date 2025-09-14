# Nekometrics

Nekometrics is an OpenSource project that allows you to centralize all your metrics and KPIs in one place, with pretty but powerful dashboards.

## Prerequisites

- Node.js (20+)
- pnpm (package manager)
- MongoDB: A MongoDB instance must be running and accessible
- SMTP Email Service: An SMTP service (e.g., Mailgun) for sending emails

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/meowarts/nekometrics.git
cd nekometrics
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration values.

### 4. Start the development server

```bash
pnpm dev
```

The application will run on port 4002 by default.

## Deployment

### Docker Deployment

Nekometrics includes a Dockerfile for containerized deployment:

```bash
docker build -t nekometrics .
docker run -p 3000:3000 --env-file .env.production nekometrics
```

### Deployment on Coolify

Nekometrics is ready for deployment on [Coolify](https://coolify.io/), a self-hosted platform for deploying applications.

#### Prerequisites

- Coolify instance running
- GitHub repository connected to Coolify
- MongoDB database accessible from your Coolify server
- OAuth applications configured (Google, Facebook, Twitter, Mailchimp)

#### Configuration Steps

1. **Create New Application in Coolify**
   - Select your Git repository
   - Choose "Docker" as the build pack
   - Set port to 3000

2. **Configure Environment Variables**

   Add these environment variables in Coolify's Environment Variables section:

   **Core Configuration:**
   ```env
   NODE_ENV=production
   PORT=3000
   NEXT_TELEMETRY_DISABLED=1
   SECRET=your-secret-key-here
   ```

   **Application URLs (IMPORTANT: Required at build time):**
   ```env
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_APP_ANALYTICS=your-analytics-id
   ```

   **Database Configuration:**
   ```env
   DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   DATABASE_NAME=nekometrics
   ```

   **Email Configuration:**
   ```env
   EMAIL_SERVER_HOST=smtp.mailgun.org
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@yourdomain.com
   EMAIL_SERVER_PASSWORD=your-email-password
   EMAIL_FROM=Nekometrics <noreply@yourdomain.com>
   ```

   **OAuth Credentials:**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Facebook OAuth
   FACEBOOK_CLIENT_ID=your-facebook-client-id
   FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

   # Mailchimp OAuth
   MAILCHIMP_CLIENT_ID=your-mailchimp-client-id
   MAILCHIMP_CLIENT_SECRET=your-mailchimp-client-secret

   # Twitter OAuth
   TWITTER_CLIENT_ID=your-twitter-client-id
   TWITTER_CLIENT_SECRET=your-twitter-client-secret
   ```

3. **Important Notes**
   - `NEXT_PUBLIC_*` variables must be set before deployment as they're embedded during build
   - Ensure MongoDB is accessible from your Coolify server (whitelist IPs if using MongoDB Atlas)
   - Update OAuth redirect URIs to match your domain after deployment

4. **Deploy**
   - Click Deploy in Coolify
   - The health check endpoint `/api/health` will be automatically monitored

#### Post-Deployment

1. **Update OAuth Redirect URIs** for each service:
   - Google: `https://your-domain.com/oauth/google`
   - Facebook: `https://your-domain.com/oauth/facebook`
   - Twitter: `https://your-domain.com/oauth/twitter`
   - Mailchimp: `https://your-domain.com/oauth/mailchimp`

2. **Verify Deployment**
   - Check health: `https://your-domain.com/api/health`
   - Test login functionality
   - Verify OAuth connections

## Services Configuration

### Google Analytics

#### 1. Enable Google Analytics Admin API

1. Go to the Google Cloud Console
2. Navigate to "Library" section
3. Search for "Google Analytics Admin API"
4. Enable it for your project

#### 2. Create OAuth 2.0 Client ID

1. In Google Cloud Console, go to "Credentials"
2. Click "+ Create Credentials" → "OAuth 2.0 Client ID"
3. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:4002` (for development)
   - Authorized redirect URIs: `http://localhost:4002/oauth/google`
4. Save the Client ID and Client Secret

#### 3. Configure Environment Variables

```bash
GOOGLE_CLIENT_ID={Client ID}
GOOGLE_CLIENT_SECRET={Client Secret}
```

### Facebook & Instagram

#### 1. Create Facebook App

1. Go to [Facebook Apps](https://developers.facebook.com/apps/)
2. Create new app:
   - Use cases: Other
   - App Types: Business

#### 2. Configure Environment Variables

```bash
FACEBOOK_CLIENT_ID={App ID}
FACEBOOK_CLIENT_SECRET={App secret}
```

**Note:** Business verification may be required for accessing pages and Instagram profiles.

### X (Twitter)

#### 1. Create Twitter App

1. Go to [Developer Portal](https://developer.x.com/en/portal/dashboard)
2. Create new app with "Add App"
3. Copy API Key and API Key Secret

#### 2. Configure User Authentication

1. In App Settings, set up "User authentication settings":
   - App permission: Read
   - Type of App: Web App, Automated App or Bot
   - Callback URI: `http://localhost:4002/oauth/twitter`

#### 3. Configure Environment Variables

```bash
TWITTER_CLIENT_ID={API Key}
TWITTER_CLIENT_SECRET={API Key Secret}
```

### Mailchimp

Configure OAuth application in Mailchimp and set the credentials in environment variables.

### WooCommerce

Configure REST API credentials for your WooCommerce store.

### Easy Digital Downloads (EDD)

Configure API credentials for your EDD-powered store.

## Architecture

- **Frontend**: Next.js with Material-UI
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Authentication**: Custom JWT-based authentication
- **Widget System**: Modular widget architecture for different metrics sources
- **Caching**: Built-in caching layer for API responses

## Development

### Available Scripts

```bash
pnpm dev          # Development server (port 4002)
pnpm build        # Build for production
pnpm start        # Start production server (port 3000)
pnpm analyze      # Analyze bundle size
```

### Project Structure

```
nekometrics/
├── components/       # React components
├── libs/            # Utility libraries and services
├── pages/           # Next.js pages and API routes
├── public/          # Static assets
└── styles/          # Global styles
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).