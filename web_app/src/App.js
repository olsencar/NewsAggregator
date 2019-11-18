import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ArticleGroup from './components/ArticleGroup.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }
  render() {
    return (
      <div className="App">
        <header>
          <p>
            News Aggregator
          </p>
        </header>
        <ArticleGroup data={this.state.data} />
      </div>
    );
  }
}

export default App;
