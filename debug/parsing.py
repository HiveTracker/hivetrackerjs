import numpy as np
import pandas as pd

data = np.fromfile('data.json', dtype=np.uint8)
df = pd.DataFrame(data)

# check for packet separator (2 successive bytes with 0x80 set)
packet_sep = (df.ix[:, 0] & 0x80) == 0x80
packet_sep = packet_sep & packet_sep.shift(1)
packet_sep = packet_sep.shift(-1).fillna(0).astype(int)

# increase packet id every time a new packet separator is reported
packet = np.cumsum(packet_sep)
df = pd.concat([df, packet], axis=1)
df.columns = ['data', 'packet']

# group bytes by packet id and count the size of each packet
packet_sizes = df.groupby('packet').count().reset_index()
packet_sizes.groupby('data').count()

# increase cycle id every time 0x60 shows up and count cycle size in bytes
cycle = np.cumsum(((df.packet.diff()) == 1).astype(int))
cycle.name = 'cycle'
df = pd.concat([df, cycle], axis=1)
cycle_sizes = df.groupby('cycle').count().reset_index()
cycle_sizes.groupby('data').count()
