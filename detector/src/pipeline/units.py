"""
Unit constants and standard paper sizes (PDF points).

Single source of truth so every detector measures against the same numbers.
1 pt = 1/72 inch. 1 inch = 2.54 cm => 1 cm = 72/2.54 = 28.3465 pt.

(Ported verbatim from the prior engine - these physical constants and the SC
spec targets are not changing in the rewrite.)
"""

CM = 28.3465          # points per centimetre
INCH = 72.0           # points per inch

# Standard sizes in points (portrait). A4 is the SC requirement: 21.0 x 29.7 cm.
A4_W, A4_H = 595.276, 841.890        # 21.0cm x 29.7cm
LETTER_W, LETTER_H = 612.0, 792.0    # 8.5in x 11in
LEGAL_W, LEGAL_H = 612.0, 1008.0     # 8.5in x 14in

# Spec targets (Supreme Court formatting brief).
SPEC_BODY_PT = 14.0
SPEC_QUOTE_PT = 12.0
SPEC_LINE_SPACING = 1.5
SPEC_MARGIN_LR_CM = 4.0       # left & right
SPEC_MARGIN_TB_CM = 2.0       # top & bottom


def pt_to_cm(pt: float) -> float:
    return pt / CM


def cm_to_pt(cm: float) -> float:
    return cm * CM
