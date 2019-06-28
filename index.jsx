const src = `
ああああああああああ
いいいいいいいいいい

ああああああああああ


かかかかかかかかかか
きききききききききき
`

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {source: src, generated: ""}
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
    // extract lines and trim white spaces
    const lines = source.split('\n').map((line) => line.trim())

    // define position symbols
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

    // format
    const generated = document.sections.reduce((generated, section, i) => {
      if (i > 0) {
        generated += '\n\n'
      }
      generated += section.paragraphs.reduce((result, paragraph, i) => {
        if (i > 0) {
          result += '\n　'
        }
        result += paragraph.lines.reduce((result, line, i) => {
          result += line
          return result
        })
        return result
      }, '')
      return generated
    }, '')

    this.setState({ source: source, generated: generated})
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
                value={this.state.generated}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

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

ReactDOM.render(<App/>, document.querySelector('#app'))
