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
    this.getArticleById('5e23acaf3894b422aac4baff');
    this.getArticle("Rod Rosenstein says he made call to release Peter Strzok-Lisa Page texts", null, "CNN")
  }

  async getArticleById(id) {
    let res = await articleService.getArticleById(id);
    console.log(res);
    this.setState({item: res});
  }

  async getArticle(title, description, source) {
    let res = await articleService.getArticle(title, description, source);
    console.log(res);
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
