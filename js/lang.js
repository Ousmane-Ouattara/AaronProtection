async function setLanguage(lang) {
  const response = await fetch(`lang/${lang}.json`);
  const translations = await response.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) {
      if (el.placeholder !== undefined) {
        el.placeholder = translations[key];
      } else {
        el.innerHTML = translations[key];
      }
    }
  });

  window.currentTranslations = translations;

  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) {
      el.placeholder = translations[key];
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
}

window.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('lang') || 'fr';
  setLanguage(lang);
});


