import React, { Component } from "react";
import "../App.css";
import ArticleGroup from "./ArticleGroup";
import articleService from "../services/articleService";
import ReactPaginate from "react-paginate";
import { Spinner } from "react-bootstrap";

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

  componentDidMount() {
    this.setArticlesToDisplay(this.props);
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.loading) {
      return {
        articlesToDisplay: props.article_data.slice(
        state.offset,
        state.offset + state.articlesPerPage)
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
      () => this.setArticlesToDisplay(this.props)
    );
  };

  removeArticleGroup = (index) => {
    this.setState((prevState) => ({
      articlesToDisplay: prevState.articlesToDisplay.filter(
        (_, i) => i !== index
      ),
    }));
  };

  setArticlesToDisplay = () => {
    this.setState({
      articlesToDisplay: this.props.article_data
        .slice(
          this.state.offset,
          this.state.offset + this.state.articlesPerPage
        )
    });
    window.scrollTo(0, 0);
  };

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
                    article_data={article}
                    authUser={this.props.authUser}
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
