export type ShareVariant = 'A' | 'B';

const SITE_URL = 'https://personality-site.vercel.app';

interface ShareTextParams {
  typeName: string;
  displayCode: string;
  extLabel: '陽キャ' | '無キャ' | '陰キャ';
  extPercent: number;
  catchphrase: string;
  variant: ShareVariant;
  platform: 'x' | 'line';
}

export function generateShareText({
  typeName, displayCode, extLabel, extPercent, catchphrase, variant, platform,
}: ShareTextParams): string {
  if (platform === 'x') {
    if (variant === 'A') {
      return `TC7診断、当たりすぎて怖い。\n\n結果:【${typeName}】${displayCode}（${extLabel}度${extPercent}%）\n\n"${catchphrase}"\n\n気になる人やってみ👇\n#TC7診断\n${SITE_URL}`;
    }
    return `21問で54タイプに分けられる\n性格診断やったらこうなった\n\n【${typeName}】${displayCode} ／${extLabel}度${extPercent}%\n"${catchphrase}"\n\n54タイプは多すぎやろ\n#TC7診断\n${SITE_URL}`;
  }
  // LINE
  if (variant === 'A') {
    return `TC7診断、当たりすぎて引いた\n\n【${typeName}】${displayCode}（${extLabel}度${extPercent}%）\n"${catchphrase}"\n\nお前もやってタイプ教えて\n${SITE_URL}`;
  }
  return `性格診断やったらタイプ多すぎて笑った\n\n【${typeName}】${displayCode} ／${extLabel}度${extPercent}%\n"${catchphrase}"\n\n54タイプあるらしい、やってみて\n${SITE_URL}`;
}
