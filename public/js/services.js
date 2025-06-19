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

  // Initialiser le système d'alertes personnalisées
  new CustomAlertSystem();
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

// SYSTÈME D'ALERTES PERSONNALISÉES pour éviter les pop-ups natifs
class CustomAlertSystem {
  constructor() {
    this.createModalContainer();
    this.replaceNativeAlerts();
  }
  
  createModalContainer() {
    if (document.getElementById('custom-alert-container')) return;
    
    const container = document.createElement('div');
    container.id = 'custom-alert-container';
    container.innerHTML = `
      <div class="custom-alert-overlay">
        <div class="custom-alert-box">
          <div class="custom-alert-content">
            <p class="custom-alert-message"></p>
            <div class="custom-alert-buttons">
              <button class="custom-alert-btn custom-alert-ok">OK</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter les styles
    const style = document.createElement('style');
    style.textContent = `
      #custom-alert-container {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999998;
      }
      
      .custom-alert-overlay {
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
      }
      
      .custom-alert-box {
        background: rgba(26, 15, 36, 0.95);
        border: 1px solid #d4af37;
        border-radius: 15px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }
      
      .custom-alert-message {
        color: #e5d7a3;
        font-family: 'Playfair Display', serif;
        font-size: 16px;
        margin-bottom: 25px;
        line-height: 1.5;
      }
      
      .custom-alert-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
      }
      
      .custom-alert-btn {
        background: #d4af37;
        color: #1a0f24;
        border: none;
        padding: 12px 25px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Playfair Display', serif;
      }
      
      .custom-alert-btn:hover {
        background: #ffd700;
        transform: translateY(-2px);
      }
      
      .custom-alert-btn:active {
        transform: translateY(0);
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(container);
  }
  
  replaceNativeAlerts() {
    // Sauvegarder les fonctions originales
    this.originalAlert = window.alert;
    this.originalConfirm = window.confirm;
    this.originalPrompt = window.prompt;
    
    // Remplacer alert()
    window.alert = (message) => {
      this.showAlert(message);
    };
    
    // Optionnel : remplacer confirm() et prompt()
    window.confirm = (message) => {
      return this.showConfirm(message);
    };
  }
  
  showAlert(message) {
    const container = document.getElementById('custom-alert-container');
    const messageEl = container.querySelector('.custom-alert-message');
    const okBtn = container.querySelector('.custom-alert-ok');
    
    messageEl.textContent = message;
    container.style.display = 'block';
    
    // Animer l'apparition
    const alertBox = container.querySelector('.custom-alert-box');
    alertBox.style.transform = 'scale(0.8)';
    alertBox.style.opacity = '0';
    
    setTimeout(() => {
      alertBox.style.transition = 'all 0.3s ease';
      alertBox.style.transform = 'scale(1)';
      alertBox.style.opacity = '1';
    }, 10);
    
    // Gérer la fermeture
    const closeAlert = () => {
      alertBox.style.transform = 'scale(0.8)';
      alertBox.style.opacity = '0';
      setTimeout(() => {
        container.style.display = 'none';
      }, 300);
    };
    
    okBtn.onclick = closeAlert;
    
    // Fermer avec Escape
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        closeAlert();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
  }
  
  showConfirm(message) {
    return new Promise((resolve) => {
      const container = document.getElementById('custom-alert-container');
      const messageEl = container.querySelector('.custom-alert-message');
      const buttonsDiv = container.querySelector('.custom-alert-buttons');
      
      messageEl.textContent = message;
      
      // Remplacer les boutons pour confirm
      buttonsDiv.innerHTML = `
        <button class="custom-alert-btn custom-alert-cancel">Annuler</button>
        <button class="custom-alert-btn custom-alert-confirm">OK</button>
      `;
      
      container.style.display = 'block';
      
      const alertBox = container.querySelector('.custom-alert-box');
      alertBox.style.transform = 'scale(0.8)';
      alertBox.style.opacity = '0';
      
      setTimeout(() => {
        alertBox.style.transition = 'all 0.3s ease';
        alertBox.style.transform = 'scale(1)';
        alertBox.style.opacity = '1';
      }, 10);
      
      const closeAndResolve = (result) => {
        alertBox.style.transform = 'scale(0.8)';
        alertBox.style.opacity = '0';
        setTimeout(() => {
          container.style.display = 'none';
          // Restaurer le bouton OK original
          buttonsDiv.innerHTML = '<button class="custom-alert-btn custom-alert-ok">OK</button>';
          resolve(result);
        }, 300);
      };
      
      container.querySelector('.custom-alert-confirm').onclick = () => closeAndResolve(true);
      container.querySelector('.custom-alert-cancel').onclick = () => closeAndResolve(false);
    });
  }
}

// CLASSE CURSEUR PERSONNALISÉ - VERSION AMÉLIORÉE POUR POP-UPS
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
    // FORCER l'affichage du curseur au démarrage avec z-index très élevé
    this.cursor.style.zIndex = '999999';
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
    
    // NOUVEAU : Forcer le curseur à rester visible même avec des modals
    document.addEventListener('mouseenter', () => {
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // Écouter les changements de focus sans masquer le curseur
    window.addEventListener('focus', () => {
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // NE PAS masquer le curseur quand on perd le focus
    window.addEventListener('blur', () => {
      // Garder le curseur visible même si la fenêtre perd le focus
      if (this.shouldShowCursor()) {
        this.show();
      }
    });
    
    // Observer les changements dans le DOM pour détecter les nouveaux modals
    this.observeModalChanges();
  }
  
  // Observer les changements DOM pour les modals
  observeModalChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Chercher les nouveaux éléments modals
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Vérifier si c'est un modal ou un élément avec z-index élevé
              const style = window.getComputedStyle(node);
              if (style.zIndex && parseInt(style.zIndex) > 1000) {
                this.ensureVisibilityForModal();
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Assurer la visibilité pour les modals
  ensureVisibilityForModal() {
    if (this.shouldShowCursor()) {
      // Augmenter temporairement le z-index
      this.cursor.style.zIndex = '9999999';
      this.show();
      
      // Forcer la visibilité avec !important via une classe CSS
      this.cursor.classList.add('modal-visible');
      
      // Retirer la classe après un délai
      setTimeout(() => {
        this.cursor.classList.remove('modal-visible');
        this.cursor.style.zIndex = '999999';
      }, 5000);
    }
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
      this.cursor.style.display = 'block';
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