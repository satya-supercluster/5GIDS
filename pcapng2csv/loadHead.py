import pyshark

cap = pyshark.FileCapture('../BS1/Goldeneye_BS1.pcapng')

for i in range(0,10):
    frame_info = cap[i].frame_info
    print(f'Frame: {frame_info}')
