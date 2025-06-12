// Gestion du scroll sur le header (sans changement de logo ni de couleur)
window.addEventListener('scroll', () => {
  const bgBar = document.querySelector('.background-bar');
  const menu = document.querySelector('.menu');
  const dealer = document.querySelector('.dealer');
  
  if (window.scrollY > 50) {
    bgBar.classList.add('visible');
    menu.classList.add('scrolled');
    dealer.classList.add('scrolled');
  } else {
    bgBar.classList.remove('visible');
    menu.classList.remove('scrolled');
    dealer.classList.remove('scrolled');
  }
});

// Fonction pour afficher/masquer le menu hamburger
function toggleMenu() {
  const menu = document.getElementById('hamburger-menu');
  menu.classList.toggle('visible');
}

// Gestion des sous-menus (dropdown) au clic
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('.dropdown > a');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const parentLi = toggle.parentElement;
      parentLi.classList.toggle('open');
    });
  });

  // Ferme le menu si on clique en dehors
  document.addEventListener('click', function (e) {
    const menu = document.getElementById('hamburger-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menu.classList.contains('visible')) {
      if (!menu.contains(e.target) && !menuIcon.contains(e.target)) {
        menu.classList.remove('visible');
      }
    }
  });
});

// Traduction multilingue
async function setLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const translations = await response.json();

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        el.innerHTML = translations[key];
      }
    });

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  } catch (error) {
    console.error('Erreur lors du chargement de la langue:', error);
  }
}

// Initialisation de la langue au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'fr';
  setLanguage(lang);
});

// Curseur personnalisé
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.custom-cursor');
  
  if (cursor) {
    // Déplacement du curseur
    document.addEventListener('mousemove', (e) => {
      cursor.style.top = `${e.clientY}px`;
      cursor.style.left = `${e.clientX}px`;
    });

    // Effet de clic
    document.addEventListener('mousedown', () => {
      cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
      cursor.classList.remove('click');
    });

    // Effet hover sur les éléments interactifs
    const interactiveTags = ['a', 'button', 'input', 'textarea', 'select', 'label'];

    document.addEventListener('mouseover', (e) => {
      if (interactiveTags.includes(e.target.tagName.toLowerCase()) || e.target.onclick) {
        cursor.classList.add('hover');
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (interactiveTags.includes(e.target.tagName.toLowerCase()) || e.target.onclick) {
        cursor.classList.remove('hover');
      }
    });
  }
});

// Smooth scroll pour les liens d'ancrage
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // Ferme le menu hamburger si ouvert
        const hamburgerMenu = document.getElementById('hamburger-menu');
        if (hamburgerMenu && hamburgerMenu.classList.contains('visible')) {
          hamburgerMenu.classList.remove('visible');
        }
      }
    });
  });
});

// Gestion de la vidéo de fond (optimisation)
document.addEventListener('DOMContentLoaded', () => {
  const videos = document.querySelectorAll('video[autoplay]');
  
  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    
    // Assure que la vidéo démarre
    video.addEventListener('loadeddata', () => {
      video.play().catch(error => {
        console.log('Lecture automatique bloquée:', error);
      });
    });
  });
});

// Optimisation des performances pour les événements de scroll
let ticking = false;

function updateHeader() {
  const background = document.querySelector('.background-bar');
  const menu = document.querySelector('.menu');
  const dealer = document.querySelector('.dealer');

  if (window.scrollY > 50) {
    background?.classList.add('visible');
    menu?.classList.add('scrolled');
    dealer?.classList.add('scrolled');
  } else {
    background?.classList.remove('visible');
    menu?.classList.remove('scrolled');
    dealer?.classList.remove('scrolled');
  }
  
  ticking = false;
}

// Version optimisée du scroll listener
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateHeader);
    ticking = true;
  }
});

// Gestion du redimensionnement de fenêtre
window.addEventListener('resize', () => {
  // Ferme le menu hamburger sur redimensionnement
  const hamburgerMenu = document.getElementById('hamburger-menu');
  if (hamburgerMenu && hamburgerMenu.classList.contains('visible')) {
    hamburgerMenu.classList.remove('visible');
  }
});

// Préchargement des images importantes (optionnel)
document.addEventListener('DOMContentLoaded', () => {
  const importantImages = [
    'img/Logo2.png'
    // Ajoutez d'autres images importantes ici
  ];
  
  importantImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });


  const dealer = document.querySelector('.dealer');
  const dropdown = document.querySelector('.language-dropdown');
  const links = dropdown.querySelectorAll('a');


  // Toggle au clic
  dealer.addEventListener('click', (e) => {
    e.stopPropagation(); // empêche la fermeture immédiate
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
  });

  // Clic ailleurs → fermer
  document.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });

  // Empêche la fermeture quand on clique à l’intérieur de la liste
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    links.forEach(link => {
  link.addEventListener('click', () => {
    dropdown.style.display = 'none';
  });
});

  });
});