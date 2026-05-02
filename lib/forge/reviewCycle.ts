import { TOPIC_TAGS, type TopicTagId } from "@/data/forge/promptConfig";

export type ForgeMetric = number | null;
export type ForgeScriptSource = "ai" | "self" | "other" | "unknown";

export const SCRIPT_SOURCE_LABELS: Record<ForgeScriptSource, string> = {
  ai: "AI作",
  self: "自作",
  other: "他人作",
  unknown: "不明",
};

export type ForgeAnalytics = {
  views: ForgeMetric;
  avgViewRate: ForgeMetric;
  likes: ForgeMetric;
  subscriberGain: ForgeMetric;
  retentionLevel: "high" | "mid" | "low" | "";
  postedAt: string;
};

export type ForgeReviewEntry = {
  id: string;
  savedAt: string;
  topicTag: TopicTagId | "";
  sourceType: ForgeScriptSource;
  sourceName: string;
  topic: string;
  score: number;
  promptSnapshot: string;
  script: string;
  resultMemo: string;
  nextRule: string;
  analytics: ForgeAnalytics;
};

function normalizeMetric(value: unknown): ForgeMetric {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const normalized = String(value ?? "").trim();
  if (!normalized || normalized === "不明" || normalized === "-") return null;

  const parsed = Number(normalized.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function metricForSort(value: ForgeMetric, fallback: number) {
  return value ?? fallback;
}

function metricLabel(value: ForgeMetric, suffix = "") {
  return value === null ? "不明" : `${value}${suffix}`;
}

function normalizeAnalytics(value: unknown): ForgeAnalytics {
  const src = (typeof value === "object" && value !== null ? value : {}) as Partial<ForgeAnalytics>;
  return {
    views: normalizeMetric(src.views),
    avgViewRate: normalizeMetric(src.avgViewRate),
    likes: normalizeMetric(src.likes),
    subscriberGain: normalizeMetric(src.subscriberGain),
    retentionLevel: src.retentionLevel === "high" || src.retentionLevel === "mid" || src.retentionLevel === "low"
      ? src.retentionLevel
      : "",
    postedAt: typeof src.postedAt === "string" ? src.postedAt : "",
  };
}

function normalizeRetentionLevel(value: string): ForgeAnalytics["retentionLevel"] {
  if (value === "high" || value === "高い") return "high";
  if (value === "mid" || value === "普通") return "mid";
  if (value === "low" || value === "弱い") return "low";
  return "";
}

function normalizeScriptSource(value: string): ForgeScriptSource {
  const normalized = value.trim();
  const matched = (Object.entries(SCRIPT_SOURCE_LABELS) as Array<[ForgeScriptSource, string]>)
    .find(([id, label]) => id === normalized || label === normalized);
  return matched?.[0] || "unknown";
}

function normalizeTopicTag(value: string): TopicTagId | "" {
  const normalized = value.trim();
  const matched = TOPIC_TAGS.find(tag => tag.id === normalized || tag.label === normalized);
  if (matched) return matched.id;
  return "";
}

function topicTagLabel(value: TopicTagId | "") {
  return TOPIC_TAGS.find(tag => tag.id === value)?.label || "";
}

function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const text = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === "\"") {
        if (text[i + 1] === "\"") {
          cell += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === "\"") {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

function cellByHeader(row: string[], indexByHeader: Map<string, number>, names: string[]) {
  for (const name of names) {
    const index = indexByHeader.get(name);
    if (index !== undefined) return row[index] || "";
  }
  return "";
}

function reviewEntryKey(entry: ForgeReviewEntry) {
  return [
    entry.savedAt,
    entry.topic,
    entry.sourceType,
    entry.script.slice(0, 120),
  ].join("\u0001");
}


export function buildAnalyticsInsights(analytics: ForgeAnalytics) {
  const insights: string[] = [];
  const rules: string[] = [];

  if (analytics.avgViewRate !== null && analytics.avgViewRate < 65) {
    insights.push("平均視聴率が低め。中盤のテンポ落ちや前置き過多の可能性");
    rules.push("各順位の1文目を短くし、2文目までに強い情報を出す");
  }

  if (analytics.retentionLevel === "low") {
    insights.push("視聴継続が弱い。導入か前半で離脱されている可能性");
    rules.push("導入説明を削り、1行目から強い対象名と異常値を入れる");
  }

  if (analytics.views !== null && analytics.likes !== null && analytics.views > 0) {
    const likeRate = analytics.likes / analytics.views;

    if (likeRate < 0.02) {
      insights.push("高評価率が低め。感情の振れ幅や納得感が弱い可能性");
      rules.push("比喩か強めの断定を1項目につき1つ入れる");
    }
  }

  if (analytics.subscriberGain !== null && analytics.views !== null && analytics.subscriberGain <= 0 && analytics.views > 0) {
    insights.push("登録者増が弱い。継続して見たい理由やキャラ立ちが薄い可能性");
    rules.push("締めで次回も見たくなる予告かシリーズ感を入れる");
  }

  if (analytics.postedAt) {
    const date = new Date(analytics.postedAt);
    if (!Number.isNaN(date.getTime())) {
      insights.push(`投稿日時メモ: ${date.toLocaleString("ja-JP")} に投稿`);
    }
  }

  return {
    insights,
    rules: [...new Set(rules)],
  };
}

export function buildImprovementMemo(entries: ForgeReviewEntry[]) {
  const recent = [...entries]
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
    .slice(0, 8);

  const picked: string[] = [];

  for (const entry of recent) {
    if (entry.nextRule.trim()) picked.push(`- ${entry.nextRule.trim()}`);
    if (entry.score <= 3 && entry.resultMemo.trim()) {
      picked.push(`- NG例メモ: ${entry.resultMemo.trim()}`);
    }
    const analytics = buildAnalyticsInsights(entry.analytics);
    for (const rule of analytics.rules) {
      picked.push(`- 指標改善: ${rule}`);
    }
  }

  return [...new Set(picked)].slice(0, 8).join("\n");
}

function entryTitle(entry: ForgeReviewEntry) {
  return entry.topic || entry.script.split(/\r?\n/).find(line => line.trim()) || "無題の台本";
}

function retentionLabel(value: ForgeAnalytics["retentionLevel"]) {
  if (value === "high") return "高い";
  if (value === "low") return "弱い";
  if (value === "mid") return "普通";
  return "不明";
}

export function buildPromptImprovementReport(entries: ForgeReviewEntry[]) {
  const uniqueRules = buildImprovementMemo(entries);
  const topEntries = [...entries]
    .sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
      const viewRateDiff = metricForSort(b.analytics.avgViewRate, -1) - metricForSort(a.analytics.avgViewRate, -1);
      if (viewRateDiff !== 0) return viewRateDiff;
      return metricForSort(b.analytics.views, -1) - metricForSort(a.analytics.views, -1);
    })
    .slice(0, 5);
  const weakEntries = [...entries]
    .sort((a, b) => {
      const scoreDiff = a.score - b.score;
      if (scoreDiff !== 0) return scoreDiff;
      return metricForSort(a.analytics.avgViewRate, 101) - metricForSort(b.analytics.avgViewRate, 101);
    })
    .slice(0, 5);

  const topLines = topEntries.map(entry => (
    `- ${entryTitle(entry)} / ${SCRIPT_SOURCE_LABELS[entry.sourceType]}${entry.sourceName ? `:${entry.sourceName}` : ""} / ${topicTagLabel(entry.topicTag) || "ネタ種類未設定"} / 評価${entry.score} / 視聴${metricLabel(entry.analytics.views)} / 平均視聴率${metricLabel(entry.analytics.avgViewRate, "%")} / 登録者増${metricLabel(entry.analytics.subscriberGain)} / 継続${retentionLabel(entry.analytics.retentionLevel)}`
  ));
  const weakLines = weakEntries.map(entry => (
    `- ${entryTitle(entry)} / ${SCRIPT_SOURCE_LABELS[entry.sourceType]}${entry.sourceName ? `:${entry.sourceName}` : ""} / ${topicTagLabel(entry.topicTag) || "ネタ種類未設定"} / 評価${entry.score} / 視聴${metricLabel(entry.analytics.views)} / 平均視聴率${metricLabel(entry.analytics.avgViewRate, "%")} / 登録者増${metricLabel(entry.analytics.subscriberGain)} / 継続${retentionLabel(entry.analytics.retentionLevel)} / メモ: ${entry.resultMemo || entry.nextRule || "未記入"}`
  ));

  return [
    "# SCRIPT FORGE 基礎プロンプト改善レポート",
    "",
    "目的: 蓄積データを台本生成時に直接混ぜず、基礎プロンプトを改訂する判断材料として使う。",
    "運用: このレポートを見て、promptConfig.ts の基礎文・文体ルール・NG表現・構成ルールだけを定期的に更新する。",
    "",
    "## 基礎プロンプトへの改訂候補",
    uniqueRules || "- まだ十分な評価データがありません。",
    "",
    "## 伸びた台本候補から見る勝ち要素",
    topLines.length > 0 ? topLines.join("\n") : "- まだデータがありません。",
    "",
    "## 改善優先の台本から見る負け要素",
    weakLines.length > 0 ? weakLines.join("\n") : "- まだデータがありません。",
    "",
    "## 次の改訂で見る観点",
    "- 冒頭1〜2文のフックは強くなっているか",
    "- 中盤で説明が長くなりすぎていないか",
    "- 高評価や登録者増につながる主観・比喩・締めがあるか",
    "- 投稿日時の偏りで結果を誤読していないか",
  ].join("\n");
}

function escapeCsvCell(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function metricCsv(value: ForgeMetric) {
  return value === null ? "" : String(value);
}

export const REVIEW_CSV_HEADER = [
  "savedAt",
  "title",
  "scriptSource",
  "sourceName",
  "ネタ種類",
  "score",
  "views",
  "avgViewRate",
  "likes",
  "subscriberGain",
  "retentionLevel",
  "postedAt",
  "script",
  "resultMemo",
  "promptImprovementHypothesis",
  "promptSnapshot",
];

export function parseReviewCsv(csv: string): ForgeReviewEntry[] {
  const rows = parseCsvRows(csv);
  if (rows.length === 0) return [];

  const header = rows[0].map(cell => cell.trim().replace(/^\uFEFF/, ""));
  const indexByHeader = new Map(header.map((name, index) => [name, index]));

  if (!indexByHeader.has("script") && !indexByHeader.has("topic") && !indexByHeader.has("title")) {
    throw new Error("評価ログCSVのヘッダーが見つかりません。forge-review-log.csv かテンプレートCSVを読み込んでください。");
  }

  return rows.slice(1)
    .filter(row => row.some(cell => cell.trim()))
    .map((row, index) => {
      const savedAt = cellByHeader(row, indexByHeader, ["savedAt"]) || new Date().toISOString();
      const script = cellByHeader(row, indexByHeader, ["script"]);
      const topic = cellByHeader(row, indexByHeader, ["title", "タイトル", "topic", "お題"]);
      const nextRule = cellByHeader(row, indexByHeader, ["promptImprovementHypothesis", "nextRule"]);

      return {
        id: `csv-${Date.now()}-${index}`,
        savedAt,
        sourceType: normalizeScriptSource(cellByHeader(row, indexByHeader, ["scriptSource", "作成元", "sourceType"])),
        sourceName: cellByHeader(row, indexByHeader, ["sourceName", "作者/参考元", "source"]),
        topicTag: normalizeTopicTag(cellByHeader(row, indexByHeader, ["topicTag", "ネタ種類", "tag"])),
        topic,
        score: Number(cellByHeader(row, indexByHeader, ["score"])) || 3,
        promptSnapshot: cellByHeader(row, indexByHeader, ["promptSnapshot"]),
        script,
        resultMemo: cellByHeader(row, indexByHeader, ["resultMemo"]),
        nextRule,
        analytics: normalizeAnalytics({
          views: cellByHeader(row, indexByHeader, ["views"]),
          avgViewRate: cellByHeader(row, indexByHeader, ["avgViewRate"]),
          likes: cellByHeader(row, indexByHeader, ["likes"]),
          subscriberGain: cellByHeader(row, indexByHeader, ["subscriberGain"]),
          retentionLevel: normalizeRetentionLevel(cellByHeader(row, indexByHeader, ["retentionLevel"])),
          postedAt: cellByHeader(row, indexByHeader, ["postedAt"]),
        }),
      };
    });
}

export function mergeReviewEntries(entries: ForgeReviewEntry[]) {
  const seen = new Set<string>();
  return entries
    .filter(entry => {
      const key = reviewEntryKey(entry);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt));
}

export function buildReviewCsv(entries: ForgeReviewEntry[]) {
  const rows = entries.map(entry => [
    entry.savedAt,
    entry.topic,
    SCRIPT_SOURCE_LABELS[entry.sourceType],
    entry.sourceName,
    topicTagLabel(entry.topicTag),
    String(entry.score),
    metricCsv(entry.analytics.views),
    metricCsv(entry.analytics.avgViewRate),
    metricCsv(entry.analytics.likes),
    metricCsv(entry.analytics.subscriberGain),
    retentionLabel(entry.analytics.retentionLevel),
    entry.analytics.postedAt,
    entry.script,
    entry.resultMemo,
    entry.nextRule,
    entry.promptSnapshot,
  ]);

  return [REVIEW_CSV_HEADER, ...rows]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(","))
    .join("\r\n");
}

export function buildReviewCsvTemplate() {
  return buildReviewCsv([]);
}
