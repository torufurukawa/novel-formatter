const App = () => (
  <div className="container m-2">
    <div className="columns">
      <div className="column col-auto">
        <div className="form-group">
          <textarea className="form-input" rows="10" cols="80" />
        </div>
        <div className="form-group">
          <textarea className="form-input" rows="10" cols="80" readOnly />
        </div>
      </div>
    </div>
  </div>
)

ReactDOM.render(<App/>, document.querySelector('#app'))
