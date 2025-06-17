const express = require('express');
const router = express.Router();
const axios = require('axios'); // Pour vérifier reCAPTCHA
const nodemailer = require('nodemailer'); // Pour envoyer les emails
const mongoose = require('mongoose');

// Schema mongoose pour sauvegarder les contacts
const contactSchema = new mongoose.Schema({
  lastname: { type: String, required: true },
  firstname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Configuration du transporteur email avec plus d'options
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Options supplémentaires pour le debugging
  debug: true, // Active les logs détaillés
  logger: true // Active le logging
});

// Vérifier la configuration email au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration email:', error);
  } else {
    console.log('✅ Configuration email validée');
  }
});

// Route POST pour recevoir les contacts
router.post('/', async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    
    const { lastname, firstname, phone, email, location, details, recaptcha } = req.body;

    // Vérification des champs requis
    if (!lastname || !firstname || !phone || !email || !location || !details) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis',
        missing: {
          lastname: !lastname,
          firstname: !firstname,
          phone: !phone,
          email: !email,
          location: !location,
          details: !details
        }
      });
    }

    // Vérification reCAPTCHA
    if (!recaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA manquant' });
    }

    // Vérifier reCAPTCHA avec Google
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
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
          return res.status(400).json({ 
            error: 'reCAPTCHA invalide',
            details: recaptchaResponse.data['error-codes']
          });
        }
      } catch (recaptchaError) {
        console.error('Erreur vérification reCAPTCHA:', recaptchaError);
        return res.status(500).json({ error: 'Erreur de vérification reCAPTCHA' });
      }
    }

    // Sauvegarder en base de données
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

    // Vérification des variables d'environnement email
    console.log('🔍 Variables email:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Défini' : '❌ Manquant');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Défini' : '❌ Manquant');
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✅ Défini' : '❌ Utilise EMAIL_USER');

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
      <hr>
      <p><em>Cette demande a été envoyée depuis le formulaire de contact du site Aaron Protection.</em></p>
    `;

    // Email à vous (notification)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: emailSubject,
      html: emailContent
    };

    // Email de confirmation au client
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation of Your Request - Aaron Protection',
      html: `
        <h2>Request Confirmation</h2>
        <p>Hello ${firstname},</p>
        <p>We have successfully received your information request.</p>
        <p><strong>Summary of your request:</strong></p>
        <ul>
          <li><strong>Location:</strong> ${location}</li>
          <li><strong>Details:</strong> ${details}</li>
        </ul>
        <p>Our team will get back to you as soon as possible by phone (${phone}) or by email.</p>
        <p>Best regards,<br>The Aaron Protection Team</p>
        <hr>
        <p><em>This is an automated message. Please do not reply to this email.</em></p>
      `
    };

    let emailResults = {
      notification: { sent: false, error: null },
      confirmation: { sent: false, error: null }
    };

    try {
      // Envoyer l'email de notification
      console.log('📧 Tentative d\'envoi email notification vers:', adminEmail);
      const notificationResult = await transporter.sendMail(mailOptions);
      console.log('✅ Email de notification envoyé:', notificationResult.messageId);
      emailResults.notification.sent = true;
    } catch (emailError) {
      console.error('❌ Erreur envoi email notification:', emailError);
      emailResults.notification.error = emailError.message;
    }

    try {
      // Envoyer l'email de confirmation au client
      console.log('📧 Tentative d\'envoi email confirmation vers:', email);
      const confirmationResult = await transporter.sendMail(clientMailOptions);
      console.log('✅ Email de confirmation envoyé:', confirmationResult.messageId);
      emailResults.confirmation.sent = true;
    } catch (emailError) {
      console.error('❌ Erreur envoi email confirmation:', emailError);
      emailResults.confirmation.error = emailError.message;
    }

    // Réponse de succès avec statut des emails
    res.status(200).json({ 
      success: true, 
      message: 'Contact enregistré avec succès',
      id: newContact._id,
      emailStatus: emailResults
    });

  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

module.exports = router;