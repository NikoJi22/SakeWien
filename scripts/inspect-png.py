"""Quick PNG IHDR + alpha check (stdlib only)."""
import struct
import sys

def main(path: str) -> None:
    with open(path, "rb") as f:
        data = f.read()
    sig = b"\x89PNG\r\n\x1a\n"
    if len(data) < 29 or data[:8] != sig:
        print("NOT a PNG (bad signature)", data[:8])
        sys.exit(1)
    pos = 8
    has_tRNS = False
    w = h = bd = ct = None
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        pos += 4
        ctype = data[pos : pos + 4]
        pos += 4
        chunk = data[pos : pos + length]
        pos += length
        crc = data[pos : pos + 4]
        pos += 4
        if ctype == b"IHDR":
            w, h, bd, ct, comp, filt, inter = struct.unpack(">IIBBBBB", chunk)
        elif ctype == b"tRNS":
            has_tRNS = True
        elif ctype == b"IDAT":
            break
        elif ctype == b"IEND":
            break
    ct_name = {0: "greyscale", 2: "RGB", 3: "palette", 4: "greyscale+alpha", 6: "RGBA"}
    print(path)
    print(f"  size: {w}x{h}, bit_depth={bd}, color_type={ct} ({ct_name.get(ct, '?')})")
    print(f"  tRNS chunk: {has_tRNS}")
    has_alpha = ct in (4, 6) or (ct == 3 and has_tRNS)
    print(f"  has_alpha_channel (RGBA/GA or palette+tRNS): {has_alpha}")


if __name__ == "__main__":
    for p in sys.argv[1:]:
        main(p)
