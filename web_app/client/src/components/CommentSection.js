import React, { Component } from 'react'
import Comment from './Comment'

class CommentSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commentText: ''
        };
    }

    postComment = () => {
        this.props.postComment(this.props.pid, this.props.sid, this.state.commentText);
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
                              <textarea className="form-control" value={this.state.commentText} onChange={e => this.updateCommentText(e)} placeholder="Write a comment..." rows="3"></textarea>
                              <br></br>
                              <button type="button" className="btn btn-info float-right" onClick={this.postComment}>Post</button>
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