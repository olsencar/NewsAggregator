import React, { Component } from 'react'
import Article from './Article'
import CommentSection from './CommentSection'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        let similarArticles = this.props.article_data.similar_articles;
        let chosenArticle = similarArticles[0];
        for (let i = 0; i < similarArticles.length; i++) {
            if (similarArticles[i].bias !== this.props.article_data.bias) {
                chosenArticle = similarArticles[i];
                break;
            }
        }
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data :chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle
        };
    }

    // This function gets the widest image to display
    // The purpose is to get the highest quality image
    getImageToDisplay() {
        let leftImages = this.state.leftArticle.images;
        let rightImages = this.state.rightArticle.images;
        let maxWidth = 0;
        let imgToKeep = new Image();
        for (let i = 0; i < leftImages.length; i++) {
            let img = new Image();
            img.src = leftImages[i];
            if (img.naturalWidth > maxWidth) {
                maxWidth = img.naturalWidth;
                imgToKeep = img;
            }
        }
        for (let i = 0; i < rightImages.length; i++) {
            let img = new Image();
            img.src = rightImages[i];
            if (img.naturalWidth > maxWidth) {
                maxWidth = img.naturalWidth;
                imgToKeep = img;
            }
        }
        console.log(imgToKeep.src);
        return imgToKeep;
    }

    render() {
        let img = this.getImageToDisplay();
        return (
            <div className="container grouped-articles shadow bg-light rounded">
                <div className="row">
                    <img src={img.src} className="article-grp-img" alt={this.state.leftArticle.title}></img>
                </div>
                <div className="row">
                    <div className="card-deck-wrapper">
                        <div className="card-deck">
                            <Article key={0} title={this.state.leftArticle.title} 
                                content={this.state.leftArticle.description}
                                source={this.state.leftArticle.source_name}
                                bias={this.state.leftArticle.bias}
                                link={this.state.leftArticle.orig_link}
                                published={this.state.leftArticle.publish_date} />
                            <Article key={1} title={this.state.rightArticle.title}
                                content={this.state.rightArticle.description}
                                source={this.state.rightArticle.source_name}
                                bias={this.state.rightArticle.bias}
                                link={this.state.rightArticle.orig_link}
                                    published={this.state.rightArticle.publish_date} />
                        </div>
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