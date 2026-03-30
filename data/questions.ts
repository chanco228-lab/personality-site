import { Question } from './types';

const rawQuestions: Question[] = [
  // NS (新規性探求)
  { id: 1, text: '計画通りに進めるより、その場の思いつきで行動することを楽しめる', factor: 'NS', reversed: false },
  { id: 2, text: '新しいカフェや店を見かけたとき、とりあえず入ってみたくなる', factor: 'NS', reversed: false },
  { id: 3, text: '仕事や趣味で、同じやり方を続けるより新しい方法を試してみたくなる', factor: 'NS', reversed: false },

  // HA (損害回避)
  { id: 4, text: '大事な決断をする前に、失敗したときのことを何度も考えてしまう', factor: 'HA', reversed: false },
  { id: 5, text: '初めての場所に行くとき、必要以上に不安を感じてしまうことが多い', factor: 'HA', reversed: false },
  { id: 6, text: '締め切りや約束が近づくと、間に合わないかもしれないと不安になる', factor: 'HA', reversed: false },

  // RD (報酬依存)
  { id: 7, text: '友人に「ありがとう」と言われると、それだけで頑張った甲斐があったと感じる', factor: 'RD', reversed: false },
  { id: 8, text: '一人で作業するより、誰かと関わりながら進めるほうが気持ちが乗りやすい', factor: 'RD', reversed: false },
  { id: 9, text: '身近な人が落ち込んでいると、その人のことが気になってしばらく意識に残ることが多い', factor: 'RD', reversed: false },

  // P (固執)
  { id: 10, text: 'やりかけの作業が中途半端だと、気になって他のことが手につかない', factor: 'P', reversed: false },
  { id: 11, text: '細部まで納得いくまで仕上げないと気が済まないことが多い', factor: 'P', reversed: false },
  { id: 12, text: '困難にぶつかっても、目標を変えるより粘り続けることを選ぶことが多い', factor: 'P', reversed: false },

  // SD (自己志向)
  { id: 13, text: '予想外のトラブルが起きたとき、誰かに頼らずまず自分でなんとかしようとする', factor: 'SD', reversed: false },
  { id: 14, text: '自分の選択に責任を持ち、結果が悪くても他人や環境のせいにしない', factor: 'SD', reversed: false },
  { id: 15, text: '「どうせ自分には無理」より「やればできる」と考えることのほうが多い', factor: 'SD', reversed: false },

  // CO (協調性)
  { id: 16, text: '困っている人を見かけたとき、声をかけるか迷っても、結局声をかけることが多い', factor: 'CO', reversed: false },
  { id: 17, text: '自分の意見と違っても、相手の話を最後まで聞こうとする', factor: 'CO', reversed: false },
  { id: 18, text: 'グループの意見を尊重して行動することが多い', factor: 'CO', reversed: false },

  // ST (自己超越性)
  { id: 19, text: '興味のあるものに、自分という存在を忘れて没頭することがある', factor: 'ST', reversed: false },
  { id: 20, text: '誰かと深く話しているとき、相手と一体感のようなものを感じることがある', factor: 'ST', reversed: false },
  { id: 21, text: '大自然や宇宙の広さを感じたとき、自分が何か大きなものの一部だと感じる', factor: 'ST', reversed: false },
];

export function getShuffledQuestions(): Question[] {
  const shuffled = [...rawQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default rawQuestions;
