#!/bin/bash

# Installer für das Snort Dashboard Projekt

echo "Starte die Installation des Snort Dashboard..."

# Schritt 1: Systemupdate und benötigte Pakete installieren
echo "Aktualisiere die Systempakete..."
sudo apt-get update

# Schritt 2: Node.js und npm installieren
echo "Installiere Node.js und npm..."
sudo apt-get install -y nodejs npm

# Schritt 3: Abhängigkeiten des Projekts installieren
echo "Installiere Projektabhängigkeiten..."
npm install

# Schritt 4: Prüfen ob MongoDB installiert ist, wenn nicht installieren
if ! command -v mongod &> /dev/null
then
    echo "MongoDB wird installiert..."
    sudo apt-get install -y mongodb
else
    echo "MongoDB ist bereits installiert."
fi

# Schritt 5: Erforderliche Verzeichnisse erstellen
echo "Erstelle Verzeichnis 'uploads'..."
mkdir -p uploads

# Schritt 6: Anwendung starten
echo "Installation abgeschlossen. Anwendung wird gestartet..."
npm start

