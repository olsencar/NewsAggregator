import React, { Component } from 'react';
import './App.css';
import ArticleGroup from './components/ArticleGroup.js';
import MainNavbar from './components/MainNavbar'

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
        <MainNavbar />
        {
          this.props.data.articles.map((group, index) => {
            return <ArticleGroup key={index} data={group} />
          })
        }
      </div>
    )
  }
}

export default App;
