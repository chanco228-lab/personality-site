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
  videoDuration: ForgeMetric;
  views: ForgeMetric;
  avgViewRate: ForgeMetric;
  likes: ForgeMetric;
  subscriberGain: ForgeMetric;
  retentionRate: ForgeMetric;
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
    videoDuration: normalizeMetric((src as { videoDuration?: unknown }).videoDuration),
    views: normalizeMetric(src.views),
    avgViewRate: normalizeMetric(src.avgViewRate),
    likes: normalizeMetric(src.likes),
    subscriberGain: normalizeMetric(src.subscriberGain),
    retentionRate: normalizeMetric((src as { retentionRate?: unknown }).retentionRate),
    postedAt: typeof src.postedAt === "string" ? src.postedAt : "",
  };
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
  }

  return [...new Set(picked)].slice(0, 8).join("\n");
}

function entryTitle(entry: ForgeReviewEntry) {
  return entry.topic || entry.script.split(/\r?\n/).find(line => line.trim()) || "無題の台本";
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
    `- ${entryTitle(entry)} / ${SCRIPT_SOURCE_LABELS[entry.sourceType]}${entry.sourceName ? `:${entry.sourceName}` : ""} / ${topicTagLabel(entry.topicTag) || "ネタ種類未設定"} / 評価${entry.score} / 動画時間${metricLabel(entry.analytics.videoDuration, "秒")} / 視聴${metricLabel(entry.analytics.views)} / 平均視聴率${metricLabel(entry.analytics.avgViewRate, "%")} / 登録者増${metricLabel(entry.analytics.subscriberGain)} / 視聴継続${metricLabel(entry.analytics.retentionRate, "%")}`
  ));
  const weakLines = weakEntries.map(entry => (
    `- ${entryTitle(entry)} / ${SCRIPT_SOURCE_LABELS[entry.sourceType]}${entry.sourceName ? `:${entry.sourceName}` : ""} / ${topicTagLabel(entry.topicTag) || "ネタ種類未設定"} / 評価${entry.score} / 動画時間${metricLabel(entry.analytics.videoDuration, "秒")} / 視聴${metricLabel(entry.analytics.views)} / 平均視聴率${metricLabel(entry.analytics.avgViewRate, "%")} / 登録者増${metricLabel(entry.analytics.subscriberGain)} / 視聴継続${metricLabel(entry.analytics.retentionRate, "%")} / メモ: ${entry.resultMemo || entry.nextRule || "未記入"}`
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
  "videoDuration",
  "views",
  "avgViewRate",
  "likes",
  "subscriberGain",
  "retentionRate",
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
          videoDuration: cellByHeader(row, indexByHeader, ["videoDuration", "動画時間", "durationSeconds"]),
          views: cellByHeader(row, indexByHeader, ["views"]),
          avgViewRate: cellByHeader(row, indexByHeader, ["avgViewRate"]),
          likes: cellByHeader(row, indexByHeader, ["likes"]),
          subscriberGain: cellByHeader(row, indexByHeader, ["subscriberGain"]),
          retentionRate: cellByHeader(row, indexByHeader, ["retentionRate", "視聴継続", "retentionLevel"]),
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
    metricCsv(entry.analytics.videoDuration),
    metricCsv(entry.analytics.views),
    metricCsv(entry.analytics.avgViewRate),
    metricCsv(entry.analytics.likes),
    metricCsv(entry.analytics.subscriberGain),
    metricCsv(entry.analytics.retentionRate),
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
