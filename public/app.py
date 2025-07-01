from flask import Flask, jsonify
from flask_cors import CORS  # Importiere CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Aktiviere CORS für alle Routen

@app.route('/run-parse-pcap', methods=['POST'])
def run_parse_pcap():
    try:
        # Stelle sicher, dass der Pfad zu `parse_pcap.py` korrekt ist
        result = subprocess.run(['python3', 'parse_pcap.py'], cwd='/home/zf/Desktop/dashboard/public', capture_output=True, text=True)

        if result.returncode == 0:
            return jsonify({"status": "success", "message": "Logs updated successfully"}), 200
        else:
            return jsonify({"status": "error", "message": result.stderr}), 500

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Verwende einen anderen Port, z. B. 5001
