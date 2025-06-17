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

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou votre service email
  auth: {
    user: process.env.EMAIL_USER, // votre email
    pass: process.env.EMAIL_PASS  // mot de passe d'application
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
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
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

    try {
      // Envoyer l'email de notification
      await transporter.sendMail(mailOptions);
      console.log('Email de notification envoyé');

      // Envoyer l'email de confirmation au client
      await transporter.sendMail(clientMailOptions);
      console.log('Email de confirmation envoyé au client');
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    // Réponse de succès
    res.status(200).json({ 
      success: true, 
      message: 'Contact enregistré avec succès',
      id: newContact._id
    });

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      details: error.message
    });
  }
});

module.exports = router;