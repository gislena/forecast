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
        const city = data.address.city || data.address.town || data.address.village || data.address.state || "Ubicación";
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
        const year = data.init.substring(0, 4);
        const month = parseInt(data.init.substring(4, 6)) - 1;
        const day = data.init.substring(6, 8);
        const hour = data.init.substring(8, 10);
        const startDate = new Date(year, month, day, hour);
        renderTimeline(data.dataseries, startDate);
    } catch (error) {
        console.error(error);
    }
}

function renderTimeline(series, startDate) {
    daysContainer.innerHTML = '';
    const dailyData = {};

    series.forEach((block) => {
        const forecastTime = new Date(startDate);
        forecastTime.setHours(startDate.getHours() + block.timepoint);
        const dateKey = forecastTime.toISOString().split('T')[0];

        if (!dailyData[dateKey] || forecastTime.getHours() === 12) {
            dailyData[dateKey] = { block, time: forecastTime };
        }
    });

    const dailyArray = Object.values(dailyData).slice(0, 14);

    dailyArray.forEach((item) => {
        const { block, time } = item;
        const dayLabel = time.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit' });

        // Limpia el nombre para que coincida con tus archivos (quita 'day' y 'night')
        const weatherBase = block.weather.replace('day', '').replace('night', '');
        const iconPath = `images/${weatherBase}.png`;

        const card = document.createElement('div');
        card.className = 'hour-card';
        card.innerHTML = `
            <div class="time-tag"><span class="day">${dayLabel}</span></div>
            <div class="icon-container">
                <img src="${iconPath}" class="weather-icon">
            </div>
            <p class="temp">${block.temp2m}°C</p>
            <div class="details">
                <span>Hum: ${block.rh2m}</span>
                <span>Viento: ${block.wind10m.speed}km/h</span>
            </div>`;
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

