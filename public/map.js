// Initialisiere die Karte
var map = L.map('map').setView([20, 0], 2);  // Setze die Weltkarte als Startansicht

// Lade die TileLayer von OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Funktion zum Abrufen der Alerts von der API
async function fetchAlerts() {
    const response = await fetch('/alerts/get-alerts');
    const data = await response.json();
    return data;  // Array von Alerts mit srcIP, desc und timeStamp
}

// Geolocation für eine IP abrufen
async function getGeoLocation(ip) {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    if (data.status === "success") {
        return { lat: data.lat, lon: data.lon, city: data.city, country: data.country };
    } else {
        console.error(`Geolocation failed for IP: ${ip}`);
        return null;
    }
}

// Funktion zum Setzen der Marker auf der Karte
async function addMarkersForAlerts() {
    const alerts = await fetchAlerts();
    for (const alert of alerts) {
        const geoLocation = await getGeoLocation(alert.srcIP);
        if (geoLocation) {
            // Setze einen Marker an der entsprechenden Position
            L.marker([geoLocation.lat, geoLocation.lon])
                .addTo(map)
                .bindPopup(`<b>IP:</b> ${alert.srcIP}<br><b>Ort:</b> ${geoLocation.city}, ${geoLocation.country}<br><b>Alert:</b> ${alert.desc}`);
        }
    }
}

// Füge die Marker hinzu
addMarkersForAlerts();

