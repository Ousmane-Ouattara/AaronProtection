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