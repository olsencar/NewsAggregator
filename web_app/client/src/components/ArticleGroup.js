import React, { Component } from 'react';
import Article from './Article';
import CommentSection from './CommentSection'
import commentService from './../services/commentService';
import votesService from './../services/votesService';
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Carousel  from 'react-bootstrap/Carousel'
import DefaultImage from '../assets/onErrorFallback.png'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        const chosenArticle = this.props.article_data.most_similar_article;

        //for comment section to use when inserting a new comment (taking with it the most udpated vote vals)
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data : chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle,
            leftVotes: 0,
            rightVotes: 0,
            leftVotesPressed: false,
            rightVotesPressed: false,
            comments: [], //cache -> set upon accordion click,
            accordionShowing: false,
            similarity_score: chosenArticle.similarity_score,
            tags: this.getTagsToDisplay(this.props.article_data.tags, chosenArticle.tags),
            images: this.getImagesToDisplay(this.props.article_data.images, chosenArticle.images, this.props.article_data.source_name, chosenArticle.source_name)
        };
    }
    //on component render
    loadVotes = async () => {
        let pid = this.props.article_data._id;
        let sid = this.props.article_data.most_similar_article._id;
        let vote_group = await votesService.getVotes(pid, sid);
        if(vote_group){
            this.setState({
                //use service worker to get comments on mongodb lookup
                leftVotes: vote_group.left_votes,
                rightVotes: vote_group.right_votes
            });
        }
    }

    //on upvote press
    handleUpvotes = async (side) => {
        let pid = this.props.article_data._id;
        let sid = this.props.article_data.most_similar_article._id;
        if(side === "left"){
            if(!this.state.leftVotesPressed){
                //update local state
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    leftVotes: +this.state.leftVotes+1,
                    leftVotesPressed: true,
                },        //state is updated asynchronously, so add updated value
                () => votesService.addVotes(pid, sid, +this.state.leftVotes, +this.state.rightVotes)
                );
            } else{//if is pressed -> undo upvote
                //update local state
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    leftVotes: +this.state.leftVotes-1,
                    leftVotesPressed: false,
                },        //state is updated asynchronously, so add updated value
                () => votesService.removeVotes(pid, sid, +this.state.leftVotes, +this.state.rightVotes)
                );
            }
        }
        else if(side === "right"){
            if(!this.state.rightVotesPressed){
                //update local state
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    rightVotes: +this.state.rightVotes+1,
                    rightVotesPressed: true,
                },        //state is updated asynchronously, so add updated value
                () => votesService.addVotes(pid, sid, +this.state.rightVotes, +this.state.rightVotes)
                );
            } else{//if is pressed -> undo upvote
                //update local state
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    rightVotes: +this.state.rightVotes-1,
                    rightVotesPressed: false,
                },        //state is updated asynchronously, so add updated value
                () => votesService.removeVotes(pid, sid, +this.state.rightVotes, +this.state.rightVotes)
                );
            }
        }

    }

    //loaded upon component load
    componentDidMount() {
        this.loadVotes();
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

        let tags = new Set(tags1.concat(tags2));
        
        let arr = [];

        for (const tag of tags.values()) {
            if (!doNotDisplayTags.has(tag.toLowerCase())) {
                arr.push(tag);
            }
        }
        arr.sort();

        return arr.slice(0, 5);
    }

    getImagesToDisplay(images1, images2, source1, source2) {
        let images = [];
        images = images1.map((item, idx) => {
            if (idx < 3) {
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
            }
        });
        const curIdx = images.length + 1;

        images = images.concat(
            images2.map((item, idx) => {
                if (idx < 3) {
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
                }
            })
        );
        return images;
    }

    addDefaultImg = (event) => {
        event.target.src = DefaultImage;
    }

    //run on accordion expansion
    handleAccordion = async () => {
        // Only fetch comments when user opens the accordion
        if (!this.state.accordionShowing) {
            //check if we've already checked for comments before (in cache/state):
            let pid = this.props.article_data._id;
            let sid = this.props.article_data.most_similar_article._id;
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
        // keep track of if the accordion is showing or not
        this.setState({
            accordionShowing: !this.state.accordionShowing
        });
    }
    //get called within CommentSection
    postComment = (pid, sid, comment) => {
        //we want to just add this comment to the specific document with the below pid and sid
        //so we'll send all this data then the service worker will extract pid sid, and the comment data
        //do a look up on pid-sid, then append its array (update) with the comment data in this json
        var d = new Date();
        var comment_data = {
            "primary_id": pid,
            "secondary_id": sid,
            "group_comments": [
                {
                    "user": this.props.authUser.displayName,
                    "uid": this.props.authUser.uid,
                    "profilePic": this.props.authUser.photoUrl,
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
        let leftUpvoteButton;
        let rightUpvoteButton;
        //change/rerender upvote button if its already been pressed
        if(this.state.leftVotesPressed){
            leftUpvoteButton = <button type="button" className="btn btn-secondary leftupvote-clicked triangle-up" onClick={() => this.handleUpvotes("left")}>⇧</button>
        }
        else{//not pressed
            leftUpvoteButton = <button type="button" className="btn btn-primary leftupvote-unclicked triangle-up" onClick={() => this.handleUpvotes("left")}>⇧</button>
        }
        //change/rerender upvote button if its already been pressed
        if(this.state.rightVotesPressed){
            rightUpvoteButton = <button type="button" className="btn btn-secondary rightupvote-clicked triangle-up" onClick={() => this.handleUpvotes("right")}>⇧</button>
        }
        else{//not pressed
            rightUpvoteButton = <button type="button" className="btn btn-primary rightupvote-unclicked triangle-up" onClick={() => this.handleUpvotes("right")}>⇧</button>
        }
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
                            <div>
                                <div id="number" className="p-3 mb-2 bg-info text-white votes" >{this.state.leftVotes}</div>
                                {leftUpvoteButton}
                            </div>
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
                            <div>
                                <div id="number" className="p-3 mb-2 bg-info text-white votes" >{this.state.rightVotes}</div>
                                {rightUpvoteButton}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="row justify-content-center bg-white">
                    <div className="col no-padding">
                        <Accordion>
                            <Card>
                                <Card.Header>
                                    <Accordion.Toggle as={Button} variant="link" eventKey="0" onClick={this.handleAccordion}>
                                        Comments
                                    </Accordion.Toggle>
                                </Card.Header>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <CommentSection comments={this.state.comments} authUser={this.props.authUser} pid={this.props.article_data._id} sid={this.props.article_data.most_similar_article._id} postComment={this.postComment} />
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
