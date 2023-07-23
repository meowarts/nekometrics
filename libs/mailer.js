const Fs = require('fs-extra');
const Nodemailer = require('nodemailer');
const CFG = require('~/config');

const mailer = Nodemailer.createTransport({
  host: CFG.email.host,
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: CFG.email.user,
    pass: CFG.email.password,
  },
});

async function sendMail(from, to, subject, html, subjectHead = '[Nekometrics] ') {
  try {
    if (from === 'noreply@nekometrics.com')
      from = 'Nekometrics <noreply@nekometrics.com>';
    await mailer.sendMail({ from: from, to: to, subject: subjectHead + subject, html: html });
    return true;
  }
  catch (err) {
    console.log("Error in sendMail.", err);
    return false;
  }
}

async function sendEmailToSupport(email, name, subject = "Empty subject", message = "Empty message") {
  if (!email || !name || !subject || !message) {
    throw new Error("The email, name, subject and message are all required.");
  }
  const to = 'support@nekometrics.com';
  const from = `${name} <${email}>`;
  return await sendMail(from, to, subject, message, '');
}

async function embedBody(title, html) {
  let tpl = Fs.readFileSync('./libs/mail.html', 'utf8');
  tpl = tpl.replace('{title}', title);
  tpl = tpl.replace('{body}', html);
  return tpl;
}

async function sendWelcomeWithPassword(email, password) {
  let from = CFG.email.from;
  let to = email;
  let subject = CFG.email.welcome.subject;
  let html = CFG.email.welcome.body.replace('{password}', password);
  let body = await embedBody(subject, html);
  sendMail(from, to, subject, body);
}

async function sendPasswordReset(email, password) {
  let from = CFG.email.from;
  let to = email;
  let subject = CFG.email.passwordReset.subject;
  let html = CFG.email.passwordReset.body.replace('{password}', password);
  let body = await embedBody(subject, html);
  sendMail(from, to, subject, body);
}

export {
  sendWelcomeWithPassword,
  sendPasswordReset,
  sendEmailToSupport
};
