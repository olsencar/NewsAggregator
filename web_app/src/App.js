import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Article from './components/Article.js';

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
        {this.state.data.map((article, idx)=>{
          return <Article key={idx} title={this.state.data[idx].title} img={this.state.data[idx].img} author={this.state.data[idx].author} content={this.state.data[idx].content} />;
        })}
      </div>
    );
  }
}

export default App;
