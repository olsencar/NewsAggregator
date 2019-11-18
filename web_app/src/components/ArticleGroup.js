import React, { Component } from 'react'
import Article from './Article'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
          data: this.props.data
        };
    }
    render() {
        return (
            <div className="container grouped-articles">
                <div className="row">
                    <div className="col left-article article-container">
                        <Article key={0} title={this.state.data[0].title} img={this.state.data[0].img} author={this.state.data[0].author} content={this.state.data[0].content} />;
                    </div>
                    <div className="col right-article article-container">
                        <Article key={1} title={this.state.data[1].title} img={this.state.data[1].img} author={this.state.data[1].author} content={this.state.data[1].content} />;
                    </div>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;