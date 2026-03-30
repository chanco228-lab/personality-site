export type FactorType = 'NS' | 'HA' | 'RD' | 'P' | 'SD' | 'CO' | 'ST';
export type FactorLevel = 'high' | 'mid' | 'low';

export type Question = {
  id: number;
  text: string;
  factor: FactorType;
  reversed: boolean;
};

export type PersonalityType = {
  id: string;
  name: string;
  catchphrase: string;
  ns: FactorLevel;
  ha: FactorLevel;
  rd: FactorLevel;
  p: 'high' | 'low';
  sd_rep: FactorLevel;
  co_rep: FactorLevel;
  loss: string;
};

export type FactorScores = {
  NS: number; HA: number; RD: number;
  P: number;  SD: number; CO: number; ST: number;
};

export type QuizResults = {
  scores: FactorScores;
  typeId: string;
};

export const FACTOR_LABELS: Record<FactorType, string> = {
  NS: '新規性探求', HA: '損害回避', RD: '報酬依存',
  P: '固執', SD: '自己志向', CO: '協調性', ST: '自己超越性',
};

// ID: {ns}{ha}{rd}_{p}  h=high m=mid l=low  p=persistent f=flexible
export const personalityTypes: PersonalityType[] = [

  // ──────────────────────────── NS高・HA低 ────────────────────────────────

  { id:'hlh_p', name:'指揮官', ns:'high', ha:'low', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'人を率いて、最後まで突き進む',
    loss:'承認欲求から本音を出せず、燃え尽きて突然止まることで周囲を困惑させる' },

  { id:'hlh_f', name:'革命家', ns:'high', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'情熱の炎で世界を変えようとする',
    loss:'承認欲求から本音を言えず、ある日突然燃え尽きて周囲を置いていく' },

  { id:'hlm_p', name:'開拓者', ns:'high', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'誰も踏み入れていない道を、自分で切り拓く',
    loss:'自分の信念にこだわりすぎ、「理解されない孤高」と感じながら孤立していく' },

  { id:'hlm_f', name:'探検家', ns:'high', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'地図のない場所へ、身一つで飛び込む',
    loss:'飽きてリセットする癖が周囲に「無責任」と映り、信頼が積み上がらない' },

  { id:'hll_p', name:'戦略家', ns:'high', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'先を読み、自分だけの勝ち筋を組み立てる',
    loss:'飽きてリセットする癖が「無責任」と映り、孤立しながら損な役回りを続ける' },

  { id:'hll_f', name:'反骨者', ns:'high', ha:'low', rd:'low', p:'low', sd_rep:'low', co_rep:'low',
    catchphrase:'既存のルールに従わない、一匹狼',
    loss:'自由を守るために逃げ続け、「信頼できない人」という評価が積み重なる' },

  // ──────────────────────────── NS高・HA中 ────────────────────────────────

  { id:'hmh_p', name:'提唱者', ns:'high', ha:'mid', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'ビジョンを語り、人を動かし続ける',
    loss:'承認欲求から無理をし続け、燃え尽きて突然姿を消すことで周囲を困惑させる' },

  { id:'hmh_f', name:'表現者', ns:'high', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'感情をそのまま表現する、天性の演者',
    loss:'期待させておいて急に冷める言動が繰り返され、大切な人から信頼を失っていく' },

  { id:'hmm_p', name:'批評家', ns:'high', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'鋭い目で本質を見抜き、言葉にする',
    loss:'正論で人を追い詰め、「正しいが付き合いにくい人」と距離を置かれやすい' },

  { id:'hmm_f', name:'懐疑者', ns:'high', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'あらゆることに「本当に？」と問いかける',
    loss:'懐疑が行動を止め、「批判はするが何もしない人」という評価が固定される' },

  { id:'hml_p', name:'起業家', ns:'high', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'リスクを取って、自分で道を切り開く',
    loss:'自分のやり方を曲げないこだわりが「チームで働けない人」という評価につながる' },

  { id:'hml_f', name:'挑戦者', ns:'high', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'次の挑戦へ、常に前だけを向く',
    loss:'次々と乗り換える姿が「浮気性」と映り、重要な機会での信頼を失いやすい' },

  // ──────────────────────────── NS高・HA高 ────────────────────────────────

  { id:'hhh_p', name:'完璧主義者', ns:'high', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'理想の形を追い求め、妥協しない',
    loss:'自分を守るあまり知らずしらず他者を傷つけ、完璧主義の頑固さが関係を壊す' },

  { id:'hhh_f', name:'庇護者', ns:'high', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'心配しながら、それでも人のために動く',
    loss:'人の感情を引き受けすぎて消耗し、突然距離を置いてしまい信頼を失う' },

  { id:'hhm_p', name:'良心家', ns:'high', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'正しいことへの強い信念を、最後まで曲げない',
    loss:'正しさにこだわるあまり人を追い詰め、「正論の人」と距離を置かれ孤立する' },

  { id:'hhm_f', name:'葛藤者', ns:'high', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'やりたい気持ちと不安の間で、揺れ続ける',
    loss:'葛藤したまま動けず、「せっかくのチャンス」を繰り返し手放して後悔が積み重なる' },

  { id:'hhl_p', name:'闘士', ns:'high', ha:'high', rd:'low', p:'high', sd_rep:'mid', co_rep:'low',
    catchphrase:'恐れを感じながらも、戦い続ける',
    loss:'感情の振れ幅が大きく、大事な場面で信頼を失いやすい' },

  { id:'hhl_f', name:'反抗者', ns:'high', ha:'high', rd:'low', p:'low', sd_rep:'low', co_rep:'low',
    catchphrase:'恐れながらも、既存の秩序に反発し続ける',
    loss:'感情の振れ幅が大きく、重要な場面での感情的言動で信頼を一瞬で失う' },

  // ──────────────────────────── NS中・HA低 ────────────────────────────────

  { id:'mlh_p', name:'外交官', ns:'mid', ha:'low', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'人と人の間に立ち、橋をかけ続ける',
    loss:'承認欲求から本音を言えず、ある日突然燃え尽きて周囲を置いていく' },

  { id:'mlh_f', name:'冒険者', ns:'mid', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'人と一緒に、新しい場所へ踏み出す',
    loss:'期待させておいて急に冷めることで、大切な人から「また離れた」と思われ続ける' },

  { id:'mlm_p', name:'記録者', ns:'mid', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'見たこと・感じたことを丁寧に記し続ける',
    loss:'着実さが「存在感のなさ」と映り、重要な場面で選ばれないまま機会を逃す' },

  { id:'mlm_f', name:'独歩者', ns:'mid', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'自分のリズムで、自分の道を行く',
    loss:'気ままさが「計画性がない人」と映り、重要な役割を任せてもらえなくなる' },

  { id:'mll_p', name:'実験者', ns:'mid', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'仮説を立てて試し、黙々と検証する',
    loss:'自分のやり方を曲げないこだわりが「孤立した人」という評価を固定させる' },

  { id:'mll_f', name:'自由人', ns:'mid', ha:'low', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'何にも縛られず、風のように生きる',
    loss:'フットワークの軽さが「無責任」と映り、重要な機会をそっと外される' },

  // ──────────────────────────── NS中・HA中 ────────────────────────────────

  { id:'mmh_p', name:'調停者', ns:'mid', ha:'mid', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'対立を和らげ、全員が前に進める道を作る',
    loss:'人の期待に応えようとしすぎて断れず消耗し、誰のためにもなれなくなる' },

  { id:'mmh_f', name:'楽天家', ns:'mid', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'なんとかなるさ、と笑いながら前へ進む',
    loss:'期待させておいて急に熱量がゼロになり、大切な関係や仕事を損ねてしまう' },

  { id:'mmm_p', name:'思索家', ns:'mid', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'じっくり考え、自分なりの答えを積み上げる',
    loss:'「いい人」で止まることで重要な場面で選ばれず、気づいたら後回しにされ続ける' },

  { id:'mmm_f', name:'現実主義者', ns:'mid', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'できることとできないことを、冷静に見極める',
    loss:'何にでも対応できる反面「あなたでなければ」という場面が少なく、代替されやすい' },

  { id:'mml_p', name:'分析家', ns:'mid', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'データと論理で、隠れた真実を掘り起こす',
    loss:'自分のやり方にこだわりすぎ、チームでの評価を得にくく重要なポジションから外される' },

  { id:'mml_f', name:'傍観者', ns:'mid', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'距離を保ちながら、全体を見渡す',
    loss:'距離を取り続けることで「関わる気がない人」と見なされ、重要な場から排除される' },

  // ──────────────────────────── NS中・HA高 ────────────────────────────────

  { id:'mhh_p', name:'守護者', ns:'mid', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'大切な人を守るために、粘り強く動き続ける',
    loss:'リスクを避けすぎてチャンスを見送り続け、慎重さが「決断できない人」という評価につながる' },

  { id:'mhh_f', name:'共感者', ns:'mid', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'人の痛みを自分のものとして受け止める',
    loss:'人の感情を引き受けすぎて突然距離を置き、「結局離れた」という評価を受ける' },

  { id:'mhm_p', name:'献身家', ns:'mid', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'誰かのために尽くすことに、生きがいを感じる',
    loss:'リスクを考えすぎてチャンスを見送り、慎重さが「決断できない人」という印象を積み重ねる' },

  { id:'mhm_f', name:'迷い人', ns:'mid', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'どこへ向かえばいいか、いつも迷い続ける',
    loss:'不安が大きすぎて動き出せず、チャンスを逃す繰り返しが自己嫌悪につながる' },

  { id:'mhl_p', name:'審判者', ns:'mid', ha:'high', rd:'low', p:'high', sd_rep:'mid', co_rep:'low',
    catchphrase:'正しさと公平さを、厳格に守り続ける',
    loss:'正論で人を追い詰め、「正しいが一緒にいると疲れる」と距離を置かれ孤立する' },

  { id:'mhl_f', name:'孤高の人', ns:'mid', ha:'high', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'群れず、自分の価値観だけを信じて生きる',
    loss:'人を頼れないまま孤立し、本当に困ったときに誰にも頼めず限界を迎える' },

  // ──────────────────────────── NS低・HA高 ────────────────────────────────

  { id:'lhh_p', name:'相談役', ns:'low', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'安心を与えながら、人の悩みに寄り添う',
    loss:'リスクを避けすぎてチャンスをそのまま見送り、後悔だけが積み重なっていく' },

  { id:'lhh_f', name:'伴走者', ns:'low', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'心配しながらも、友人のそばにいようとする',
    loss:'心配しすぎて動けず、「頼りにならない人」という評価が積み重なる' },

  { id:'lhm_p', name:'支援者', ns:'low', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'安全に、着実に、人を後ろから支える',
    loss:'リスクを避けすぎてチャンスを見送り、安全を求めるあまり何も変わらない状況が続く' },

  { id:'lhm_f', name:'同行者', ns:'low', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'不安を抱えながらも、誰かと一緒に歩く',
    loss:'不安が大きすぎて動き出せず、チャンスを逃す繰り返しが自己嫌悪につながる' },

  { id:'lhl_p', name:'研究者', ns:'low', ha:'high', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'一つのテーマを、徹底的に掘り下げる',
    loss:'正論で人を追い詰め、「あなたは正しいが疲れる」と言われ孤立していく' },

  { id:'lhl_f', name:'慎想家', ns:'low', ha:'high', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'心配と疑念を抱えたまま、動けずにいる',
    loss:'心配が行動を止め続け、「結局何もしない人」という評価が積み重なる' },

  // ──────────────────────────── NS低・HA中 ────────────────────────────────

  { id:'lmh_p', name:'縁の下の力持ち', ns:'low', ha:'mid', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'目立たずとも、確実に人を支え続ける',
    loss:'断れずに損な役回りを引き受け続け、静かに消耗していく' },

  { id:'lmh_f', name:'聞き上手', ns:'low', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'話を聞くことで、人の心を楽にする',
    loss:'頼りにされている分、続けられなくなったときの失望が大きく、信頼を一気に失う' },

  { id:'lmm_p', name:'堅実家', ns:'low', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'地道に、着実に、揺るがず積み上げる',
    loss:'堅実すぎて変化に乗り遅れ、積み上げた成果が環境変化で陳腐化することがある' },

  { id:'lmm_f', name:'穏やかな協力者', ns:'low', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'波風を立てず、穏やかに人と関わる',
    loss:'変化を嫌い継続も苦手なため、現状維持のまま時代に取り残されていくことがある' },

  { id:'lml_p', name:'職人', ns:'low', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'一つのことを極めることに、誇りを持つ',
    loss:'黙々と働く姿が「協調性のなさ」と映り、チームでの評価が得にくくなる' },

  { id:'lml_f', name:'観測者', ns:'low', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'静かに観察し、距離を保ちながら見守る',
    loss:'距離を取り続けることで「関わる気がない人」と見なされ、大切な機会を逃し続ける' },

  // ──────────────────────────── NS低・HA低 ────────────────────────────────

  { id:'llh_p', name:'実直家', ns:'low', ha:'low', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'誠実さと粘り強さで、人の信頼を積み上げる',
    loss:'断れずに損な役回りを引き受け続け、静かに消耗していく' },

  { id:'llh_f', name:'親友型', ns:'low', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'そばにいることで、人に安心感を与える',
    loss:'断れないまま引き受け続け、気づいたときには回復できないほど消耗している' },

  { id:'llm_p', name:'誠実者', ns:'low', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'黙々と、誠実に、自分の仕事を果たす',
    loss:'黙々と働く誠実さが「存在感のなさ」と映り、成果があっても見落とされ続ける' },

  { id:'llm_f', name:'温情家', ns:'low', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'温かさで、人をそっと包み込む',
    loss:'マイペースさが「不真面目」と映り、チャンスを与えてもらえないまま機会を失い続ける' },

  { id:'lll_p', name:'哲学者', ns:'low', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'静かに内側を掘り下げ、自分の真理を求める',
    loss:'人を頼れないまま限界まで抱え込み、本当に困ったときに詰む' },

  { id:'lll_f', name:'隠者', ns:'low', ha:'low', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'何にも縛られず、静かに自分の世界に生きる',
    loss:'人を頼れず孤立したまま限界を超え、本当に困ったときに誰も助けてくれない状況に陥る' },
];
