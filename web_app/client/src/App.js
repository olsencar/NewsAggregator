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
    // this.getArticleById('5e24f01e3894b422aa12bb85');
    this.getArticleById('5e24fe2e3894b422aa1416b8')
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
        <div className="container">
          <div className="col"></div>
          <div className="col">
            {
              this.props.data.articles.map((article, index) => {
                return (
                  <ArticleGroup key={index} data={article} />
                )
              })
            }
          </div>
          <div className="col"></div>
        </div>
      </div>
    )
  }
}

export default App;
