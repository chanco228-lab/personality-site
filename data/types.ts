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
    loss:'あなたは勢いよく進める中で、周囲の気持ちを後回しにしてしまい、気づいたら協力を得にくくなることがある' },

  { id:'hlh_f', name:'革命家', ns:'high', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'情熱の炎で世界を変えようとする',
    loss:'あなたは理想に向かって突き進む中で、現実的な調整を後回しにしてしまい、気づいたら孤立することがある' },

  { id:'hlm_p', name:'開拓者', ns:'high', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'誰も踏み入れていない道を、自分で切り拓く',
    loss:'あなたは新しいことに挑む中で、細かな確認を飛ばしてしまい、気づいたら手戻りが増えることがある' },

  { id:'hlm_f', name:'探検家', ns:'high', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'地図のない場所へ、身一つで飛び込む',
    loss:'あなたは自由に動く中で、優先順位を曖昧にしてしまい、気づいたら時間をロスすることがある' },

  { id:'hll_p', name:'戦略家', ns:'high', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'先を読み、自分だけの勝ち筋を組み立てる',
    loss:'あなたは効率よく進めようとする中で、人の気持ちのペースを後回しにしてしまい、気づいたら意図が伝わりにくくなることがある' },

  { id:'hll_f', name:'反骨者', ns:'high', ha:'low', rd:'low', p:'low', sd_rep:'low', co_rep:'low',
    catchphrase:'既存のルールに従わない、一匹狼',
    loss:'あなたは自分の考えを大切にする中で、他者の意見を受け取りにくくなり、気づいたら視野が狭くなることがある' },

  // ──────────────────────────── NS高・HA中 ────────────────────────────────

  { id:'hmh_p', name:'提唱者', ns:'high', ha:'mid', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'ビジョンを語り、人を動かし続ける',
    loss:'あなたは理想を語る力がある一方で、具体的な一歩が後回しになり、気づいたら周囲が動きにくくなることがある' },

  { id:'hmh_f', name:'表現者', ns:'high', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'感情をそのまま表現する、天性の演者',
    loss:'あなたは感情を込めて伝える中で、伝えたい軸が揺れてしまい、気づいたら本来の意図が伝わりにくくなることがある' },

  { id:'hmm_p', name:'批評家', ns:'high', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'鋭い目で本質を見抜き、言葉にする',
    loss:'あなたは物事を深く見ようとする中で、改善点に意識が向きすぎてしまい、気づいたら前に進むタイミングを逃すことがある' },

  { id:'hmm_f', name:'懐疑者', ns:'high', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'あらゆることに「本当に？」と問いかける',
    loss:'あなたは慎重に考えるあまり、決断のタイミングを逃してしまい、気づいたら機会を見送ることがある' },

  { id:'hml_p', name:'起業家', ns:'high', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'リスクを取って、自分で道を切り開く',
    loss:'あなたは次々と挑戦する中で、土台づくりを後回しにしてしまい、気づいたら成果が安定しにくくなることがある' },

  { id:'hml_f', name:'挑戦者', ns:'high', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'次の挑戦へ、常に前だけを向く',
    loss:'あなたは勢いよく行動する中で、振り返りの時間を取りにくくなり、気づいたら同じつまずきを繰り返すことがある' },

  // ──────────────────────────── NS高・HA高 ────────────────────────────────

  { id:'hhh_p', name:'完璧主義者', ns:'high', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'理想の形を追い求め、妥協しない',
    loss:'あなたは高い基準を持つあまり、細部にこだわりすぎてしまい、気づいたら進みが遅くなることがある' },

  { id:'hhh_f', name:'庇護者', ns:'high', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'心配しながら、それでも人のために動く',
    loss:'あなたは周囲を守ろうとする中で、自分の負担を後回しにしてしまい、気づいたら疲れが溜まることがある' },

  { id:'hhm_p', name:'良心家', ns:'high', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'正しいことへの強い信念を、最後まで曲げない',
    loss:'あなたは正しさを大切にするあまり、柔軟な対応が難しくなり、気づいたら選択肢が狭まることがある' },

  { id:'hhm_f', name:'葛藤者', ns:'high', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'やりたい気持ちと不安の間で、揺れ続ける',
    loss:'あなたは多くを考える中で、決めきれない状態が続き、気づいたら動き出せないことがある' },

  { id:'hhl_p', name:'闘士', ns:'high', ha:'high', rd:'low', p:'high', sd_rep:'mid', co_rep:'low',
    catchphrase:'恐れを感じながらも、戦い続ける',
    loss:'あなたは全力で向き合う中で、力の配分を見失い、気づいたら消耗が大きくなることがある' },

  { id:'hhl_f', name:'反抗者', ns:'high', ha:'high', rd:'low', p:'low', sd_rep:'low', co_rep:'low',
    catchphrase:'恐れながらも、既存の秩序に反発し続ける',
    loss:'あなたは自分の意思を守る中で、協力の機会を逃してしまい、気づいたら一人で抱えることがある' },

  // ──────────────────────────── NS中・HA低 ────────────────────────────────

  { id:'mlh_p', name:'外交官', ns:'mid', ha:'low', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'人と人の間に立ち、橋をかけ続ける',
    loss:'あなたは調整役として動く中で、自分の意見を後回しにしてしまい、気づいたら本音を出せないことがある' },

  { id:'mlh_f', name:'冒険者', ns:'mid', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'人と一緒に、新しい場所へ踏み出す',
    loss:'あなたは楽しさを優先する中で、長期的な視点が薄くなり、気づいたら成果が安定しないことがある' },

  { id:'mlm_p', name:'記録者', ns:'mid', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'見たこと・感じたことを丁寧に記し続ける',
    loss:'あなたは丁寧に積み重ねる中で、変化への対応が後回しになり、気づいたら新しい流れに乗り遅れることがある' },

  { id:'mlm_f', name:'独歩者', ns:'mid', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'自分のリズムで、自分の道を行く',
    loss:'あなたは自分のペースを大切にする中で、周囲との連携が薄くなり、気づいたら孤立することがある' },

  { id:'mll_p', name:'実験者', ns:'mid', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'仮説を立てて試し、黙々と検証する',
    loss:'あなたは試しながら進める中で、結果の振り返りが後回しになり、気づいたら経験が活かしきれないことがある' },

  { id:'mll_f', name:'自由人', ns:'mid', ha:'low', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'何にも縛られず、風のように生きる',
    loss:'あなたはその場の流れで動く中で、続ける意識が薄れやすく、気づいたら途中で終わることが増えることがある' },

  // ──────────────────────────── NS中・HA中 ────────────────────────────────

  { id:'mmh_p', name:'調停者', ns:'mid', ha:'mid', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'対立を和らげ、全員が前に進める道を作る',
    loss:'あなたは周囲のバランスを取ろうとする中で、自分の優先順位が後回しになり、気づいたら無理を重ねてしまうことがある' },

  { id:'mmh_f', name:'楽天家', ns:'mid', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'なんとかなるさ、と笑いながら前へ進む',
    loss:'あなたは前向きに受け止める中で、問題の深さに気づくのが遅れ、気づいたら対応が後手に回ることがある' },

  { id:'mmm_p', name:'思索家', ns:'mid', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'じっくり考え、自分なりの答えを積み上げる',
    loss:'あなたはじっくり考える中で、納得できるまで動けなくなり、気づいたら行動のタイミングを逃すことがある' },

  { id:'mmm_f', name:'現実主義者', ns:'mid', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'できることとできないことを、冷静に見極める',
    loss:'あなたは現実的に判断する中で、リスクを避ける選択が増え、気づいたら挑戦の幅が狭くなることがある' },

  { id:'mml_p', name:'分析家', ns:'mid', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'データと論理で、隠れた真実を掘り起こす',
    loss:'あなたは論理的に整理する中で、判断材料を集めすぎてしまい、気づいたら動き出しが遅くなることがある' },

  { id:'mml_f', name:'傍観者', ns:'mid', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'距離を保ちながら、全体を見渡す',
    loss:'あなたは状況を見守る中で、関与のタイミングを逃し、気づいたら距離ができることがある' },

  // ──────────────────────────── NS中・HA高 ────────────────────────────────

  { id:'mhh_p', name:'守護者', ns:'mid', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'大切な人を守るために、粘り強く動き続ける',
    loss:'あなたは責任感を持つ中で、抱え込みすぎてしまい、気づいたら余裕がなくなることがある' },

  { id:'mhh_f', name:'共感者', ns:'mid', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'人の痛みを自分のものとして受け止める',
    loss:'あなたは相手に寄り添う中で、自分の気持ちを後回しにしてしまい、気づいたら疲れることがある' },

  { id:'mhm_p', name:'献身家', ns:'mid', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'誰かのために尽くすことに、生きがいを感じる',
    loss:'あなたは人のために動く中で、自分の優先度を下げてしまい、気づいたら負担が偏ることがある' },

  { id:'mhm_f', name:'迷い人', ns:'mid', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'どこへ向かえばいいか、いつも迷い続ける',
    loss:'あなたは周囲を気にする中で、決断が揺れやすくなり、気づいたら進みが遅くなることがある' },

  { id:'mhl_p', name:'審判者', ns:'mid', ha:'high', rd:'low', p:'high', sd_rep:'mid', co_rep:'low',
    catchphrase:'正しさと公平さを、厳格に守り続ける',
    loss:'あなたは正しさを大切にする中で、評価の目が厳しくなりやすく、気づいたら周囲との距離が生まれることがある' },

  { id:'mhl_f', name:'孤高の人', ns:'mid', ha:'high', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'群れず、自分の価値観だけを信じて生きる',
    loss:'あなたは自立を大切にする中で、助けを求めにくくなり、気づいたら一人で抱えることがある' },

  // ──────────────────────────── NS低・HA高 ────────────────────────────────

  { id:'lhh_p', name:'相談役', ns:'low', ha:'high', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'安心を与えながら、人の悩みに寄り添う',
    loss:'あなたは人の話を聞く中で、自分の意見を控えがちになり、気づいたら影に回ることがある' },

  { id:'lhh_f', name:'伴走者', ns:'low', ha:'high', rd:'high', p:'low', sd_rep:'low', co_rep:'high',
    catchphrase:'心配しながらも、友人のそばにいようとする',
    loss:'あなたは寄り添う中で、相手に合わせすぎてしまい、気づいたら自分を見失うことがある' },

  { id:'lhm_p', name:'支援者', ns:'low', ha:'high', rd:'mid', p:'high', sd_rep:'mid', co_rep:'mid',
    catchphrase:'安全に、着実に、人を後ろから支える',
    loss:'あなたは支えることを優先する中で、自分の成長機会を後回しにしてしまうことがある' },

  { id:'lhm_f', name:'同行者', ns:'low', ha:'high', rd:'mid', p:'low', sd_rep:'low', co_rep:'mid',
    catchphrase:'不安を抱えながらも、誰かと一緒に歩く',
    loss:'あなたは一緒に進む中で、主体的な判断が弱まり、気づいたら流されることがある' },

  { id:'lhl_p', name:'研究者', ns:'low', ha:'high', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'一つのテーマを、徹底的に掘り下げる',
    loss:'あなたは丁寧に調べる中で、準備に時間をかけすぎてしまい、気づいたら実践の機会を逃すことがある' },

  { id:'lhl_f', name:'慎想家', ns:'low', ha:'high', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'心配と疑念を抱えたまま、動けずにいる',
    loss:'あなたは深く考える中で、不安が先立ち、気づいたら行動に踏み出しにくいことがある' },

  // ──────────────────────────── NS低・HA中 ────────────────────────────────

  { id:'lmh_p', name:'縁の下の力持ち', ns:'low', ha:'mid', rd:'high', p:'high', sd_rep:'mid', co_rep:'high',
    catchphrase:'目立たずとも、確実に人を支え続ける',
    loss:'あなたは裏から支える中で、自分の貢献を表に出す機会が少なく、気づいたら評価につながりにくいことがある' },

  { id:'lmh_f', name:'聞き上手', ns:'low', ha:'mid', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'話を聞くことで、人の心を楽にする',
    loss:'あなたは相手を受け止める中で、自分の話を控えすぎてしまい、気づいたら伝わりにくいことがある' },

  { id:'lmm_p', name:'堅実家', ns:'low', ha:'mid', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'地道に、着実に、揺るがず積み上げる',
    loss:'あなたは安定を大切にする中で、新しい一歩を慎重に考えすぎてしまい、気づいたら変化の機会を逃すことがある' },

  { id:'lmm_f', name:'穏やかな協力者', ns:'low', ha:'mid', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'波風を立てず、穏やかに人と関わる',
    loss:'あなたは周囲との調和を優先する中で、自分の意見を控えがちになり、気づいたら存在感が薄くなることがある' },

  { id:'lml_p', name:'職人', ns:'low', ha:'mid', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'一つのことを極めることに、誇りを持つ',
    loss:'あなたは納得のいく質を追求する中で、仕上げに時間をかけすぎてしまい、気づいたら機会を逃すことがある' },

  { id:'lml_f', name:'観測者', ns:'low', ha:'mid', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'静かに観察し、距離を保ちながら見守る',
    loss:'あなたは状況を丁寧に見極める中で、関わるタイミングを逃してしまい、気づいたら距離ができることがある' },

  // ──────────────────────────── NS低・HA低 ────────────────────────────────

  { id:'llh_p', name:'実直家', ns:'low', ha:'low', rd:'high', p:'high', sd_rep:'high', co_rep:'high',
    catchphrase:'誠実さと粘り強さで、人の信頼を積み上げる',
    loss:'あなたは誠実に取り組む中で、柔軟な対応が難しくなり、気づいたら選択肢が狭まることがある' },

  { id:'llh_f', name:'親友型', ns:'low', ha:'low', rd:'high', p:'low', sd_rep:'mid', co_rep:'high',
    catchphrase:'そばにいることで、人に安心感を与える',
    loss:'あなたは信頼関係を大切にする中で、相手に合わせすぎてしまい、気づいたら負担が増えることがある' },

  { id:'llm_p', name:'誠実者', ns:'low', ha:'low', rd:'mid', p:'high', sd_rep:'high', co_rep:'mid',
    catchphrase:'黙々と、誠実に、自分の仕事を果たす',
    loss:'あなたは責任を持つ中で、断ることが難しくなり、気づいたら抱え込みやすくなることがある' },

  { id:'llm_f', name:'温情家', ns:'low', ha:'low', rd:'mid', p:'low', sd_rep:'mid', co_rep:'mid',
    catchphrase:'温かさで、人をそっと包み込む',
    loss:'あなたは優しさを優先する中で、自分の基準が曖昧になり、気づいたら流されることがある' },

  { id:'lll_p', name:'哲学者', ns:'low', ha:'low', rd:'low', p:'high', sd_rep:'high', co_rep:'low',
    catchphrase:'静かに内側を掘り下げ、自分の真理を求める',
    loss:'あなたは深く考え続ける中で、答えを出すタイミングが遅れやすく、気づいたら行動の機会を見送ることがある' },

  { id:'lll_f', name:'隠者', ns:'low', ha:'low', rd:'low', p:'low', sd_rep:'mid', co_rep:'low',
    catchphrase:'何にも縛られず、静かに自分の世界に生きる',
    loss:'あなたは静かに過ごす中で、外との関わりが減り、気づいたらチャンスが遠のくことがある' },
];
