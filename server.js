const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", 
          "'unsafe-eval'",   
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "unpkg.com",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://www.recaptcha.net"
        ],
        scriptSrcAttr: ["'unsafe-inline'", "'unsafe-hashes'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "fonts.googleapis.com",
          "cdn.jsdelivr.net",
          "cdnjs.cloudflare.com",
          "https://www.gstatic.com"
        ],
        fontSrc: [
          "'self'",
          "fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://www.google.com",
          "https://www.gstatic.com",
          "https://a.tile.openstreetmap.org",
          "https://b.tile.openstreetmap.org",
          "https://c.tile.openstreetmap.org",
          "https://a.basemaps.cartocdn.com",
          "https://b.basemaps.cartocdn.com",
          "https://c.basemaps.cartocdn.com",
          "https://d.basemaps.cartocdn.com"
        ],
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "https://aaronprotection.onrender.com",
          "https://www.google.com",
          "https://www.recaptcha.net"
        ],
        frameSrc: [
          "https://www.google.com",
          "https://www.recaptcha.net"
        ],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB
mongoose.connect(process.env.MONGODB_URI, {
})
.then(() => console.log('✅ MongoDB connecté'))
.catch((err) => console.error('❌ Erreur MongoDB :', err));

// Routes
const contactRoute = require('./routes/contact');
const supportRoute = require('./routes/support');

app.use('/api/contact', contactRoute);
app.use('/api/support', supportRoute);

// Statique
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER ? 'Oui' : 'Non'}`);
  console.log(`🔐 reCAPTCHA configuré: ${process.env.RECAPTCHA_SECRET ? 'Oui' : 'Non'}`);


  app.use(cors({
  origin: ['http://localhost:3000', 'https://votre-domaine-frontend.com'], // Remplacez par vos domaines
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use('/api/support', require('./routes/support'));
});