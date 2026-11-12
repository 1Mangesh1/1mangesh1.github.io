import { Avatar, Card, Check, Icon, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './voice-agent.css'

// A project still (420 × 280) for Mira, a browser voice agent. The call view is
// the hero: a browser window pinned top-left that runs off the right and
// bottom. A tool-call card straddles its lower-left edge and carries the
// payoff: book_appointment resolved. Every word is the product's own (its
// header, its tool ticker, the tool's name and result). The video is a dark
// tile with Mira's avatar, because a still never draws a face.

export default function MbVoiceAgent() {
  return (
    <Stage width={420} height={280} greys="cool" className="look-mb mb-voice-agent">
      {() => (
        <>
          <Window url="voice-agent-demo-frontend.vercel.app" className="va-window">
            <div className="va-page">
              <div className="va-header">
                <Text className="va-name">Mira</Text>
                <span className="va-live">
                  <span className="va-live__dot" />
                  <Text>live</Text>
                </span>
              </div>
              {/* The product's tool ticker: a tick, the tool's label and "done", in caps */}
              <div className="va-ticker">
                <Icon name="check" size={12} stroke={2} />
                <Text className="va-ticker__label">Booking done</Text>
              </div>
              {/* The fill is its own layer: the tile stands for video, so it holds no words */}
              <div className="va-tile">
                <div className="va-video" />
                <Avatar name="Mira" tone="accent" size={60} ring="confirmed" className="va-avatar" />
              </div>
            </div>
          </Window>

          <Card flush pad="small" lift className="va-tool">
            <div className="va-tool__head">
              <Check on size={18} />
              <Text className="va-tool__name">book_appointment</Text>
            </div>
            <div className="va-tool__rows">
              <Text className="va-key">ok</Text>
              <Text className="va-val">true</Text>
              <Text className="va-key">slot</Text>
              <Text className="va-val">2026-05-02T14:00</Text>
            </div>
          </Card>
        </>
      )}
    </Stage>
  )
}
