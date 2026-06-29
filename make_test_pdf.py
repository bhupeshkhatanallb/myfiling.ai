"""Generate a realistic Supreme Court filing PDF to exercise the detectors."""
import hashlib
# Work around reportlab passing usedforsecurity= to md5 on this Python build.
_orig_md5 = hashlib.md5
def _md5(data=b"", **kwargs):
    kwargs.pop("usedforsecurity", None)
    return _orig_md5(data)
hashlib.md5 = _md5

import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

os.makedirs("dashboard/Test_pdf", exist_ok=True)
path = "dashboard/Test_pdf/sample_filing.pdf"
c = canvas.Canvas(path, pagesize=A4)
w, h = A4

def page_num(n):
    c.setFont("Helvetica", 10)
    c.drawRightString(w - 0.6 * inch, h - 0.6 * inch, str(n))

def heading(text):
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(w / 2, h - 1.5 * inch, text)

def body(text):
    c.setFont("Helvetica", 11)
    c.drawString(1 * inch, h - 2.2 * inch, text)

# Page 1: Cover (no number — correct)
c.setFont("Helvetica-Bold", 14)
c.drawCentredString(w / 2, h - 2 * inch, "IN THE SUPREME COURT OF INDIA")
c.drawCentredString(w / 2, h - 2.4 * inch, "CIVIL APPELLATE JURISDICTION")
c.setFont("Helvetica", 12)
c.drawCentredString(w / 2, h - 3 * inch, "WRIT PETITION (CIVIL) NO. ___ OF 2026")
c.showPage()

# Page 2: Vakalatnama
page_num(2); heading("VAKALATNAMA")
body("I, the petitioner, hereby appoint the advocate-on-record.")
c.showPage()

# Page 3: Index
page_num(3); heading("INDEX")
c.setFont("Helvetica", 11)
y = h - 2.2 * inch
for line in ["1 SYNOPSIS 4", "2 STATEMENT OF FACTS 5", "3 ARGUMENTS 6", "4 PRAYER 7"]:
    c.drawString(1 * inch, y, line); y -= 0.3 * inch
c.showPage()

# Page 4: Synopsis
page_num(4); heading("SYNOPSIS"); body("This matter concerns a question of law.")
c.showPage()

# Page 5: Facts
page_num(5); heading("STATEMENT OF FACTS"); body("The facts are as follows.")
c.showPage()

# Page 6: Arguments
page_num(6); heading("ARGUMENTS"); body("The petitioner submits these legal arguments.")
c.showPage()

# Page 7: Prayer (annexures deliberately omitted -> should flag a defect)
page_num(7); heading("PRAYER"); body("It is therefore prayed that this Court grant relief.")
c.showPage()

c.save()
print("[OK] Created %s (%d bytes)" % (path, os.path.getsize(path)))
