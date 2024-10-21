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

#### 1. Create a new app

If you have already an app, skip to 2.

1. Go to the [Developer Portal](https://developer.x.com/en/portal/dashboard).
2. Create a new app from the "+Add App."
3. Set the "App name" you would like.
4. Copy "API Key" and "API Key Secret". Use these keys after.
5. Go to "App Settings"

#### 2. Set up the User authentication settings

1. Click "Set up" in your App Settings's "User authentication settings" section. If you have already set up, click "Edit."
2. Configure with the following settings:
   - App permission: Read
   - Type of App: Web App, Automated App or Bot
   - App info
     - Callback URI / Redirect URL: `http://localhost:4002/oauth/twitter`
     - Website URL: any

#### 3. Configure Environment Variables

Set the Consumer Keys, "API Key" and "API Key Secret" obtained in step 1, to "TWITTER_CLIENT_ID" and "TWITTER_CLIENT_SECRET" respectively in the `.env.local` file.

```bash
TWITTER_CLIENT_ID={API Key}
TWITTER_CLIENT_SECRET={API Key Secret}
```

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

### Facebook & Instagram

#### 1. Create a new app

1. Go to the [Apps page](https://developers.facebook.com/apps/).
2. Create a new app from the "Create App" button.
3. In a creating flow, select the below:
   - Use cases: Other
   - App Types: Business

#### 2. Configure Environment Variables

Once you create the app, you'll see the "App ID" and "App secret" on the basic page of the app settings. Set these values to "FACEBOOK_CLIENT_ID" and "FACEBOOK_CLIENT_SECRET" respectively in the `.env.local` file.

```bash
FACEBOOK_CLIENT_ID={App ID}
FACEBOOK_CLIENT_SECRET={App secret}
```

#### Note

If your pages and your Instagram account didn't show in the data source (like `Facebook (0 page, 0 instagram profile)` ), you might need Business verification. Check the Verifications section in your App settings' basic page and follow the steps on that page.
