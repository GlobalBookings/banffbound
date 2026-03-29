#!/usr/bin/env python3
"""
Purge AI-sounding superlatives from blog content files.
Replaces overused words with natural, varied alternatives.
Only modifies HTML string content — never touches TypeScript code.
"""

import re
import os
import json
from collections import defaultdict

BASE_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

FILES = [
    'blogContent.ts',
    'blogContent1.ts',
    'blogContent2.ts',
    'blogContent3.ts',
]

# ── Word-level replacements ──────────────────────────────────────────────
# Each key maps to a list of alternatives that will be cycled through.
WORD_REPLACEMENTS = {
    'spectacular':    ['impressive', 'dramatic', 'striking', 'remarkable', 'incredible'],
    'stunning':       ['beautiful', 'gorgeous', 'remarkable', 'jaw-dropping', 'incredible'],
    'unforgettable':  ['memorable', 'remarkable', 'one-of-a-kind', 'standout', 'incredible'],
    'world-class':    ['top-tier', 'exceptional', 'outstanding', 'renowned', 'excellent'],
    'pristine':       ['clean', 'untouched', 'crystal-clear', 'pure', 'fresh'],
    'extraordinary':  ['remarkable', 'exceptional', 'impressive', 'notable', 'rare'],
    'ultimate':       ['complete', 'comprehensive', 'definitive', 'top', 'best'],
    'nestled':        ['tucked', 'set', 'located', 'sitting', 'found'],
    'unparalleled':   ['unmatched', 'exceptional', 'rare', 'outstanding', 'unique'],
    'curated':        ['selected', 'chosen', 'picked', 'compiled', 'hand-picked'],
    'exquisite':      ['fine', 'elegant', 'refined', 'delicate'],
}

PHRASE_REPLACEMENTS = {
    'hidden gem':  ['local favourite', 'lesser-known spot', 'quiet find', 'off-the-radar spot'],
}

# ── "whether you're" rephrasing patterns ─────────────────────────────────
# We match the whole "whether you're <X> or <Y>" construction and rephrase.
WHETHER_PATTERN = re.compile(
    r"[Ww]hether you(?:'re|'re| are)\b",
    re.IGNORECASE,
)
WHETHER_ALTS = [
    "If you're",
    "For those",
    "If you're",
    "For anyone",
    "For those",
]


def _match_case(original: str, replacement: str) -> str:
    """Preserve the case pattern of the original word."""
    if original.isupper():
        return replacement.upper()
    if original[0].isupper():
        return replacement[0].upper() + replacement[1:]
    return replacement


class CyclingReplacer:
    """Cycles through a list of alternatives for each target word."""

    def __init__(self):
        self._counters: dict[str, int] = defaultdict(int)
        self.stats: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))

    def _next(self, key: str, alts: list[str]) -> str:
        idx = self._counters[key] % len(alts)
        self._counters[key] += 1
        return alts[idx]

    # ── word-level replacement ───────────────────────────────────────
    def replace_words(self, text: str, filename: str) -> str:
        for target, alts in WORD_REPLACEMENTS.items():
            pattern = re.compile(re.escape(target), re.IGNORECASE)
            def _sub(m, _target=target, _alts=alts):
                alt = self._next(_target, _alts)
                result = _match_case(m.group(0), alt)
                self.stats[filename][_target] += 1
                return result
            text = pattern.sub(_sub, text)
        return text

    # ── phrase-level replacement ─────────────────────────────────────
    def replace_phrases(self, text: str, filename: str) -> str:
        for target, alts in PHRASE_REPLACEMENTS.items():
            pattern = re.compile(re.escape(target), re.IGNORECASE)
            def _sub(m, _target=target, _alts=alts):
                alt = self._next(_target, _alts)
                result = _match_case(m.group(0), alt)
                self.stats[filename][_target] += 1
                return result
            text = pattern.sub(_sub, text)
        return text

    # ── "whether you're" rephrasing ──────────────────────────────────
    def replace_whether(self, text: str, filename: str) -> str:
        def _sub(m):
            alt = self._next('whether_youre', WHETHER_ALTS)
            self.stats[filename]["whether you're"] += 1
            # Preserve original capitalisation of start
            if m.group(0)[0].isupper():
                return alt[0].upper() + alt[1:]
            return alt[0].lower() + alt[1:]
        text = WHETHER_PATTERN.sub(_sub, text)
        return text


def process_file(filepath: str, replacer: CyclingReplacer) -> None:
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We only want to edit inside template-literal strings (between backticks).
    # Strategy: split on backtick boundaries, process only the HTML parts.
    parts = content.split('`')
    # Odd-indexed parts are inside backtick template literals (the HTML content).
    for i in range(1, len(parts), 2):
        original = parts[i]
        modified = replacer.replace_phrases(original, filename)
        modified = replacer.replace_words(modified, filename)
        modified = replacer.replace_whether(modified, filename)
        parts[i] = modified

    new_content = '`'.join(parts)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)


def main():
    replacer = CyclingReplacer()

    for fname in FILES:
        fpath = os.path.join(BASE_DIR, fname)
        if not os.path.isfile(fpath):
            print(f"⚠  Skipped (not found): {fpath}")
            continue
        process_file(fpath, replacer)

    # ── Report ───────────────────────────────────────────────────────
    grand_total = 0
    print("\n" + "=" * 65)
    print("  SUPERLATIVE PURGE — REPLACEMENT REPORT")
    print("=" * 65)

    for fname in FILES:
        file_stats = replacer.stats.get(fname, {})
        if not file_stats:
            continue
        file_total = sum(file_stats.values())
        grand_total += file_total
        print(f"\n📄 {fname}  ({file_total} replacements)")
        print("-" * 45)
        for word in sorted(file_stats, key=lambda w: -file_stats[w]):
            print(f"   {word:<22} → {file_stats[word]:>4}")

    print(f"\n{'=' * 65}")
    print(f"  GRAND TOTAL: {grand_total} replacements across {len(FILES)} files")
    print(f"{'=' * 65}\n")


if __name__ == '__main__':
    main()
