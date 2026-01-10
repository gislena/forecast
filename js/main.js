const map = L.map('map').setView([-34.60, -58.38], 4);
const daysContainer = document.querySelector('.days');
const cityDisplay = document.querySelector('#city-display');
let marker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

async function getCityName(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || data.address.state || "Ubicación seleccionada";
        cityDisplay.innerText = `Clima para: ${city}`;
    } catch (error) {
        cityDisplay.innerText = `Ubicación: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
}

async function getForecast(lat, lon) {
    const url = `https://www.7timer.info/bin/api.pl?lon=${lon.toFixed(2)}&lat=${lat.toFixed(2)}&product=civil&output=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // 1. PROCESAR FECHA DE INICIO (init: "2026010918")
        const year = data.init.substring(0, 4);
        const month = parseInt(data.init.substring(4, 6)) - 1; // Meses 0-11
        const day = data.init.substring(6, 8);
        const hour = data.init.substring(8, 10);
        const startDate = new Date(year, month, day, hour);

        renderTimeline(data.dataseries, startDate);
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderTimeline(series, startDate) {
    daysContainer.innerHTML = '';
    
    series.forEach((block) => {
        const forecastTime = new Date(startDate);
        forecastTime.setHours(startDate.getHours() + block.timepoint);

        const dayName = forecastTime.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        const hourName = forecastTime.getHours().toString().padStart(2, '0') + ':00';

        const weatherIcon = `https://www.7timer.info/img/misc/about_civil_${block.weather}.png`;

        const card = document.createElement('div');
        card.className = 'hour-card';
        card.innerHTML = `
            <div class="time-tag">
                <span class="day">${dayName}</span>
                <span class="hour">${hourName} hs</span>
            </div>
            <img src="${weatherIcon}" alt="${block.weather}">
            <p class="temp">${block.temp2m}°C</p>
            <div class="details">
                <span>Hum: ${block.rh2m}</span>
                <span>Viento: ${block.wind10m.speed}</span>
            </div>
        `;
        daysContainer.appendChild(card);
    });
}

map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (marker) marker.setLatLng(e.latlng);
    else marker = L.marker(e.latlng).addTo(map);

    getCityName(lat, lng);
    getForecast(lat, lng);
});

