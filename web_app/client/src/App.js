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
      item: {},
      articles: []
    };
  }

  componentDidMount() {
    this.getArticle();
    this.getRecentArticles();
  }

  async getArticle() {
    let res = await articleService.getArticle('5e1e967d355a502f978f79e3');
    console.log(res);
    this.setState({item: res});
  }

  async getRecentArticles() {
    let res = await articleService.getRecentArticles();
    console.log(res);
    this.setState({articles: res})
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
