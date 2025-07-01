document.addEventListener('DOMContentLoaded', function () {
    const alertTable = document.getElementById('alertTable').getElementsByTagName('tbody')[0];
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const deleteSelectedButton = document.getElementById('deleteSelectedButton');
    const deleteAllButton = document.getElementById('deleteAllButton');
    const applyFilterButton = document.getElementById('applyFilterButton');
    const clearFilterButton = document.getElementById('clearFilterButton');
    const fetchSftpAlertsButton = document.getElementById('fetchSftpAlertsButton');
        
    // Modal Logic
    const modal = document.getElementById("alertModal");
    const modalContent = document.getElementById("alertDetails");
    const closeModalBtn = document.getElementsByClassName("close")[0];

    // Function to open the modal with the alert details
    //function openModal(alertId) {
        //// Fetch the alert and additional log details using the alert's ID
        //fetch(`/alerts/log-details/${alertId}`)
            //.then(response => response.json())
            //.then(data => {
                //if (!data.alert) {
                    //throw new Error("Alert not found");
                //}

                //const alert = data.alert;

                //let logDetailsHtml = '';
                //if (data.logDetails && data.logDetails.length > 0) {
                    //logDetailsHtml = '<br><b>Log Details:</b><br><pre>' + JSON.stringify(data.logDetails, null, 2) + '</pre>';
                //} else {
                    //logDetailsHtml = '<br><b>Log Details:</b> Keine passenden Log-Details gefunden.';
                //}

                //modal.style.display = "block";
                //modalContent.innerHTML = `
                    //<b>Beschreibung:</b> ${alert.Desc || "Keine Beschreibung verfügbar"}<br>
                    //<b>Quelle IP:</b> ${alert.srcIP || "N/A"}<br>
                    //<b>Ziel IP:</b> ${alert.destIP || "N/A"}<br>
                    //<b>Protokoll:</b> ${alert.commProtocol || "N/A"}<br>
                    //<b>Timestamp:</b> ${alert.timeStamp || "N/A"}<br>
                    //<b>Port:</b> ${alert.srcPort || "N/A"} -> ${alert.destPort || "N/A"}<br>
                    //<b>Rule ID:</b> ${alert.ruleID || "N/A"}
                    //${logDetailsHtml}
                //`;
            //})
            //.catch(error => {
                //console.error('Fehler beim Abrufen der Log-Details:', error);
                //modal.style.display = "block";
                //modalContent.innerHTML = `
                    //<b>Log Details:</b> Fehler beim Abrufen der Log-Details.
                //`;
            //});
    //}

    //// Close modal when clicking on the "x"
    //closeModalBtn.onclick = function() {
        //modal.style.display = "none";
    //};

    //// Close modal when clicking outside of the modal
    //window.onclick = function(event) {
        //if (event.target === modal) {
            //modal.style.display = "none";
        //}
    //};

    function fetchAlerts(filters = {}) {
        let query = Object.keys(filters)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
            .join('&');
        
        fetch(`/alerts?${query}`)
            .then(response => response.json())
            .then(data => {
                alertTable.innerHTML = ''; // Clear previous content
                const srcIPCounts = {};
                const destIPCounts = {};
                const protocolCounts = {};
                const alertsByDate = {};
                let alertCounts = 0;

                data.forEach(alert => {
                    // Fill the table
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', alert._id);
                    row.innerHTML = `
                        <td><input type="checkbox" class="alert-checkbox" value="${alert._id}"></td>
                        <td>${alert.Desc}</td>
                        <td>${alert.timeStamp}</td>
                        <td>${alert.srcIP}</td>
                        <td>${alert.srcPort}</td>
                        <td>${alert.destIP}</td>
                        <td>${alert.destPort}</td>
                        <td>${alert.commProtocol}</td>
                        <td>${alert.ruleID}</td>
                        <td>${alert.ecuID}</td>
                        <td>${alert.IDSMID}</td>
                    `;
                    alertTable.appendChild(row);

                    //// Add event listener for each row to display details
                    //row.addEventListener('click', () => {
                        //console.log('Alert clicked:', alert);  // Log the alert to see if `_id` is present
                        //if (alert && alert._id) {
                            //openModal(alert._id);  // Open the modal with the alert details
                        //} else {
                            //console.error("Alert ID is undefined for the clicked alert.");
                        //}
                    //});

                    // Count IPs, protocols, and dates
                    srcIPCounts[alert.srcIP] = (srcIPCounts[alert.srcIP] || 0) + 1;
                    destIPCounts[alert.destIP] = (destIPCounts[alert.destIP] || 0) + 1;
                    protocolCounts[alert.commProtocol] = (protocolCounts[alert.commProtocol] || 0) + 1;

                    // Extract date (only year-month-day)
                    let alertDate = alert.timeStamp.split('-')[0]; // Extract the date part of the timestamp
                                       
                    // Collect alert count by date
                    alertsByDate[alertDate] = (alertsByDate[alertDate] || 0) + 1;

                    alertCounts++;
                });

                // Update charts
                updateSrcIPChart(srcIPCounts);
                updateDestIPChart(destIPCounts);
                updateAlertCountChart(alertsByDate);
                updateProtocolChart(protocolCounts);
            })
            .catch(error => console.error('Fehler beim Abrufen der Alerts:', error));
    }
             

    // Tortendiagramm: Quelle IPs
    function updateSrcIPChart(srcIPCounts) {
        const ctx = document.getElementById('srcIPChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(srcIPCounts),
                datasets: [{
                    label: 'Quelle IPs',
                    data: Object.values(srcIPCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Tortendiagramm: Protokollverteilung
    function updateProtocolChart(protocolCounts) {
        const ctx = document.getElementById('protocolChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(protocolCounts),
                datasets: [{
                    label: 'Protokollverteilung',
                    data: Object.values(protocolCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Tortendiagramm: Ziel IPs
    function updateDestIPChart(destIPCounts) {
        const ctx = document.getElementById('destIPChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(destIPCounts),
                datasets: [{
                    label: 'Ziel IPs',
                    data: Object.values(destIPCounts),
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Balkendiagramm: Anzahl der Alerts nach Tagen
    function updateAlertCountChart(alertsByDate) {
        const ctx = document.getElementById('alertCountChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(alertsByDate),
                datasets: [{
                    label: 'Anzahl der Alerts nach Tagen',
                    data: Object.values(alertsByDate),
                    backgroundColor: '#36A2EB',
                    borderColor: '#36A2EB',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Datum'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Anzahl der Alerts'
                        }
                    }
                },
                responsive: true
            }
        });
    }
    

    // Apply filters
    applyFilterButton.addEventListener('click', () => {
        const srcIP = document.getElementById('srcIP').value;
        const destIP = document.getElementById('destIP').value;
        const protocol = document.getElementById('protocol').value;

        const filters = {};
        if (srcIP) filters.srcIP = srcIP;
        if (destIP) filters.destIP = destIP;
        if (protocol) filters.commProtocol = protocol;

        fetchAlerts(filters); // Fetch alerts with filters applied
    });

    // Clear filters
    clearFilterButton.addEventListener('click', () => {
        document.getElementById('srcIP').value = '';
        document.getElementById('destIP').value = '';
        document.getElementById('protocol').value = '';
        fetchAlerts(); // Fetch all alerts without filters
    });

    // Upload file
    uploadButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/alerts/upload', {
                method: 'POST',
                body: formData,
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload(); // Reload after successful upload
                    fileInput.value = ''; // Reset file input
                } else {
                    console.error('Fehler beim Hochladen der CSV-Datei.');
                }
            })
            .catch(error => console.error('Fehler beim Hochladen:', error));
        } else {
            console.error('Keine Datei ausgewählt.');
        }
    });

    // Delete selected alerts
    deleteSelectedButton.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.alert-checkbox:checked')).map(cb => cb.value);

        if (selectedIds.length > 0) {
            fetch('/alerts/delete-multiple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            })
            .then(response => {
                if (response.ok) {
                    window.location.reload(); // Reload after deleting
                } else {
                    console.error('Fehler beim Löschen der ausgewählten Alerts.');
                }
            })
            .catch(error => console.error('Fehler beim Löschen der ausgewählten Alerts:', error));
        } else {
            alert('Keine Alerts ausgewählt.');
        }
    });

    // Fetch CSV files from SFTP
    fetchSftpAlertsButton.addEventListener('click', () => {
        fetch('/alerts/fetch-sftp', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message); // Show feedback
                }
                window.location.reload(); // Reload after fetching
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der CSV-Dateien von SFTP:', error);
                alert('Verbindung zum SFTP-Server konnte nicht hergestellt werden. Bitte prüfen Sie die Netzwerkverbindung und die Servereinstellungen.');
            });
    });

    // Delete all alerts
    deleteAllButton.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich alle Alerts löschen?')) {
            fetch('/alerts/delete-all', { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message); // Show feedback on how many alerts were deleted
                }
                fetchAlerts(); // Refresh alerts after deletion
            })
            .catch(error => console.error('Fehler beim Löschen aller Alerts:', error));
        }
    });

    // Fetch alerts on page load (without filters)
    fetchAlerts();
});

