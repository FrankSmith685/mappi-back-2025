import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST, // ej: 'smtp.gmail.com'
    port: Number(process.env.EMAIL_PORT), // ej: 465
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"starmobiliario" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
