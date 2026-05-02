"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  MODE_TABS,
  TOPIC_TAGS,
  type Mode,
  type TopicTagId,
} from "@/data/forge/promptConfig";
import { buildForgePrompt, getDuration, getSeCount } from "@/lib/forge/promptBuilders";
import {
  buildPromptImprovementReport,
  buildReviewCsv,
  buildReviewCsvTemplate,
  mergeReviewEntries,
  parseReviewCsv,
  SCRIPT_SOURCE_LABELS,
  type ForgeReviewEntry,
  type ForgeScriptSource,
} from "@/lib/forge/reviewCycle";

const PASSWORD = "garikimbs";

function getTopicTagLabel(value: TopicTagId | "") {
  return TOPIC_TAGS.find(tag => tag.id === value)?.label || "未設定";
}

function parseMetricDraft(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;

  const parsed = Number(normalized.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function metricText(value: number | null, suffix = "") {
  return value === null ? "不明" : `${value}${suffix}`;
}

function getSourceLabel(value: ForgeScriptSource) {
  return SCRIPT_SOURCE_LABELS[value] || "不明";
}

function getEntryTitle(entry: ForgeReviewEntry) {
  return entry.topic || entry.script.split(/\r?\n/).find(line => line.trim()) || "無題の台本";
}

function buildPostedAt(month: string, day: string, hour: string) {
  const parts: string[] = [];

  if (month) parts.push(`${month}月`);
  if (day) parts.push(`${day}日`);
  if (hour) parts.push(`${hour}時`);

  return parts.join(" ");
}

export default function ForgePage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);

  const [count, setCount] = useState(3);
  const [ideaText, setIdeaText] = useState("");
  const [topic, setTopic] = useState("");
  const [mats, setMats] = useState("");
  const [supp, setSupp] = useState("");
  const [mode, setMode] = useState<Mode>("script");
  const [seText, setSeText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvResult, setCsvResult] = useState("");
  const [csvLabel, setCsvLabel] = useState("ショート用1");
  const [copied, setCopied] = useState(false);

  const [reviewScript, setReviewScript] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [scriptSource, setScriptSource] = useState<ForgeScriptSource>("ai");
  const [sourceName, setSourceName] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [reviewScore, setReviewScore] = useState(3);
  const [reviewNextRule, setReviewNextRule] = useState("");
  const [topicTag, setTopicTag] = useState<TopicTagId | "">("");
  const [reviewEntries, setReviewEntries] = useState<ForgeReviewEntry[]>([]);
  const [improvementMemo, setImprovementMemo] = useState("");
  const [reviewImportStatus, setReviewImportStatus] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [views, setViews] = useState("");
  const [avgViewRate, setAvgViewRate] = useState("");
  const [likes, setLikes] = useState("");
  const [subscriberGain, setSubscriberGain] = useState("");
  const [retentionRate, setRetentionRate] = useState("");
  const [postedMonth, setPostedMonth] = useState("");
  const [postedDay, setPostedDay] = useState("");
  const [postedHour, setPostedHour] = useState("");

  const prompt = useMemo(() => buildForgePrompt({
    mode,
    count,
    topic,
    mats,
    supp,
    seText,
    csvText,
    csvLabel,
    ideaText,
  }), [mode, count, topic, mats, supp, seText, csvText, csvLabel, ideaText]);

  const scriptPromptSnapshot = useMemo(() => buildForgePrompt({
    mode: "script",
    count,
    topic,
    mats,
    supp,
    seText,
    csvText,
    csvLabel,
    ideaText,
  }), [count, topic, mats, supp, seText, csvText, csvLabel, ideaText]);

  const reviewAnalytics = useMemo(() => ({
    videoDuration: parseMetricDraft(videoDuration),
    views: parseMetricDraft(views),
    avgViewRate: parseMetricDraft(avgViewRate),
    likes: parseMetricDraft(likes),
    subscriberGain: parseMetricDraft(subscriberGain),
    retentionRate: parseMetricDraft(retentionRate),
    postedAt: buildPostedAt(postedMonth, postedDay, postedHour),
  }), [videoDuration, views, avgViewRate, likes, subscriberGain, retentionRate, postedMonth, postedDay, postedHour]);

  const topEntries = useMemo(() => (
    [...reviewEntries].sort((a, b) => {
      const viewDiff = (b.analytics.views ?? -1) - (a.analytics.views ?? -1);
      if (viewDiff !== 0) return viewDiff;
      return (b.analytics.avgViewRate ?? -1) - (a.analytics.avgViewRate ?? -1);
    }).slice(0, 5)
  ), [reviewEntries]);

  const weakEntries = useMemo(() => (
    [...reviewEntries].sort((a, b) => {
      const scoreDiff = a.score - b.score;
      if (scoreDiff !== 0) return scoreDiff;
      return (a.analytics.avgViewRate ?? 101) - (b.analytics.avgViewRate ?? 101);
    }).slice(0, 5)
  ), [reviewEntries]);

  const copy = useCallback(() => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard?.writeText(prompt).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [prompt]);

  const downloadCsv = useCallback(() => {
    const content = csvResult.trim();
    if (!content) return;

    const bom = "\uFEFF";
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitle.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [csvResult]);

  const downloadTextFile = useCallback((filename: string, content: string) => {
    const body = content.trim();
    if (!body) return;

    const bom = "\uFEFF";
    const blob = new Blob([bom + body], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const saveReview = useCallback(() => {
    const entry: ForgeReviewEntry = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      topicTag,
      sourceType: scriptSource,
      sourceName: sourceName.trim(),
      topic: reviewTitle.trim(),
      score: reviewScore,
      promptSnapshot: scriptSource === "ai" ? scriptPromptSnapshot : "",
      script: reviewScript.trim(),
      resultMemo: reviewResult.trim(),
      nextRule: reviewNextRule.trim(),
      analytics: reviewAnalytics,
    };

    const nextEntries = mergeReviewEntries([entry, ...reviewEntries]);
    setReviewEntries(nextEntries);
    setImprovementMemo(buildPromptImprovementReport(nextEntries));
    setReviewImportStatus(`画面内の評価DBは ${nextEntries.length} 件です。CSVで書き出すと台帳に反映できます。`);
    setReviewTitle("");
    setSourceName("");
    setReviewScript("");
    setReviewResult("");
    setReviewNextRule("");
    setVideoDuration("");
    setViews("");
    setAvgViewRate("");
    setLikes("");
    setSubscriberGain("");
    setRetentionRate("");
    setPostedMonth("");
    setPostedDay("");
    setPostedHour("");
  }, [
    topicTag,
    scriptSource,
    sourceName,
    reviewTitle,
    scriptPromptSnapshot,
    reviewScore,
    reviewScript,
    reviewResult,
    reviewNextRule,
    reviewEntries,
    reviewAnalytics,
  ]);

  const exportReviewCsv = useCallback(() => {
    if (reviewEntries.length === 0) return;

    const bom = "\uFEFF";
    const content = buildReviewCsv(reviewEntries);
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forge-review-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [reviewEntries]);

  const downloadReviewCsvTemplate = useCallback(() => {
    const bom = "\uFEFF";
    const content = buildReviewCsvTemplate();
    const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "forge-review-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadReviewTextTemplate = useCallback(() => {
    downloadTextFile("forge-review-template.txt", [
      "【台本評価メモ】",
      "",
      "保存日時:",
      "投稿日時(月/日/時):",
      "タイトル:",
      "作成元: AI作 / 自作 / 他人作 / 不明",
      "作者・参考元:",
      "ネタ種類:",
      "評価点:",
      "",
      "【YouTube指標】",
      "動画時間(秒):",
      "視聴回数:",
      "平均視聴率:",
      "高評価数:",
      "チャンネル登録者増数:",
      "視聴継続(%):",
      "",
      "【台本】",
      "",
      "【結果メモ】",
      "",
      "【基礎プロンプト改善仮説】",
      "",
      "【使用プロンプト】",
      "",
    ].join("\n"));
  }, [downloadTextFile]);

  const importReviewCsv = useCallback(async (file: File | null) => {
    if (!file) return;

    try {
      const content = await file.text();
      const imported = parseReviewCsv(content);
      const nextEntries = mergeReviewEntries([...imported, ...reviewEntries]);
      setReviewEntries(nextEntries);
      setImprovementMemo(buildPromptImprovementReport(nextEntries));
      setReviewImportStatus(`${file.name} から ${imported.length} 件を読み込みました。画面内の評価DBは ${nextEntries.length} 件です。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "CSVを読み込めませんでした。";
      setReviewImportStatus(message);
    }
  }, [reviewEntries]);

  const clearReviewLog = useCallback(() => {
    setReviewEntries([]);
    setImprovementMemo("");
    setReviewImportStatus("");
  }, []);

  const preRef = useRef<HTMLPreElement>(null);
  const reviewCsvInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [prompt]);

  if (!authed) {
    return (
      <div style={S.authBg}>
        <div style={S.authBox}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚡</div>
          <h1 style={S.brand}>SCRIPT FORGE</h1>
          <p style={S.brandSub}>台本プロンプト生成ツール</p>
          <input
            type="password"
            value={pw}
            onChange={e => {
              setPw(e.target.value);
              setPwErr(false);
            }}
            onKeyDown={e => e.key === "Enter" && (pw === PASSWORD ? setAuthed(true) : setPwErr(true))}
            placeholder="パスワード"
            style={{ ...S.inp, borderColor: pwErr ? "#e74c3c" : C.bdr }}
          />
          {pwErr && <p style={{ color: "#e74c3c", fontSize: 11, margin: "2px 0 0" }}>パスワードが違います</p>}
          <button onClick={() => pw === PASSWORD ? setAuthed(true) : setPwErr(true)} style={S.mainBtn}>
            入場
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <header style={S.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={S.brand2}>SCRIPT FORGE</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {MODE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              style={mode === tab.id ? S.tabOn : S.tabOff}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div style={S.cols}>
        <div style={S.left}>
          {mode === "idea" ? (
            <>
              <Block n="1" t="ネタの原石">
                <textarea
                  value={ideaText}
                  onChange={e => setIdeaText(e.target.value)}
                  placeholder={"例：\n新キャラのウルトが強そう\n今の環境でオーティスが地味に強い気がする\nこのバグ、悪用したらやばそう\nアプデ内容はあるけど、どこを動画にすればいいかわからない"}
                  style={S.ta}
                  rows={10}
                />
                <p style={S.meta}>まだ雑でOK。事実、噂、違和感、思いつき、素材メモをそのまま入れる欄です。</p>
              </Block>
            </>
          ) : mode === "script" ? (
            <>
              <Block n="1" t="項目数">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <select value={count} onChange={e => setCount(Number(e.target.value))} style={S.sel}>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>
                        {n}選{n === 1 ? "（深掘り）" : n === 3 ? "（基本）" : ""}
                      </option>
                    ))}
                  </select>
                  <span style={S.meta}>尺 {getDuration(count)}　｜　SE目安 {getSeCount(count)}（全文に1個ずつ）</span>
                </div>
              </Block>

              <Block n="2" t="お題">
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="例：次回アプデで追加される新キャラ3体の性能紹介"
                  style={S.ta}
                  rows={2}
                />
              </Block>

              <Block n="3" t="情報素材（データ貼り付け）">
                <textarea
                  value={mats}
                  onChange={e => setMats(e.target.value)}
                  placeholder="アプデ内容、キャラデータ、確率データ等を箇条書きで"
                  style={S.ta}
                  rows={6}
                />
              </Block>

              <Block n="4" t="補足説明（任意）">
                <textarea
                  value={supp}
                  onChange={e => setSupp(e.target.value)}
                  placeholder={"追加の指示や注意点。例：\n・1位は絶対ダミアンにして\n・比喩はワンピースで統一\n・冒頭でフレンド募集入れて\n・もっと煽り強めで"}
                  style={S.ta}
                  rows={3}
                />
                <p style={S.meta}>お題・素材だけでは伝わらないニュアンスや制約を書く欄。空欄OK。</p>
              </Block>

            </>
          ) : mode === "review" ? (
            <>
              <Block n="1" t="ローカル保存の仕組み">
                <p style={{ ...S.meta, marginTop: 0 }}>
                  ブラウザ内では作業用に保持するだけで、正式な保存は `CSV / TXT` の手動ダウンロード前提です。蓄積データは基礎プロンプトの改善にだけ使い、台本生成時には混ぜません。
                </p>
                <div style={S.tipBox}>
                  <div style={S.tipRow}>保存単位: `台本1本 = タイトル + 作成元 + ネタ種類 + 台本本文 + 指標 + メモ + 改善仮説`</div>
                  <div style={S.tipRow}>用途: 「どの台本が伸びたか」「どの台本が駄作か」を比較し、基礎プロンプトの改訂材料にする</div>
                  <div style={S.tipRow}>正式なローカル保存: `forge-review-log.csv` や `prompt-improvement-report.txt` を自分でダウンロードして管理</div>
                  <div style={S.tipRow}>この画面の一覧は再読み込みや機種変更で消える前提。残したい情報は必ずファイルに書き出す</div>
                </div>
                <input
                  ref={reviewCsvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={e => {
                    void importReviewCsv(e.target.files?.[0] ?? null);
                    e.currentTarget.value = "";
                  }}
                  style={{ display: "none" }}
                />
                <div style={S.actionRow}>
                  <button
                    onClick={() => reviewCsvInputRef.current?.click()}
                    style={S.secondaryBtn}
                  >
                    既存CSVを読み込む
                  </button>
                  <button
                    onClick={downloadReviewCsvTemplate}
                    style={S.secondaryBtn}
                  >
                    評価CSVテンプレート
                  </button>
                </div>
                {reviewImportStatus && (
                  <p style={{ ...S.meta, color: reviewImportStatus.includes("読み込") || reviewImportStatus.includes("評価DB") ? C.acc : "#c0392b" }}>
                    {reviewImportStatus}
                  </p>
                )}
              </Block>

              <Block n="2" t="基礎プロンプト改善レポート">
                <textarea
                  value={improvementMemo}
                  onChange={e => setImprovementMemo(e.target.value)}
                  placeholder={"評価ログを追加すると、基礎プロンプトをどう改訂するかのレポートがここに出ます。\n例：\n- 冒頭2文のフック規則を強化\n- AIっぽい説明口調をNG表現に追加\n- 登録につながる締めの型を基礎文へ追加"}
                  style={S.ta}
                  rows={6}
                />
                <p style={S.meta}>この内容は `① 台本生成` には自動追加されません。基礎プロンプトを定期的に手で直すための判断材料です。</p>
              </Block>

              <Block n="3" t="台本 + YouTubeアナリティクス評価">
                <div style={S.reviewHero}>
                  <p style={S.reviewHeroTitle}>1本ずつ、迷わず記録</p>
                  <p style={S.reviewHeroText}>タイトルは評価タブ専用で保存します。数値は空欄なら「不明」として扱うので、台本だけ先に入れてもOKです。</p>
                </div>

                <div style={S.reviewStep}>
                  <div style={S.reviewStepHead}>
                    <span style={S.reviewStepNo}>1</span>
                    <span style={S.reviewStepTitle}>作品</span>
                  </div>
                  <input
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="タイトル。例：攻撃が当たりづらいキャラ4選"
                    style={{ ...S.metricInput, fontSize: 15, fontWeight: 700 }}
                  />
                  <div style={S.sourceGrid}>
                    {(Object.entries(SCRIPT_SOURCE_LABELS) as Array<[ForgeScriptSource, string]>).map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() => setScriptSource(id)}
                        style={scriptSource === id ? S.sourceCardOn : S.sourceCard}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    value={sourceName}
                    onChange={e => setSourceName(e.target.value)}
                    placeholder={scriptSource === "other" ? "作者・チャンネル名・参考元（任意）" : "メモ。例：GPT-5 / 自分 / 参考動画名（任意）"}
                    style={{ ...S.metricInput, marginTop: 10 }}
                  />
                </div>

                <div style={S.reviewStep}>
                  <div style={S.reviewStepHead}>
                    <span style={S.reviewStepNo}>2</span>
                    <span style={S.reviewStepTitle}>分類</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => setTopicTag("")} style={topicTag === "" ? S.chipOn : S.chip}>
                      未設定
                    </button>
                    {TOPIC_TAGS.map(tag => (
                      <button key={tag.id} onClick={() => setTopicTag(tag.id)} style={topicTag === tag.id ? S.chipOn : S.chip}>
                        {tag.label}
                      </button>
                    ))}
                  </div>
                  <p style={S.meta}>ネタ種類はExcelで比較するためのタグです。台本生成プロンプトには混ぜません。</p>
                </div>

                <div style={S.reviewStep}>
                  <div style={S.reviewStepHead}>
                    <span style={S.reviewStepNo}>3</span>
                    <span style={S.reviewStepTitle}>数字</span>
                    <span style={S.unknownPill}>空欄 = 不明</span>
                  </div>
                  <div style={S.analyticsGrid}>
                    <MetricField label="動画時間 (秒)" value={videoDuration} onChange={setVideoDuration} placeholder="例: 29" />
                    <MetricField label="視聴回数" value={views} onChange={setViews} />
                    <MetricField label="平均視聴率 (%)" value={avgViewRate} onChange={setAvgViewRate} step="0.1" />
                    <MetricField label="高評価数" value={likes} onChange={setLikes} />
                    <MetricField label="登録者増数" value={subscriberGain} onChange={setSubscriberGain} />
                    <MetricField label="視聴継続 (%)" value={retentionRate} onChange={setRetentionRate} step="0.1" />
                    <label style={S.metricField}>
                      <span style={S.metricLabel}>投稿月</span>
                      <select
                        value={postedMonth}
                        onChange={e => setPostedMonth(e.target.value)}
                        style={S.metricInput}
                      >
                        <option value="">不明</option>
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(month => (
                          <option key={month} value={month}>{month}月</option>
                        ))}
                      </select>
                    </label>
                    <MetricField label="投稿日" value={postedDay} onChange={setPostedDay} placeholder="例: 12" />
                    <MetricField label="投稿時間" value={postedHour} onChange={setPostedHour} placeholder="例: 21" />
                  </div>
                </div>

                <div style={S.reviewStep}>
                  <div style={S.reviewStepHead}>
                    <span style={S.reviewStepNo}>4</span>
                    <span style={S.reviewStepTitle}>台本と学び</span>
                  </div>
                  <textarea
                    value={reviewScript}
                    onChange={e => setReviewScript(e.target.value)}
                    placeholder="AI作・自作・他人作、どの台本でもここに貼り付け"
                    style={S.ta}
                    rows={6}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.hi }}>評価</span>
                    <select value={reviewScore} onChange={e => setReviewScore(Number(e.target.value))} style={S.selCompact}>
                      {[5, 4, 3, 2, 1].map(score => (
                        <option key={score} value={score}>{score} / 5</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={reviewResult}
                    onChange={e => setReviewResult(e.target.value)}
                    placeholder="結果メモ。例：初速弱い / 維持率は高い / 締めは刺さった / 冒頭で離脱"
                    style={{ ...S.ta, marginTop: 10 }}
                    rows={4}
                  />
                  <textarea
                    value={reviewNextRule}
                    onChange={e => setReviewNextRule(e.target.value)}
                    placeholder="基礎プロンプトへ反映したい改善仮説。例：冒頭2文で結論を先出しするルールを強める"
                    style={{ ...S.ta, marginTop: 10 }}
                    rows={3}
                  />
                </div>
                <div style={S.actionRow}>
                  <button
                    onClick={saveReview}
                    disabled={!reviewScript.trim() && !reviewTitle.trim()}
                    style={!reviewScript.trim() && !reviewTitle.trim() ? S.dlBtnDisabled : S.dlBtn}
                  >
                    一覧に追加して改善レポート更新
                  </button>
                  <button
                    onClick={exportReviewCsv}
                    disabled={reviewEntries.length === 0}
                    style={reviewEntries.length === 0 ? S.secondaryBtnDisabled : S.secondaryBtn}
                  >
                    評価ログCSVダウンロード
                  </button>
                </div>
                <div style={S.actionRow}>
                  <button
                    onClick={() => downloadTextFile("prompt-improvement-report.txt", improvementMemo)}
                    disabled={!improvementMemo.trim()}
                    style={!improvementMemo.trim() ? S.secondaryBtnDisabled : S.secondaryBtn}
                  >
                    基礎プロンプト改善TXT
                  </button>
                  <button
                    onClick={() => downloadTextFile("current-script-prompt.txt", scriptPromptSnapshot)}
                    disabled={!scriptPromptSnapshot.trim()}
                    style={!scriptPromptSnapshot.trim() ? S.secondaryBtnDisabled : S.secondaryBtn}
                  >
                    台本生成プロンプトTXT
                  </button>
                </div>
                <div style={S.actionRow}>
                  <button
                    onClick={downloadReviewCsvTemplate}
                    style={S.secondaryBtn}
                  >
                    評価CSVテンプレート
                  </button>
                  <button
                    onClick={downloadReviewTextTemplate}
                    style={S.secondaryBtn}
                  >
                    評価TXTテンプレート
                  </button>
                </div>
                <button
                  onClick={clearReviewLog}
                  disabled={reviewEntries.length === 0}
                  style={reviewEntries.length === 0 ? S.linkBtnDisabled : S.linkBtn}
                >
                  画面内の評価一覧をクリア
                </button>
                <div style={S.reviewList}>
                  <p style={{ margin: "0 0 8px", fontWeight: 700, color: C.hi, fontSize: 13 }}>最近の評価ログ</p>
                  {reviewEntries.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 12, color: C.dim }}>まだ保存された評価ログはありません。</p>
                  ) : (
                    reviewEntries.slice(0, 5).map(entry => (
                      <div key={entry.id} style={S.reviewItem}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.hi, lineHeight: 1.45 }}>
                              {getEntryTitle(entry)}
                            </p>
                            <span style={{ fontSize: 11, fontWeight: 700, color: C.acc }}>
                              {getSourceLabel(entry.sourceType)}{entry.sourceName ? `:${entry.sourceName}` : ""} / {getTopicTagLabel(entry.topicTag)} / {entry.score}点
                            </span>
                          </div>
                          <span style={{ fontSize: 10, color: C.dim }}>
                            {new Date(entry.savedAt).toLocaleString("ja-JP")}
                          </span>
                        </div>
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                          動画時間 {metricText(entry.analytics.videoDuration, "秒")} / 再生 {metricText(entry.analytics.views)} / 視聴率 {metricText(entry.analytics.avgViewRate, "%")} / 高評価 {metricText(entry.analytics.likes)} / 登録者増 {metricText(entry.analytics.subscriberGain)} / 視聴継続 {metricText(entry.analytics.retentionRate, "%")}
                        </p>
                        {entry.analytics.postedAt && (
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: C.dim, lineHeight: 1.5 }}>
                            投稿日時 {entry.analytics.postedAt}
                          </p>
                        )}
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: C.txt, lineHeight: 1.55 }}>
                          {entry.nextRule || entry.resultMemo || "メモなし"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div style={S.archiveGrid}>
                  <div style={S.reviewList}>
                    <p style={{ margin: "0 0 8px", fontWeight: 700, color: C.hi, fontSize: 13 }}>伸びた台本候補</p>
                    {topEntries.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: C.dim }}>まだデータがありません。</p>
                    ) : (
                      topEntries.map(entry => (
                        <ArchiveItem key={entry.id} entry={entry} tone="good" />
                      ))
                    )}
                  </div>
                  <div style={S.reviewList}>
                    <p style={{ margin: "0 0 8px", fontWeight: 700, color: C.hi, fontSize: 13 }}>駄作候補 / 改善優先</p>
                    {weakEntries.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12, color: C.dim }}>まだデータがありません。</p>
                    ) : (
                      weakEntries.map(entry => (
                        <ArchiveItem key={entry.id} entry={entry} tone="weak" />
                      ))
                    )}
                  </div>
                </div>
              </Block>
            </>
          ) : mode === "se" ? (
            <>
              <Block n="1" t="CSV分割済みテキストを貼り付け">
                <textarea
                  value={seText}
                  onChange={e => setSeText(e.target.value)}
                  placeholder="CSV分割に合わせた字幕テキストをここに貼り付け"
                  style={S.ta}
                  rows={16}
                />
              </Block>
            </>
          ) : (
            <>
              <Block n="1" t="ラベル選択">
                <div style={{ display: "flex", gap: 6 }}>
                  {["ショート用1", "ショート用2"].map(lb => (
                    <button
                      key={lb}
                      onClick={() => setCsvLabel(lb)}
                      style={csvLabel === lb ? S.chipOn : S.chip}
                    >
                      {lb}
                    </button>
                  ))}
                </div>
                <p style={S.meta}>CSVの左列に入るラベル名。動画編集ソフトのテロップ設定に対応。</p>
              </Block>

              <Block n="2" t="台本を貼り付け">
                <textarea
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder={"完成した台本をここに貼り付け。\nSEタグ（[SE:〇〇]）が含まれていても自動で除去されます。"}
                  style={S.ta}
                  rows={10}
                />
              </Block>

              <Block n="3" t="CSV結果 → ダウンロード">
                <textarea
                  value={csvResult}
                  onChange={e => setCsvResult(e.target.value)}
                  placeholder="ChatGPTが出力したCSVデータをここに貼り付け"
                  style={S.ta}
                  rows={8}
                />
                <button onClick={downloadCsv} disabled={!csvResult.trim()} style={!csvResult.trim() ? S.dlBtnDisabled : S.dlBtn}>
                  CSVダウンロード
                </button>
              </Block>

              <div style={S.csvInfo}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, color: C.hi, fontSize: 13 }}>📐 字幕ルール</p>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: C.txt, lineHeight: 1.6 }}>
                  1行13文字×最大2行＝1字幕は最大26文字。実際は15〜25文字が多く、短い節はなるべく結合します。
                  CSVは改行なし（編集ソフトが13文字で自動改行）。分割に迷ったら結合優先です。
                </p>
                <p style={{ margin: 0, fontSize: 11, color: C.dim }}>
                  出力例：{csvLabel},体力が実質3万のセコレットが誕生する
                </p>
              </div>
            </>
          )}
        </div>

        <div style={S.right}>
          <div style={S.outHdr}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.hi }}>
              {mode === "script"
                ? "📋 台本生成プロンプト"
                : mode === "idea"
                  ? "🔎 ネタ深掘りプロンプト"
                : mode === "csv"
                  ? "📐 CSV字幕プロンプト"
                  : mode === "se"
                    ? "🔊 SE割り当てプロンプト"
                    : "📊 評価DB / 基礎プロンプト改善"}
            </span>
            <button onClick={copy} style={copied ? S.cpDone : S.cpBtn}>
              {copied ? "✓ コピー完了" : "コピー"}
            </button>
          </div>
          <pre ref={preRef} style={S.pre}>{prompt}</pre>
          <div style={S.outFoot}>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{prompt.length.toLocaleString()} 文字</span>
            <span style={{ color: C.acc, fontWeight: 700, fontSize: 11 }}>
              {mode === "review"
                ? "→ 台本と指標を集計 → 基礎プロンプト改訂へ"
                : mode === "idea"
                ? "→ ChatGPTに貼る → 不足情報と切り口を確認 → ①へ"
                : mode === "script"
                ? "→ ChatGPTに貼る → 結果を評価 → 基礎文を改訂"
                : mode === "se"
                  ? "→ ChatGPTに貼る → CSV行ごとのSE付き完成版"
                  : "→ ChatGPTに貼る → CSV分割完了 → ③へ"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricField({
  label,
  value,
  onChange,
  step = "1",
  placeholder = "不明",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
  placeholder?: string;
}) {
  return (
    <label style={S.metricField}>
      <span style={S.metricLabel}>{label}</span>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={S.metricInput}
      />
    </label>
  );
}

function ArchiveItem({
  entry,
  tone,
}: {
  entry: ForgeReviewEntry;
  tone: "good" | "weak";
}) {
  const title = getEntryTitle(entry);
  const badgeText = tone === "good" ? "伸びた候補" : "改善優先";
  const badgeStyle = tone === "good" ? S.goodBadge : S.weakBadge;

  return (
    <div style={S.archiveItem}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.hi, lineHeight: 1.45 }}>{title}</p>
          <p style={{ margin: "4px 0 0", fontSize: 10, color: C.dim }}>
            {new Date(entry.savedAt).toLocaleString("ja-JP")}
          </p>
        </div>
        <span style={badgeStyle}>{badgeText}</span>
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 11, color: C.dim, lineHeight: 1.55 }}>
        {getSourceLabel(entry.sourceType)} / {getTopicTagLabel(entry.topicTag)} / 動画時間 {metricText(entry.analytics.videoDuration, "秒")} / 再生 {metricText(entry.analytics.views)} / 視聴率 {metricText(entry.analytics.avgViewRate, "%")} / 高評価 {metricText(entry.analytics.likes)} / 登録者増 {metricText(entry.analytics.subscriberGain)} / 視聴継続 {metricText(entry.analytics.retentionRate, "%")}
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 12, color: C.txt, lineHeight: 1.55 }}>
        {entry.nextRule || entry.resultMemo || "メモなし"}
      </p>
    </div>
  );
}

function Block({ n, t, children }: { n: string; t: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={S.num}>{n}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.hi }}>{t}</span>
      </div>
      {children}
    </div>
  );
}

const C = {
  bg: "#f8f6ff",
  sf: "#ffffff",
  bdr: "rgba(0,0,0,0.08)",
  acc: "#6c5ce7",
  accDim: "rgba(108,92,231,0.08)",
  accGlow: "rgba(108,92,231,0.18)",
  acc2: "#fd79a8",
  txt: "#2d3436",
  dim: "#888e99",
  hi: "#1a1a2e",
};

const S: Record<string, CSSProperties> = {
  authBg: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg, #f8f6ff 0%, #e8e4f8 40%, #fce4ec 100%)",
    fontFamily: "'Noto Sans JP',system-ui,sans-serif",
  },
  authBox: {
    background: C.sf, border: `1px solid ${C.bdr}`, borderRadius: 20,
    padding: "44px 36px", textAlign: "center", width: 320,
    boxShadow: "0 8px 40px rgba(108,92,231,0.10)",
  },
  brand: { fontSize: 20, fontWeight: 900, color: C.acc, letterSpacing: 5, margin: "0 0 2px" },
  brandSub: { fontSize: 11, color: C.dim, margin: "0 0 24px" },
  brand2: { fontSize: 15, fontWeight: 900, color: C.acc, letterSpacing: 4 },
  inp: {
    width: "100%", padding: "11px 14px", background: C.bg,
    border: `1px solid ${C.bdr}`, borderRadius: 10, color: C.txt, fontSize: 14,
    outline: "none", boxSizing: "border-box", marginBottom: 6,
  },
  mainBtn: {
    width: "100%", padding: "11px", background: `linear-gradient(135deg, ${C.acc}, #fd79a8)`,
    color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
    cursor: "pointer", marginTop: 6, boxShadow: "0 4px 14px rgba(108,92,231,0.25)",
  },
  root: {
    minHeight: "100vh", background: C.bg, color: C.txt,
    fontFamily: "'Noto Sans JP',system-ui,sans-serif",
  },
  hdr: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: `1px solid ${C.bdr}`,
    background: C.sf, flexWrap: "wrap", gap: 8,
  },
  tabOff: {
    padding: "7px 14px", background: "transparent", border: `1px solid ${C.bdr}`,
    borderRadius: 8, color: C.dim, fontSize: 12, cursor: "pointer",
  },
  tabOn: {
    padding: "7px 14px", background: C.accDim, border: `1px solid ${C.acc}`,
    borderRadius: 8, color: C.acc, fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  cols: { display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 54px)" },
  left: {
    padding: "20px", borderRight: `1px solid ${C.bdr}`, background: C.bg,
    overflowY: "auto", maxHeight: "calc(100vh - 54px)",
  },
  right: { display: "flex", flexDirection: "column", maxHeight: "calc(100vh - 54px)", background: C.sf },
  num: {
    width: 24, height: 24, borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.acc}, #fd79a8)`,
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 900, flexShrink: 0,
  },
  card: {
    padding: "16px 17px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left",
    transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardOn: {
    padding: "16px 17px", background: C.accDim, border: `1.5px solid ${C.acc}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left", boxShadow: `0 4px 20px ${C.accGlow}`,
  },
  exTag: {
    fontSize: 10, color: C.acc, background: C.accDim,
    padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", fontWeight: 600,
  },
  sel: {
    padding: "9px 14px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 10, color: C.hi, fontSize: 14, fontWeight: 600,
    cursor: "pointer", outline: "none", minWidth: 125,
  },
  selCompact: {
    padding: "7px 10px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 9, color: C.hi, fontSize: 13, fontWeight: 600,
    cursor: "pointer", outline: "none", minWidth: 92,
  },
  ta: {
    width: "100%", padding: "11px 13px", background: C.sf,
    border: `1.5px solid ${C.bdr}`, borderRadius: 10, color: C.txt,
    fontSize: 13, lineHeight: 1.65, resize: "vertical", outline: "none",
    boxSizing: "border-box", fontFamily: "'Noto Sans JP',system-ui,sans-serif",
  },
  meta: { fontSize: 11, color: C.dim, marginTop: 5, lineHeight: 1.4, display: "block" },
  chip: {
    padding: "6px 12px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 8, color: C.dim, fontSize: 12, cursor: "pointer",
  },
  chipOn: {
    padding: "6px 12px", background: C.accDim, border: `1.5px solid ${C.acc}`,
    borderRadius: 8, color: C.acc, fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  seBox: {
    fontSize: 12, color: C.acc, margin: "10px 0 0", padding: "9px 12px",
    background: C.accDim, borderRadius: 8, lineHeight: 1.5, fontWeight: 500,
  },
  csvInfo: {
    padding: "14px 16px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 12, marginTop: 4,
  },
  reviewHero: {
    padding: "16px 18px",
    background: "linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%)",
    border: `1.5px solid ${C.bdr}`,
    borderRadius: 18,
    marginBottom: 12,
    boxShadow: "0 8px 24px rgba(20,32,70,0.05)",
  },
  reviewHeroTitle: {
    margin: "0 0 5px",
    fontSize: 18,
    fontWeight: 900,
    color: C.hi,
    letterSpacing: "-0.02em",
  },
  reviewHeroText: {
    margin: 0,
    fontSize: 12,
    color: C.dim,
    lineHeight: 1.65,
  },
  reviewStep: {
    padding: "14px 15px",
    background: C.sf,
    border: `1.5px solid ${C.bdr}`,
    borderRadius: 16,
    marginTop: 12,
  },
  reviewStepHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  reviewStepNo: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: C.hi,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
  },
  reviewStepTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: C.hi,
  },
  unknownPill: {
    marginLeft: "auto",
    padding: "3px 8px",
    borderRadius: 999,
    background: "#eef2f7",
    color: C.dim,
    fontSize: 10,
    fontWeight: 800,
  },
  sourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    marginTop: 10,
  },
  sourceCard: {
    padding: "10px 8px",
    background: "#f7f8fb",
    border: `1.5px solid ${C.bdr}`,
    borderRadius: 12,
    color: C.dim,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  sourceCardOn: {
    padding: "10px 8px",
    background: C.hi,
    border: `1.5px solid ${C.hi}`,
    borderRadius: 12,
    color: "#fff",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(26,26,46,0.15)",
  },
  tipBox: {
    padding: "10px 12px", background: "#fff8f2", border: "1px solid rgba(241, 140, 74, 0.18)",
    borderRadius: 10, margin: "10px 0",
  },
  analyticsGrid: {
    display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 10,
  },
  analyticsBox: {
    padding: "12px 14px", background: "#f8fbff", border: "1px solid rgba(108,92,231,0.12)",
    borderRadius: 10, marginBottom: 10,
  },
  tipRow: {
    fontSize: 12, color: C.txt, lineHeight: 1.55, marginBottom: 4,
  },
  metricField: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  metricLabel: {
    fontSize: 11, color: C.dim, fontWeight: 700,
  },
  metricInput: {
    width: "100%", padding: "9px 10px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 9, color: C.txt, fontSize: 13, outline: "none", boxSizing: "border-box",
  },
  actionRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10,
  },
  reviewList: {
    padding: "14px 16px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 12, marginTop: 12,
  },
  archiveGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12,
  },
  archiveItem: {
    padding: "10px 0", borderTop: `1px solid ${C.bdr}`,
  },
  reviewItem: {
    padding: "10px 0", borderTop: `1px solid ${C.bdr}`,
  },
  goodBadge: {
    padding: "3px 7px", borderRadius: 999, background: "#e9fbf4", color: "#0f9f6e", fontSize: 10, fontWeight: 800,
    whiteSpace: "nowrap",
  },
  weakBadge: {
    padding: "3px 7px", borderRadius: 999, background: "#fff3f1", color: "#d35445", fontSize: 10, fontWeight: 800,
    whiteSpace: "nowrap",
  },
  dlBtn: {
    width: "100%", padding: "11px", marginTop: 10,
    background: `linear-gradient(135deg, ${C.acc}, #fd79a8)`,
    color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
    cursor: "pointer", boxShadow: "0 4px 14px rgba(108,92,231,0.25)",
  },
  dlBtnDisabled: {
    width: "100%", padding: "11px", marginTop: 10,
    background: "#d7dbe3", color: "#7f8794", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 800, cursor: "not-allowed",
  },
  secondaryBtn: {
    width: "100%", padding: "11px", marginTop: 10,
    background: C.sf, color: C.acc, border: `1.5px solid ${C.acc}`, borderRadius: 10,
    fontSize: 14, fontWeight: 800, cursor: "pointer",
  },
  secondaryBtnDisabled: {
    width: "100%", padding: "11px", marginTop: 10,
    background: C.sf, color: "#a4abba", border: `1.5px solid ${C.bdr}`, borderRadius: 10,
    fontSize: 14, fontWeight: 800, cursor: "not-allowed",
  },
  linkBtn: {
    marginTop: 10, padding: 0, background: "transparent", border: "none",
    color: "#c0392b", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  linkBtnDisabled: {
    marginTop: 10, padding: 0, background: "transparent", border: "none",
    color: "#bfc6d0", fontSize: 12, fontWeight: 700, cursor: "not-allowed",
  },
  outHdr: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: `1px solid ${C.bdr}`, background: C.sf,
  },
  cpBtn: {
    padding: "7px 18px", background: `linear-gradient(135deg, ${C.acc}, #fd79a8)`,
    color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer",
    boxShadow: "0 3px 10px rgba(108,92,231,0.2)",
  },
  cpDone: {
    padding: "7px 18px", background: "#00b894", color: "#fff", border: "none",
    borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer",
  },
  pre: {
    flex: 1, overflowY: "auto", padding: "18px 20px", margin: 0,
    fontSize: 11, lineHeight: 1.8, color: "#555e68",
    whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#fafafe",
  },
  outFoot: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "10px 20px", borderTop: `1px solid ${C.bdr}`, fontSize: 11, color: C.dim,
    background: C.sf,
  },
};
