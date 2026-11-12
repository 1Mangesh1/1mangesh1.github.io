import { Badge, Bar, Card, Row, Stage, Text, Window } from '../../kit'
import '../mb-look.css'
import './doctalk.css'

// A still (420 x 280) for the DocTalk project card: a question asked of an
// uploaded PDF, the grounded answer, and the citations that name where it
// came from. The answer window is pinned top-left and runs off the bottom;
// the cited page straddles its right edge, half outside, over the window's
// empty margin. The accent is spent on the citations only: the marks in the
// answer, the cited source and the passage on the page, which sits level
// with its source row so the two read as one band.
//
// Real strings: the file name, its status, the question, the answer and two
// sources. The page and the rows the crop takes are bars. The product is
// asked about itself, so the answer states two facts of the portfolio entry
// (a search for the top-5 chunks, only those fed to the LLM) and no invented
// finding. The file name, the question and the page and chunk numbers are
// sample values.

const SOURCES = [
  { n: 1, page: 'Page 3', chunk: 'chunk 4' },
  { n: 2, page: 'Page 8', chunk: 'chunk 11' },
]

// The first source is the one open on the page: its mark is solid everywhere
function Cite({ n }: { n: number }) {
  return <Badge tone="accent" className="dt-cite" data-on={n === 1 || undefined}>{String(n)}</Badge>
}

export default function MbDoctalk() {
  return (
    <Stage className="look-mb mb-doctalk" width={420} height={280} greys="cool">
      {() => (
        <>
          <Window title="architecture.pdf" toolbar={<Text className="dt-status">Ready</Text>} className="dt-win">
            <div className="dt-body">
              <div className="dt-q">
                <Text>How are answers grounded?</Text>
              </div>
              <div className="dt-col">
                {/* One sentence a line, each ending on the mark for its source.
                    The second is the shorter by well over a gutter, so the two
                    marks never sit almost one above the other. */}
                <div className="dt-a">
                  <div>A search finds the top-5 chunks.<Cite n={1} /></div>
                  <div>Only those go to the LLM.<Cite n={2} /></div>
                </div>
                <div className="dt-sources">
                  {SOURCES.map((s) => (
                    <Row key={s.n} pad={8} selected={s.n === 1} className="dt-src" lead={<Cite n={s.n} />} title={<Text className="dt-ref">{s.page}</Text>} meta={<Text className="dt-chunk">{s.chunk}</Text>} />
                  ))}
                  {[[46, 52], [38, 44]].map(([page, chunk], i) => (
                    <Row key={i} pad={8} className="dt-src" lead={<Bar w={16} h={16} r={5} tone={2} />} title={<Bar w={page!} tone={3} />} meta={<Bar w={chunk!} tone={2} />} />
                  ))}
                </div>
              </div>
            </div>
          </Window>

          {/* The cited page: a ruled sheet, the passage the first source names marked on it */}
          <Card pad="small" gap={6} className="dt-page">
            <Bar w={44} h={5} tone={5} className="dt-page__title" />
            {[100, 84].map((w) => <Bar key={w} w={`${w}%`} h={4} tone={3} />)}
            <div className="dt-mark">
              {[100, 92, 64].map((w) => <Bar key={w} w={`${w}%`} h={4} style={{ background: 'var(--mark-ink)' }} />)}
            </div>
            {[100, 90, 96, 56].map((w) => <Bar key={w} w={`${w}%`} h={4} tone={3} />)}
          </Card>
        </>
      )}
    </Stage>
  )
}
