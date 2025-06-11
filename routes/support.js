const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Exemple simple avec fullname, email, subject, message
router.post('/support', async (req, res) => {
  const { fullname, email, subject, message } = req.body;

  if (!fullname || !email || !subject || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
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
