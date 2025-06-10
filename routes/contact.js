const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/contact', async (req, res) => {
  const { lastname, firstname, phone, email, location, details } = req.body;

  try {
    // Enregistrement MongoDB
    const newContact = new Contact({ lastname, firstname, phone, email, location, details });
    await newContact.save();

    // Config email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Email pour toi
    const notificationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: 'Nouvelle demande de protection',
      text: `
📩 Nouvelle demande reçue :

👤 Nom : ${lastname}
👤 Prénom : ${firstname}
📞 Téléphone : ${phone}
📧 Email : ${email}
📍 Lieu : ${location}

📝 Détails :
${details}
      `
    };

    // Email de confirmation pour le client avec HTML
    const confirmationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Confirmation de votre demande - Aaron Protection',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Bonjour ${firstname},</h2>
          <p>Votre demande a bien été reçue par <strong>Aaron Protection</strong>.</p>
          <p>Nous l'étudierons avec attention et vous recontacterons prochainement par téléphone ou email.</p>

          <h3 style="margin-top: 20px;">📄 Résumé de votre demande :</h3>
          <ul>
            <li><strong>Nom :</strong> ${lastname}</li>
            <li><strong>Prénom :</strong> ${firstname}</li>
            <li><strong>Email :</strong> ${email}</li>
            <li><strong>Téléphone :</strong> ${phone}</li>
            <li><strong>Lieu :</strong> ${location}</li>
            <li><strong>Détails :</strong> ${details}</li>
          </ul>

          <p style="margin-top: 30px;">Merci pour votre confiance.<br>L'équipe <strong>Aaron Protection</strong>.</p>
        </div>
      `
    };

    await transporter.sendMail(notificationMail);
    await transporter.sendMail(confirmationMail);

    res.status(200).json({ message: 'Demande enregistrée et emails envoyés.' });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement ou de l\'envoi d\'email.' });
  }
});

module.exports = router;
