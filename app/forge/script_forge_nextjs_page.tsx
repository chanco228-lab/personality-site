"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";

const PASSWORD = "garikimbs";

// ============================================================
// PROMPT TEMPLATES
// ============================================================

const SYSTEM_PROMPT_HEADER = `あなたはBrawl Starsの日本語YouTubeショート動画の台本ライターです。
チャンネルの投稿者は10代の男性クリエイター。視聴者も10代〜20代前半の男性プレイヤーです。

# 出力形式
- テキストのみ（コピペ用）
- 案は1つだけ、最高の1本に絞って出す
- 効果音の指示は入れない（別工程で入れる）
- 出力の構造は以下の通り：

【サムネタイトル】（10文字以内、パッと目を引く短いもの）
読み上げタイトル（15〜25文字、「参戦」で終わる or 「N選」で終わる）
---
（本文）
---
（締めのコメント誘導）`;

const STRUCTURE_RULES = `
# 絶対ルール

## 構造
- ランキング形式（基本：第3位→第2位→第1位）
- 項目数は柔軟（お題に合わせる）
- 締め＝「みんなの〇〇は？」でコメント誘導`;

const ITEM_WRITING_RULES = `
## 各項目の書き方

### 3選以下の場合（1項目＝3〜5文で深掘り）
- 1文目：対象名＋核心の事実（スキル効果・数値・バグ内容など）
- 2文目：具体的な影響やヤバさの補足
- 3文目：感情コメント、比喩、ツッコミ、または追加情報
- 4〜5文目（任意）：さらに深掘りや関連情報

### 4選以上の場合（上位3つは深掘り、残りは1〜2文で簡潔に）
- 下位項目：対象名＋変更内容を1〜2文で端的に
- 上位3つ：3選と同じ深掘り構造`;

const TITLE_PATTERNS = `
## タイトルの型（毎回どれか1つ選ぶ）
1. 衝撃告知型：「マジで来た＋[内容]」
2. 危機感型：「[恐怖ワード]＋[内容]」
3. 行動促進型：「[期限]＋[行動]」
4. 驚愕性能型：「[対象]＋やばすぎる性能」
5. 発覚型：「ついに[内容]判明」
6. 速報型：「あまりにも早すぎる＋[内容]」
7. 警告型：「[対象]注意報＋[内容]」
8. 対策型：「[対象]撲滅委員会 / [対象]を倒す方法」`;

type CategoryId = "hype" | "serious" | "data";
type Mode = "script" | "se" | "csv";
type Category = {
  id: CategoryId;
  label: string;
  sub: string;
  detail: string;
  examples: string[];
};

const TONE_RULES: Record<CategoryId, string> = {
  hype: `
## 文体トーン：盛り上げ系（軽い・テンション高め）
- 体言止め、倒置法、省略を多用
- 「火力おかしい」「これもう反則」「環境ぶっ壊してる」
- ツッコミ調OK：「〜だろこれｗｗｗ」「流石に意味不明すぎる」
- テンポパターン：【衝撃→補足→ツッコミ】の3拍子
  例）「火力が衝撃の500%上昇。もはやブロスタじゃなくてドラゴンボールの戦闘力インフレだろこれ。」
- 事実を淡々と積んでから最後に感情を爆発させるパターンも有効
  例）「エイム線が全く信用できず、ボールの判定も小さくなったように見える。シュートもパスもキャッチも全部ずれるから、これはマジで早急に修正してほしいバグだ。」`,
  serious: `
## 文体トーン：警告・注意喚起系（やや硬い・権威的）
- 事実説明は丁寧語寄り：「〜が確認されている」「〜する行為は処罰される」
- 警告部分で権威的トーン：「利用は決して推奨されない」「注意が必要だ」
- ただし全体が硬くならないよう、冒頭や締めは軽くする
- テンポパターン：【結論先出し→理由→ダメ押し】
  例）「利用は決して推奨されない。なぜなら、極めて高い確率で垢BANの対象となるからである。故意にバグを引き起こして不当に利益を得る行為は、運営側から重く処罰される。」
- 「非常に」「極めて」はこのカテゴリでのみ1〜2回使用OK`,
  data: `
## 文体トーン：データ羅列系（淡々→加速）
- 数値変更は淡々と並べる：「体力が7400から6800へ低下」
- 下位項目は1文で処理、上位に行くほど文量を増やす（加速感）
- 上位3項目だけ感情コメントやツッコミを入れる
- テンポパターン：【淡々→淡々→急に熱い】
  例）「第6位：チェスター ウルトのチャージ率が10%低下。」（淡々）
  →上位に行くにつれ文量増加→1位で感情爆発
- 確率データは小数点以下まで必ず記載（0.33%、0.11%等）
- 確定入手と確率入手の差を明確にする`,
};

const WORD_CHOICE_RULES = `
# 言葉選びルール

## 置き換え必須（AI臭い表現→実際の台本で使われる表現）
- 「非常に強い」→「おかしい」「えぐい」「ぶっ壊れ」
- 「非常に強力なキャラクター」→「環境ぶっ壊してる」「チートキャラ」「最強ポジションに座ってる」
- 「優れたスキルを持つ」→「〜できるのが最強ポイント」「〜なのがやばい」
- 「深刻なバグです」→「一番終わっている」「流石に意味不明すぎる」
- 「追加されました」→「来た」「実装された」
- 「不公平な仕様です」→「なかなかにずるい」「廃課金向けだろこれ」
- 「確認されています」→「発生」「起きてる」「横行している」
- 「弱体化されました」→「ナーフ食らった」「弱体化が来た」
- 「使用が困難です」→「弱そう」「正直キツい」「終わってる」
- 「大きな影響を与えます」→「環境が変わる」「試合を壊す」

## 避けること
- 「非常に」「極めて」の連発（警告系で1回だけならOK）
- 「注目すべきは」「特筆すべきは」（ニュース臭い）
- 同じ構文の繰り返し（「〇〇は△△で□□です」が3回続く等）
- 冒頭で「今回は〜を紹介します」（いきなり内容に入る）
- 「さらに」「また」「加えて」は台本全体で2回まで
- 「〜となっています」（警告系以外では使用禁止）

## 積極的に使う接続
- 「しかも」（追い打ち感）
- 「なのに」「なのになぜか」（裏切り・意外性）
- 「もはや」（限度を超えた感）
- 「正直」（主観への切り替え）
- 接続詞なしの直接接続もOK

## 生っぽい表現（AIが自力で出しにくいやつ）
- 一人称の切実な願望：「これはマジで早急に修正してほしいバグだ」
- 呆れのトーン：「流石に意味不明すぎる」
- 笑いつつ呆れる：「完全に廃課金向けコラボだろこれｗｗｗ」
- ネットミーム的ツッコミ：「人の心とかないんか」「これ帰りだな」`;

const TEMPO_EXAMPLES = `
# テンポ・リズムの参考例（実際に伸びた台本から）

## リズム例1：衝撃→補足→ツッコミ（盛り上げ系の基本）
「ラフス強化をもらった状態でハイパーチャージのタレットを置くと、火力が衝撃の500%上昇。もはやブロスタじゃなくてドラゴンボールの戦闘力インフレだろこれ。」

## リズム例2：事実積み上げ→感情爆発（バグ・問題系）
「エイム線が全く信用できず、ボールの判定も小さくなったように見える。シュートもパスもキャッチも全部ずれるから、これはマジで早急に修正してほしいバグだ。」

## リズム例3：結論先→理由→ダメ押し（警告系）
「利用は決して推奨されない。なぜなら、極めて高い確率で垢BANの対象となるからである。故意にバグを引き起こして不当に利益を得る行為は、運営側から重く処罰される。」

## リズム例4：淡々→加速（データ羅列系）
「第6位：チェスター ウルトのチャージ率が10%低下。第5位：シリウス 体力が7400から6800へ低下。」→ 上位になるにつれ1項目の文量を増やしていく。

## 項目間の切り替えバリエーション（同じフレーズを2回使わない）
- 第3位→第2位：「続いて第2位」/ フレーズなしで直接「第2位：〇〇」/ 「まだまだ序の口」
- 第2位→第1位：「そして栄えある第1位」/ 「今回一番終わっているのが」/ 「堂々の第1位」`;

const COMMON_FOOTER = `
# 共通ルール

## 語尾バリエーション（同じ語尾を2文連続禁止）
断定系：〜だ / 〜す / 〜ます
体言止め：〜のキャラ / 〜という性能 / 〜バグ
感情系：〜すぎる / 〜やばい / 〜えぐい
疑問系：〜だろうか / 〜のか
省略系：〜かも / 〜けど / 〜らしい
権威系（警告時のみ）：〜である / 〜からだ / 〜ため注意が必要だ

## 投稿者の人格（1台本に1〜2箇所）
- 自分語り：「ちなみに僕は〜」「正直これはキツい」
- 主観的な願望：「マジで早急に修正してほしい」
- 軽い自虐やネタ：「（コンプしました🐱）」

## 数値ルール
- 確率は小数点以下まで（0.33%）
- ダメージは具体値（560→1400）
- HP変更は前→後（7400→6800）
- 数値のない項目でも「〇秒間」「〇回ヒット」等の定量表現を最低1つ

## 比喩ルール（各台本に最低1つ）
- ゲーム外作品に例える：「ドラゴンボールの戦闘力インフレ」
- ジャンル逸脱比喩：「もはやブロスタじゃなくて○○」
- 既存キャラ比較：「完全に○○の上位互換」「○○バグの再来」

## 煽りワード（各台本3つ以上使用）
S級：ぶっ壊れ / やばすぎる / 最強 / チート / 環境
A級：マジで来た / 反則 / 恐怖 / 地獄 / 確定 / 脅威的 / 致命的
B級：上位互換 / 神スキン / 救済措置 / 混沌 / 無法地帯 / えぐい / 意味不明

## 文の長さとリズム
- 1文15〜35文字が基本。40文字超えたら分割。
- リズム：短文→短文→やや長文→短文
- 下位項目は短く、上位項目は長く（加速感）

## 1台本に最低1回「もはや」「正直」「なのに」を使う`;

const SE_PROMPT = `あなたはYouTubeショート動画の効果音ディレクターです。
以下の完成済み台本に、効果音（SE）の挿入位置を指定してください。

# 大原則
全ての文（区切り）に1つずつSEを入れる。SEのない文は絶対に作らない。
SEは「文の内容・感情」に合わせて選ぶ。適当に散らすのではなく、言葉の意味とSEの音がセットで伝わるように。

# SE一覧と選び方（これ以外のSEは使用禁止）

## 区切り・場面転換系（次の話題に移るとき）
| SE | いつ使う | 具体例 |
|----|---------|--------|
| 拍子木1 | 順位の発表、新しい項目の開始 | 「第3位！」「続いて第2位」「1つ目」の直前 |
| 小鼓（こつづみ） | 順位発表の別バリエーション、間を作る、不穏な話題への切り替え | 「第2位」の直前（拍子木と交互に使う）、警告系の導入 |
| 鈴を鳴らす | 軽い補足情報、ちょっとした追加、話題の小さな切り替え | 「ちなみに〜」「なお〜」「ちなみに僕は〜」の直前 |

## ポジティブ・盛り上がり系（良いこと・強いこと・すごいこと）
| SE | いつ使う | 具体例 |
|----|---------|--------|
| 歓声と拍手 | 1位の発表、最高評価、勝利、ポジティブな結論 | 「堂々の第1位！」「栄えある第1位」の直後 |
| きらーん | レア・レジェンドアイテム登場、神スキン、高レアリティ | 「レジェンドレアスキン」「神スキン」「限定アイテム」が出てきた文 |
| シャキーン1 | 新キャラ登場、強化・覚醒、ハイパーチャージ追加、パワーアップ | 「新キャラが〜」「ハイパーチャージ追加で〜」「強化された」文 |

## ネガティブ・ショック系（悪いこと・残念なこと・衝撃）
| SE | いつ使う | 具体例 |
|----|---------|--------|
| チーン1 | ナーフ・弱体化、残念な結果、期待外れ、使用禁止 | 「ナーフが来た」「弱体化」「使用禁止に」「体力が低下」の文 |
| バーン（どら） | 衝撃的な事実、ぶっ壊れ数値、予想外の展開 | 「火力500%上昇」「確率0.11%」「全部セットで5200円」のような衝撃数値の直後 |
| 間抜け4 | ネタ、弱いキャラ、ズコー的な場面、脱力系オチ | 「弱そう」「使ってる人見たことない」「謎の仕様」の文 |

## 強調・ツッコミ系（感情を乗せるとき）
| SE | いつ使う | 具体例 |
|----|---------|--------|
| 和太鼓ドンッ | 最も重要な結論、BAN警告、最終決定、「ここが核心」 | 「垢BANの対象」「早急な修正が必要」「最強キャラ」の核心文 |
| 和太鼓カカッ | テンポよく情報を畳み掛けるとき、連続データ、加速感 | ナーフ一覧の下位項目、数値が連続する箇所 |
| ビシッとツッコミ2 | ツッコミ、呆れ、「おかしいだろ」系の感情 | 「流石に意味不明すぎる」「廃課金向けだろこれ」「人の心とかないんか」の文 |

# SE選択の判断フロー（毎文これに従う）

1. この文は「次の話題に移る区切り」か？ → 拍子木1 or 小鼓（交互に使う）
2. この文は「補足・ちなみに系」か？ → 鈴を鳴らす
3. この文は「ナーフ・弱体化・残念」か？ → チーン1
4. この文は「衝撃的な数値・事実」か？ → バーン（どら）
5. この文は「新登場・強化・パワーアップ」か？ → シャキーン1
6. この文は「レア・高級・キラキラ系」か？ → きらーん
7. この文は「ツッコミ・呆れ・皮肉」か？ → ビシッとツッコミ2
8. この文は「ネタ・脱力・弱い」か？ → 間抜け4
9. この文は「最重要結論・警告」か？ → 和太鼓ドンッ
10. この文は「データの連続・畳み掛け」か？ → 和太鼓カカッ
11. この文は「1位の発表」か？ → 歓声と拍手
12. 上記に当てはまらない → 文の感情に最も近いSEを選ぶ

# 挿入形式
- [SE:名前] の形式で台本テキスト内に埋め込む
- SEは文の「直前」に置く（例：[SE:拍子木1] 第3位！ビビ 3連バット）
- 【重要】1つの項目（第3位のまとまり、第2位のまとまり等）の中で同じSEを2回使わない。1項目内は全て違うSEにする
- 台本全体でも同じSEを3回以上連続で使わない
- 区切り系（拍子木1と小鼓）は交互に使ってバリエーションを出す
- 出力は台本全文にSEタグを挿入した完成版のみ

# SE付き台本の例

[SE:和太鼓ドンッ] アプデ後の無法地帯バグ 3選
[SE:拍子木1] 第3位！ビビ 3連バット
[SE:バーン（どら）] ビビでハイパーチャージと通常攻撃を同時に出すと、1ロードなのに通常攻撃が3回出るバグが発生。
[SE:ビシッとツッコミ2] バットを振る速度が明らかにおかしく、近づかれたら一瞬で体力が溶ける。
[SE:チーン1] しかもフランケンにも同じ系統のバグがあり、やばい。
[SE:小鼓（こつづみ）] 続いて第2位！ぬるぬるモーティス
[SE:シャキーン1] アプデ後のモーティスは、60Hzでも120Hzみたいにぬるぬる動ける。
[SE:鈴を鳴らす] いつものモーティスより切り返しが滑らかで、端末格差が減ったらしい。
[SE:歓声と拍手] そして今回一番終わっているのが、第1位！ボール判定のバグ
[SE:バーン（どら）] サッカーのボール判定がぶっ壊れて、エイム線が全く信用できない。
[SE:ビシッとツッコミ2] シュートもパスもキャッチも全部ずれるから、これはマジで早急に修正してほしいバグだ。
[SE:和太鼓ドンッ] みんなが遭遇したバグは？`;

const SE_CATEGORY_HINTS: Record<CategoryId, string> = {
  hype: "きらーん、歓声と拍手、シャキーン1を多めに。明るく派手な印象。",
  serious: "小鼓、和太鼓ドンッ、ビシッとツッコミ2を多めに。不穏さ・緊迫感。",
  data: "チーン1を項目ごとに使い分け。大幅ナーフにはバーン（どら）。レア報酬にはきらーん。",
};

// ============================================================
// CSV SUBTITLE PROMPT
// ============================================================

const CSV_PROMPT = `あなたはYouTubeショート動画の字幕データ作成の専門家です。
以下の台本テキストを、動画編集ソフトに読み込ませるCSV形式の字幕データに変換してください。

# CSV形式
- 1列目：ラベル（指定されたものを全行に固定）
- 2列目：字幕テキスト（1画面分）
- ヘッダー行なし、カンマ区切り
- テキスト内にカンマがあればダブルクォートで囲む

# 字幕分割の大原則

字幕は「視聴者が音声を聞きながら、パッと見て一瞬で読める量」に区切る。
機械的に文字数で切るのではなく、意味のまとまり・呼吸の区切り・読みやすさを総合的に判断して、最も自然な位置で分割すること。

## 文字数ルール（厳守）
- 画面の横幅は13文字。1行は絶対に13文字を超えない
- 字幕は最大2行表示＝1字幕あたり最大26文字
- 26文字を超える場合は必ず次の字幕に分割する
- 1字幕は15〜25文字が最も多いパターン。短すぎる字幕を作らないことが最も重要
- 分割に迷ったら結合する。短すぎるより長い方がマシ
- 10文字以下の字幕は前後どちらかと結合する（結合後26文字以内であること）
- 特に感情語・オチ単体（「えぐい」「やばい」「反則すぎる」「地味にやばい」等）は絶対に単独行にしない
- 声に出して1〜2秒で読める量が目安

## 分割しすぎ禁止（最重要ルール）
字幕を作ったら、必ず「隣の字幕と結合できないか」を全行チェックする。
26文字以内に収まるなら結合する。分割より結合を優先すること。

### 結合の判断基準
1. 現在の字幕と次の字幕を繋げて26文字以内に収まるか？ → 収まるなら結合する
2. 10文字以下の字幕は単独で存在してはいけない。必ず前後どちらかと結合する
3. 「〜のに」「〜けど」「〜から」「〜て」「〜正直」で終わる字幕は、次の字幕と結合できないか必ず検討する
4. 感情語・オチ（「えぐい」「やばい」「反則すぎる」等）が単独の字幕になっていたら、前の字幕と結合する
5. 短い動作の列挙（「〜する」「〜見る」「〜逃げる」）は、26文字以内に収まる限りまとめる

### 結合の具体例（全てOKパターン）
- 「簡単で使いやすいのにタンクにも中射程にも強い万能キャラ」（25文字）→ OK、1字幕
- 「近距離に来た相手を一気に処理できるのがえぐい」（22文字）→ OK、1字幕
- 「毒で回復を止めるタンクを見る足の速さで逃げる」（22文字）→ OK、1字幕
- 「やれることが多すぎて正直弱体化されてもまだ普通に強い」（25文字）→ OK、1字幕
- 「これもうHP高いキャラほど逃げられない税務署だろ」（23文字）→ OK、1字幕
- 「もはやブロスタじゃなくてエドガーから逃げるホラーゲーム」（25文字）→ OK、1字幕

### NGパターン（これが出たら失敗）
- 「えぐい」が単独の行 → 前の字幕と結合すべき
- 「万能キャラ」が単独の行かつ前と結合して26文字以内 → 結合すべき
- 10文字以下の行が前後と結合可能なのに単独 → 結合すべき

## CSVと字幕の関係
CSVの1セル＝字幕の1画面分（改行なしの1行テキスト）。
動画編集ソフト側で13文字ごとに自動改行されるので、CSV側では改行を入れない。
つまり「体力が実質3万のセコレットが誕生する」（19文字）は画面では2行になるが、CSVでは1セル。

## 分割の判断基準（ヒントであり、機械的に適用するルールではない）
以下を参考にしつつ、文ごとに最も読みやすい区切りをAIが判断する：

- 句点「。」は基本的に区切りになる
- 読点「、」は区切りの候補になる（ただし短い節を無理に分けない）
- 助詞（は・が・を・に・で・と・も・から・まで・へ）の後は自然な区切りになりやすい
- 接続表現（しかも・なのに・もはや・さらに）の前は区切りになりやすい
- 「〜して」「〜なく」等の連用形の後も区切り候補
- 体言止めの直後は強い区切り

## 絶対に分割してはいけない位置
- 単語の途中（漢字の読みを分断しない）
- キャラ名・技名の途中（「ハイパー / チャージ」はNG）
- 数値と単位のセット（「500%」「0.33%」「5200円」「3万」は1つの塊）
- 「〇〇の△△」のような短い修飾関係を切ると意味が取りにくくなる場合

## 判断に迷ったら
声に出して読んでみて、息継ぎしたくなる場所で区切る。
「この字幕だけ見て意味が通じるか？」を基準にする。

# 具体例

## 入力
体力が実質3万のセコレットが誕生する。バグのやり方は、コレットウルトを途中でキャンセルさせることだ。

## 出力
ラベル,体力が実質3万のセコレットが誕生する
ラベル,バグのやり方はコレットウルトを途中で
ラベル,キャンセルさせることだ

→ 1行目は19文字（2行表示：「体力が実質3万の」+「セコレットが誕生する」）。2行目は17文字。3行目は11文字で1行に収まる。

## 入力
ラフス強化をもらった状態でハイパーチャージのタレットを置くと、火力が衝撃の500%上昇。もはやブロスタじゃなくてドラゴンボールの戦闘力インフレだろこれ。

## 出力
ラベル,ラフス強化をもらった状態で
ラベル,ハイパーチャージのタレットを置くと
ラベル,火力が衝撃の500%上昇
ラベル,もはやブロスタじゃなくて
ラベル,ドラゴンボールの戦闘力インフレだろこれ

→ 各行13〜20文字。「ハイパーチャージ」を分断しない。「500%」を分断しない。「もはや」の前で区切る。

## 入力
エイム線が全く信用できず、ボールの判定も小さくなったように見える。シュートもパスもキャッチも全部ずれるから、これはマジで早急に修正してほしいバグだ。

## 出力
ラベル,エイム線が全く信用できず
ラベル,ボールの判定も小さくなったように見える
ラベル,シュートもパスもキャッチも全部ずれるから
ラベル,これはマジで早急に修正してほしいバグだ

→ 2行目は20文字（2行表示：「ボールの判定も小さく」+「なったように見える」で各行13文字以内）。4行目も20文字だが意味を切ると不自然なのでこのまま。

# 注意
- [SE:〇〇] タグが台本内にある場合は全て除去してから処理する
- 「第3位！」「第2位！」「第1位！」等の順位コールも1つの字幕にする
- タイトル読み上げも字幕に含める
- 字幕テキスト（右列）に半角スペース・全角スペースを入れない。空白があれば削除する
- 出力はCSVデータのみ。説明文や補足は一切不要`;

// ============================================================
// CATEGORIES (3 categories with rich descriptions)
// ============================================================

const CATEGORIES: Category[] = [
  {
    id: "hype",
    label: "🔥 盛り上げ系",
    sub: "テンション高め・エンタメ・ポジティブ寄り",
    detail: "新キャラ紹介、スキン・コラボ情報、環境ランキング、おすすめ/買うべき系、キャラ対策・攻略、新要素の性能解説、ガチャ報酬紹介、最強戦法など。「すげー！」「やべー！」の方向で引っ張る台本は全部これ。",
    examples: [
      "満環境キャラランキング",
      "ヒロアカコラボスキン",
      "新規バフィー性能",
      "カタログで買うべきスキン",
      "ダミアン撲滅委員会",
      "新キャラ最強戦法",
      "ノバドロック報酬",
    ],
  },
  {
    id: "serious",
    label: "⚠️ 警告・注意喚起系",
    sub: "やや硬め・危機感・権威的トーンを混ぜる",
    detail: "バグ悪用のBAN警告、アプデの落とし穴、課金トラップ、運営のやらかし・お詫び対応、不公平な仕様への批判など。「ヤバい」の矢印が怒り・不満・注意喚起に向いている台本。警告部分だけ意図的に硬い表現を使う。",
    examples: [
      "垢BAN注意報",
      "アプデに潜む恐怖",
      "反則ギリギリで活動中",
      "不公平ショップラインナップ",
      "運営からのごめんなさい",
    ],
  },
  {
    id: "data",
    label: "📊 データ羅列系",
    sub: "数値中心・淡々と並べて上位で加速",
    detail: "ナーフ/バフの数値一覧、ガチャの排出確率の全容、バランス調整パッチノート、ボックス排出内容など。数値の羅列が主体で、下位は淡々・上位で感情を入れる構造。確率は小数点以下まで、ダメージは変更前→後で記載。",
    examples: [
      "緊急バランス調整6選",
      "ダミアンボックス確率判明",
      "シリウス性能（数値多め）",
    ],
  },
];

const MODE_TABS: Array<{ id: Mode; label: string }> = [
  { id: "script", label: "① 台本生成" },
  { id: "se", label: "② SE割り当て" },
  { id: "csv", label: "③ CSV字幕" },
];

// ============================================================
// HELPERS
// ============================================================

function getDuration(n: number) {
  if (n <= 1) return "30〜45秒";
  if (n <= 3) return "45〜60秒";
  if (n <= 5) return "60〜75秒";
  if (n <= 7) return "70〜90秒";
  if (n <= 10) return "80〜100秒";
  if (n <= 15) return "90〜120秒";
  if (n <= 20) return "120〜150秒";
  return "150秒以上";
}

function getSeCount(n: number) {
  // Roughly 3-4 sentences per item + title + closing = per-sentence SE
  if (n <= 1) return "8〜12個";
  if (n <= 3) return "12〜18個";
  if (n <= 5) return "18〜24個";
  if (n <= 7) return "22〜30個";
  if (n <= 10) return "28〜38個";
  if (n <= 15) return "35〜48個";
  if (n <= 20) return "45〜60個";
  return "55個以上";
}

// ============================================================
// MAIN
// ============================================================

export default function ForgePage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);

  const [cat, setCat] = useState<CategoryId | "">("");
  const [count, setCount] = useState(3);
  const [topic, setTopic] = useState("");
  const [mats, setMats] = useState("");
  const [supp, setSupp] = useState("");
  const [mode, setMode] = useState<Mode>("script");
  const [seText, setSeText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvResult, setCsvResult] = useState("");
  const [csvLabel, setCsvLabel] = useState("ショート用1");
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => {
    if (mode === "csv") {
      return CSV_PROMPT.replace(/ラベル/g, csvLabel) + `\n\n# ラベル：${csvLabel}\n\n# 台本\n${csvText}`;
    }
    if (mode === "se") {
      const hint = cat ? SE_CATEGORY_HINTS[cat] : "";
      return [
        SE_PROMPT,
        `\n# SE数量：全ての文に1個ずつ（目安：${getSeCount(count)}）`,
        `\n# カテゴリ別SE傾向\n${hint}`,
        `\n# 台本\n${seText}`,
      ].join("\n");
    }
    const tone = cat ? TONE_RULES[cat] : "";
    const category = CATEGORIES.find(c => c.id === cat);
    const label = category?.label || "未選択";
    const categorySub = category?.sub || "未選択";
    const suppB = supp.trim() ? `\n【補足説明・追加指示】\n${supp}` : "";
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
      suppB,
    ].join("\n");
  }, [cat, count, topic, mats, supp, mode, seText, csvText, csvLabel]);

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
    } catch (e) {
      // fallback: try clipboard API
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

  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [prompt]);

  // ── Auth ──
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
            onChange={e => { setPw(e.target.value); setPwErr(false); }}
            onKeyDown={e => e.key === "Enter" && (pw === PASSWORD ? (setAuthed(true)) : setPwErr(true))}
            placeholder="パスワード"
            style={{ ...S.inp, borderColor: pwErr ? "#e74c3c" : C.bdr }}
          />
          {pwErr && <p style={{ color: "#e74c3c", fontSize: 11, margin: "2px 0 0" }}>パスワードが違います</p>}
          <button
            onClick={() => pw === PASSWORD ? setAuthed(true) : setPwErr(true)}
            style={S.mainBtn}
          >
            入場
          </button>
        </div>
      </div>
    );
  }

  // ── App ──
  return (
    <div style={S.root}>
      <header style={S.hdr}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={S.brand2}>SCRIPT FORGE</span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {MODE_TABS.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              style={mode === m.id ? S.tabOn : S.tabOff}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div style={S.cols}>
        {/* LEFT */}
        <div style={S.left}>
          {mode === "script" ? (
            <>
              <Block n="1" t="カテゴリ">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {CATEGORIES.map(c => {
                    const on = cat === c.id;
                    return (
                      <button key={c.id} onClick={() => setCat(c.id)} style={on ? S.cardOn : S.card}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: on ? C.acc : C.hi }}>{c.label}</span>
                          <span style={{ fontSize: 11, color: C.dim }}>{c.sub}</span>
                        </div>
                        <p style={{ fontSize: 12, color: C.txt, lineHeight: 1.65, margin: "0 0 6px" }}>{c.detail}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {c.examples.map((ex, i) => (
                            <span key={i} style={S.exTag}>{ex}</span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Block>

              <Block n="2" t="項目数">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <select
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    style={S.sel}
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>
                        {n}選{n === 1 ? "（深掘り）" : n === 3 ? "（基本）" : ""}
                      </option>
                    ))}
                  </select>
                  <span style={S.meta}>尺 {getDuration(count)}　｜　SE目安 {getSeCount(count)}（全文に1個ずつ）</span>
                </div>
              </Block>

              <Block n="3" t="お題">
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="例：次回アプデで追加される新キャラ3体の性能紹介"
                  style={S.ta}
                  rows={2}
                />
              </Block>

              <Block n="4" t="情報素材（データ貼り付け）">
                <textarea
                  value={mats}
                  onChange={e => setMats(e.target.value)}
                  placeholder="アプデ内容、キャラデータ、確率データ等を箇条書きで"
                  style={S.ta}
                  rows={6}
                />
              </Block>

              <Block n="5" t="補足説明（任意）">
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
          ) : mode === "se" ? (
            <>
              <Block n="1" t="カテゴリ（SE傾向）">
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => setCat(c.id)} style={cat === c.id ? S.chipOn : S.chip}>
                      {c.label}
                    </button>
                  ))}
                </div>
                {cat && <div style={S.seBox}>SE傾向：{SE_CATEGORY_HINTS[cat]}</div>}
              </Block>
              <Block n="2" t="確認済み台本を貼り付け">
                <textarea
                  value={seText}
                  onChange={e => setSeText(e.target.value)}
                  placeholder="人が確認・微調整した台本をここに貼り付け"
                  style={S.ta}
                  rows={16}
                />
              </Block>
            </>
          ) : (
            /* CSV MODE */
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
                <button
                  onClick={downloadCsv}
                  disabled={!csvResult.trim()}
                  style={!csvResult.trim() ? S.dlBtnDisabled : S.dlBtn}
                >
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

        {/* RIGHT */}
        <div style={S.right}>
          <div style={S.outHdr}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.hi }}>
              {mode === "script" ? "📋 台本生成プロンプト" : mode === "se" ? "🔊 SE割り当てプロンプト" : "📐 CSV字幕プロンプト"}
            </span>
            <button onClick={copy} style={copied ? S.cpDone : S.cpBtn}>
              {copied ? "✓ コピー完了" : "コピー"}
            </button>
          </div>
          <pre ref={preRef} style={S.pre}>{prompt}</pre>
          <div style={S.outFoot}>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{prompt.length.toLocaleString()} 文字</span>
            <span style={{ color: C.acc, fontWeight: 700, fontSize: 11 }}>
              {mode === "script" ? "→ ChatGPTに貼る → 確認 → ②へ" : mode === "se" ? "→ ChatGPTに貼る → SE付き台本完成 → ③へ" : "→ ChatGPTに貼る → CSV字幕データ完成"}
            </span>
          </div>
        </div>
      </div>
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

// ============================================================
// TOKENS
// ============================================================

const C = {
  bg: "#f8f6ff",
  sf: "#ffffff",
  bdr: "rgba(0,0,0,0.08)",
  acc: "#6c5ce7",
  accDim: "rgba(108,92,231,0.08)",
  accGlow: "rgba(108,92,231,0.18)",
  acc2: "#fd79a8",
  acc2Dim: "rgba(253,121,168,0.1)",
  txt: "#2d3436",
  dim: "#888e99",
  hi: "#1a1a2e",
};

const S: Record<string, CSSProperties> = {
  authBg: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: `linear-gradient(135deg, #f8f6ff 0%, #e8e4f8 40%, #fce4ec 100%)`,
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
    width: "100%", padding: "11px", background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`,
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
    background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`,
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 900, flexShrink: 0,
  },
  card: {
    padding: "16px 17px", background: C.sf, border: `1.5px solid ${C.bdr}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left",
    transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardOn: {
    padding: "16px 17px", background: C.accDim, border: `1.5px solid ${C.acc}`,
    borderRadius: 14, cursor: "pointer", textAlign: "left",
    boxShadow: `0 4px 20px ${C.accGlow}`,
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
  dlBtn: {
    width: "100%", padding: "11px", marginTop: 10,
    background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`,
    color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
    cursor: "pointer", boxShadow: "0 4px 14px rgba(108,92,231,0.25)",
  },
  dlBtnDisabled: {
    width: "100%", padding: "11px", marginTop: 10,
    background: "#d7dbe3", color: "#7f8794", border: "none", borderRadius: 10,
    fontSize: 14, fontWeight: 800, cursor: "not-allowed", boxShadow: "none",
  },
  outHdr: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: `1px solid ${C.bdr}`, background: C.sf,
  },
  cpBtn: {
    padding: "7px 18px", background: `linear-gradient(135deg, ${C.acc}, ${C.acc2})`,
    color: "#fff", border: "none",
    borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer",
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
