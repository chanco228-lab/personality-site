import {
  CSV_PROMPT,
  IDEA_DEEP_DIVE_PROMPT,
  SE_PROMPT,
  SCRIPT_PROMPT_V5,
  type Mode,
} from "@/data/forge/promptConfig";

export function getDuration(n: number) {
  if (n <= 1) return "30〜45秒";
  if (n <= 3) return "45〜60秒";
  if (n <= 5) return "60〜75秒";
  if (n <= 7) return "70〜90秒";
  if (n <= 10) return "80〜100秒";
  if (n <= 15) return "90〜120秒";
  if (n <= 20) return "120〜150秒";
  return "150秒以上";
}

export function getSeCount(n: number) {
  if (n <= 1) return "8〜12個";
  if (n <= 3) return "12〜18個";
  if (n <= 5) return "18〜24個";
  if (n <= 7) return "22〜30個";
  if (n <= 10) return "28〜38個";
  if (n <= 15) return "35〜48個";
  if (n <= 20) return "45〜60個";
  return "55個以上";
}

type BuildForgePromptInput = {
  mode: Mode;
  count: number;
  topic: string;
  mats: string;
  supp: string;
  seText: string;
  csvText: string;
  csvLabel: string;
  ideaText: string;
};

export function buildForgePrompt(input: BuildForgePromptInput) {
  const {
    mode,
    count,
    topic,
    mats,
    supp,
    seText,
    csvText,
    csvLabel,
    ideaText,
  } = input;

  if (mode === "idea") {
    return [
      IDEA_DEEP_DIVE_PROMPT,
      `\n---\n\n【ネタの原石】\n${ideaText || "（未入力）"}`,
    ].join("\n");
  }

  if (mode === "csv") {
    return CSV_PROMPT.replace(/ラベル/g, csvLabel) + `\n\n# ラベル：${csvLabel}\n\n# 台本\n${csvText}`;
  }

  if (mode === "review") {
    return [
      "# FORGE 評価DB",
      "",
      "用途: 蓄積データを、台本生成プロンプトの基礎文を改善するための研究ログとして整理",
      "推奨保存方法: CSV / TXT を手動ダウンロードして Excel やメモで管理",
      "重要: 蓄積データは実際の台本生成プロンプトには混ぜない。多すぎる過去データで生成品質を落とさないため、改善は基礎プロンプトの改訂時だけに使う。",
      "",
      "このタブでは次の情報をまとめて保存する:",
      "- タイトル（台本生成のお題とは分離）",
      "- 作成元（AI作 / 自作 / 他人作 / 不明）",
      "- ネタ種類タグ",
      "- 台本本文",
      "- YouTube指標（不明なものは空欄で保存）",
      "- 評価メモ",
      "- 基礎プロンプトへ反映する改善仮説",
    ].join("\n");
  }

  if (mode === "se") {
    return [
      SE_PROMPT,
      `\n# SE数量：全ての文に1個ずつ（目安：${getSeCount(count)}）`,
      `\n# CSV分割済みテキスト\n${seText}`,
    ].join("\n");
  }

  const supplementBlock = supp.trim()
    ? `【補足説明・追加指示】\n${supp.trim()}`
    : "【補足説明・追加指示】\n（未入力）";

  return SCRIPT_PROMPT_V5
    .replaceAll("{{count}}", String(count))
    .replaceAll("{{duration}}", getDuration(count))
    .replaceAll("{{topic}}", topic || "（未入力）")
    .replaceAll("{{materials}}", mats || "（未入力）")
    .replaceAll("{{supplementBlock}}", supplementBlock);
}
