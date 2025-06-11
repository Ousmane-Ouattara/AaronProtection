const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => console.error('❌ Erreur MongoDB :', err));

// API routes
const contactRoute = require('./routes/contact');
app.use('/api', contactRoute);

// Sert tous les fichiers HTML, CSS, JS, etc. depuis la racine du projet
app.use(express.static(__dirname));

// Redirige '/' vers index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur en cours sur http://localhost:${PORT}`));


const supportRoute = require('./routes/support');
app.use('/api', supportRoute);
