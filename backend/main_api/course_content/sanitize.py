"""Text cleaning for admin-authored content.

Defence in depth only: the frontend must still render content as plain
markdown/React text and never via innerHTML.
"""
import re
import unicodedata

_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_HTML_TAG = re.compile(r"</?[A-Za-z!][^>\n]*>")
_BAD_LINK = re.compile(r"\]\(\s*(?:javascript|vbscript|data):[^)]*\)", re.IGNORECASE)


def clean_code(value: str) -> str:
    """Control characters only: code legitimately contains < and >."""
    return _CONTROL.sub("", unicodedata.normalize("NFC", value))


def clean_text(value: str) -> str:
    """Control characters, raw HTML tags and script-scheme markdown links."""
    value = clean_code(value)
    value = _HTML_TAG.sub("", value)
    return _BAD_LINK.sub("](#)", value)


def clean_line(value: str) -> str:
    """Single-line text (titles, labels): clean_text plus collapsed whitespace."""
    return " ".join(clean_text(value).split())
