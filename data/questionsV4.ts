import { Question } from './types';

const rawQuestionsV4: Question[] = [
  // NS (好奇心)
  { id: 101, text: '初めて会う人との会話は、むしろ楽しみに感じる', factor: 'NS', reversed: false },
  { id: 102, text: '知らない街や場所を、目的なくふらっと探索するのが好きだ', factor: 'NS', reversed: false },
  { id: 103, text: '慣れたやり方より、新しい方法や手順を試してみたくなる', factor: 'NS', reversed: false },
  { id: 104, text: '興味を持ったことは夜遅くても調べ続けてしまうことがある', factor: 'NS', reversed: false },
  { id: 105, text: '自分の考え方に挑戦してくる本や話し相手に出会うと面白いと感じる', factor: 'NS', reversed: false },
  { id: 106, text: '安定した状況でも、もっと面白いことがないか探してしまう', factor: 'NS', reversed: false },
  { id: 107, text: '旅では定番スポットより、その場でしか出会えない体験を探したい', factor: 'NS', reversed: false },

  // HA (慎重さ)
  { id: 108, text: '大事な決断をする前に、失敗したときのことを何度も考えてしまう', factor: 'HA', reversed: false },
  { id: 109, text: '何かを送信・提出する前に、何度も確認しないと不安になる', factor: 'HA', reversed: false },
  { id: 110, text: '締め切りが近づくと、間に合わないかもしれないという不安が頭に浮かぶ', factor: 'HA', reversed: false },
  { id: 111, text: '人前で発言するとき、失言しないか事前にかなり気になる', factor: 'HA', reversed: false },
  { id: 112, text: '何か悪いことが起きそうな予感がすると、なかなか頭から離れない', factor: 'HA', reversed: false },
  { id: 113, text: '自分がミスをしたあと、しばらくそのことを引きずってしまう', factor: 'HA', reversed: false },
  { id: 114, text: '初めての環境では、事前に十分な情報を集めてから臨む方だ', factor: 'HA', reversed: false },

  // RD (共感力)
  { id: 115, text: '誰かに感謝されると、それだけで頑張った甲斐があったと感じる', factor: 'RD', reversed: false },
  { id: 116, text: '友人が落ち込んでいると、自分も気持ちが沈むことがある', factor: 'RD', reversed: false },
  { id: 117, text: '他人が喜んでいる姿を見ると、自分もうれしくなる', factor: 'RD', reversed: false },
  { id: 118, text: 'グループの中で疎外感を持っている人がいると、気になって放っておけない', factor: 'RD', reversed: false },
  { id: 119, text: '親しい人から頼られると、無理してでも応えたくなる', factor: 'RD', reversed: false },
  { id: 120, text: '人の顔色や感情の変化に気づきやすい方だ', factor: 'RD', reversed: false },
  { id: 121, text: '困っている見知らぬ人を見ると、声をかけずにはいられない', factor: 'RD', reversed: false },

  // P (粘り強さ)
  { id: 122, text: 'やりかけのことが中途半端だと、気になって他のことに集中できない', factor: 'P', reversed: false },
  { id: 123, text: '途中で諦めるより、時間がかかっても最後までやり遂げる方だ', factor: 'P', reversed: false },
  { id: 124, text: '細部まで納得できるまで仕上げないと気が済まない', factor: 'P', reversed: false },
  { id: 125, text: '一度決めたことは、つらくても続けようとする方だ', factor: 'P', reversed: false },
  { id: 126, text: '目標に向かって努力しているとき、あまり飽きを感じない', factor: 'P', reversed: false },
  { id: 127, text: '難しい問題にぶつかっても、別の方法を探してでも解決しようとする', factor: 'P', reversed: false },
  { id: 128, text: '疲れていても、やるべきことを終えるまで動き続けられる', factor: 'P', reversed: false },

  // SD (自律性)
  { id: 129, text: '自分の将来や目標について、具体的なイメージを持っている', factor: 'SD', reversed: false },
  { id: 130, text: '自分の行動の理由を、自分自身でしっかり説明できる', factor: 'SD', reversed: false },
  { id: 131, text: '失敗しても他人や環境のせいにせず、自分の課題として捉えられる', factor: 'SD', reversed: false },
  { id: 132, text: '自分の強みや弱みを、わりと客観的に把握している', factor: 'SD', reversed: false },
  { id: 133, text: '日常の小さな習慣の積み重ねが大切だと思い、実践している', factor: 'SD', reversed: false },
  { id: 134, text: '気持ちが乗らないときでも、やるべきことに取りかかれる方だ', factor: 'SD', reversed: false },
  { id: 135, text: '自分の行動と価値観がだいたい一致していると感じる', factor: 'SD', reversed: false },

  // CO (協調性) - 8問
  { id: 136, text: 'グループの目標より自分の目標を優先することが多い', factor: 'CO', reversed: true },
  { id: 137, text: '意見が違う人の話も、最後まで聞こうとする方だ', factor: 'CO', reversed: false },
  { id: 138, text: 'チームのために自分の意見を引っ込めることができる', factor: 'CO', reversed: false },
  { id: 139, text: '他人の立場に立って物事を考えるのが得意な方だ', factor: 'CO', reversed: false },
  { id: 140, text: 'グループ内で対立が起きたとき、仲裁に入ろうとする', factor: 'CO', reversed: false },
  { id: 141, text: '自分が損をしても、集団の利益のために動けることがある', factor: 'CO', reversed: false },
  { id: 142, text: '誰かが一方的に批判されているとき、その人の立場を代弁したくなる', factor: 'CO', reversed: false },
  { id: 143, text: 'みんなの意見をまとめながら進めることが得意だ', factor: 'CO', reversed: false },

  // ST (没頭力)
  { id: 144, text: '興味のあるものに、自分という存在を忘れて没頭することがある', factor: 'ST', reversed: false },
  { id: 145, text: '音楽や映画などに深く入り込んで、感情が大きく揺さぶられることが多い', factor: 'ST', reversed: false },
  { id: 146, text: '誰かと深く話しているとき、不思議な一体感を感じることがある', factor: 'ST', reversed: false },
  { id: 147, text: '大自然の中にいると、日常の悩みが小さく感じられる', factor: 'ST', reversed: false },
  { id: 148, text: '何かを創ることや表現することに、強いやりがいを感じる', factor: 'ST', reversed: false },
  { id: 149, text: '時間を忘れるほど集中できることが人生の中にある', factor: 'ST', reversed: false },
  { id: 150, text: '日常の何気ない瞬間に、美しさや感動を覚えることがある', factor: 'ST', reversed: false },
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
