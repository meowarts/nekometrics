var config = {};

config.server = {};

/******************************************************************************
 * CORE
 *****************************************************************************/

config.app = {};
config.app.url = process.env.NEXT_PUBLIC_APP_URL;
config.app.analytics = process.env.NEXT_PUBLIC_APP_ANALYTICS;

/******************************************************************************
 * MONGO DB
 *****************************************************************************/

config.db = {};
config.db.url = process.env.DATABASE_URL;
config.db.database = process.env.DATABASE_NAME;

/******************************************************************************
 * SERVICES
 *****************************************************************************/

config.services = {};
config.services.google = {};
config.services.google.client_id = process.env.GOOGLE_CLIENT_ID;
config.services.google.client_secret = process.env.GOOGLE_CLIENT_SECRET;

config.services.facebook = {};
config.services.facebook.client_id = process.env.FACEBOOK_CLIENT_ID;
config.services.facebook.client_secret = process.env.FACEBOOK_CLIENT_SECRET;

config.services.mailchimp = {};
config.services.mailchimp.client_id = process.env.MAILCHIMP_CLIENT_ID;
config.services.mailchimp.client_secret = process.env.MAILCHIMP_CLIENT_SECRET;

// Must use the Consumer Keys and not the Authentication Tokens
config.services.twitter = {};
config.services.twitter.client_id = process.env.TWITTER_CLIENT_ID;
config.services.twitter.client_secret = process.env.TWITTER_CLIENT_SECRET;

/******************************************************************************
 * MAILGUN
 *****************************************************************************/

config.email = {};
config.email.host = process.env.EMAIL_SERVER_HOST;
config.email.user = process.env.EMAIL_SERVER_USER;
config.email.password = process.env.EMAIL_SERVER_PASSWORD;
config.email.from = process.env.EMAIL_FROM;

config.email.welcome = {
	subject: 'Welcome to Nekometrics :)',
	body: `
		Hello,
		
		<p>Welcome to Nekometrics. A password was generated for you. Please access <a href="${config.app.url}">Nekometrics</a> and modify it. Here it is:</p>

		<p style="text-align: center; font-size: 32px;">{password}</p>
		
		<p>Onced logged in, you will be able to create your first dashboard. Connect to the services you would like to use (Google Analytics, Instagran , etc), and then add and organize your widgets on that dashboard. And most importantly, enjoy the process :)</p>
		
		<p>Thank you!<br />Nekometrics.</p>
	`
};

config.email.passwordReset = {
	subject: 'Password reset',
	body: `
		Hello,
		
		<p>A new password was generated for you. Please access <a href="${config.app.url}">Nekometrics</a> and modify it, if you like. Here it is:</p>

		<p style="text-align: center; font-size: 32px;">{password}</p>
		
		<p>Thank you!<br />Nekometrics.</p>
	`
};

module.exports = config;