const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require("helmet");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => console.error('❌ Erreur MongoDB :', err));

// Routes
const contactRoute = require('./routes/contact');
const supportRoute = require('./routes/support');

app.use('/api/contact', contactRoute);  // pour le formulaire de contact
app.use('/api/support', supportRoute);  // pour le support technique

// Sert les fichiers statiques (optionnel si tu n’as pas besoin de servir de HTML depuis backend)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});


