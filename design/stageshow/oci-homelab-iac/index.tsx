import { Card, Prompt, Row, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './oci.css'

// A project still (420 × 280): the cluster stands up from code. The terminal
// that ran the apply is pinned top-left and runs off the right; the instances
// panel straddles its bottom edge over the terminal's empty margin, a level
// above it. The panel is the payoff, so it is in front and holds the one solid
// status color; the terminal only ticks its three modules.
//
// The panel shows the README's staged rollout as it stands: the control plane
// is the current step and runs, and the other three are the next steps. Only
// the running node gets the solid dot.
//
// Real strings, all from the portfolio entry and the repo's README: the
// command and its folder, the three module names, the four roles and the two
// shapes.

const MODULES = ['network', 'security', 'compute']

const NODES = [
  { role: 'k3s control plane', shape: 'ARM · 12 GB', running: true },
  { role: 'k3s worker', shape: 'ARM · 12 GB' },
  { role: 'WireGuard bastion', shape: 'AMD · 1 GB' },
  { role: 'Uptime monitor', shape: 'AMD · 1 GB' },
]

export default function OciHomelab() {
  return (
    <Stage width={420} height={280} greys="cool" className="look-mb mb-oci-homelab-iac">
      {() => (
        <>
          <Window chrome="terminal" lights="grey" className="oci-term">
            <Prompt path="~/oci-homelab-iac">terraform apply</Prompt>
            {MODULES.map((name) => (
              <div key={name} className="oci-line">
                <span className="oci-tick ok">✓</span>
                <span>module.{name}</span>
              </div>
            ))}
          </Window>

          {/* The 21px gap, with the rows' 18px line, puts the first row on the
              first module line's baseline */}
          <Card lift pad="small" gap={21} className="oci-panel">
            {NODES.map((node) => (
              <Row
                key={node.role}
                pad={0}
                className="oci-row"
                lead={<span className="oci-dot" data-running={node.running || undefined} />}
                title={<Text className={node.running ? undefined : 'oci-next'}>{node.role}</Text>}
                meta={<Text className="oci-shape">{node.shape}</Text>}
              />
            ))}
          </Card>
        </>
      )}
    </Stage>
  )
}
