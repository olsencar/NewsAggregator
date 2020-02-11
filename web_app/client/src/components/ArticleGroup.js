import React, { Component } from 'react';
import Article from './Article';
import CommentSection from './CommentSection'
import commentService from './../services/commentService';
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Carousel  from 'react-bootstrap/Carousel'
import DefaultImage from '../onErrorFallback.png'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        const chosenArticle = this.props.article_data.most_similar_article;
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data : chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle,
            comments: [], //cache -> set upon accordion click
            tags: this.getTagsToDisplay(this.props.article_data.tags, chosenArticle.tags),
            images: this.getImagesToDisplay(this.props.article_data.images, chosenArticle.images, this.props.article_data.source_name, chosenArticle.source_name)
        };
    }

    componentWillReceiveProps(newProps) {
        const chosenArticle = newProps.article_data.most_similar_article;

        this.setState({
            leftArticle: newProps.article_data.bias <= chosenArticle.bias ? newProps.article_data : chosenArticle,
            rightArticle: newProps.article_data.bias > chosenArticle.bias ? newProps.article_data : chosenArticle,
            tags: this.getTagsToDisplay(newProps.article_data.tags, chosenArticle.tags),
            images: this.getImagesToDisplay(newProps.article_data.images, chosenArticle.images, newProps.article_data.source_name, chosenArticle.source_name)
        });
    }

    getTagsToDisplay(tags1, tags2) {
        const doNotDisplayTags = new Set([
            'cnn', 'fox', 'breitbart', 'huffington-post', 
            'washington-post', 'washington-times',
            'this', 'that', 'he', 'she', 'politics', 'false', 'true'
        ]);
        let arr = tags1.concat(tags2);
        arr = arr.filter(item => {
            return !doNotDisplayTags.has(item);
        }).sort();
        // only show a max of 5 tags
        let len = arr.length;
        len = len > 5 ? 5 : len;

        return arr.slice(0, len);
    }

    getImagesToDisplay(images1, images2, source1, source2) {
        let images = [];
        images = images1.map((item, idx) => {
            return (
                <Carousel.Item key={idx}>
                    <img 
                        onError={this.addDefaultImg}
                        src={item}
                        alt={source1}
                    />
                    <Carousel.Caption>
                        <p>{source1}</p>
                    </Carousel.Caption>
                </Carousel.Item>
            )
        });
        const curIdx = images.length + 1;

        images = images.concat(
            images2.map((item, idx) => {
                return (
                    <Carousel.Item key={idx + curIdx} >
                        <img 
                            onError={this.addDefaultImg}
                            className="img-fluid"
                            src={item}
                            alt={source2}
                        />
                        <Carousel.Caption>
                            <p>{source2}</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                )
            })
        );
        return images;
    }

    addDefaultImg = (event) => {
        event.target.src = DefaultImage;
    }
    handleAccordion = async () => {
        //check if we've already checked for comments before (in cache/state):
        let pid = this.props.article_data._id;
        let sid = this.props.article_data.similar_articles[0]._id;
        if(this.state.comments.length === 0){//empty -> not filled with comments from previous API call
            let article_group_comments = await commentService.getComments(pid, sid);
            if(article_group_comments){
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    comments: article_group_comments.group_comments
                });
            }       
        }
    }
    //get called within CommentSection
    postComment = (pid, sid, comment) => {
        //we want to just add this comment to the specific document with the below pid and sid
        //so we'll send all this data then the service worker will extract pid sid, and the comment data
        //do a look up on pid-sid, then append its array (update) with the comment data in this json
        var d = new Date();
        var time_data = String(d.getMonth())+"/"+String(d.getDate())+"/"+String(d.getFullYear());
        var comment_data = {
            "primary_id": pid,
            "secondary_id": sid,
            "group_comments": [
                {
                "user": "Anonymous",
                "profilePic": "https://bootdey.com/img/Content/user_1.jpg",
                "time": time_data,
                "text": comment
                }
            ]
        };
        commentService.addComment(comment_data);
        //then append to this.state.comments so the change gets reflected
        this.setState({
            comments: this.state.comments.concat([comment_data.group_comments[0]])
        });
    }
    render() {
        return (
            <div className="container grouped-articles shadow bg-light rounded">
                <div className="row justify-content-center">
                    <Carousel interval={null} slide={false} >
                        {this.state.images.map((img) => img)}
                    </Carousel>
                </div>
                {this.state.tags.map((t, idx) => {
                    return (
                        <span key={idx} className="badge badge-secondary">#{t}</span>
                    )
                })}
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
                    <div className="container bg-white">
                        <Accordion>
                            <Card>
                                <Card.Header>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={this.handleAccordion}>
                                        Discussion
                                    </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <CommentSection comments={this.state.comments} pid={this.props.article_data._id} sid={this.props.article_data.similar_articles[0]._id} postComment={this.postComment} />
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </div>
                </div>
                
            </div>
        )
    }
}

export default ArticleGroup;
