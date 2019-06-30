import Head from 'next/head'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import '../node_modules/spectre.css/dist/spectre.min.css'

const example = `
最初の段落です。
後続する文は、最初の段落に含まれます。

ひとつの空行をはさんで、次の段落を始めます。
後続する文は、この段落に含まれます。


ふたつの空行をはさんで、次のセクションを始めます。
けれどもジョバンニは手を大きく振ってどしどし学校の門を出て来ました。
`

//
// React Components
//

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { source: '', generated: '' }
    this.handleChange = this.handleChange.bind(this)
    this.update = this.update.bind(this)
    this.clear = this.clear.bind(this)
    this.setExample = this.setExample.bind(this)
  }

  static async getInitialProps({ req }) {
    const host = req.headers.host
    return { host }
  }

  handleChange(event) {
    this.update(event.target.value)
  }

  update(source) {
    const document = parse(source)
    const generated = format(document)
    this.setState({ source: source, generated: generated })
  }

  setExample() {
    this.update(example)
  }

  clear() {
    this.update('')
  }

  render = () => {
    const imageURL = 'https://' + this.props.host + require('./eyecatch.jpg')

    const head = <Head>
      <title>Novel Formatter</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta property="og:title" content="Novel Formatter" />
      <meta property="og:description" content="ゲンロンSF創作講座の梗概提出用に、テキストを整形します。" />
      <meta property="og:image" content={imageURL} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bloodscooper" />
      <meta name="twitter:title" content="Novel Formatter" />
      <meta name="twitter:description" content="ゲンロンSF創作講座の梗概提出用に、テキストを整形します。" />
      <meta name="twitter:image" content={imageURL} />
    </Head>
    const navbar = <header className="navbar bg-primary p-2">
      <section className="navbar-section" />
      <section className="navbar-center">
        <span className="navbar-brand" >Novel Formatter</span>
      </section>
      <section className="navbar-section" />
    </header>
    const main = <div className="p-2" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <p>ゲンロンSF創作講座の梗概提出用に、文章を整形します。</p>
      <p>
        ゲンロンSF創作講座の投稿サイトは、デフォルトで自動的に段落の最初を字下げし、かつ、段落間には空行を挿入して表示します。
        いかにも小説の作法に則ってない、と指摘されそうです。
      </p>
      <p>
        このツールは、（私にとって）推敲しやすい書式の梗概を、投稿サイトにコピペできる書式に変換します。
      </p>
      <p style={{ fontSize: '80%' }}>
        会話のかぎかっこの行頭処理には対応していません。
        <a href="https://twitter.com/bloodscooper">古川</a>が実作にいけるまで、お待ち下さい。
      </p>

      <div className="form-group" style={{ marginBottom: '1em' }}>
        <label>
          <span className="label label-rounded label-primary">Step 1</span><br />
          梗概をペースト
        </label>
        <textarea className="form-input mt-1" rows="10" placeholder="ここに梗概をペースト"
          value={this.state.source} onChange={this.handleChange} />
        <div className="mt-1 text-right">
          <button className="btn btn-sm" onClick={this.clear}>
            消去
          </button>
          &nbsp;
          <button className="btn btn-sm" onClick={this.setExample}>
            消去して、例文を表示
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>
          <span className="label label-rounded label-primary">Step 2</span><br />
          コピーして、ゲンロンSF創作講座の投稿サイトにペースト
        </label>
        <textarea className="form-input mt-1" rows="8" readOnly
          value={this.state.generated} />
        <div className="mt-1 text-right">
          <CopyToClipboard text={this.state.generated}>
            <button className="btn btn-sm">コピー</button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
    return [head, navbar, main]
  }
}

//
// Data structures
//

class Document {
  constructor() {
    this.sections = []
  }

  pushSection(section) {
    this.sections.push(section)
  }

  get lastSection() {
    return this.sections[this.sections.length - 1]
  }
}

class Section {
  constructor(paragraph) {
    this.paragraphs = []
    if (paragraph) {
      this.pushParagraph(paragraph)
    }
  }

  pushParagraph(paragraph) {
    this.paragraphs.push(paragraph)
  }

  get lastParagraph() {
    return this.paragraphs[this.paragraphs.length - 1]
  }
}

class Paragraph {
  constructor(line) {
    this.lines = []
    if (line) {
      this.pushLine(line)
    }
  }

  pushLine(line) {
    this.lines.push(line)
  }
}

//
// parser and dumper
//

function parse(text) {
  // extract lines and trim white spaces
  const lines = text.split('\n').map((line) => line.trim())
  // define position status
  const beginning = Symbol('beginning')
  const inParagraph = Symbol('inParagraph')
  const endOfParagraph = Symbol('endOfParagraph')
  const endOfSection = Symbol('endOfSection')

  let position = beginning
  const document = lines.reduce((document, line) => {
    switch (position) {
      case beginning:
        if (line) {
          document.pushSection(new Section(new Paragraph(line)))
          position = inParagraph
        }
        break
      case inParagraph:
        if (line) {
          document.lastSection.lastParagraph.pushLine(line)
        } else {
          position = endOfParagraph
        }
        break
      case endOfParagraph:
        if (line) {
          document.lastSection.pushParagraph(new Paragraph(line))
          position = inParagraph
        } else {
          position = endOfSection
        }
        break
      case endOfSection:
        if (line) {
          document.pushSection(new Section(new Paragraph(line)))
          position = inParagraph
        }
        break
      default:
        console.log('unknown status')
    }
    return document
  }, new Document())

  return document
}

function format(document) {
  const text = document.sections.reduce((text, section, i) => {
    // insert a blank line between sections
    if (i > 0) {
      text += '\n\n'
    }

    text += section.paragraphs.reduce((text, paragraph, i) => {
      // insert a space in fron of paragraph, except first paragaph in a section
      if (i > 0) {
        text += '\n　'
      }

      text += paragraph.lines.reduce((text, line, i) => {
        return text + line
      })
      return text
    }, '')
    return text
  }, '')

  return text
}

export default App;
