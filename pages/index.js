import Head from 'next/head'
import '../node_modules/spectre.css/dist/spectre.min.css'

const example = `
そして教室じゅうはしばらく机の蓋をあけたりしめたり本を重ねたりする音がいっぱいでしたが、まもなくみんなはきちんと立って礼をすると教室を出ました。


ジョバンニが学校の門を出るとき、同じ組の七、八人は家へ帰らずカムパネルラをまん中にして校庭の隅の桜の木のところに集っていました。
それはこんやの星祭に青いあかりをこしらえて川へ流ながす烏瓜を取とりに行く相談らしかったのです。

けれどもジョバンニは手を大きく振ふってどしどし学校の門を出て来ました。
すると町の家々ではこんやの銀河の祭にいちいの葉の玉をつるしたり、ひのきの枝にあかりをつけたり、いろいろしたくをしているのでした。
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
  }

  componentDidMount() {
    const document = parse(example)
    const generated = format(document)
    this.setState({ generated: generated })
  }

  handleChange(event) {
    this.update(event.target.value)
  }

  update(source) {
    const document = parse(source)
    const generated = format(document)
    this.setState({ source: source, generated: generated })
  }

  render = () => {
    return [
      <Head>
        <title>Novel Formatter</title>
        <meta property="og:title" content="Novel Formatter" />
        <meta property="og:description" content="ゲンロンＳＦ創作講座の梗概提出用に、テキストを整形します。" />
        <meta property="og:image" content={require('./eyecatch.jpg')} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@bloodscooper" />
        <meta name="twitter:title" content="Novel Formatter" />
        <meta name="twitter:description" content="ゲンロンＳＦ創作講座の梗概提出用に、テキストを整形します。" />
        <meta name="twitter:image" content={require('./eyecatch.jpg')} />
      </Head>,
      <div className="container m-2">
        <div className="columns">
          <div className="column col-auto">
            <div className="form-group">
              <textarea className="form-input" rows="12" cols="80" placeholder={example}
                value={this.state.source} onChange={this.handleChange} />
            </div>
            <div className="form-group">
              <textarea className="form-input" rows="12" cols="80" readOnly
                value={this.state.generated} />
            </div>
          </div>
        </div>
      </div>
    ]
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
