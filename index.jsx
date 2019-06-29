const src = `
ああああああああああ
いいいいいいいいいい

ああああああああああ


かかかかかかかかかか
きききききききききき
`

//
// React Components
//

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { source: src, generated: "" }
    this.handleChange = this.handleChange.bind(this)
    this.update = this.update.bind(this)
  }

  componentDidMount() {
    this.update(this.state.source)
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
    return (
      <div className="container m-2">
        <div className="columns">
          <div className="column col-auto">
            <div className="form-group">
              <textarea className="form-input" rows="10" cols="80"
                value={this.state.source} onChange={this.handleChange} />
            </div>
            <div className="form-group">
              <textarea className="form-input" rows="10" cols="80" readOnly
                value={this.state.generated} />
            </div>
          </div>
        </div>
      </div>
    )
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

//
// React
//

ReactDOM.render(<App />, document.querySelector('#app'))
