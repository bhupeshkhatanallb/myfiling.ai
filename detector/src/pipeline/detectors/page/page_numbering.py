"""
PageNumberingDetector — continuous folio numbering (Stage 5 consumer).

PORTED VERBATIM from the prior engine's structure.py. This detector produces the
corpus's single CRITICAL (duplicate folios on p17 of diary 172759), so its
algorithms — region scoring, longest-non-decreasing denoise, genuine-vs-artifact
duplicate discrimination, gap-vs-unreadable reconciliation — are preserved
exactly. Only ``self.doc``->``self.ctx`` and ``.index``->``.pdf_page_no`` changed,
and folio extraction now lives in ``extractors.page_numbering``.
"""

from __future__ import annotations

import bisect
from typing import Any, Dict, List, Tuple

from ...base import Detector, DetectorResult
from ...finding import Finding, Severity, Confidence
from ...registry import register
from ...model import CORNER_REGIONS
from ...extractors.page_numbering import extract_folio_number
from ...feature_flags import PAGINATION_CHECKS_ENABLED


@register
class PageNumberingDetector(Detector):
    """Detects and validates continuous folio numbering."""

    name = "PageNumberingDetector"
    rule = "SC Rules, Order IV r.2 - Pagination"
    kind = "page"

    _TRUST_COVERAGE = 0.6

    def run(self) -> DetectorResult:
        details: Dict[str, Any] = {
            "total_pages": self.ctx.page_count,
            "numbering_region": None,
            "pages_with_numbers": 0,
            "numbering_coverage": 0.0,
            "sequence_gaps": [],
            "duplicate_numbers": [],
            "trusted": False,
        }
        # Pagination/folio checks are disabled until written page-number
        # detection is reliable (see feature_flags.PAGINATION_CHECKS_ENABLED).
        if not PAGINATION_CHECKS_ENABLED:
            details["disabled"] = "pagination checks temporarily disabled"
            return self.result(details=details, findings=[], confidence=Confidence.HIGH)

        if not self.ctx.text_scrutinizable:
            return self.unverified(fid="d_pgn_scan", what="Page Numbering", page=1)

        region_seqs = self._collect_region_sequences()
        best_region, folios = self._pick_best_region(region_seqs)
        details["numbering_region"] = best_region

        body_pages = max(1, self.ctx.page_count - 1)
        details["pages_with_numbers"] = len(folios)
        coverage = len(folios) / body_pages
        details["numbering_coverage"] = round(coverage * 100, 1)

        first_unnumbered = next(
            (p.pdf_page_no + 1 for p in self.ctx.pages
             if p.pdf_page_no >= 1 and p.pdf_page_no not in folios), 2)
        details["first_unnumbered_page"] = first_unnumbered

        findings: List[Finding] = []

        if not folios:
            findings.append(Finding(
                id="d_pgn_001", severity=Severity.CRITICAL, page=first_unnumbered,
                title="No Page Numbers Found",
                description=("No page (folio) numbers were detected on the body pages. "
                             "The Registry requires continuous folio numbering."),
                remediation="Number every page continuously (Arabic numerals), "
                            "typically top-right or top-centre.",
                confidence=Confidence.HIGH))
            return self.result(details=details, findings=findings, confidence=Confidence.HIGH)

        trusted = coverage >= self._TRUST_COVERAGE
        details["trusted"] = trusted

        duplicates = self._detect_duplicates(folios)
        gaps = self._detect_gaps(folios)
        details["duplicate_numbers"] = duplicates
        details["sequence_gaps"] = gaps

        if trusted and not self._numbering_is_reliable(folios, gaps):
            details["trusted"] = False
            findings.append(Finding(
                id="d_pgn_unrel", severity=Severity.WARNING, page=first_unnumbered,
                title="Page Numbering Could Not Be Reliably Verified",
                description=("Folio numbers were recovered but are internally "
                             "inconsistent (OCR noise / watermarks / citations bleeding "
                             "into the margin). Automated continuity checking is "
                             "unreliable for this document."),
                remediation="Manually confirm every page carries a unique, continuous folio number.",
                confidence=Confidence.LOW))
            return self.result(details=details, findings=findings, confidence=Confidence.LOW)

        if trusted:
            if duplicates:
                first = duplicates[0]
                findings.append(Finding(
                    id="d_pgn_dup", severity=Severity.CRITICAL,
                    page=first["page_index"] + 1,
                    title="Duplicate Page Numbers",
                    description=(f"Folio number {first['number']} appears on multiple "
                                 f"pages. Duplicate folios break the pagination."),
                    remediation="Re-number so every page has a unique, continuous folio.",
                    confidence=Confidence.HIGH))
            if gaps:
                missing_nums = [g["missing"] for g in gaps]
                missing = ", ".join(str(m) for m in missing_nums[:6])
                explained = self._gaps_explained_by_unreadable_pages(folios, missing_nums)
                if explained:
                    findings.append(Finding(
                        id="d_pgn_002m", severity=Severity.MINOR,
                        page=gaps[0]["page_index"] + 1,
                        title="Unreadable Folio Number(s)",
                        description=(f"Folio number(s) {missing} could not be read, but "
                                     f"surrounding pages are continuously numbered. The "
                                     f"page(s) likely carry a faint/garbled stamp."),
                        remediation=f"Confirm page(s) numbered {missing} carry a clear folio.",
                        confidence=Confidence.MEDIUM))
                else:
                    findings.append(Finding(
                        id="d_pgn_002", severity=Severity.CRITICAL,
                        page=gaps[0]["page_index"] + 1,
                        title="Non-Sequential Page Numbering",
                        description=(f"Folio numbering is not continuous; missing: "
                                     f"{missing}. The Registry objects to broken pagination."),
                        remediation="Ensure folio numbers run continuously without gaps.",
                        confidence=Confidence.HIGH))
            if not gaps and not duplicates and coverage < 0.95:
                findings.append(Finding(
                    id="d_pgn_003", severity=Severity.MINOR, page=first_unnumbered,
                    title="Some Pages May Be Missing Folio Numbers",
                    description=(f"Folio numbers were recovered from only "
                                 f"{details['numbering_coverage']}% of body pages. A few "
                                 f"pages may be unnumbered (or numbered outside the "
                                 f"margins); e.g. page {first_unnumbered}."),
                    remediation="Confirm every page carries a visible folio number.",
                    confidence=Confidence.MEDIUM))
            conf = Confidence.HIGH
        else:
            findings.append(Finding(
                id="d_pgn_lowcov", severity=Severity.MINOR, page=first_unnumbered,
                title="Page Numbering Could Not Be Fully Verified",
                description=(f"Folio numbers were recovered from only "
                             f"{details['numbering_coverage']}% of body pages, too few to "
                             f"confirm continuity automatically (e.g. page "
                             f"{first_unnumbered} has no readable folio)."),
                remediation="Verify folio numbering manually; place numbers consistently.",
                confidence=Confidence.LOW))
            conf = Confidence.LOW

        return self.result(details=details, findings=findings, confidence=conf)

    # ------------------------------------------------------------------ helpers
    def _collect_region_sequences(self) -> Dict[str, List[Tuple[int, int]]]:
        seqs: Dict[str, List[Tuple[int, int]]] = {r: [] for r in CORNER_REGIONS}
        corners = self.ctx.corner_tokens
        for p in self.ctx.pages:
            if p.pdf_page_no == 0:
                continue
            regions = corners[p.pdf_page_no]
            for region in CORNER_REGIONS:
                num = extract_folio_number(regions.get(region, ""))
                if num is not None:
                    seqs[region].append((p.pdf_page_no, num))
        return seqs

    def _score_region(self, seq: List[Tuple[int, int]]) -> float:
        if len(seq) < 2:
            return float(len(seq))
        nums = [n for _, n in seq]
        increasing = sum(1 for a, b in zip(nums, nums[1:]) if b >= a)
        mono = increasing / (len(nums) - 1)
        plus_one = sum(1 for a, b in zip(nums, nums[1:]) if b - a == 1)
        step = plus_one / (len(nums) - 1)
        return len(seq) * (0.5 + mono) * (0.5 + step)

    def _pick_best_region(self, region_seqs):
        best_region, best_score = None, 0.0
        for region, seq in region_seqs.items():
            score = self._score_region(seq)
            if score > best_score:
                best_score, best_region = score, region
        if best_region is None:
            return None, {}
        return best_region, dict(region_seqs[best_region])

    @staticmethod
    def _denoise(ordered: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
        if len(ordered) < 3:
            return ordered
        nums = [n for _, n in ordered]
        tails: List[int] = []
        tails_idx: List[int] = []
        prev = [-1] * len(nums)
        for i, v in enumerate(nums):
            pos = bisect.bisect_right(tails, v)
            if pos == len(tails):
                tails.append(v)
                tails_idx.append(i)
            else:
                tails[pos] = v
                tails_idx[pos] = i
            prev[i] = tails_idx[pos - 1] if pos > 0 else -1
        keep = set()
        k = tails_idx[-1]
        while k != -1:
            keep.add(k)
            k = prev[k]
        return [ordered[i] for i in range(len(ordered)) if i in keep]

    def _detect_duplicates(self, folios: Dict[int, int]) -> List[Dict]:
        ordered = sorted(folios.items())
        dups: List[Dict] = []
        for k in range(len(ordered) - 1):
            (idx_a, num_a) = ordered[k]
            (idx_b, num_b) = ordered[k + 1]
            if num_a != num_b:
                continue
            before = ordered[k - 1][1] if k - 1 >= 0 else num_a - 1
            after = ordered[k + 2][1] if k + 2 < len(ordered) else num_b + 1
            if before == num_a - 1 and after == num_b + 1:
                dups.append({"page_index": idx_b, "number": num_b})
        return dups

    def _numbering_is_reliable(self, folios: Dict[int, int], gaps: List[Dict]) -> bool:
        body_pages = max(1, self.ctx.page_count - 1)
        if len(gaps) > body_pages * 0.5:
            return False
        spine = self._denoise(sorted(folios.items()))
        spine_nums = [n for _, n in spine]
        if not spine_nums:
            return False
        span = spine_nums[-1] - spine_nums[0] + 1
        return span <= body_pages * 1.5 + 5

    def _gaps_explained_by_unreadable_pages(self, folios, missing_nums) -> bool:
        body_pages = max(1, self.ctx.page_count - 1)
        spine = self._denoise(sorted(folios.items()))
        spine_nums = [n for _, n in spine]
        if not spine_nums:
            return False
        unreadable_pages = body_pages - len(spine_nums)
        if unreadable_pages < len(missing_nums):
            return False
        span = spine_nums[-1] - spine_nums[0] + 1
        return span <= body_pages * 1.15 + 3

    def _detect_gaps(self, folios: Dict[int, int]) -> List[Dict]:
        gaps: List[Dict] = []
        ordered = self._denoise(sorted(folios.items()))
        for (idx_a, num_a), (idx_b, num_b) in zip(ordered, ordered[1:]):
            if num_b - num_a > 1:
                for missing in range(num_a + 1, num_b):
                    gaps.append({"page_index": idx_a, "missing": missing,
                                 "between": [num_a, num_b]})
        return gaps
