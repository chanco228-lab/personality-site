import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f4c81 0%, #1a6b8a 40%, #2d9596 100%)' }}>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-8 border border-white/30">
          <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></span>
          約5分で完了
        </div>

        {/* Main heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
          あなたの本質を、
          <br />
          <span className="text-teal-200">科学で照らす。</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-blue-100 mb-4 max-w-xl leading-relaxed">
          心理学に基づいた21の質問で、あなたの性格の核心を解き明かします。
        </p>
        <p className="text-sm text-blue-200 mb-10 max-w-lg">
          新規性探求・損害回避・報酬依存など7つの気質因子から、
          <br className="hidden md:block" />
          54のパーソナリティタイプのいずれかを診断します。
        </p>

        {/* CTA Button */}
        <Link
          href="/quiz"
          className="group inline-flex items-center gap-3 bg-white text-teal-700 font-bold text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:bg-teal-50 transition-all duration-300 hover:scale-105"
        >
          診断スタートする
          <svg
            className="w-5 h-5 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            {
              emoji: '\u{1F52C}',
              title: '科学的根拠',
              desc: 'クロニンジャーの気質モデルをベースにした心理学的アプローチ',
            },
            {
              emoji: '\u26A1',
              title: 'たった21問',
              desc: '一問一答形式で約3分。シンプルで直感的に答えられます',
            },
            {
              emoji: '\u{1F512}',
              title: '完全無料・匿名',
              desc: '個人情報の入力不要。結果はお使いの端末に保存されます',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-left hover:bg-white/15 transition-colors"
            >
              <div className="text-2xl mb-3">{feature.emoji}</div>
              <h3 className="font-bold text-white mb-1.5">{feature.title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-white/10">
        <p className="text-blue-200 text-xs leading-relaxed max-w-xl mx-auto px-4">
          ※ 本診断は娯楽・自己理解を目的としたものです。医療診断や専門的なカウンセリングの代替とはなりません。
          <br />
          診断結果はあくまで参考情報としてご活用ください。
        </p>
      </footer>
    </main>
  );
}
