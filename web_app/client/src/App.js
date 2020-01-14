import React, { Component } from 'react';
import './App.css';
import ArticleGroup from './components/ArticleGroup.js';
import MainNavbar from './components/MainNavbar'
import articleService from './services/articleService';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      item: {}
    };
  }

  componentDidMount() {
    this.getArticle();
  }

  async getArticle() {
    let res = await articleService.getArticle('6b982313fd235207a27d1d03d0c2d49bff331eb1bb92f3f6f498fcd72782c446cdb169808fed90217a2a6aaef58b38f298b06292b74c443b17dbe7aade38a350');
    console.log(res);
    this.setState({item: res});
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
