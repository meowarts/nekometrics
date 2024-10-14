# Nekometrics

Nekometrics is an OpenSource project that allows you to centralize all your metrics and KPIs in one place, with pretty but powerful dashboards.

## Prerequisites

- Node.js (<= 16.20.2)
- Yarn (used for dependency management)
- MongoDB: A MongoDB instance must be running and accessible. Set the connection string in the `DATABASE_URL` environment variable.
- SMTP Email Service: An SMTP email service such as Mailgun is required for sending emails. Configure the email server settings in your env (e.g. `.env.local`) file:
  - `EMAIL_SERVER_HOST`
  - `EMAIL_SERVER_PORT`
  - `EMAIL_SERVER_USER`
  - `EMAIL_SERVER_PASSWORD`
  - `EMAIL_FROM`

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/nekometrics.git
cd nekometrics
```

### 2. Install dependencies

Since `yarn.lock` is present, use `yarn` to install all necessary dependencies.

```bash
yarn install
```

### 3. Set up environment variables

Create a env (here, `.env.local`) file in the root directory by copying `.env` and configuring the required values.

```bash
cp .env .env.local
```

Edit the env file with your environment configurations (e.g., MongoDB connection details, API keys).

### 4. Start the development server

To run the application in development mode on port 4002:

```bash
yarn dev
```

## Services

This section outlines the necessary steps to register and configure various services. Each service requires specific settings and credentials, which may vary based on your development or production environment.

The following instructions are tailored for development mode with the `.env.local` file. Please ensure to adjust any values (e.g., localhost) as necessary.

### MAILCHIMP

### Woocommerce

### X(Twitter)

### Instagram

### EDD

### YouTube

### Google

#### 1. Enable Google Analytics Admin API

1. Go to the Google Cloud Console.
2. Navigate to the "Library" section.
3. Search for "Google Analytics Admin API".
4. Click on the API and enable it for your project.

#### 2. Create OAuth 2.0 Client ID Credentials

1. In the Google Cloud Console, go to the "Credentials" section.
2. Click on "+ Create Credentials" and select "OAuth 2.0 Client ID".
3. Configure the OAuth client with the following settings:
   - Application type: Web application
   - Name: Input any name you prefer
   - Authorized JavaScript origins: `http://localhost:4002`
   - Authorized redirect URIs: `http://localhost:4002/oauth/google`
4. Click "Create" to generate the credentials.

#### 3. Configure Environment Variables

After creating the credentials, you'll see the "Client ID" and "Client Secret". Set these values to "GOOGLE_CLIENT_ID" and "GOOGLE_CLIENT_SECRET" respectively in the `.env.local` file.

```bash
GOOGLE_CLIENT_ID={Client ID}
GOOGLE_CLIENT_SECRET={Client Secret}
```

### Facebook
