import { Bar, Card, Check, Meter, Row, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './fieldnotes.css'

// A project still (420 × 280): the pipeline has finished and the verdict is in.
// The window holds the five-step trace, pinned top-left and off the bottom; the
// verdict card straddles its right edge, about half outside, over the rows'
// empty ends. Real words: the address, the five step names and the verdict.

// The four agent tools (AgentToolName in the API) and the step that follows
// them in both flows (steps/verdict_generator.py)
const STEPS = ['fetch_and_parse_jd', 'research_company', 'scan_github', 'compare_resume', 'generate_verdict']

// The verdict's evidence, as filler: a label and a value per line
const EVIDENCE = [
  [58, 34],
  [42, 48],
  [66, 28],
]

export default function MbFieldnotes() {
  return (
    <Stage width={420} height={280} greys="cool" className="look-mb mb-fieldnotes">
      {() => (
        <>
          <Window url="fieldnotes.mangeshbide.tech" className="fn-window">
            <div className="fn-trace">
              {STEPS.map((tool) => (
                <Row key={tool} pad={0} className="fn-step" lead={<Check on size={16} />} title={<Text className="fn-tool">{tool}</Text>} />
              ))}
            </div>
            <div className="fn-foot">
              <Bar w={46} tone={3} />
              <Bar w={64} tone={2} />
              <Bar w={38} tone={2} />
            </div>
          </Window>

          <Card lift flush className="fn-verdict">
            <div className="fn-ruling">
              <Text className="fn-apply">APPLY</Text>
              {/* The match score with no number: the fill says strong, nothing more */}
              <Meter value={0.84} tone="success" />
            </div>
            <div className="fn-evidence">
              {EVIDENCE.map(([label, value], i) => (
                <div key={i} className="fn-evidence__line">
                  <Bar w={label} tone={3} />
                  <Bar w={value} tone={2} />
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </Stage>
  )
}
