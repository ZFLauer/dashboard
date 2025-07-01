document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const rulesTable = document.getElementById('rulesTable').getElementsByTagName('tbody')[0];

    // Funktion zum Hochladen und Parsen der Snort-Regeln
    uploadButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const content = e.target.result;
                displayRules(content);
            };
            reader.readAsText(file);
        } else {
            alert('Bitte wähle eine Datei aus.');
        }
    });

    // Funktion zum Darstellen der Snort-Regeln in einer Tabelle
    function displayRules(content) {
        // Vorherige Einträge löschen
        rulesTable.innerHTML = '';

        // Datei zeilenweise durchlaufen
        const lines = content.split('\n');
        lines.forEach((line) => {
            // Überspringe auskommentierte Zeilen
            if (line.trim().startsWith('#') || line.trim() === '') {
                return;
            }

            const row = document.createElement('tr');

            // Spalte für die Regel selbst (nicht auskommentiert)
            const ruleCell = document.createElement('td');
            ruleCell.textContent = line;
            row.appendChild(ruleCell);

            // Zeile zur Tabelle hinzufügen
            rulesTable.appendChild(row);
        });
    }
});

