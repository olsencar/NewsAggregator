import React, { Component } from "react";
import "../App.css";
import ArticleGroup from "./ArticleGroup";
import articleService from "../services/articleService";
import ReactPaginate from "react-paginate";
import { Spinner } from "react-bootstrap";
import userService from '../services/userService';
import votesService from '../services/votesService';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articlesToDisplay: [],
      articlesPerPage: 15,
      offset: 0,
      pageCount: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.loading) {
      let displayedArticles = props.article_data.slice(
        state.offset,
        state.offset + state.articlesPerPage
      );
      displayedArticles.forEach(article => {
        article.voteDirection = HomePage.getUserUpvoteData(article, props.upvotes)
      });

      return {
        articlesToDisplay: displayedArticles,
        pageCount: Math.ceil(props.article_data.length / state.articlesPerPage)
      }
    }
    return null;
  }
  getArticleById = async (id) => {
    let res = await articleService.getArticleById(id);
    this.setState({ item: res });
  };

  getArticle = async (title, description, source) => {
    let res = await articleService.getArticle(title, description, source);
    this.setState({ item: res });
  };

  handlePageClick = (data) => {
    const selected = data.selected;
    this.setState(
      {
        offset: selected * this.state.articlesPerPage,
      },
      () => window.scrollTo(0, 0)
    );
  };

  static getUserUpvoteData = (article, upvotes) => {
    let voteDirection = 0;

    if (upvotes) {
      for (let upvote of upvotes) {
        if (upvote.primary_id === article._id 
          && upvote.secondary_id === article.most_similar_article._id) {
            return upvote.voteDirection;
        }
      }
    }
    return voteDirection;
  }

  getTagsToDisplay = (tags1, tags2) => {
    const doNotDisplayTags = new Set([
      "cnn",
      "fox",
      "breitbart",
      "huffington-post",
      "washington-post",
      "washington-times",
      "this",
      "that",
      "he",
      "she",
      "politics",
      "false",
      "true",
    ]);

    let tags = new Set(tags1.concat(tags2));

    let arr = [];

    for (const tag of tags.values()) {
      if (!doNotDisplayTags.has(tag.toLowerCase())) {
        arr.push(tag);
      }
    }
    arr.sort();

    return arr.slice(0, 5);
  }

  getImages = (images1, source1, images2, source2) => {
    let images = [];

    images1 = images1 ? images1 : [];
    images2 = images2 ? images2 : [];

    let count = 0;
    for (let img of images1) {
      if (count < 3) {
        images.push({
          src: img,
          sourceName: source1
        });
      } else {
        break;
      }
    }

    count = 0;
    for (let img of images2) {
      if (count < 3) {
        images.push({
          src: img,
          sourceName: source2
        });
      } else {
        break;
      }
    }
    return images;
  }

  upvote = (articleIndex, voteDirection) => {
    const article = this.state.articlesToDisplay[articleIndex];
    this.props.handleUpvote(article._id, article.most_similar_article._id, voteDirection)
  } 

  render() {
    let paginationElement;
    if (this.state.pageCount > 1) {
      paginationElement = (
        <ReactPaginate
          pageRangeDisplayed={5}
          marginPagesDisplayed={2}
          previousLabel={<span aria-hidden="true">&laquo;</span>}
          nextLabel={<span aria-hidden="true">&raquo;</span>}
          breakLabel={<span className="gap">...</span>}
          pageCount={this.state.pageCount}
          onPageChange={this.handlePageClick}
          containerClassName="pagination"
          disabledClassName="disabled"
          activeClassName="active"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
        />
      );
    }

    return (
      <div className="App">
        {this.props.loading ? (
          <Spinner
            animation="border"
            variant="primary"
            className="main-loading-spinner"
          />
        ) : null}
        <div className="container" id="feed-container">
          <div className="col">
            {this.state.articlesToDisplay
              .map((article, index) => {
                return (
                  <ArticleGroup
                    key={index}
                    key_id={index}
                    id={index}
                    leftArticle={article.bias <= article.most_similar_article.bias
                      ? article
                      : article.most_similar_article
                    }
                    rightArticle={
                      article.bias > article.most_similar_article.bias
                        ? article
                        : article.most_similar_article
                    }
                    tags={this.getTagsToDisplay(article.tags, article.most_similar_article.tags)}
                    images={this.getImages(article.images, article.source_name, article.most_similar_article.images, article.most_similar_article.source_name)}
                    pid={article._id}
                    sid={article.most_similar_article._id}
                    authUser={this.props.authUser}
                    voteDirection={article.voteDirection}
                    upvote={this.upvote}
                    removeArticleGroup={this.removeArticleGroup}
                  />
                );
              })}
            <div className="pagination">{paginationElement}</div>
          </div>
          <div className="col"></div>
        </div>
      </div>
    );
  }
}

export default HomePage;
