import React, { Component } from 'react';
import './App.css';
import ArticleGroup from './components/ArticleGroup.js';
import MainNavbar from './components/MainNavbar'
import articleService from './services/articleService';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      articlesPerPage: 15,
      article_data: [],
      comment_data: this.props.comment_data,
      item: {}
    };
    this.getRecentArticles();
  }

  componentDidMount() {
    // this.getArticleById('5e24f01e3894b422aa12bb85');
    // this.getArticleById('5e24fe2e3894b422aa1416b8')
    // this.getRecentArticles();
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
    // console.log(res);
    this.setState({data: res})
  }

  isDisabled(direction) {
    const pageChange = this.state.currentPage + direction;
    const numOfPages = Math.ceil(this.state.data.length / this.state.articlesPerPage);
    if (pageChange > 0 && pageChange < numOfPages) {
      return "";
    } else {
      return "disabled";
    }
  }

  previousPage = () => {
    this.setState({
      currentPage: this.state.currentPage - 1
    });
  }

  nextPage = () => {
    this.setState({
      currentPage: this.state.currentPage + 1
    });
  }

  render() {
    const idxOfLastArticle = this.state.currentPage * this.state.articlesPerPage;
    const idxOfFirstArticle = idxOfLastArticle - this.state.articlesPerPage;
    const currentArticles = this.state.data.slice(idxOfFirstArticle, idxOfLastArticle);

    return (
      <div className="App">
        <MainNavbar />
        <div className="container">
          <div className="col">
            </div>
          <div className="col">
              {
                this.props.article_data.articles.map((group, index) => {
                // search for correct comment
                // iterate over each comment
                // default comment is null
                var group_comments = []
                for (var i = 0; i < this.props.comment_data.comments.length; i++){
                  if (
                    (this.props.comment_data.comments[i].primary_id === group._id) && (this.props.comment_data.comments[i].secondary_id === group.similar_articles[0]._id) ||
                    (this.props.comment_data.comments[i].primary_id === group.similar_articles[0]._id) && (this.props.comment_data.comments[i].secondary_id === group._id)
                    ){
                    //set group comments to be the group of comments under this id pairing
                    group_comments = this.props.comment_data.comments[i].group_comments
                  }
                }
                return (
                  <ArticleGroup key={index} article_data={group} comment_data={group_comments}/>
                )
              })
            }
            <ul className="pagination">
              <li className={"page-item " + this.isDisabled(-1)}>
                <button className="page-link" tabIndex="-1" onClick={this.previousPage}>Previous</button>
              </li>
              <li className={"page-item " + this.isDisabled(1)}>
                <button className="page-link" tabIndex="-1" onClick={this.nextPage}>Next</button>
              </li>
            </ul>
          </div>
          <div className="col"></div>
        </div>
      </div>
    )
  }
}

export default App;
