import React, { Component } from 'react'
import Comment from './Comment';

class CommentSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commentText: ''
        };
    }

    postComment = () => {
        if (this.props.authUser) {
            this.props.postComment(this.props.pid, this.props.sid, this.state.commentText);
        } else {
            console.error('User is not logged in');
        }
        //clear input field
        this.setState({
            commentText: ''
        });
    }

    updateCommentText = (text) => {
        this.setState({
            commentText: text.target.value
        });
    }

    render() {
        return (
            <div className="row justify-content-center">
                <div className="col no-padding">
                    <div className="comment-wrapper">
                        <div className="panel panel-info">
                            <div className="panel-body">
                                {this.props.authUser ? (
                                    <div>
                                        <textarea className="form-control" value={this.state.commentText} onChange={e => this.updateCommentText(e)} placeholder="Write a comment..." rows="3"></textarea>
                                        <button type="button" className="btn btn-dark float-left" onClick={this.postComment}>Post</button>
                                    </div>
                                ) : "Log in to comment!"
                                }
                                <div className="clearfix"></div>
                                <hr></hr>
                                <ul className="media-list">
                                    {
                                        this.props.comments.map((comment, index) => {
                                            return <Comment key={index} user={comment.user} time={comment.time} text={comment.text} profilePic={comment.profilePic} />
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CommentSection;
