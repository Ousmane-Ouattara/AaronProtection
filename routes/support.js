const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const SupportRequest = require('../models/SupportRequest');

router.post('/', async (req, res) => {
  try {
    const { fullname, email, subject, message, website, timestamp, 'g-recaptcha-response': token } = req.body;

    // Honeypot anti-spam
    if (website) {
      return res.status(400).json({ error: 'Spam détecté (honeypot).' });
    }

    // Vérification des champs requis
    if (!fullname || !email || !subject || !message) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Vérif reCAPTCHA
    if (!token) {
      return res.status(400).json({ error: 'reCAPTCHA manquant.' });
    }

    try {
      const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
      });
      
      if (!recaptchaRes.ok) {
        throw new Error(`HTTP error! status: ${recaptchaRes.status}`);
      }
      
      const recaptchaData = await recaptchaRes.json();
      if (!recaptchaData.success) {
        return res.status(400).json({ error: 'Échec de la vérification reCAPTCHA.' });
      }
    } catch (recaptchaError) {
      console.error('Erreur reCAPTCHA:', recaptchaError);
      return res.status(500).json({ error: 'Erreur lors de la vérification reCAPTCHA.' });
    }

    // Anti-envoi trop rapide (vérifier que timestamp existe)
    if (timestamp && Date.now() - parseInt(timestamp) < 1000) {
      return res.status(400).json({ error: 'Envoi trop rapide détecté.' });
    }

    // Enregistre dans la base
    try {
      const newRequest = new SupportRequest({ fullname, email, subject, message });
      await newRequest.save();
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      // Continue même si l'enregistrement échoue
    }

    // Envoi d'e-mail
    try {
      const transporter = nodemailer.createTransporter({
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
    } catch (mailError) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', mailError);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail.' });
    }

    res.status(200).json({ message: 'Votre demande a été envoyée avec succès.' });

  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;