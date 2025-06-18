// Initialisation de la carte
const map = L.map('map').setView([20, 0], 2);

// Fond noir
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(map);

// Charger les pays depuis GitHub (source fiable)
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'gold',        // Bordure en or
        weight: 1,
        fillColor: 'gold',    // Remplissage or
        fillOpacity: 0.5
      },
      onEachFeature: function (feature, layer) {
        // Récupérer le nom du pays
        const countryName = feature.properties.name || feature.properties.NAME || 'Pays inconnu';
        
        // Événement de clic
        layer.on('click', function () {
          L.popup()
            .setLatLng(layer.getBounds().getCenter())
            .setContent(`<strong>${countryName}</strong><br>Services disponibles partout`)
            .openOn(map);
        });
        
        // Effet hover
        layer.on('mouseover', function () {
          layer.setStyle({ 
            fillOpacity: 0.7, 
            fillColor: '#FFD700',
            weight: 2
          });
        });
        
        layer.on('mouseout', function () {
          layer.setStyle({ 
            fillOpacity: 0.5, 
            fillColor: 'gold',
            weight: 1 
          });
        });
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données géographiques:', error);
  });