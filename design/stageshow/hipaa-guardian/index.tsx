import { Badge, Bar, Card, Divider, Row, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './hipaa-guardian.css'

// A project still (420 × 280) for HIPAA Guardian: the audit report after a
// scan. The report window is pinned top, centered, and runs off the bottom.
// The first finding is open on a card pulled forward of the list, a gutter
// wider than the window on each side: its type, the file and line, the
// confidence as the one big number, the matched line, and the HIPAA rule it
// maps to. The next finding and a filler row show that the list goes on.
//
// The matched value is never text, not even a fake one: it is a Bar.
//
// Real strings, all from the skill's own sample output
// (examples/sample-finding.json, examples/sample-audit-report.md) and
// scripts/generate-report.py: the report's file name, the finding count,
// two findings and one rule.

export default function HipaaGuardian() {
  return (
    <Stage width={420} height={280} greys="cool" className="look-mb mb-hipaa-guardian">
      {() => (
        <>
          <Window title="audit_report.md" toolbar={<Badge tone="danger" dot className="hg-count">3 PHI findings</Badge>} className="hg-window">
            <div className="hg-list">
              {/* The open finding's place in the list: the card below sits over it */}
              <div className="hg-slot" />
              <Row
                pad={10}
                className="hg-row"
                title={<Text className="hg-type">Date of Birth</Text>}
                subtitle={<Text className="hg-file">src/tests/fixtures/test_data.py:87</Text>}
                meta={<Text className="hg-score">95%</Text>}
              />
              <Divider inset={10} />
              <Row pad={10} className="hg-row" title={<Bar w={132} tone={4} />} subtitle={<Bar w={176} tone={3} />} meta={<Bar w={22} tone={3} />} />
            </div>
          </Window>

          <Card pad="small" gap={8} className="hg-focus">
            <div className="hg-head">
              <Row
                pad={0}
                className="hg-row"
                title={<Text className="hg-type">Social Security Number</Text>}
                subtitle={<Text className="hg-file">config/.env.development:15</Text>}
              />
              <div className="hg-stat">
                <Text className="hg-stat__value">99%</Text>
                <Text className="hg-stat__label">confidence</Text>
              </div>
            </div>
            <div className="hg-match">
              <Text className="hg-code">TEST_PATIENT_SSN=</Text>
              {/* As wide as the 11 characters it stands for, in the ink of the text */}
              <Bar w={90} h={11} r={2} style={{ background: 'var(--ss-text-strong)' }} />
            </div>
            <div className="hg-rule">
              <Text className="hg-rule__label">HIPAA rule</Text>
              <Text className="hg-rule__value">Privacy Rule 164.514(b)(2)(i)(G)</Text>
            </div>
          </Card>
        </>
      )}
    </Stage>
  )
}
