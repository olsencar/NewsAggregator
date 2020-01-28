import React, { Component } from 'react';
import Article from './Article';
import Img from 'react-image';
import CommentSection from './CommentSection'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        const chosenArticle = this.props.article_data.most_similar_article;
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data : chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle,
            image: null
        };
    }

    componentWillReceiveProps(newProps) {
        const chosenArticle = newProps.article_data.most_similar_article;

        this.setState({
            leftArticle: newProps.article_data.bias <= chosenArticle.bias ? newProps.article_data : chosenArticle,
            rightArticle: newProps.article_data.bias > chosenArticle.bias ? newProps.article_data : chosenArticle,
        });
    }

    // This function gets the widest image to display
    // The purpose is to get the highest quality image
    getImageToDisplay = async () => {
        let leftImages = this.state.leftArticle.images;
        let rightImages = this.state.rightArticle.images;
        let maxWidth = 0;
        let imgToKeep = new Image();
        for (let i = 0; i < leftImages.length; i++) {
            let img = new Image();
            try {
                img.src = leftImages[i];
                if (img.naturalWidth > maxWidth) {
                    maxWidth = img.naturalWidth;
                    imgToKeep = img;
                }
            } catch (error) {
                console.error(error);
            }
        }
        for (let i = 0; i < rightImages.length; i++) {
            let img = new Image();
            try {
                img.src = rightImages[i];
                if (img.naturalWidth > maxWidth) {
                    maxWidth = img.naturalWidth;
                    imgToKeep = img;
                }
            } catch (error) {
                console.error(error);
            }
        }
        return imgToKeep;
    }

    render() {
        return (
            <div className="container grouped-articles shadow bg-light rounded">
                <div className="row">
                    <Img src={this.state.leftArticle.images.concat(this.state.rightArticle.images)} alt={this.state.leftArticle.title} className="article-grp-img" />
                </div>
                <span className="badge badge-secondary">#impeachment</span>
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
