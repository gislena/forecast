const map = L.map('map').setView([-34.60, -58.38], 4);
const daysContainer = document.querySelector('.days');
const cityDisplay = document.querySelector('#city-display');
let marker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Función para obtener nombre de ciudad mediante Geocoding Inverso
async function getCityName(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state || "Ubicación desconocida";
        cityDisplay.innerText = `Clima en: ${city}`;
    } catch (error) {
        cityDisplay.innerText = `Clima en: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
}

function renderTimeline(series) {
    daysContainer.innerHTML = '';
    
    // El punto de inicio es la hora 'init' de la API
    series.forEach((block) => {
        const card = document.createElement('div');
        card.className = 'hour-card';
        
        // timepoint representa las horas transcurridas desde el inicio
        const hoursAhead = block.timepoint;
        
        card.innerHTML = `
            <div class="time-tag">+${hoursAhead}h</div>
            <img src="https://www.7timer.info/img/misc/about_civil_${block.weather}.png">
            <p class="temp">${block.temp2m}°C</p>
            <div class="details">
                <span>Humedad: ${block.rh2m}</span>
                <span>Viento: ${block.wind10m.speed}</span>
            </div>
        `;
        daysContainer.appendChild(card);
    });
}

async function getForecast(lat, lon) {
    const url = `https://www.7timer.info/bin/api.pl?lon=${lon.toFixed(2)}&lat=${lat.toFixed(2)}&product=civil&output=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Enviamos la serie completa (sin filtrar por día)
        renderTimeline(data.dataseries);
    } catch (error) {
        console.error("Error:", error);
    }
}

map.on('click', (e) => {
    const { lat, lng } = e.latlng;

    if (marker) {
        marker.setLatLng(e.latlng);
    } else {
        marker = L.marker(e.latlng).addTo(map);
    }

    getCityName(lat, lng);
    getForecast(lat, lng);
});


setTimeout(() => map.invalidateSize(), 100);

