import { Question } from './types';

const rawQuestionsV4: Question[] = [
  // NS (好奇心) - 8問
  { id: 101, text: '初めて行く店やイベントには、とりあえず飛び込んでみたくなる', factor: 'NS', reversed: false },
  { id: 102, text: '思いついたことを、深く考える前に行動へ移すことが多い', factor: 'NS', reversed: false },
  { id: 103, text: '決められた手順どおりに進める作業のほうが落ち着く', factor: 'NS', reversed: true },
  { id: 104, text: '退屈な状態が続くと、何か刺激的なことをしたくてたまらなくなる', factor: 'NS', reversed: false },
  { id: 105, text: '買い物で迷ったときは、いったん保留にして持ち帰るほうだ', factor: 'NS', reversed: true },
  { id: 106, text: '細かいルールが多い場所にいると、窮屈で反発したくなる', factor: 'NS', reversed: false },
  { id: 107, text: '予定は事前にきっちり決めておかないと気が済まない', factor: 'NS', reversed: true },
  { id: 108, text: '怒りや興奮を、その場で表に出してしまうほうだ', factor: 'NS', reversed: false },

  // HA (慎重さ) - 8問
  { id: 109, text: '初対面の人ばかりの場では、緊張して疲れてしまう', factor: 'HA', reversed: false },
  { id: 110, text: 'まだ起きていない失敗を、何度も頭の中で想像してしまう', factor: 'HA', reversed: false },
  { id: 111, text: '先の見通しが立たない状況でも「なんとかなる」と思える', factor: 'HA', reversed: true },
  { id: 112, text: '一日動き回ると、周りの人より早く疲れてしまう', factor: 'HA', reversed: false },
  { id: 113, text: '少し危なそうなことでも、あまり怖がらずに挑戦できる', factor: 'HA', reversed: true },
  { id: 114, text: '人前で話す予定があると、何日も前から気が重くなる', factor: 'HA', reversed: false },
  { id: 115, text: '知らない場所へ一人で行くのは、むしろ楽しい', factor: 'HA', reversed: true },
  { id: 116, text: 'よくない知らせを聞くと、しばらく引きずってしまう', factor: 'HA', reversed: false },

  // RD (共感力) - 8問
  { id: 117, text: '人の悲しい話を聞くと、自分まで泣きそうになる', factor: 'RD', reversed: false },
  { id: 118, text: '誰かに褒められると、その後もずっと頑張れる', factor: 'RD', reversed: false },
  { id: 119, text: '一人でいるほうが気楽で、人恋しくならない', factor: 'RD', reversed: true },
  { id: 120, text: '親しい人と離れると、強い寂しさを感じる', factor: 'RD', reversed: false },
  { id: 121, text: '相手の表情や声の小さな変化に気づきやすい', factor: 'RD', reversed: false },
  { id: 122, text: '感情的な話をされても、距離を取って冷静に聞ける', factor: 'RD', reversed: true },
  { id: 123, text: '困っている人がいると、放っておけない', factor: 'RD', reversed: false },
  { id: 124, text: '他人に自分がどう思われているかは、あまり気にならない', factor: 'RD', reversed: true },

  // P (粘り強さ) - 8問
  { id: 125, text: 'うまくいかないことでも、粘り強く続けるほうだ', factor: 'P', reversed: false },
  { id: 126, text: '疲れていても、決めた分量は最後までやり切る', factor: 'P', reversed: false },
  { id: 127, text: '成果が見えない努力は、途中でやめてしまう', factor: 'P', reversed: true },
  { id: 128, text: '「もう十分」と言われても、さらに良くしようとしてしまう', factor: 'P', reversed: false },
  { id: 129, text: '一度失敗すると、その後やる気が続かなくなる', factor: 'P', reversed: true },
  { id: 130, text: '目標のためなら、地味な作業の繰り返しも苦にならない', factor: 'P', reversed: false },
  { id: 131, text: '熱中しても、飽きるのが早いほうだ', factor: 'P', reversed: true },
  { id: 132, text: '忙しいときほど力を発揮できる', factor: 'P', reversed: false },

  // SD (自律性) - 6問
  { id: 133, text: '自分が何をしたいのか、はっきり分かっている', factor: 'SD', reversed: false },
  { id: 134, text: '物事がうまくいかないと、自分は無力だと感じる', factor: 'SD', reversed: true },
  { id: 135, text: '決めたことの結果は、人のせいにせず自分で引き受ける', factor: 'SD', reversed: false },
  { id: 136, text: '今の自分の性格を、おおむね受け入れられている', factor: 'SD', reversed: false },
  { id: 137, text: '何かを選ぶとき、周りの意見に流されやすい', factor: 'SD', reversed: true },
  { id: 138, text: '目標に向けて、自分で計画を立てて進められる', factor: 'SD', reversed: false },

  // CO (協調性) - 6問
  { id: 139, text: '意見が合わない相手でも、その立場を想像しようとする', factor: 'CO', reversed: false },
  { id: 140, text: 'たいていの人は、隙があれば自分を利用しようとしていると思う', factor: 'CO', reversed: true },
  { id: 141, text: '自分が少し損をしても、相手を助けたいと思うことがある', factor: 'CO', reversed: false },
  { id: 142, text: '相手の失敗は、なかなか許す気になれない', factor: 'CO', reversed: true },
  { id: 143, text: '集団の中では、全体がうまく回るように動くほうだ', factor: 'CO', reversed: false },
  { id: 144, text: '他人の問題に関わるのは、面倒なので避けたい', factor: 'CO', reversed: true },

  // ST (没頭力) - 6問
  { id: 145, text: '自然や音楽に触れて、我を忘れるほど感動することがある', factor: 'ST', reversed: false },
  { id: 146, text: '説明のつかない偶然にも、何か意味があるように感じる', factor: 'ST', reversed: false },
  { id: 147, text: '目に見えないものは信じない', factor: 'ST', reversed: true },
  { id: 148, text: '何かに没頭すると、時間の感覚がなくなる', factor: 'ST', reversed: false },
  { id: 149, text: '自分は、何か大きな流れの一部だと感じることがある', factor: 'ST', reversed: false },
  { id: 150, text: '現実的に証明できることだけを重視する', factor: 'ST', reversed: true },
];

export function getV4Questions(): Question[] {
  const factors = ['NS', 'HA', 'RD', 'P', 'SD', 'CO', 'ST'];
  const byFactor: Record<string, Question[]> = {};
  for (const f of factors) byFactor[f] = rawQuestionsV4.filter((q) => q.factor === f);
  const maxLen = Math.max(...factors.map((f) => byFactor[f].length));
  const result: Question[] = [];
  for (let i = 0; i < maxLen; i++) {
    for (const f of factors) {
      if (byFactor[f][i]) result.push(byFactor[f][i]);
    }
  }
  return result;
}

export default rawQuestionsV4;
