import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';
import env from '../config/env';
import logger from '../config/logger';

// Create transporter
const createTransporter = () => {
  // If email config is not set, use ethereal (fake SMTP for testing)
  if (!env.EMAIL_HOST || !env.EMAIL_USER) {
    logger.warn('Email configuration not set. Using Ethereal for testing.');
    return null;
  }

  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

/**
 * Send email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // If no transporter, create ethereal account for testing
    let transport = transporter;

    if (!transport) {
      const testAccount = await nodemailer.createTestAccount();
      transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: env.EMAIL_FROM || 'LIMONCG <noreply@limoncg.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transport.sendMail(mailOptions);

    if (!transporter) {
      logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    logger.info('Email sent to %s', options.to);
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Welcome to LIMONCG!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}"
           style="background-color: #1976d2; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666;">Or copy and paste this URL into your browser:</p>
      <p style="color: #1976d2; word-break: break-all;">${verifyUrl}</p>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">
        If you didn't create an account, please ignore this email.
      </p>
    </div>
  `;

  const text = `
    Welcome to LIMONCG!

    Thank you for registering. Please verify your email address by visiting:
    ${verifyUrl}

    If you didn't create an account, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - LIMONCG',
    html,
    text,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="background-color: #1976d2; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666;">Or copy and paste this URL into your browser:</p>
      <p style="color: #1976d2; word-break: break-all;">${resetUrl}</p>
      <p style="color: #d32f2f; font-weight: bold;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">
        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </p>
    </div>
  `;

  const text = `
    Password Reset Request

    You requested to reset your password. Visit this URL to proceed:
    ${resetUrl}

    This link will expire in 1 hour.

    If you didn't request a password reset, please ignore this email.
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - LIMONCG',
    html,
    text,
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">Welcome to LIMONCG, ${fullName}!</h2>
      <p>Your email has been verified successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>Take free placement tests to assess your level</li>
        <li>Access demo exams to get familiar with the format</li>
        <li>Purchase credits to unlock premium exams</li>
        <li>Track your progress with detailed analytics</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${env.FRONTEND_URL}/dashboard"
           style="background-color: #1976d2; color: white; padding: 12px 30px;
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      <p style="color: #666;">Happy learning!</p>
    </div>
  `;

  const text = `
    Welcome to LIMONCG, ${fullName}!

    Your email has been verified successfully.

    Visit your dashboard: ${env.FRONTEND_URL}/dashboard

    Happy learning!
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to LIMONCG!',
    html,
    text,
  });
};
