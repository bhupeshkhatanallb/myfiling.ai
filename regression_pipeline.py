"""Regression harness for the V2 pipeline — mirrors regression.py for the new engine.

Runs the pipeline DetectorEngine over the corpus and prints, per file, the same
summary format as regression.py so the two can be diffed line-for-line.
"""
import sys, os, time, glob, traceback
sys.path.insert(0, "detector/src")
from pipeline import DetectorEngine

ROOT = "test_pdf"


def latest_per_diary():
    out = []
    for d in sorted(glob.glob(os.path.join(ROOT, "diary_*"))):
        pdfs = sorted(glob.glob(os.path.join(d, "*.pdf")))
        if pdfs:
            out.append(pdfs[-1])
    return out


def run(paths):
    agg = {"critical": 0, "warning": 0, "minor": 0}
    titles = {}
    total_t = 0.0
    for path in paths:
        rel = os.path.relpath(path, ROOT)
        try:
            t = time.time()
            eng = DetectorEngine(path)
            res = eng.run_all(parallel=True)
            dt = time.time() - t
            total_t += dt
            s = res["summary"]
            doc = eng.doc
            scanned = doc.is_scanned
            print(f"\n{rel}  | pages={doc.page_count} scanned={scanned} "
                  f"time={dt:.1f}s  C{s['critical_count']}/W{s['warning_count']}/M{s['minor_count']}"
                  f"  idx={res['index']['entries']} bm={res['bookmarks']['count']}")
            for dfct in res["defects"]:
                sev = dfct["severity"]
                agg[sev] = agg.get(sev, 0) + 1
                titles[dfct["title"]] = titles.get(dfct["title"], 0) + 1
                print(f"    [{sev:8}] p{dfct.get('page')}: {dfct['title']}")
        except Exception as e:
            print(f"\n{rel}  | ENGINE CRASH: {e}")
            traceback.print_exc()
    print("\n" + "=" * 60)
    print(f"FILES: {len(paths)}  total_time={total_t:.1f}s  avg={total_t/max(1,len(paths)):.1f}s")
    print("DEFECT TOTALS:", agg)
    print("BY TITLE:")
    for t, c in sorted(titles.items(), key=lambda x: -x[1]):
        print(f"   {c:3}  {t}")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args == ["--latest"]:
        paths = latest_per_diary()
    elif args:
        paths = args
    else:
        paths = sorted(glob.glob(os.path.join(ROOT, "**", "*.pdf"), recursive=True))
    run(paths)
