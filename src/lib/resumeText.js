const EMPTY_VALUES = new Set(['なし', '無し', '未入力', '（未入力）', '(未入力)', 'N/A', 'n/a', '-', '—']);

// Generated resumes sometimes echo "なし" for fields the candidate left blank — treat those as empty.
export function cleanText(value) {
  const text = String(value ?? '').trim();
  return EMPTY_VALUES.has(text) ? '' : text;
}