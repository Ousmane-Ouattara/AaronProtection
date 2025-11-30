const express = require('express');
const router = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const Contact = require('../models/Contact'); // IMPORTANT : Utiliser le modèle existant

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('=== DÉBUT TRAITEMENT CONTACT ===');
    console.log('Données reçues:', req.body);
    
    const { lastname, firstname, phone, email, location, details, recaptcha } = req.body;

    // Vérification des champs requis
    if (!lastname || !firstname || !phone || !email || !location || !details) {
      console.log('CHAMPS MANQUANTS');
      return res.status(400).json({ 
        error: 'Tous les champs sont requis'
      });
    }

    // Vérification reCAPTCHA
    if (!recaptcha) {
      console.log('RECAPTCHA MANQUANT');
      return res.status(400).json({ error: 'reCAPTCHA manquant' });
    }

    // Vérifier reCAPTCHA avec Google
    const recaptchaSecret = process.env.RECAPTCHA_SECRET;
    if (recaptchaSecret) {
      try {
        const recaptchaResponse = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          {
            params: {
              secret: recaptchaSecret,
              response: recaptcha
            }
          }
        );

        if (!recaptchaResponse.data.success) {
          console.log('RECAPTCHA INVALIDE');
          return res.status(400).json({ 
            error: 'reCAPTCHA invalide'
          });
        }
        console.log('RECAPTCHA VALIDÉ');
      } catch (recaptchaError) {
        console.error('Erreur vérification reCAPTCHA:', recaptchaError);
        return res.status(500).json({ error: 'Erreur de vérification reCAPTCHA' });
      }
    }

    // Sauvegarder en base de données
    console.log('Enregistrement en base...');
    const newContact = new Contact({
      lastname: lastname.trim(),
      firstname: firstname.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      location: location.trim(),
      details: details.trim()
    });

    await newContact.save();
    console.log('Contact sauvegardé:', newContact._id);

    // Vérifier la config email
    console.log('Config email:', {
      MAIL_USER: process.env.MAIL_USER ? 'OK' : 'MANQUANT',
      MAIL_PASS: process.env.MAIL_PASS ? 'OK' : 'MANQUANT',
      MAIL_RECEIVER: process.env.MAIL_RECEIVER ? 'OK' : 'MANQUANT'
    });

    // Envoi d'email de notification
    const emailSubject = `Nouvelle demande de renseignement - ${firstname} ${lastname}`;
    const emailContent = `
      <h2>Nouvelle demande de renseignement</h2>
      <p><strong>Nom :</strong> ${lastname}</p>
      <p><strong>Prénom :</strong> ${firstname}</p>
      <p><strong>Téléphone :</strong> ${phone}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Lieu :</strong> ${location}</p>
      <p><strong>Détails :</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
        ${details.replace(/\n/g, '<br>')}
      </div>
      <p><strong>Date de la demande :</strong> ${new Date().toLocaleString('fr-FR')}</p>
    `;

    // Email à vous (notification)
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_RECEIVER || process.env.MAIL_USER,
      subject: emailSubject,
      html: emailContent
    };

    // Email de confirmation au client
    const clientMailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: 'Confirmation de votre demande - Aaron Protection',
      html: `
        <h2>Confirmation de réception</h2>
        <p>Bonjour ${firstname},</p>
        <p>Nous avons bien reçu votre demande de renseignement.</p>
        <p><strong>Résumé de votre demande :</strong></p>
        <ul>
          <li><strong>Lieu :</strong> ${location}</li>
          <li><strong>Détails :</strong> ${details}</li>
        </ul>
        <p>Notre équipe reviendra vers vous dans les plus brefs délais par téléphone (${phone}) ou par email.</p>
        <p>Cordialement,<br>L'équipe Aaron Protection</p>
      `
    };

    try {
      console.log('Envoi email de notification...');
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de notification envoyé');

      console.log('Envoi email de confirmation...');
      await transporter.sendMail(clientMailOptions);
      console.log('✅ Email de confirmation envoyé au client');
    } catch (emailError) {
      console.error('❌ ERREUR EMAIL:', emailError);
      console.error('Détails:', emailError.message);
      // Retourner une erreur si l'email échoue
      return res.status(500).json({ 
        error: 'Erreur lors de l\'envoi de l\'e-mail',
        details: emailError.message
      });
    }

    console.log('=== SUCCÈS COMPLET ===');
    res.status(200).json({ 
      success: true, 
      message: 'Contact enregistré avec succès'
    });

  } catch (error) {
    console.error('ERREUR GÉNÉRALE:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

module.exports = router;