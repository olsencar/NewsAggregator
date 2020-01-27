import React, { Component } from 'react'
import Article from './Article'
import CommentSection from './CommentSection'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
        // Below sorts the order of news stories from leftmost -> rightmost bias
          article_data: this.props.article_data.sort((a, b) => {
              return a.bias - b.bias
          })
        };
    }
    render() {
        return (
            <div className="container grouped-articles">
                <div className="row">
                    <div className="col left-article article-container">
                        <Article key={0} title={this.state.article_data[0].title} img={this.state.article_data[0].image.url} 
                        content={this.state.article_data[0].description} 
                        source={this.state.article_data[0].source_name} 
                        bias={this.state.article_data[0].bias} 
                        link={this.state.article_data[0].orig_link} 
                        published={this.state.article_data[0].publish_date.$date} />
                    </div>
                    <div className="col right-article article-container">
                        <Article key={1} title={this.state.article_data[1].title} img={this.state.article_data[1].image.url} 
                        content={this.state.article_data[1].description} 
                        source={this.state.article_data[1].source_name} 
                        bias={this.state.article_data[1].bias} 
                        link={this.state.article_data[1].orig_link} 
                        published={this.state.article_data[1].publish_date.$date} />
                    </div>
                </div>
                <div className="container bg-white">
                    <Accordion>
                      <Card>
                        <Card.Header>
                          <Accordion.Toggle as={Button} variant="Secondary" eventKey="0">
                            Discussion
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <CommentSection comments={this.props.comment_data}/>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;