const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const SupportRequest = require('../models/SupportRequest');

router.post('/', async (req, res) => {
  const { fullname, email, subject, message, website, timestamp, 'g-recaptcha-response': token } = req.body;

// Honeypot anti-spam
if (website) return res.status(400).json({ error: 'Spam détecté (honeypot).' });

// Vérif reCAPTCHA
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

// Anti-envoi trop rapide
if (Date.now() - parseInt(timestamp) < 1000) {
  return res.status(400).json({ error: 'Envoi trop rapide détecté.' });
}

  if (!fullname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    // Enregistre dans la base
    const newRequest = new SupportRequest({ fullname, email, subject, message });
    await newRequest.save();

    // Envoi d'e-mail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Support Technique" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: `[Support] ${subject}`,
      text: `Demande reçue de ${fullname} (${email}) :\n\n${message}`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Your request has been successfully sent.' });

  } catch (error) {
    console.error('Erreur lors de l’envoi de l’e-mail :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;
