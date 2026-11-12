import type { ReactNode } from 'react'
import { Bar, Card, Prompt, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './skills.css'

// A project still (420 × 280): the skills CLI has cloned the collection and
// asks which skills to install. The terminal is pinned top and left and runs
// off the bottom; the download count straddles its right edge, about half
// outside, over the terminal's empty margin.
//
// Real strings: the install command, the count the CLI reports, its question,
// the collection's first three skills and the download count.

// The picker sorts by name, so these are the collection's first three rows; the first is picked
const SKILLS = ['ai-agents', 'ai-prompting', 'ansible']
// The next row, as filler
const MORE = [72]

// A terminal is a character grid: every mark owns one cell
function Mark({ children, dim }: { children: ReactNode; dim?: boolean }) {
  return <span className={`cs-mark ${dim ? 'dim' : 'ok'}`}>{children}</span>
}

export default function ClaudeSkills() {
  return (
    <Stage className="look-mb mb-claude-skills" width={420} height={280} greys="cool">
      {() => (
        <>
          <Window chrome="terminal" lights="grey" className="cs-term">
            <Prompt path="~">{'npx skills add \\'}</Prompt>
            {/* The kit's command ink on everything the person typed or picked */}
            <div className="cs-cont">
              <span className="ss-term__cmd">1Mangesh1/dev-skills-collection</span>
            </div>
            <div className="cs-line">
              <Mark>◇</Mark>
              <span>Found 94 skills</span>
            </div>
            <div className="cs-line">
              <Mark>◆</Mark>
              <span>Select skills to install</span>
            </div>
            {SKILLS.map((name, i) => (
              <div key={name} className="cs-line cs-opt">
                <Mark dim={i > 0}>{i === 0 ? '●' : '○'}</Mark>
                <span className={i === 0 ? 'ss-term__cmd' : undefined}>{name}</span>
              </div>
            ))}
            {MORE.map((w) => (
              <div key={w} className="cs-line cs-opt">
                <Mark dim>○</Mark>
                <Bar w={w} h={6} r={3} style={{ background: 'var(--cs-bar)' }} />
              </div>
            ))}
          </Window>

          <Card lift gap={10} className="cs-stat">
            <Text className="cs-count">750+</Text>
            <Text className="cs-unit">downloads</Text>
          </Card>
        </>
      )}
    </Stage>
  )
}
