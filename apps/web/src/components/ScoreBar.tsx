export default function ScoreBar({ score }: { score: number }) {
  const tone = score >= 85 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low'
  return <div className="score-inline"><div className="score-track"><span className={tone} style={{ width: `${score}%` }} /></div><strong>{score}%</strong></div>
}
