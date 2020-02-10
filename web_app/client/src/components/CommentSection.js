import React, { Component } from 'react'
import Comment from './Comment'
import commentService from './../services/commentService';

class CommentSection extends Component {
    constructor(props) {
        super(props);
        this.commentText = React.createRef();
    }

    postComment = () => {
        this.props.postComment(this.props.pid, this.props.sid, this.commentText.current.value);
        //clear input field
        this.commentText.current.value = "";
    }
    
    render() {
        console.log("rendering comment section");
        console.log(this.props.comments);
        return (
          <div className="row bootstrap snippets">
              <div className="col-md-11">
                  <div className="comment-wrapper">
                      <div className="panel panel-info">
                          <div className="panel-body">
                              <textarea className="form-control" ref={this.commentText} placeholder="write a comment..." rows="3"></textarea>
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