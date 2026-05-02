import {
  COMMON_FOOTER,
  CATEGORIES,
  CSV_PROMPT,
  ITEM_WRITING_RULES,
  SE_CATEGORY_HINTS,
  SE_PROMPT,
  STRUCTURE_RULES,
  SYSTEM_PROMPT_HEADER,
  TEMPO_EXAMPLES,
  TITLE_PATTERNS,
  TONE_RULES,
  type CategoryId,
  type Mode,
  WORD_CHOICE_RULES,
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
  cat: CategoryId | "";
  count: number;
  topic: string;
  mats: string;
  supp: string;
  seText: string;
  csvText: string;
  csvLabel: string;
};

export function buildForgePrompt(input: BuildForgePromptInput) {
  const {
    mode,
    cat,
    count,
    topic,
    mats,
    supp,
    seText,
    csvText,
    csvLabel,
  } = input;

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
      "- 台本本文",
      "- 視聴回数",
      "- 平均視聴率",
      "- 高評価数",
      "- チャンネル登録者増数",
      "- 視聴継続",
      "- 投稿日時",
      "- 評価メモ",
      "- 基礎プロンプトへ反映する改善仮説",
    ].join("\n");
  }

  if (mode === "se") {
    const hint = cat ? SE_CATEGORY_HINTS[cat] : "";
    return [
      SE_PROMPT,
      `\n# SE数量：全ての文に1個ずつ（目安：${getSeCount(count)}）`,
      `\n# カテゴリ別SE傾向\n${hint}`,
      `\n# CSV分割済みテキスト\n${seText}`,
    ].join("\n");
  }

  const tone = cat ? TONE_RULES[cat] : "";
  const category = CATEGORIES.find(c => c.id === cat);
  const label = category?.label || "未選択";
  const categorySub = category?.sub || "未選択";
  const suppBlock = supp.trim() ? `\n【補足説明・追加指示】\n${supp}` : "";

  return [
    SYSTEM_PROMPT_HEADER,
    STRUCTURE_RULES,
    `- 読み上げ尺：${getDuration(count)}`,
    `- 項目数：${count}選`,
    ITEM_WRITING_RULES,
    TITLE_PATTERNS,
    "\n# 文体ルール（最重要）",
    tone,
    WORD_CHOICE_RULES,
    TEMPO_EXAMPLES,
    COMMON_FOOTER,
    `\n---\n\n【お題】\n${topic || "（未入力）"}`,
    `\n【情報素材】\n${mats || "（未入力）"}`,
    `\n【カテゴリ】${label}`,
    `\n【カテゴリ補足】${categorySub}`,
    suppBlock,
  ].join("\n");
}
