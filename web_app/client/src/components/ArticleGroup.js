import React, { Component } from 'react';
import Article from './Article';
import Img from 'react-image';
import CommentSection from './CommentSection'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import commentService from './../services/commentService';

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        const chosenArticle = this.props.article_data.most_similar_article;
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data : chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle,
            image: null,
            comments: [] //cache -> set upon accordion click
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

    handleAccordion = async () => {
        //check if we've already checked for comments before (in cache/state):
        let pid = this.props.article_data._id;
        let sid = this.props.article_data.similar_articles[0]._id;
        if(!this.comments.length){//empty -> not filled with comments from previous API call
            let article_group_comments = await commentService.getComments(pid, sid);
            console.log(article_group_comments);
            this.setState({
                //use service worker to get comments on mongodb lookup
                comments: article_group_comments.group_comments
            });
        }
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
                          <Accordion.Toggle as={Button} onClick="handleAccordion" variant="Secondary" eventKey="0">
                            Discussion
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <CommentSection comments={[this.state.comments]} pid={this.props.article_data} sid= {this.props.article_data.similar_articles._id}/>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;
