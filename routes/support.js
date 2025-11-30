const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const https = require('https');
const querystring = require('querystring');
const SupportRequest = require('../models/SupportRequest');

// Fonction pour faire la vérification reCAPTCHA sans node-fetch
function verifyRecaptcha(token, secret) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      secret: secret,
      response: token
    });

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

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
      const recaptchaData = await verifyRecaptcha(token, process.env.RECAPTCHA_SECRET);
      console.log('Données reCAPTCHA:', recaptchaData);
      
      if (!recaptchaData.success) {
        console.log('ÉCHEC RECAPTCHA:', recaptchaData['error-codes']);
        return res.status(400).json({ error: 'Échec de la vérification reCAPTCHA.' });
      }
      
      console.log('✅ reCAPTCHA VALIDÉ');
    } catch (recaptchaError) {
      console.error('ERREUR RECAPTCHA:', recaptchaError);
      return res.status(500).json({ error: 'Erreur lors de la vérification reCAPTCHA.' });
    }

    // Anti-envoi trop rapide
    if (timestamp && Date.now() - parseInt(timestamp) < 1000) {
      console.log('ENVOI TROP RAPIDE:', Date.now() - parseInt(timestamp), 'ms');
      return res.status(400).json({ error: 'Envoi trop rapide détecté.' });
    }

    // Enregistre dans la base
    console.log('Tentative d\'enregistrement en base...');
    try {
      const newRequest = new SupportRequest({ fullname, email, subject, message });
      await newRequest.save();
      console.log('✅ ENREGISTREMENT BDD RÉUSSI');
    } catch (dbError) {
      console.error('❌ ERREUR BDD:', dbError);
      // Continue même si l'enregistrement échoue
    }

    // === DIAGNOSTIC EMAIL DÉTAILLÉ ===
    console.log('\n=== DIAGNOSTIC EMAIL ===');
    console.log('Variables d\'environnement:');
    console.log('- MAIL_USER:', process.env.MAIL_USER || '❌ MANQUANT');
    console.log('- MAIL_PASS:', process.env.MAIL_PASS ? '✅ Présent (longueur: ' + process.env.MAIL_PASS.length + ')' : '❌ MANQUANT');
    console.log('- MAIL_RECEIVER:', process.env.MAIL_RECEIVER || '❌ MANQUANT');
    
    // Test de création du transporter
    console.log('\nCréation du transporter...');
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        },
        debug: true, // Active les logs détaillés
        logger: true // Active le logger
      });
      console.log('✅ Transporter créé');
    } catch (transporterError) {
      console.error('❌ ERREUR CRÉATION TRANSPORTER:', transporterError);
      return res.status(500).json({ 
        error: 'Erreur de configuration email',
        details: transporterError.message 
      });
    }

    // Test de vérification du transporter
    console.log('\nVérification de la connexion...');
    try {
      await transporter.verify();
      console.log('✅ Connexion email vérifiée');
    } catch (verifyError) {
      console.error('❌ ERREUR VÉRIFICATION:', verifyError);
      console.error('Code:', verifyError.code);
      console.error('Command:', verifyError.command);
      return res.status(500).json({ 
        error: 'Impossible de se connecter au serveur email',
        details: verifyError.message,
        code: verifyError.code
      });
    }

    // Préparation du mail
    console.log('\nPréparation du mail...');
    const mailOptions = {
      from: `"Support Technique" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: `[Support] ${subject}`,
      text: `Demande reçue de ${fullname} (${email}) :\n\n${message}`,
      html: `
        <h2>Nouvelle demande de support</h2>
        <p><strong>De:</strong> ${fullname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p><em>Date: ${new Date().toLocaleString('fr-FR')}</em></p>
      `
    };

    console.log('Options du mail:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    // Envoi du mail
    console.log('\n🚀 Envoi du mail...');
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
    } catch (mailError) {
      console.error('\n❌ ERREUR DÉTAILLÉE EMAIL:');
      console.error('Message:', mailError.message);
      console.error('Code:', mailError.code);
      console.error('Command:', mailError.command);
      console.error('Response:', mailError.response);
      console.error('ResponseCode:', mailError.responseCode);
      console.error('Stack:', mailError.stack);
      
      return res.status(500).json({ 
        error: 'Erreur lors de l\'envoi de l\'e-mail',
        details: mailError.message,
        code: mailError.code,
        response: mailError.response
      });
    }

    console.log('\n✅ SUCCÈS COMPLET - Envoi réponse');
    res.status(200).json({ message: 'Votre demande a été envoyée avec succès.' });

  } catch (error) {
    console.error('\n❌ ERREUR GÉNÉRALE:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: error.message 
    });
  }
  
  console.log('=== FIN TRAITEMENT SUPPORT REQUEST ===\n');
});

module.exports = router;