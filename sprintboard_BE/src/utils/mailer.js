const nodemailer = require('nodemailer');
const logger = require('./logger');

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
    return transporter;
  }

  // Free local/dev mode: logs the email instead of sending it.
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailer = createTransporter();
  const info = await mailer.sendMail({
    from: process.env.MAIL_FROM || 'SprintBoard <no-reply@sprintboard.local>',
    to,
    subject,
    text,
    html,
  });

  if (!process.env.SMTP_HOST && info.message) {
    logger.info('Email generated in local mode', {
      to,
      subject,
      message: info.message.toString(),
    });
  }

  return info;
};

const sendWelcomeEmail = async ({ to, name, organizationName }) => {
  return sendMail({
    to,
    subject: 'Welcome to SprintBoard',
    text: `Hi ${name}, welcome to SprintBoard. Your organization ${organizationName} is ready.`,
    html: `<p>Hi ${name},</p><p>Welcome to SprintBoard. Your organization <strong>${organizationName}</strong> is ready.</p>`,
  });
};

const sendIssueAssignedEmail = async ({ to, assigneeName, issueTitle }) => {
  return sendMail({
    to,
    subject: `Issue assigned: ${issueTitle}`,
    text: `Hi ${assigneeName}, an issue was assigned to you: ${issueTitle}`,
    html: `<p>Hi ${assigneeName},</p><p>An issue was assigned to you: <strong>${issueTitle}</strong></p>`,
  });
};

module.exports = { sendMail, sendWelcomeEmail, sendIssueAssignedEmail };
