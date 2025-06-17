const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
require('dotenv').config();

router.post('/', async (req, res) => {
  const { lastname, firstname, phone, email, location, details, website, timestamp, 'g-recaptcha-response': token } = req.body;

// 🛡 Anti-spam : honeypot
if (website) return res.status(400).json({ error: 'Spam détecté (honeypot).' });

// 🛡 Anti-bot : reCAPTCHA
if (!token) return res.status(400).json({ error: 'reCAPTCHA manquant.' });

const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
});
const recaptchaData = await recaptchaRes.json();
if (!recaptchaData.success) {
  return res.status(400).json({ error: 'Échec de la vérification reCAPTCHA.' });
}

// ⏱ Anti-abus : envoi trop rapide
if (Date.now() - parseInt(timestamp) < 1000) {
  return res.status(400).json({ error: 'Envoi trop rapide détecté.' });
}

  try {
    // Enregistrement en base MongoDB
    const newContact = new Contact({ lastname, firstname, phone, email, location, details });
    await newContact.save();

    // Transport mail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Mail de notification
    const notificationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: 'New Protection Request',
      text: `
📩 New request received:

👤 Last name: ${lastname}
👤 First name: ${firstname}
📞 Phone: ${phone}
📧 Email: ${email}
📍 Location: ${location}

📝 Details:
${details}
      `
    };

    // Mail de confirmation client
    const confirmationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Request Confirmation - Aaron Protection',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Hello ${firstname},</h2>
          <p>Your request has been successfully received by <strong>Aaron Protection</strong>.</p>
          <p>We will carefully review your request and get back to you shortly by phone or email.</p>

          <h3 style="margin-top: 20px;">📄 Summary of your request:</h3>
          <ul>
            <li><strong>Last name:</strong> ${lastname}</li>
            <li><strong>First name:</strong> ${firstname}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Details:</strong> ${details}</li>
          </ul>

          <p style="margin-top: 30px;">Thank you for your trust.<br>The <strong>Aaron Protection</strong> team.</p>
        </div>
      `
    };

    await transporter.sendMail(notificationMail);
    await transporter.sendMail(confirmationMail);

    res.status(200).json({ message: 'Request saved and emails sent.' });

  } catch (error) {
    console.error('❌ Erreur dans contact.js:', error);
    res.status(500).json({ error: 'An error occurred while saving or sending email.' });
  }
});

module.exports = router;
