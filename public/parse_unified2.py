import struct
import sys
import json
from datetime import datetime

def parse_unified2_log(file_path, src_ip, dest_ip, timestamp):
    log_details = []

    try:
        with open(file_path, "rb") as f:
            while True:
                try:
                    # Read the header length
                    header = f.read(8)
                    if len(header) < 8:
                        break  # End of file reached

                    # Unpack header using struct
                    record_type, record_length = struct.unpack('>II', header)

                    # Read the entire record
                    record_data = f.read(record_length)
                    if len(record_data) < record_length:
                        break

                    # Extract some details based on the record type
                    if record_type == 7:  # Example record type for event
                        # Example parsing to extract event data
                        event = struct.unpack('>IIIIIIIIIII', record_data[:44])  # Adjust to actual format
                        event_timestamp = datetime.fromtimestamp(event[1])
                        event_src_ip = ".".join(map(str, struct.unpack('BBBB', record_data[44:48])))
                        event_dest_ip = ".".join(map(str, struct.unpack('BBBB', record_data[48:52])))

                        # Check conditions
                        if event_src_ip == src_ip and event_dest_ip == dest_ip and event_timestamp.strftime("%Y-%m-%d") == timestamp:
                            log_entry = {
                                "source_ip": event_src_ip,
                                "destination_ip": event_dest_ip,
                                "timestamp": event_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                                "event_id": event[0],
                                "signature_id": event[3],
                            }
                            log_details.append(log_entry)
                except struct.error:
                    # Handle any struct unpacking errors (corrupt data, incorrect format)
                    break

        # Output the results as JSON
        print(json.dumps(log_details, indent=2))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python parse_unified2_log.py <file_path> <src_ip> <dest_ip> <timestamp>")
        sys.exit(1)

    file_path = sys.argv[1]
    src_ip = sys.argv[2]
    dest_ip = sys.argv[3]
    timestamp = sys.argv[4]

    parse_unified2_log(file_path, src_ip, dest_ip, timestamp)

