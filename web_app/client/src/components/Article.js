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
        return (
            <div className="article card bg-light rounded">
                <div className="card-body">
                    <h5 className="card-title"><a className="card-title-a" href={this.props.link} target="_blank" rel="noopener noreferrer">{this.props.title}</a></h5>
                    <p className="card-text">{this.props.content}</p>
                </div>
                <div className="card-footer text-muted">
                    <span className={"card-link banner-source banner-source-" + this.getPartyColor(this.props.bias)}>{this.props.source}</span>
                    <span className="card-link">{this.props.published.substr(0,10)}</span>
                </div>
                {/* <button type="button" className="btn btn-primary">Upvote</button>
                <button type="button" className="btn btn-danger">Downvote</button> */}
            </div>

        )
    }
}


export default Article;
