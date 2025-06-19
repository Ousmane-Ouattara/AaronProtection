// Gestion du scroll sur le header
function updateHeader() {
  const bgBar = document.querySelector('.background-bar');
  const menu = document.querySelector('.menu');
  const dealer = document.querySelector('.dealer');

  if (window.scrollY > 50) {
    bgBar?.classList.add('visible');
    menu?.classList.add('scrolled');
    dealer?.classList.add('scrolled');
  } else {
    bgBar?.classList.remove('visible');
    menu?.classList.remove('scrolled');
    dealer?.classList.remove('scrolled');
  }

  ticking = false;
}

let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
});

// Toggle menu hamburger
function toggleMenu() {
  const menu = document.getElementById('hamburger-menu');
  if (menu) menu.classList.toggle('visible');
}

// Gestion des sous-menus
document.addEventListener('DOMContentLoaded', () => {
  // Dropdown (sous-menu dans le hamburger)
  const dropdownToggles = document.querySelectorAll('.dropdown > a');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggle.parentElement.classList.toggle('open');
    });
  });

  // Ferme le menu si on clique en dehors
  document.addEventListener('click', function (e) {
    const menu = document.getElementById('hamburger-menu');
    const menuIcon = document.getElementById('menu-icon');
    if (menu && menu.classList.contains('visible')) {
      if (!menu.contains(e.target) && !menuIcon?.contains(e.target)) {
        menu.classList.remove('visible');
      }
    }
  });

  // Traduction
  const lang = localStorage.getItem('lang') || 'fr';
  setLanguage(lang);

  // Smooth scroll pour les ancres
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const menu = document.getElementById('hamburger-menu');
        if (menu?.classList.contains('visible')) {
          menu.classList.remove('visible');
        }
      }
    });
  });

  // Lecture vidéo fond
  const videos = document.querySelectorAll('video[autoplay]');
  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadeddata', () => {
      video.play().catch(err => {
        console.warn('Lecture automatique bloquée :', err);
      });
    });
  });

  // Préchargement images
  const importantImages = [
    'img/Logo2.png'
    // Ajouter d'autres images ici
  ];
  importantImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Menu de sélection de langue
  const dealer = document.querySelector('.dealer');
  const dropdown = document.querySelector('.language-dropdown');

  if (dealer && dropdown) {
    const links = dropdown.querySelectorAll('a');

    dealer.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      links.forEach(link => {
        link.addEventListener('click', () => {
          dropdown.style.display = 'none';
        });
      });
    });
  }
});

// Traduction multilingue
async function setLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const translations = await response.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) el.innerHTML = translations[key];
    });

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  } catch (error) {
    console.error('Erreur lors du chargement de la langue:', error);
  }
}

// Ferme menu hamburger sur resize
window.addEventListener('resize', () => {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  if (hamburgerMenu?.classList.contains('visible')) {
    hamburgerMenu.classList.remove('visible');
  }
});

// CLASSE CURSEUR PERSONNALISÉ - VERSION CORRIGÉE
class CustomCursor {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.isVisible = false;
    
    if (!this.cursor) {
      console.warn('Élément .custom-cursor non trouvé');
      return;
    }
    
    this.init();
  }
  
  init() {
    // FORCER l'affichage du curseur au démarrage
    this.show();
    
    // Gestion du mouvement de la souris
    document.addEventListener('mousemove', (e) => {
      this.updatePosition(e.clientX, e.clientY);
      
      // TOUJOURS afficher le curseur sur desktop
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // Gestion des clics
    document.addEventListener('mousedown', () => {
      if (this.shouldShowCursor()) {
        this.cursor.classList.add('click');
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('click');
    });
    
    // Gestion du hover sur éléments interactifs
    const interactiveTags = ['a', 'button', 'input', 'textarea', 'select', 'label'];
    
    document.addEventListener('mouseover', (e) => {
      if (this.shouldShowCursor() && 
          (interactiveTags.includes(e.target.tagName.toLowerCase()) || e.target.onclick)) {
        this.cursor.classList.add('hover');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (interactiveTags.includes(e.target.tagName.toLowerCase()) || e.target.onclick) {
        this.cursor.classList.remove('hover');
      }
    });
    
    // NOUVEAU : Forcer le curseur à rester visible
    document.addEventListener('mouseenter', () => {
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // Gérer les changements de focus sans masquer le curseur
    window.addEventListener('focus', () => {
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // NE PAS masquer le curseur quand on perd le focus
    window.addEventListener('blur', () => {
      // On ne fait rien - on garde le curseur visible
    });
    
    // Gestion de la visibilité du document (simplifiée)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.shouldShowCursor()) {
        this.show();
      }
    });
  }
  
  shouldShowCursor() {
    // Uniquement vérifier si on est sur desktop
    return window.innerWidth > 768;
  }
  
  updatePosition(x, y) {
    this.cursor.style.left = `${x}px`;
    this.cursor.style.top = `${y}px`;
  }
  
  show() {
    if (this.shouldShowCursor() && !this.isVisible) {
      this.cursor.style.opacity = '1';
      this.cursor.style.visibility = 'visible';
      this.isVisible = true;
    }
  }
  
  hide() {
    if (this.isVisible) {
      this.cursor.style.opacity = '0';
      this.cursor.style.visibility = 'hidden';
      this.isVisible = false;
    }
  }
}

// Initialisation unique du curseur
let customCursorInstance = null;

function initCustomCursor() {
  if (!customCursorInstance && document.querySelector('.custom-cursor')) {
    customCursorInstance = new CustomCursor();
  }
}

// S'assurer que le curseur n'est initialisé qu'une seule fois
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
  initCustomCursor();
}