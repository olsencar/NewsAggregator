import React, { Component } from 'react'
import Article from './Article'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Below sorts the order of news stories from leftmost -> rightmost bias
          data: this.props.data.sort((a, b) => {
              return a.bias - b.bias
          })
        };
    }

    render() {
        return (
            <div className="container grouped-articles">
                <div className="row">
                    <div className="col left-article article-container">
                        <Article key={0} title={this.state.data[0].title} img={this.state.data[0].image.url} 
                        content={this.state.data[0].description} 
                        source={this.state.data[0].source_name} 
                        bias={this.state.data[0].bias} 
                        link={this.state.data[0].orig_link} 
                        published={this.state.data[0].publish_date.$date} />
                    </div>
                    <div className="col right-article article-container">
                        <Article key={1} title={this.state.data[1].title} img={this.state.data[1].image.url} 
                        content={this.state.data[1].description} 
                        source={this.state.data[1].source_name} 
                        bias={this.state.data[1].bias} 
                        link={this.state.data[1].orig_link} 
                        published={this.state.data[1].publish_date.$date} />
                    </div>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;