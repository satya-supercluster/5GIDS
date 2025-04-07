import os
import csv
import argparse
import pyshark
from concurrent.futures import ProcessPoolExecutor

def process_frame_attributes(packet):
    try:
        frame = packet.frame_info
        return {
            'arrival_time': getattr(frame, 'time', ''),
            'arrival_time_epoch': getattr(frame, 'time_epoch', ''),
            'time_delta': getattr(frame, 'time_delta', ''),
            'time_relative': getattr(frame, 'time_relative', ''),
            'frame_length': getattr(frame, 'len', ''),
            'capture_length': getattr(frame, 'cap_len', ''),
            'protocols': getattr(frame, 'protocols', ''),
            'interface_id': getattr(frame, 'interface_id', ''),
            'interface_name': getattr(frame, 'interface_name', '')
        }
    except Exception as e:
        print(f"Error extracting frame info: {e}")
        return {}

def process_pcapng_to_csv(input_file, output_file):
    with open(output_file, 'w', newline='') as f:
        fieldnames = [
            'arrival_time', 'arrival_time_epoch', 'time_delta',
            'time_relative', 'frame_length', 'capture_length',
            'protocols', 'interface_id', 'interface_name'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        cap = pyshark.FileCapture(input_file, only_summaries=False)
        for packet in cap:
            row = process_frame_attributes(packet)
            if row:
                writer.writerow(row)
        cap.close()

def process_file(input_path, output_path):
    print(f"Processing {os.path.basename(input_path)}")
    process_pcapng_to_csv(input_path, output_path)
    print(f"Saved: {output_path}")

def main(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    tasks = []
    with ProcessPoolExecutor() as executor:
        for filename in os.listdir(input_folder):
            if filename.endswith('.pcapng'):
                input_path = os.path.join(input_folder, filename)
                output_path = os.path.join(output_folder, filename.replace('.pcapng', '.csv'))
                tasks.append(executor.submit(process_file, input_path, output_path))
        # Wait for all tasks to complete
        for task in tasks:
            task.result()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Extract selected FRAME attributes for 5G IDS from .pcapng files.")
    parser.add_argument('--input_folder', required=True, help='Folder with .pcapng files')
    parser.add_argument('--output_folder', required=True, help='Folder to save .csv files')
    args = parser.parse_args()
    main(args.input_folder, args.output_folder)


# python pcapng2csvScript.py --input_folder /pathToInputFolder --output_folder /PathToOutputFolder