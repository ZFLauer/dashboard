import os
import json
import pyshark

def parse_all_pcap_files(directory, output_file="logfile.json"):
    log_details = []
    unique_entries = set()  # Set zur Überprüfung doppelter Einträge

    try:
        # Alle Dateien im angegebenen Verzeichnis durchlaufen
        for filename in os.listdir(directory):
            if filename.startswith("snort.log.") and filename[10:].isdigit():
                file_path = os.path.join(directory, filename)
                
                # Verwenden von PyShark, um die Datei zu lesen
                cap = pyshark.FileCapture(file_path)

                for packet in cap:
                    # Generiere eine eindeutige ID für jeden Log-Eintrag
                    log_entry_id = (
                        str(packet.sniff_time),
                        packet.ip.src if 'IP' in packet else 'N/A',
                        packet.ip.dst if 'IP' in packet else 'N/A',
                        packet.transport_layer
                    )

                    # Überprüfen, ob die ID bereits existiert
                    if log_entry_id in unique_entries:
                        continue  # Überspringe doppelte Einträge

                    # Füge den neuen Eintrag zur Set hinzu
                    unique_entries.add(log_entry_id)

                    # Erstelle den Log-Eintrag
                    log_entry = {
                        "timestamp": str(packet.sniff_time),
                        "highest_layer": packet.highest_layer,
                        "length": packet.length,
                        "source_ip": packet.ip.src if 'IP' in packet else 'N/A',
                        "destination_ip": packet.ip.dst if 'IP' in packet else 'N/A',
                        "protocol": packet.transport_layer,
                        "full_packet_summary": str(packet)
                    }

                    log_details.append(log_entry)

        # Log-Einträge nach Zeitstempel sortieren
        log_details.sort(key=lambda x: x["timestamp"])

        # Speichern der eindeutigen Log-Einträge in der JSON-Datei
        with open(output_file, 'w') as f:
            json.dump(log_details, f, indent=2)

        print(f"Alle Log-Dateien verarbeitet und in {output_file} gespeichert.")

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    directory = "../uploads"  # Verzeichnis mit den snort.log Dateien
    parse_all_pcap_files(directory)
