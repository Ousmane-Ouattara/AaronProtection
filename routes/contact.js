const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
require('dotenv').config();

router.post('/', async (req, res) => {
  const { lastname, firstname, phone, email, location, details } = req.body;

  try {
    // Save to MongoDB
    const newContact = new Contact({ lastname, firstname, phone, email, location, details });
    await newContact.save();

    // Email config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    // Notification email for admin
    const notificationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_RECEIVER,
      subject: 'New Protection Request',
      text: `
📩 New request received:

👤 Last name: ${lastname}
👤 First name: ${firstname}
📞 Phone: ${phone}
📧 Email: ${email}
📍 Location: ${location}

📝 Details:
${details}
      `
    };

    // Confirmation email for client
    const confirmationMail = {
      from: `"Aaron Protection" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your Request Confirmation - Aaron Protection',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #1a1a1a;">Hello ${firstname},</h2>
          <p>Your request has been successfully received by <strong>Aaron Protection</strong>.</p>
          <p>We will carefully review your request and get back to you shortly by phone or email.</p>

          <h3 style="margin-top: 20px;">📄 Summary of your request:</h3>
          <ul>
            <li><strong>Last name:</strong> ${lastname}</li>
            <li><strong>First name:</strong> ${firstname}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Location:</strong> ${location}</li>
            <li><strong>Details:</strong> ${details}</li>
          </ul>

          <p style="margin-top: 30px;">Thank you for your trust.<br>The <strong>Aaron Protection</strong> team.</p>
        </div>
      `
    };

    await transporter.sendMail(notificationMail);
    await transporter.sendMail(confirmationMail);

    res.status(200).json({ message: 'Request saved and emails sent.' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while saving or sending email.' });
  }
});

module.exports = router;
