"""
Unit tests for the V2 pipeline (no PDF I/O required for most).

Covers the new machinery the rewrite introduced: chunked reader contract, the
DefectSink 20-cap, folio extraction parity, index grammar, title detection
precedence, the streaming processor event sequence, and validator precision
guards. Run: ``python test_pipeline.py``.
"""

import sys
import os
import asyncio

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "detector", "src"))

import pipeline  # noqa: E402
from pipeline.base import DefectSink, MAX_DEFECTS_PER_DETECTOR  # noqa: E402
from pipeline.finding import Finding, Severity, Confidence  # noqa: E402
from pipeline.extractors.page_numbering import extract_folio_number  # noqa: E402
from pipeline.extractors.index import parse_index_entries  # noqa: E402
from pipeline.model import detect_page_title  # noqa: E402
from pipeline.reader import ChunkReader, RawPage  # noqa: E402

PASS = 0
FAIL = 0


def check(name, cond):
    global PASS, FAIL
    if cond:
        PASS += 1
    else:
        FAIL += 1
        print(f"  FAIL: {name}")


# --- DefectSink 20-cap ------------------------------------------------------ #
def test_defect_cap():
    streamed = []
    sink = DefectSink("X", on_finding=lambda f: streamed.append(f))
    for i in range(30):
        sink.push(Finding(id=f"f{i}", severity=Severity.MINOR, title="t",
                          description="d", remediation="r"))
    check("cap truncates to 20", len(sink.findings) == MAX_DEFECTS_PER_DETECTOR)
    check("cap flag set", sink.capped is True)
    check("streamed exactly 20", len(streamed) == 20)
    check("push returns False when full", sink.push(
        Finding(id="z", severity=Severity.MINOR, title="t", description="d",
                remediation="r")) is False)
    check("source stamped", all(f.source == "X" for f in sink.findings))


# --- folio extraction (parity with prior engine) ---------------------------- #
def test_folio():
    cases = {"3": 3, "3.": 3, "1  IN THE HIGH": 1, "39 ted 14.07": 39,
             "2'0 2026:DHC": 20, "I": None, "V": None, "?": None, "": None}
    for raw, want in cases.items():
        check(f"folio {raw!r}->{want}", extract_folio_number(raw) == want)


# --- index grammar ---------------------------------------------------------- #
def test_index():
    text = ("1. Synopsis & List of Dates 1 - 5\n"
            "2. Cause Title 6\n"
            "3. ANNEXURE P-1 Copy of order 10 - 20\n")
    entries = parse_index_entries(text)
    check("3 index entries", len(entries) == 3)
    check("entry1 range", entries[0].start_page_no == 1 and entries[0].end_page_no == 5)
    check("annexure parsed", 1 in entries[2].annexures)


# --- title detection precedence (specific over cause-title header) ---------- #
def test_titles():
    # A synopsis page that ALSO carries the court-name running header must be
    # tagged Synopsis, not Cause Title.
    syn = "IN THE SUPREME COURT OF INDIA\nSYNOPSIS\nThe present petition..."
    check("synopsis beats cause-title header", detect_page_title(syn) == "Synopsis & List of Dates")
    cause = "IN THE HIGH COURT OF DELHI\nIN THE MATTER OF:\nA vs B"
    check("plain cause title", detect_page_title(cause) == "Cause Title")
    # A page that only mentions 'affidavit' deep in the body is not the affidavit
    # section (no short heading line) -> None.
    body = "X" * 80 + "\nsome long paragraph mentioning affidavit somewhere here in prose text"
    check("no false affidavit from body mention", detect_page_title(body) != "Affidavit")


# --- ChunkReader contract --------------------------------------------------- #
def test_chunk_reader():
    # Build a tiny PDF on the fly if reportlab is available; else skip gracefully.
    try:
        import fitz
    except Exception:
        print("  (skip ChunkReader: PyMuPDF unavailable)")
        return
    import tempfile
    doc = fitz.open()
    for i in range(7):
        page = doc.new_page()
        page.insert_text((72, 72), f"Page {i+1} body text " * 10)
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.close()
    doc.save(tmp.name); doc.close()
    try:
        with ChunkReader(tmp.name, chunk_size=3) as r:
            check("page_count=7", r.page_count == 7)
            chunks = list(r.chunks())
            check("3 chunks (3+3+1)", [len(c) for c in chunks] == [3, 3, 1])
            check("all RawPage", all(isinstance(p, RawPage) for c in chunks for p in c))
            check("indices contiguous", [p.index for c in chunks for p in c] == list(range(7)))
    finally:
        os.unlink(tmp.name)


# --- streaming processor event order ---------------------------------------- #
def test_processor_stream():
    try:
        import fitz
    except Exception:
        print("  (skip processor: PyMuPDF unavailable)")
        return
    import tempfile
    from pipeline.processor import DocumentProcessor
    doc = fitz.open()
    for i in range(4):
        page = doc.new_page()
        page.insert_text((72, 72), "IN THE SUPREME COURT OF INDIA\nbody text " * 20)
    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    tmp.close()
    doc.save(tmp.name); doc.close()

    async def drive():
        types = []
        async for ev in DocumentProcessor(tmp.name).stream():
            types.append(ev.type)
        return types

    try:
        types = asyncio.run(drive())
        check("emits progress", "progress" in types)
        check("emits summary", "summary" in types)
        check("terminal done", types[-1] == "done")
        check("summary before done", types.index("summary") < types.index("done"))
    finally:
        os.unlink(tmp.name)


# --- TextLayerDetector (no-text-layer = defect) ----------------------------- #
def test_text_layer():
    from pipeline.model import DocumentContext, PageMetadata
    from pipeline.detectors.page.text_layer import TextLayerDetector

    def page(idx, selectable, mode="native"):
        return PageMetadata(pdf_page_no=idx, width=595, height=842,
                            char_count=(100 if selectable else 2), image_count=1,
                            text=("body" if selectable else ""),
                            text_selectable=selectable, extraction_mode=mode)

    # 70/84 (83%) image pages -> overwhelmingly unsearchable -> CRITICAL.
    pages = [page(i, selectable=(i < 14)) for i in range(84)]
    ctx = DocumentContext("x", pages, 84)
    res = TextLayerDetector(ctx).run()
    crit = [f for f in res.findings if f.severity == Severity.CRITICAL]
    check("image-only doc -> critical no-text-layer", len(crit) == 1)
    check("critical id", crit and crit[0].id == "d_textlayer_001")

    # 60% of pages unsearchable (majority but not all) -> WARNING.
    pages = [page(i, selectable=(i >= 60)) for i in range(100)]  # 60/100
    res = TextLayerDetector(DocumentContext("x", pages, 100)).run()
    check("majority-scanned -> warning", any(f.id == "d_textlayer_002" for f in res.findings))

    # 27% scanned annexures (normal native petition + annexure block) -> SILENT.
    # This is the corpus false-positive case the calibration must NOT flag.
    pages = [page(i, selectable=(i >= 21)) for i in range(78)]  # 21/78 = 27%
    res = TextLayerDetector(DocumentContext("x", pages, 78)).run()
    check("normal scanned annexures -> no defect", len(res.findings) == 0)

    # Clean native filing (a couple of signature scans) -> silent.
    pages = [page(i, selectable=(i >= 2)) for i in range(50)]  # 2/50 = 4%
    res = TextLayerDetector(DocumentContext("x", pages, 50)).run()
    check("native filing -> no text-layer defect", len(res.findings) == 0)

    # OCR'd pages count as no-text-layer (the filed PDF wasn't searchable).
    pages = [page(i, selectable=False, mode="ocr") for i in range(40)]
    res = TextLayerDetector(DocumentContext("x", pages, 40, ocr_used=True)).run()
    crit = [f for f in res.findings if f.severity == Severity.CRITICAL]
    check("OCR'd doc still flagged not-searchable", len(crit) == 1)


if __name__ == "__main__":
    print("Running pipeline unit tests...")
    test_defect_cap()
    test_folio()
    test_index()
    test_titles()
    test_chunk_reader()
    test_processor_stream()
    test_text_layer()
    print(f"\n{PASS} passed, {FAIL} failed")
    sys.exit(1 if FAIL else 0)
