/**
 * 旧コード(hlh_p) → 新表示コード(HLH+) に変換
 */
export function toDisplayCode(internalId: string): string {
  const parts = internalId.split('_');
  const levels = parts[0].toUpperCase(); // 'hlh' → 'HLH'
  const suffix = parts[1] === 'p' ? '+' : '-';
  return `${levels}${suffix}`;
}

/**
 * 新表示コード(HLH+) → 旧コード(hlh_p) に変換
 */
export function toInternalId(displayCode: string): string {
  const suffix = displayCode.slice(-1);
  const levels = displayCode.slice(0, -1).toLowerCase();
  const persistence = suffix === '+' ? 'p' : 'f';
  return `${levels}_${persistence}`;
}

/**
 * コードの各文字を人間が読める形で返す
 */
export function explainCode(displayCode: string): {
  ns: string; ha: string; rd: string; persistence: string;
} {
  const labels: Record<string, string> = { H: '高い', M: 'ふつう', L: '低い' };
  return {
    ns: labels[displayCode[0]],
    ha: labels[displayCode[1]],
    rd: labels[displayCode[2]],
    persistence: displayCode[3] === '+' ? '粘り強い' : '柔軟',
  };
}
