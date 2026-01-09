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
        cityDisplay.innerText = `Clima para: ${city}`;
    } catch (error) {
        cityDisplay.innerText = `Clima para: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
}

function renderDays(series) {
    daysContainer.innerHTML = '';
    series.forEach(day => {
        const dateStr = day.date.toString();
        const displayDate = `${dateStr.substring(6, 8)}/${dateStr.substring(4, 6)}/${dateStr.substring(0, 4)}`;
        
        const card = document.createElement('div');
        card.className = 'day-card';
        card.innerHTML = `
            <h3>${displayDate}</h3>
            <img src="https://www.7timer.info/img/misc/about_civil_${day.weather}.png">
            <p><strong>Máx: ${day.temp2m.max}°C</strong></p>
            <p>Min: ${day.temp2m.min}°C</p>
        `;
        daysContainer.appendChild(card);
    });
}

async function getForecast(lat, lon) {
    const url = `https://www.7timer.info/bin/api.pl?lon=${lon.toFixed(2)}&lat=${lat.toFixed(2)}&product=civillight&output=json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        renderDays(data.dataseries);
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