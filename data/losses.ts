export type LossText = {
  typeId: string;
  stLevel: 'high' | 'mid' | 'low';
  text: string;
};

export const lossTexts: LossText[] = [

  // ────────────── 指揮官 hlh_p ──────────────
  { typeId: 'hlh_p', stLevel: 'high',
    text: '使命感で自分を追い込み、燃え尽きて突然止まり周囲を混乱させる' },
  { typeId: 'hlh_p', stLevel: 'mid',
    text: '承認欲求を隠したまま無理し続け、燃え尽きて突然消える' },
  { typeId: 'hlh_p', stLevel: 'low',
    text: '結果だけを追い続け、人間関係を消耗品として扱い孤立する' },

  // ────────────── 革命家 hlh_f ──────────────
  { typeId: 'hlh_f', stLevel: 'high',
    text: '理想に酔うほど急速に冷め、期待した人を置き去りにする' },
  { typeId: 'hlh_f', stLevel: 'mid',
    text: '情熱が唐突に消え、大切な人から「また離れた」と思われ続ける' },
  { typeId: 'hlh_f', stLevel: 'low',
    text: '飽きたらすぐ切り捨てる姿が冷たく見え、重要な人脈を失う' },

  // ────────────── 開拓者 hlm_p ──────────────
  { typeId: 'hlm_p', stLevel: 'high',
    text: '崇高な使命感が孤立を正当化し、「理解者がいない」と嘆き続ける' },
  { typeId: 'hlm_p', stLevel: 'mid',
    text: '信念へのこだわりが協調を妨げ、重要な場面で孤立する' },
  { typeId: 'hlm_p', stLevel: 'low',
    text: '正しさを押しつけ、協調できない人という評価が固定される' },

  // ────────────── 探検家 hlm_f ──────────────
  { typeId: 'hlm_f', stLevel: 'high',
    text: '「意味がない」と感じた瞬間に全て手放し、信頼が一度に崩れる' },
  { typeId: 'hlm_f', stLevel: 'mid',
    text: '飽きてリセットする癖が無責任に映り、信頼が積み上がらない' },
  { typeId: 'hlm_f', stLevel: 'low',
    text: '楽しさだけで動き責任を避けるため、重要な仕事を任されなくなる' },

  // ────────────── 戦略家 hll_p ──────────────
  { typeId: 'hll_p', stLevel: 'high',
    text: '大局観に酔って細部を軽視し、重要な人間関係を失いながら孤立する' },
  { typeId: 'hll_p', stLevel: 'mid',
    text: '孤立した場所で損な役回りを引き受け続け、消耗して行き詰まる' },
  { typeId: 'hll_p', stLevel: 'low',
    text: '自分の利益だけを計算する姿が見透かされ、協力者がいなくなる' },

  // ────────────── 反骨者 hll_f ──────────────
  { typeId: 'hll_f', stLevel: 'high',
    text: '「体制への抵抗」を大義にして逃げ続け、現実的成果がゼロのまま終わる' },
  { typeId: 'hll_f', stLevel: 'mid',
    text: '自由を守るために逃げ続け、「信頼できない人」という評価が積み重なる' },
  { typeId: 'hll_f', stLevel: 'low',
    text: '不都合になると即座に切り捨て、誰からも本気で向き合われなくなる' },

  // ────────────── 提唱者 hmh_p ──────────────
  { typeId: 'hmh_p', stLevel: 'high',
    text: '理想のビジョンを語るほど自分を追い込み、突然消えて人を裏切る' },
  { typeId: 'hmh_p', stLevel: 'mid',
    text: '承認欲求から無理をし続け、燃え尽きて突然姿を消し周囲を困惑させる' },
  { typeId: 'hmh_p', stLevel: 'low',
    text: '評価されないと冷めた態度になり、期待していた人に失望を与える' },

  // ────────────── 表現者 hmh_f ──────────────
  { typeId: 'hmh_f', stLevel: 'high',
    text: '感動で動き始めるが感動が消えた瞬間に止まり、人を裏切る形になる' },
  { typeId: 'hmh_f', stLevel: 'mid',
    text: '期待させておいて急に冷める言動が繰り返され、大切な人の信頼を失う' },
  { typeId: 'hmh_f', stLevel: 'low',
    text: '飽きると即切り替えるため「都合よく使われた」と思われ関係が壊れる' },

  // ────────────── 批評家 hmm_p ──────────────
  { typeId: 'hmm_p', stLevel: 'high',
    text: '高い理想の正しさを押しつけ、「一緒にいると疲れる」と敬遠される' },
  { typeId: 'hmm_p', stLevel: 'mid',
    text: '正論で人を追い詰め、「正しいが付き合いにくい人」と距離を置かれる' },
  { typeId: 'hmm_p', stLevel: 'low',
    text: '批判だけして動かない姿が「言うだけの人」として定着し軽視される' },

  // ────────────── 懐疑者 hmm_f ──────────────
  { typeId: 'hmm_f', stLevel: 'high',
    text: '「本当の意味」を追い求めて動けず、重要な決断を先送りし続ける' },
  { typeId: 'hmm_f', stLevel: 'mid',
    text: '懐疑が行動を止め、「批判はするが何もしない人」という評価が固定される' },
  { typeId: 'hmm_f', stLevel: 'low',
    text: 'リスクを過剰に計算して動けず、チャンスを全部見送って停滞する' },

  // ────────────── 起業家 hml_p ──────────────
  { typeId: 'hml_p', stLevel: 'high',
    text: '「使命」と信じるやり方を絶対視し、チームを壊しながら孤立する' },
  { typeId: 'hml_p', stLevel: 'mid',
    text: '自分のやり方を曲げないこだわりが「チームで働けない人」という評価になる' },
  { typeId: 'hml_p', stLevel: 'low',
    text: '結果のためなら何でもする姿勢が信頼を損ない、協力者がいなくなる' },

  // ────────────── 挑戦者 hml_f ──────────────
  { typeId: 'hml_f', stLevel: 'high',
    text: '新しい意味を求めて次々移り、「芯がない人」という評価が定着する' },
  { typeId: 'hml_f', stLevel: 'mid',
    text: '次々と乗り換える姿が「浮気性」と映り、重要な機会での信頼を失う' },
  { typeId: 'hml_f', stLevel: 'low',
    text: '得になると判断した瞬間に切り替え、「利用する人」として警戒される' },

  // ────────────── 完璧主義者 hhh_p ──────────────
  { typeId: 'hhh_p', stLevel: 'high',
    text: '崇高な理想を盾に他者の欠点を指摘し続け、大切な人を傷つけて失う' },
  { typeId: 'hhh_p', stLevel: 'mid',
    text: '自分を守るあまり他者を傷つけ、完璧主義の頑固さが大切な関係を壊す' },
  { typeId: 'hhh_p', stLevel: 'low',
    text: '効率と正確さを求めるあまり感情を切り捨て、人が離れていく' },

  // ────────────── 庇護者 hhh_f ──────────────
  { typeId: 'hhh_f', stLevel: 'high',
    text: '人の苦しみを我が事として抱え込みすぎ、突然消えて信頼を裏切る' },
  { typeId: 'hhh_f', stLevel: 'mid',
    text: '人の感情を引き受けすぎて消耗し、突然距離を置いて信頼を失う' },
  { typeId: 'hhh_f', stLevel: 'low',
    text: '表面的に人の話を聞くだけで本当に必要な関与を避け、信頼されない' },

  // ────────────── 良心家 hhm_p ──────────────
  { typeId: 'hhm_p', stLevel: 'high',
    text: '道徳的正しさへの強いこだわりが批判に変わり、孤立していく' },
  { typeId: 'hhm_p', stLevel: 'mid',
    text: '正しさへのこだわりが人を追い詰め、「正論の人」と距離を置かれる' },
  { typeId: 'hhm_p', stLevel: 'low',
    text: 'ルール通りにしか動けない融通のなさが「頭が固い」と敬遠される' },

  // ────────────── 葛藤者 hhm_f ──────────────
  { typeId: 'hhm_f', stLevel: 'high',
    text: '理想と現実の間で揺れ続け、人生の大切な選択肢を全て逃す' },
  { typeId: 'hhm_f', stLevel: 'mid',
    text: '葛藤したまま動けず、大切なチャンスを繰り返し手放して後悔が積む' },
  { typeId: 'hhm_f', stLevel: 'low',
    text: '不安から逃げるため先送りを続け、気づけば選択肢がなくなっている' },

  // ────────────── 闘士 hhl_p ──────────────
  { typeId: 'hhl_p', stLevel: 'high',
    text: '正義感が激情に変わり、大事な場面で感情的になって信頼を壊す' },
  { typeId: 'hhl_p', stLevel: 'mid',
    text: '感情の振れ幅が大きく、大事な場面での言動で信頼を失いやすい' },
  { typeId: 'hhl_p', stLevel: 'low',
    text: '感情を抑圧した反動が爆発し、最悪の場面で関係を取り返しなく破壊する' },

  // ────────────── 反抗者 hhl_f ──────────────
  { typeId: 'hhl_f', stLevel: 'high',
    text: '不満を「体制への抵抗」として爆発させ、重要な関係を一瞬で壊す' },
  { typeId: 'hhl_f', stLevel: 'mid',
    text: '感情の振れ幅が大きく、重要な場面での感情的言動で信頼を一瞬で失う' },
  { typeId: 'hhl_f', stLevel: 'low',
    text: '感情抑制の仮面が突然剥がれ、誰も予測できない形で関係が壊れる' },

  // ────────────── 外交官 mlh_p ──────────────
  { typeId: 'mlh_p', stLevel: 'high',
    text: '「人をつなぐ使命」を抱えるほど本音を隠し続け、燃え尽きて消える' },
  { typeId: 'mlh_p', stLevel: 'mid',
    text: '承認欲求から本音を言えず、ある日突然燃え尽きて周囲を置いていく' },
  { typeId: 'mlh_p', stLevel: 'low',
    text: '関係維持のために本音を殺し続け、気づいたとき感情が枯渇している' },

  // ────────────── 冒険者 mlh_f ──────────────
  { typeId: 'mlh_f', stLevel: 'high',
    text: '感動が薄れると意味を見失い、大切な人との関係をあっさり手放す' },
  { typeId: 'mlh_f', stLevel: 'mid',
    text: '期待させておいて急に冷め、大切な人から「また離れた」と思われ続ける' },
  { typeId: 'mlh_f', stLevel: 'low',
    text: '楽しさが続く間だけ関与し、困難になると消える「晴れの人」と見られる' },

  // ────────────── 記録者 mlm_p ──────────────
  { typeId: 'mlm_p', stLevel: 'high',
    text: '内面の豊かさを表に出せず、深みが伝わらないまま評価の圏外に置かれる' },
  { typeId: 'mlm_p', stLevel: 'mid',
    text: '着実さが「存在感のなさ」と映り、重要な場面で選ばれないまま機会を逃す' },
  { typeId: 'mlm_p', stLevel: 'low',
    text: '目立つことを意図的に避けるため、実力があっても上に行けない' },

  // ────────────── 独歩者 mlm_f ──────────────
  { typeId: 'mlm_f', stLevel: 'high',
    text: '「自分だけの道」への執着が協調を拒み、重要な機会から外され続ける' },
  { typeId: 'mlm_f', stLevel: 'mid',
    text: '気ままさが「計画性がない人」と映り、重要な役割を任せてもらえなくなる' },
  { typeId: 'mlm_f', stLevel: 'low',
    text: '面倒を避けるため最低限しか動かず、いつも蚊帳の外に置かれる' },

  // ────────────── 実験者 mll_p ──────────────
  { typeId: 'mll_p', stLevel: 'high',
    text: '自分の仮説への強いこだわりが現実の修正を拒み、孤立した研究者で終わる' },
  { typeId: 'mll_p', stLevel: 'mid',
    text: '自分のやり方を曲げないこだわりが「孤立した人」という評価を固定させる' },
  { typeId: 'mll_p', stLevel: 'low',
    text: '人との摩擦を徹底的に避けるため、誰とも関われない人になっていく' },

  // ────────────── 自由人 mll_f ──────────────
  { typeId: 'mll_f', stLevel: 'high',
    text: '「縛られないこと」を理念にして責任を回避し、信頼できない人と見なされる' },
  { typeId: 'mll_f', stLevel: 'mid',
    text: 'フットワークの軽さが「無責任」と映り、重要な機会をそっと外される' },
  { typeId: 'mll_f', stLevel: 'low',
    text: '都合が悪くなると軽やかに去り、「信頼できない人」という烙印が押される' },

  // ────────────── 調停者 mmh_p ──────────────
  { typeId: 'mmh_p', stLevel: 'high',
    text: '全員の調和を守ろうとして誰にも「No」と言えず、静かに消耗する' },
  { typeId: 'mmh_p', stLevel: 'mid',
    text: '人の期待に応えようとして断れず消耗し、誰のためにもなれなくなる' },
  { typeId: 'mmh_p', stLevel: 'low',
    text: '波風を立てないことだけを優先し、本当に必要な意見を言えないまま終わる' },

  // ────────────── 楽天家 mmh_f ──────────────
  { typeId: 'mmh_f', stLevel: 'high',
    text: '「なんとかなる」という感覚を信じ込み、準備不足で大切な機会を飛ばす' },
  { typeId: 'mmh_f', stLevel: 'mid',
    text: '期待させておいて急に熱量がゼロになり、大切な関係や仕事を損ねる' },
  { typeId: 'mmh_f', stLevel: 'low',
    text: '楽観が根拠のない思い込みに変わり、現実的なリスクを無視して失敗する' },

  // ────────────── 思索家 mmm_p ──────────────
  { typeId: 'mmm_p', stLevel: 'high',
    text: '内面の深さを行動に変えられず、「考えているだけの人」として扱われる' },
  { typeId: 'mmm_p', stLevel: 'mid',
    text: '「いい人」で止まることで重要な場面で選ばれず、後回しにされ続ける' },
  { typeId: 'mmm_p', stLevel: 'low',
    text: '冒険より安全を選ぶ保守的な姿勢が、成長の機会を次々と消していく' },

  // ────────────── 現実主義者 mmm_f ──────────────
  { typeId: 'mmm_f', stLevel: 'high',
    text: '「現実的であること」に徹するあまり感情と理想を軽視し、人に響かない' },
  { typeId: 'mmm_f', stLevel: 'mid',
    text: '何にでも対応できる反面「あなたでなければ」という場面が少なく代替される' },
  { typeId: 'mmm_f', stLevel: 'low',
    text: '効率と現実だけを優先し、「機械的な人」として人間関係が薄くなる' },

  // ────────────── 分析家 mml_p ──────────────
  { typeId: 'mml_p', stLevel: 'high',
    text: '真実の追求にこだわりすぎてチームの空気を壊し、孤立した専門家になる' },
  { typeId: 'mml_p', stLevel: 'mid',
    text: 'やり方へのこだわりがチームを遠ざけ、重要なポジションから外される' },
  { typeId: 'mml_p', stLevel: 'low',
    text: '感情を排した分析が「冷たい人」と見られ、信頼されないまま終わる' },

  // ────────────── 傍観者 mml_f ──────────────
  { typeId: 'mml_f', stLevel: 'high',
    text: '「全体を見る」という名目で関与を避け、気づいたら蚊帳の外にいる' },
  { typeId: 'mml_f', stLevel: 'mid',
    text: '距離を保つ姿が「関わる気がない人」と見なされ、重要な場から外される' },
  { typeId: 'mml_f', stLevel: 'low',
    text: '不必要なリスクを一切取らないため、何も生み出さないまま時間が過ぎる' },

  // ────────────── 守護者 mhh_p ──────────────
  { typeId: 'mhh_p', stLevel: 'high',
    text: '「守るべきもの」への強い意識がリスク回避を正当化し、成長が止まる' },
  { typeId: 'mhh_p', stLevel: 'mid',
    text: 'リスクを避けすぎてチャンスを見送り、慎重さが「決断できない人」になる' },
  { typeId: 'mhh_p', stLevel: 'low',
    text: '安全を最優先にして挑戦を避け、「変化に対応できない人」と見られる' },

  // ────────────── 共感者 mhh_f ──────────────
  { typeId: 'mhh_f', stLevel: 'high',
    text: '人の感情世界に深く入り込みすぎ、限界で突然消えて「裏切り者」になる' },
  { typeId: 'mhh_f', stLevel: 'mid',
    text: '感情を引き受けすぎて突然距離を置き、「結局離れた」と思われる' },
  { typeId: 'mhh_f', stLevel: 'low',
    text: '表面的な共感だけで深く関わることを避け、「薄い人」と見なされる' },

  // ────────────── 献身家 mhm_p ──────────────
  { typeId: 'mhm_p', stLevel: 'high',
    text: '「傷つけたくない」という思いが判断を縛り、大切なタイミングを逃し続ける' },
  { typeId: 'mhm_p', stLevel: 'mid',
    text: 'リスクの考えすぎでチャンスを逃し、「決断できない人」という印象が積む' },
  { typeId: 'mhm_p', stLevel: 'low',
    text: '自分を守るために行動を最小化し、貢献できる場面を自分から減らしていく' },

  // ────────────── 迷い人 mhm_f ──────────────
  { typeId: 'mhm_f', stLevel: 'high',
    text: '深い意味を求めるほど選択が複雑化し、どこにも踏み出せなくなる' },
  { typeId: 'mhm_f', stLevel: 'mid',
    text: '不安が大きすぎて動き出せず、チャンスを逃す繰り返しが自己嫌悪になる' },
  { typeId: 'mhm_f', stLevel: 'low',
    text: '不安を感じないようにするため感情を麻痺させ、人生の感覚が薄くなる' },

  // ────────────── 審判者 mhl_p ──────────────
  { typeId: 'mhl_p', stLevel: 'high',
    text: '道義の正しさを追求するほど「疲れる人」と距離を置かれ孤立する' },
  { typeId: 'mhl_p', stLevel: 'mid',
    text: '正論で人を追い詰め、「正しいが一緒にいると疲れる」と孤立する' },
  { typeId: 'mhl_p', stLevel: 'low',
    text: 'ルールと効率を押しつける態度が「冷たい人」と見られ、周囲が去る' },

  // ────────────── 孤高の人 mhl_f ──────────────
  { typeId: 'mhl_f', stLevel: 'high',
    text: '「孤独な高み」を誇るほど現実の助けを求められず、本当の危機に詰む' },
  { typeId: 'mhl_f', stLevel: 'mid',
    text: '人を頼れないまま孤立し、本当に困ったとき誰にも頼めず限界を迎える' },
  { typeId: 'mhl_f', stLevel: 'low',
    text: '自分だけで完結しようとする執着が、必要な助けを永遠に遠ざける' },

  // ────────────── 相談役 lhh_p ──────────────
  { typeId: 'lhh_p', stLevel: 'high',
    text: '「人を傷つけたくない」という思いがリスクを極大化し、動けないまま後悔する' },
  { typeId: 'lhh_p', stLevel: 'mid',
    text: 'リスクを避けすぎてチャンスをそのまま見送り、後悔だけが積み重なっていく' },
  { typeId: 'lhh_p', stLevel: 'low',
    text: '安全な選択しかできない保守的さが、人生の転機を全部つぶしていく' },

  // ────────────── 伴走者 lhh_f ──────────────
  { typeId: 'lhh_f', stLevel: 'high',
    text: '相手の苦しみを深く感じるほど自分も動けなくなり、側にいるだけになる' },
  { typeId: 'lhh_f', stLevel: 'mid',
    text: '心配しすぎて動けず、「頼りにならない人」という評価が積み重なる' },
  { typeId: 'lhh_f', stLevel: 'low',
    text: '心配より現実的行動を重視しすぎ、肝心なときに情が薄く見える' },

  // ────────────── 支援者 lhm_p ──────────────
  { typeId: 'lhm_p', stLevel: 'high',
    text: '「安心できる場を守りたい」という思いが変化を拒否し、成長が止まる' },
  { typeId: 'lhm_p', stLevel: 'mid',
    text: 'リスクを避けすぎてチャンスを見送り、安全を求めるあまり何も変わらない' },
  { typeId: 'lhm_p', stLevel: 'low',
    text: '変化への恐れを「現実的判断」と合理化し、必要な一歩を踏み出せない' },

  // ────────────── 同行者 lhm_f ──────────────
  { typeId: 'lhm_f', stLevel: 'high',
    text: '誰かとつながっていないと不安で行動できず、一人で選択することができない' },
  { typeId: 'lhm_f', stLevel: 'mid',
    text: '不安が大きすぎて動き出せず、チャンスを逃す繰り返しが自己嫌悪になる' },
  { typeId: 'lhm_f', stLevel: 'low',
    text: '不安を感じないよう感情を鈍らせ、気づいたとき何も残っていない' },

  // ────────────── 研究者 lhl_p ──────────────
  { typeId: 'lhl_p', stLevel: 'high',
    text: '真理を追求する姿勢が批判的態度に変わり、周囲が近づけなくなる' },
  { typeId: 'lhl_p', stLevel: 'mid',
    text: '正論で人を追い詰め、「あなたは正しいが疲れる」と言われ孤立していく' },
  { typeId: 'lhl_p', stLevel: 'low',
    text: '効率と正確さだけを重視し、感情的なつながりを軽視して孤立する' },

  // ────────────── 慎想家 lhl_f ──────────────
  { typeId: 'lhl_f', stLevel: 'high',
    text: '深く考えるほど世界の複雑さに圧倒され、一歩も踏み出せなくなる' },
  { typeId: 'lhl_f', stLevel: 'mid',
    text: '心配が行動を止め続け、「結局何もしない人」という評価が積み重なる' },
  { typeId: 'lhl_f', stLevel: 'low',
    text: 'リスクの回避だけを考えて動かず、機会を全て見送って後悔する' },

  // ────────────── 縁の下の力持ち lmh_p ──────────────
  { typeId: 'lmh_p', stLevel: 'high',
    text: '「支えることが使命」という信念が断ることを罪悪に感じさせ、消耗する' },
  { typeId: 'lmh_p', stLevel: 'mid',
    text: '断れずに損な役回りを引き受け続け、静かに消耗していく' },
  { typeId: 'lmh_p', stLevel: 'low',
    text: '期待に応えることが習慣化し、断る選択肢があることすら忘れて消耗する' },

  // ────────────── 聞き上手 lmh_f ──────────────
  { typeId: 'lmh_f', stLevel: 'high',
    text: '人の話を深く受け止めるほど重荷になり、突然聞けなくなって失望される' },
  { typeId: 'lmh_f', stLevel: 'mid',
    text: '頼りにされている分、続けられなくなったときの失望が大きく信頼を失う' },
  { typeId: 'lmh_f', stLevel: 'low',
    text: '聞くことを義務として続け、感情なく処理する姿が「冷たい」と気づかれる' },

  // ────────────── 堅実家 lmm_p ──────────────
  { typeId: 'lmm_p', stLevel: 'high',
    text: '「地道な積み上げ」への信念が変化への適応を妨げ、時代に取り残される' },
  { typeId: 'lmm_p', stLevel: 'mid',
    text: '堅実すぎて変化に乗り遅れ、積み上げた成果が環境変化で陳腐化する' },
  { typeId: 'lmm_p', stLevel: 'low',
    text: '確実性だけを求めて新しいことを全て拒否し、変化の波に飲まれる' },

  // ────────────── 穏やかな協力者 lmm_f ──────────────
  { typeId: 'lmm_f', stLevel: 'high',
    text: '「穏やかさを守りたい」という思いが変化への抵抗になり、気づけば孤立する' },
  { typeId: 'lmm_f', stLevel: 'mid',
    text: '変化を嫌い継続も苦手なため、現状維持のまま時代に取り残されていく' },
  { typeId: 'lmm_f', stLevel: 'low',
    text: '摩擦を避けるために全て受け流し、「意見のない人」として軽く見られる' },

  // ────────────── 職人 lml_p ──────────────
  { typeId: 'lml_p', stLevel: 'high',
    text: '「本物の仕事」へのこだわりが孤高の姿勢になり、協力を得られなくなる' },
  { typeId: 'lml_p', stLevel: 'mid',
    text: '黙々と働く姿が「協調性のなさ」と映り、チームでの評価が得にくくなる' },
  { typeId: 'lml_p', stLevel: 'low',
    text: '自分の作業範囲だけを守り、周囲との連携を怠って信頼されない' },

  // ────────────── 観測者 lml_f ──────────────
  { typeId: 'lml_f', stLevel: 'high',
    text: '「観察者でいることに意味がある」という自己定義が関与を永遠に遠ざける' },
  { typeId: 'lml_f', stLevel: 'mid',
    text: '距離を取り続けることで「関わる気がない人」と見なされ、機会を逃し続ける' },
  { typeId: 'lml_f', stLevel: 'low',
    text: 'リスクのある関与を全て避けるため、「無害だが無価値」な人になっていく' },

  // ────────────── 実直家 llh_p ──────────────
  { typeId: 'llh_p', stLevel: 'high',
    text: '「人の役に立つことに意味がある」という確信が断ることを許さず、消耗する' },
  { typeId: 'llh_p', stLevel: 'mid',
    text: '誠実に引き受け続けるほど都合よく使われ、気づいたとき消耗している' },
  { typeId: 'llh_p', stLevel: 'low',
    text: '義務感と習慣から動き続けるだけで、自分が何を望むかを失う' },

  // ────────────── 親友型 llh_f ──────────────
  { typeId: 'llh_f', stLevel: 'high',
    text: '「そばにいることが存在意義」という思いが断ることを消し、消耗する' },
  { typeId: 'llh_f', stLevel: 'mid',
    text: '断れないまま引き受け続け、気づいたときには回復できないほど消耗している' },
  { typeId: 'llh_f', stLevel: 'low',
    text: '断れないのではなく習慣的に引き受けるだけで、自分の限界に気づかない' },

  // ────────────── 誠実者 llm_p ──────────────
  { typeId: 'llm_p', stLevel: 'high',
    text: '誠実さへのこだわりが自己主張を封じ、働いても見えない存在になる' },
  { typeId: 'llm_p', stLevel: 'mid',
    text: '黙々と働く誠実さが「存在感のなさ」と映り、成果があっても見落とされる' },
  { typeId: 'llm_p', stLevel: 'low',
    text: '感情を見せない堅実さが「つかみどころがない人」と思われ、距離を置かれる' },

  // ────────────── 温情家 llm_f ──────────────
  { typeId: 'llm_f', stLevel: 'high',
    text: '「温かくあること」への執着が行動の遅さを正当化し、機会を逃し続ける' },
  { typeId: 'llm_f', stLevel: 'mid',
    text: 'マイペースが「不真面目」と映り、チャンスを与えてもらえなくなる' },
  { typeId: 'llm_f', stLevel: 'low',
    text: '感情より効率を優先する冷淡さが、温情家という評判と矛盾して信頼を失う' },

  // ────────────── 哲学者 lll_p ──────────────
  { typeId: 'lll_p', stLevel: 'high',
    text: '孤独を「哲学の源泉」として美化し、助けを求めることを一生できない' },
  { typeId: 'lll_p', stLevel: 'mid',
    text: '人を頼れないまま限界まで抱え込み、本当に困ったときに詰む' },
  { typeId: 'lll_p', stLevel: 'low',
    text: '孤独を合理的だと判断して誰も頼らず、本当の危機に誰もいないことに気づく' },

  // ────────────── 隠者 lll_f ──────────────
  { typeId: 'lll_f', stLevel: 'high',
    text: '一人でいることを神聖視し、助けを求めることは弱さだと信じて孤立する' },
  { typeId: 'lll_f', stLevel: 'mid',
    text: '人を頼れず孤立したまま限界を超え、本当に困ったとき誰も助けてくれない' },
  { typeId: 'lll_f', stLevel: 'low',
    text: '関わりを避ける合理的判断が積み重なり、気づいたとき誰一人残っていない' },

];
