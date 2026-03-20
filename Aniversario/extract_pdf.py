import sys
try:
    import fitz  # PyMuPDF
except ImportError:
    print("PyMuPDF not installed.")
    sys.exit(1)

doc = fitz.open(sys.argv[1])
for i, page in enumerate(doc):
    text = page.get_text("dict")
    print(f"--- Page {i+1} ---")
    for block in text.get("blocks", []):
        if "lines" in block:
            for line in block["lines"]:
                for span in line["spans"]:
                    print(f"Text: '{span['text']}' @ {span['bbox']} - Font: {span['font']} - Size: {span['size']}")
