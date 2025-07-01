// Funktion zum Laden und Anzeigen der Logs
async function loadLogs() {
    try {
        const response = await fetch('logfile.json');
        
        if (!response.ok) {
            throw new Error("Fehler beim Laden der JSON-Datei");
        }
        
        let logs = await response.json();
        
        // Sortiere Logs von neu nach alt (nach Zeitstempel)
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        displayLogs(logs);  // Zeigt die Logs in der Tabelle an
        setupFilters(logs);  // Initialisiert die Filter
    } catch (error) {
        console.error("Fehler beim Laden der Logs:", error);
    }
}

// Event-Listener für den Update-Button, um parse_pcap.py auszuführen und die Logs neu zu laden
document.getElementById("updateLogsButton").addEventListener("click", async () => {
    try {
        // Sende Anfrage an den Flask-Server, um parse_pcap.py zu starten
        const response = await fetch('http://localhost:5001/run-parse-pcap', { method: 'POST' });

        if (response.ok) {
            const result = await response.json();
            alert(result.message);  // Zeigt die Erfolgsnachricht an
            loadLogs();  // Logs erneut laden
        } else {
            alert("Fehler beim Aktualisieren der Logs");
        }
    } catch (error) {
        console.error("Fehler beim Starten des Skripts:", error);
    }
});

// Funktion zur Anzeige der Logs in der Tabelle
function displayLogs(logs) {
    const logTableBody = document.getElementById('logTable').querySelector('tbody');
    logTableBody.innerHTML = "";  // Tabelle leeren

    logs.forEach((log) => {
        const row = document.createElement('tr');
        
        // Klick-Event hinzufügen, um die Log-Details im Modal anzuzeigen
        row.addEventListener('click', () => showLogDetails(log));
        
        const timestampCell = document.createElement('td');
        timestampCell.textContent = log.timestamp;
        row.appendChild(timestampCell);

        const layerCell = document.createElement('td');
        layerCell.textContent = log.highest_layer || 'N/A';
        row.appendChild(layerCell);

        const srcIpCell = document.createElement('td');
        srcIpCell.textContent = log.source_ip || 'N/A';
        row.appendChild(srcIpCell);

        const destIpCell = document.createElement('td');
        destIpCell.textContent = log.destination_ip || 'N/A';
        row.appendChild(destIpCell);

        const protocolCell = document.createElement('td');
        protocolCell.textContent = log.protocol || 'N/A';
        row.appendChild(protocolCell);

        logTableBody.appendChild(row);
    });
}

// Funktion zum Anzeigen der Log-Details im modalen Pop-up
function showLogDetails(log) {
    document.getElementById('logTimestamp').textContent = log.timestamp;
    document.getElementById('logHighestLayer').textContent = log.highest_layer;
    document.getElementById('logLength').textContent = log.length;
    document.getElementById('logSourceIP').textContent = log.source_ip;
    document.getElementById('logDestinationIP').textContent = log.destination_ip;
    document.getElementById('logProtocol').textContent = log.protocol;
    document.getElementById('logFullPacketSummary').textContent = log.full_packet_summary;
    
    // Modal öffnen
    const modal = document.getElementById('logModal');
    modal.style.display = "block";
}

// Funktion zur Einrichtung der Filter
function setupFilters(logs) {
    const filterButton = document.getElementById('applyFilterButton');
    const clearButton = document.getElementById('clearFilterButton');

    filterButton.addEventListener('click', () => {
        const timestampFilter = document.getElementById('timestampFilter').value;
        const srcIpFilter = document.getElementById('srcIPFilter').value;
        const destIpFilter = document.getElementById('destIPFilter').value;
        const protocolFilter = document.getElementById('protocolFilter').value;

        // Filtere Logs basierend auf den Eingaben
        const filteredLogs = logs.filter(log => {
            return (!timestampFilter || log.timestamp.includes(timestampFilter)) &&
                   (!srcIpFilter || log.source_ip === srcIpFilter) &&
                   (!destIpFilter || log.destination_ip === destIpFilter) &&
                   (!protocolFilter || log.protocol === protocolFilter);
        });

        displayLogs(filteredLogs);  // Zeigt gefilterte Logs in der Tabelle an
    });

    clearButton.addEventListener('click', () => {
        displayLogs(logs);  // Zeigt alle Logs in der Tabelle an
    });
}

// Event-Listener für das Schließen des Modals
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('logModal').style.display = "none";
});

// Schließen des Modals, wenn außerhalb geklickt wird
window.addEventListener('click', (event) => {
    const modal = document.getElementById('logModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// Initiales Laden der Logs beim Start der Seite
document.addEventListener('DOMContentLoaded', loadLogs);
