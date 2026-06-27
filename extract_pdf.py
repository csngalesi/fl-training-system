import sys
try:
    import PyPDF2
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

try:
    with open('Elite_Soccer_Engineering.pdf', 'rb') as f:
        pdf = PyPDF2.PdfReader(f)
        print(f"PAGES: {len(pdf.pages)}")
        for i, p in enumerate(pdf.pages):
            print(f"\n--- PAGE {i+1} ---")
            text = p.extract_text()
            print(text.strip().replace("\n", " ")[:150])
except Exception as e:
    print("ERROR:", e)
