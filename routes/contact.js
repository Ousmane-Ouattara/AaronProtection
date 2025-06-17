const express = require('express');
const router = express.Router();
const axios = require('axios'); // Pour vérifier reCAPTCHA

// Schema mongoose pour sauvegarder les contacts (optionnel)
const mongoose = require('mongoose');
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
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY; // Ajoutez cette variable d'environnement
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
    } else {
      console.warn('RECAPTCHA_SECRET_KEY non définie, vérification ignorée');
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