const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
// Changement important : utiliser node-fetch ou axios au lieu de fetch natif
const fetch = require('node-fetch'); // ou const axios = require('axios');
const SupportRequest = require('../models/SupportRequest');

router.post('/', async (req, res) => {
  console.log('=== DÉBUT TRAITEMENT SUPPORT REQUEST ===');
  console.log('Body reçu:', req.body);
  
  try {
    const { fullname, email, subject, message, website, timestamp, 'g-recaptcha-response': token } = req.body;
    
    console.log('Données extraites:', {
      fullname: fullname ? 'OK' : 'MANQUANT',
      email: email ? 'OK' : 'MANQUANT',
      subject: subject ? 'OK' : 'MANQUANT',
      message: message ? 'OK' : 'MANQUANT',
      website: website || 'vide',
      timestamp: timestamp || 'non fourni',
      token: token ? 'OK' : 'MANQUANT'
    });

    // Honeypot anti-spam
    if (website) {
      console.log('SPAM DÉTECTÉ - honeypot:', website);
      return res.status(400).json({ error: 'Spam détecté (honeypot).' });
    }

    // Vérification des champs requis
    if (!fullname || !email || !subject || !message) {
      console.log('CHAMPS MANQUANTS');
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Vérif reCAPTCHA
    if (!token) {
      console.log('TOKEN RECAPTCHA MANQUANT');
      return res.status(400).json({ error: 'reCAPTCHA manquant.' });
    }

    console.log('Vérification reCAPTCHA...');
    console.log('RECAPTCHA_SECRET existe:', !!process.env.RECAPTCHA_SECRET);
    
    try {
      const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
      });
      
      console.log('Réponse reCAPTCHA status:', recaptchaRes.status);
      
      if (!recaptchaRes.ok) {
        throw new Error(`HTTP error! status: ${recaptchaRes.status}`);
      }
      
      const recaptchaData = await recaptchaRes.json();
      console.log('Données reCAPTCHA:', recaptchaData);
      
      if (!recaptchaData.success) {
        console.log('ÉCHEC RECAPTCHA:', recaptchaData['error-codes']);
        return res.status(400).json({ error: 'Échec de la vérification reCAPTCHA.' });
      }
      
      console.log('reCAPTCHA VALIDÉ');
    } catch (recaptchaError) {
      console.error('ERREUR RECAPTCHA:', recaptchaError);
      return res.status(500).json({ error: 'Erreur lors de la vérification reCAPTCHA.' });
    }

    // Anti-envoi trop rapide
    if (timestamp && Date.now() - parseInt(timestamp) < 1000) {
      console.log('ENVOI TROP RAPIDE:', Date.now() - parseInt(timestamp), 'ms');
      return res.status(400).json({ error: 'Envoi trop rapide détecté.' });
    }

    // Enregistre dans la base (optionnel - peut être commenté si problème BDD)
    console.log('Tentative d\'enregistrement en base...');
    try {
      const newRequest = new SupportRequest({ fullname, email, subject, message });
      await newRequest.save();
      console.log('ENREGISTREMENT BDD RÉUSSI');
    } catch (dbError) {
      console.error('ERREUR BDD:', dbError);
      // Continue même si l'enregistrement échoue
    }

    // Envoi d'e-mail
    console.log('Tentative d\'envoi d\'email...');
    console.log('Config email:', {
      MAIL_USER: process.env.MAIL_USER ? 'OK' : 'MANQUANT',
      MAIL_PASS: process.env.MAIL_PASS ? 'OK' : 'MANQUANT',
      MAIL_RECEIVER: process.env.MAIL_RECEIVER ? 'OK' : 'MANQUANT'
    });
    
    try {
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
      console.log('EMAIL ENVOYÉ AVEC SUCCÈS');
    } catch (mailError) {
      console.error('ERREUR EMAIL:', mailError);
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'e-mail.' });
    }

    console.log('SUCCÈS COMPLET - Envoi réponse');
    res.status(200).json({ message: 'Votre demande a été envoyée avec succès.' });

  } catch (error) {
    console.error('ERREUR GÉNÉRALE:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
  
  console.log('=== FIN TRAITEMENT SUPPORT REQUEST ===');
});

module.exports = router;