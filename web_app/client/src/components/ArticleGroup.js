import React, { Component } from 'react';
import Article from './Article';
import Img from 'react-image';
import CommentSection from './CommentSection'
import commentService from './../services/commentService';
import {Helmet} from "react-helmet"; //needed to add scripts for the accordion drop down comment section

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
    //READ THIS:
    //This is the function that is triggered when you click the accordion button, it is what sets the state.comments for the <CommentSection ...> to then load from
    //This does the API call to fetch the comment data (using promises with the 'await' I think? so the rest of the code waits?) then once done it Sets State.
    //This set state will then trigger re-render for this component and its children (<CommentSection> -> <Comment> etc.)
    //Issue: Clicking the accordion, which dynamically fetches and stores data (handleAccordion), sets the state correctly (verified with console.log's), but then
    //the re-rendered comment section gets [] as the comments instead of the new state.comments ..??? its not like its rendering BEFORE the set state occurs since the 
    //set state is what triggers the re-render in the first place? Very confused rn, anyways im starving so im gonna go get some food.
    handleAccordion = async () => {
        //check if we've already checked for comments before (in cache/state):
        let pid = this.props.article_data._id;
        let sid = this.props.article_data.similar_articles[0]._id;
        if(this.state.comments.length === 0){//empty -> not filled with comments from previous API call
            let article_group_comments = await commentService.getComments(pid, sid);
            console.log(article_group_comments);
            if(article_group_comments){
                console.log('about to set comments');   
                this.setState({
                    //use service worker to get comments on mongodb lookup
                    comments: article_group_comments.group_comments
                });
            }       
        }
    }

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
                "user": "anonymous",
                "profilePic": "https://bootdey.com/img/Content/user_1.jpg",
                "time": time_data,
                "text": comment
                }
            ]
        };
        commentService.addComment(comment_data);
        //clear input field
        //then append to this.state.comments so the change gets reflected
        this.setState({
            comments: this.state.comments.concat([comment_data.group_comments[0]])
        });
    }
    render() {
        console.log("rendering article group");
        console.log(this.state.comments);
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
                <Helmet>
                    <link href="https://fonts.googleapis.com/css?family=Roboto:400,500|Open+Sans" rel="stylesheet"></link>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"></link>
                    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
                </Helmet>
                <div className="container bg-white">
                    <div className="accordion" id="accordionExample">
                        <div className="card">
                            <div className="card-header" id="headingOne">
                                <h2 className="mb-0">
                                    <button type="button" className="btn btn-link" onClick={this.handleAccordion} data-toggle="collapse" data-target={"#collapse-"+this.props.key_id} >Discussion</button>									
                                </h2>
                            </div>
                            <div id={"collapse-"+this.props.key_id} className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                <div className="card-body">
                                    <CommentSection comments={this.state.comments} pid={this.props.article_data._id} sid={this.props.article_data.similar_articles[0]._id} postComment={this.postComment} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;
