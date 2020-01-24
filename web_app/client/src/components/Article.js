import React, { Component } from 'react'
// the actual article component takes in props from the article_data file and returns JSX with that data
// uses bootstraps card content box to format article
class Article extends Component {
    getPartyColor(bias) {
        if (bias < 0) {
            return "left";
        } else if (bias > 0) {
            return "right";
        } else {
            return "mid";
        }
    }
    render() {
        if ('image' in this.props) {
            return (
                <div className="article card">
                    <img src={this.props.image} className="card-img-top article-img" alt={this.props.title} />
                    <div className={"banner-source banner-source-" + this.getPartyColor(this.props.bias)}>{this.props.source}</div>
                    <div className="card-body">
                        <h5 className="card-title">{this.props.title}</h5>
                        <p className="card-text">{this.props.content}</p>
                        <hr />
                        <span className="card-link">Published: {this.props.published.substr(0,10)}</span>
                        <a href={this.props.link} target="_blank" rel="noopener noreferrer" className="card-link">Link to full article</a>
                    </div>
                    {/* <button type="button" className="btn btn-primary">Upvote</button>
                    <button type="button" className="btn btn-danger">Downvote</button> */}
                </div>
            )
        } else {
            return (
                <div className="article card">
                    <div className={"banner-source banner-source-" + this.getPartyColor(this.props.bias)}>{this.props.source}</div>
                    <div className="card-body">
                        <h5 className="card-title">{this.props.title}</h5>
                        <p className="card-text">{this.props.content}</p>
                        <hr />
                        <span className="card-link">Published: {this.props.published.substr(0,10)}</span>
                        <a href={this.props.link} target="_blank" rel="noopener noreferrer" className="card-link">Link to full article</a>
                    </div>
                    {/* <button type="button" className="btn btn-primary">Upvote</button>
                    <button type="button" className="btn btn-danger">Downvote</button> */}
                </div>
            )
        }
    }
}


export default Article;