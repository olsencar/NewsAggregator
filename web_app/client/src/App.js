import React, { Component } from 'react';
import './App.css';
import ArticleGroup from './components/ArticleGroup.js';
import MainNavbar from './components/MainNavbar'
import articleService from './services/articleService';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      article_data: this.props.article_data,
      comment_data: this.props.comment_data,
      item: {}
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
            this.props.article_data.articles.map((group, index) => {
              // search for correct comment
              // iterate over each comment
              // default comment is null
              var group_comments = []
              for (var i = 0; i < this.props.comment_data.comments.length; i++){
                if (
                  (this.props.comment_data.comments[i].primary_id === group[0]._id) && (this.props.comment_data.comments[i].secondary_id === group[1]._id) ||
                  (this.props.comment_data.comments[i].primary_id === group[1]._id) && (this.props.comment_data.comments[i].secondary_id === group[0]._id)
                  ){
                  //set group comments to be the group of comments under this id pairing
                  group_comments = this.props.comment_data.comments[i].group_comments
                }
              }
             return <ArticleGroup key={index} article_data={group} comment_data={group_comments}/>
          })
        }
      </div>
    )
  }
}

export default App;
