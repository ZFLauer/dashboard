import sys
import json
import pyshark


def parse_pcap(file_path):
    log_details = []

    try:
        # Use PyShark to read the pcap file
        cap = pyshark.FileCapture(file_path)

        for packet in cap:
            log_entry = {
                "full_packet_summary": str(packet)
            }

            # Extracting all fields from every layer in the packet
            for layer in packet.layers:
                layer_name = layer.layer_name
                log_entry[layer_name] = {}
                for field_name in layer.field_names:
                    log_entry[layer_name][field_name] = layer.get_field_value(field_name)

            # Adding general packet information
            log_entry.update({
                "timestamp": str(packet.sniff_time),
                "length": packet.length,
                "highest_layer": packet.highest_layer,
                "interface_captured": packet.interface_captured
            })

            log_details.append(log_entry)

        # Print the log details as JSON
        print(json.dumps(log_details, indent=2))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_pcap.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    parse_pcap(file_path)

