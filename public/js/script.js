// Gestion du scroll sur le header
window.addEventListener('scroll', () => {
  const bgBar = document.querySelector('.background-bar');
  const menu = document.querySelector('.menu');
  const dealer = document.querySelector('.dealer');
  const logoImg = document.querySelector('.logo img');
  

  if (window.scrollY > 50) {
    bgBar.classList.add('visible');
    menu.classList.add('scrolled');
    dealer.classList.add('scrolled');
    logoImg.src = 'img/Logo2.png';
  } else {
    bgBar.classList.remove('visible');
    menu.classList.remove('scrolled');
    dealer.classList.remove('scrolled');
    logoImg.src = 'img/Logo.png';
  }
});

// Fonction pour afficher/masquer le menu hamburger
function toggleMenu() {
  const menu = document.getElementById('hamburger-menu');
  
  // Ajout ou suppression de la classe 'visible' pour afficher/cacher le menu
  menu.classList.toggle('visible');
}

// Gestion des sous-menus (dropdown) au clic (utile pour mobile)
document.addEventListener('DOMContentLoaded', () => {
  const dropdownToggles = document.querySelectorAll('.dropdown > a');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault(); // Empêche la redirection immédiate
      const parentLi = toggle.parentElement;
      parentLi.classList.toggle('open');
    });
  });

  // Ferme le menu si on clique en dehors
document.addEventListener('click', function (e) {
  const menu = document.getElementById('hamburger-menu');
  const menuIcon = document.getElementById('menu-icon');

  // Vérifie si le menu est ouvert
  if (menu.classList.contains('visible')) {
    // Si le clic est en dehors du menu ET du bouton menu
    if (!menu.contains(e.target) && !menuIcon.contains(e.target)) {
      menu.classList.remove('visible');
    }
  }
});

window.addEventListener('scroll', () => {
  const dealer = document.querySelector('.dealer');
  const main2 = document.querySelector('#main2');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sectionTop = main2.offsetTop;

  if (window.scrollY + window.innerHeight / 2 >= sectionTop) {
    dealer.classList.add('gold');      // Or pour langues
    hamburgerMenu.classList.add('gold'); // Or pour menu hamburger
  } else {
    dealer.classList.remove('gold');   
    hamburgerMenu.classList.remove('gold');
  }
});


});



async function setLanguage(lang) {
  const response = await fetch(`lang/${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      el.innerHTML = translations[key];
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
}

window.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'fr';
  setLanguage(lang);
});

// CURSEUR PERSONNALISÉ
 const cursor = document.querySelector('.custom-cursor');

  // Suivre la souris
  document.addEventListener('mousemove', (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;
  });

  // Effet clic
  document.addEventListener('mousedown', () => {
    cursor.classList.add('click');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('click');
  });

  // Survol des éléments interactifs
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


