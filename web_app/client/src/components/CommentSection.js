import React, { Component } from 'react'
import Comment from './Comment'
import commentService from './../services/commentService';

class CommentSection extends Component {
    constructor(props) {
        super(props);
        this.commentText = React.createRef();
        this.state = {
            comments: this.props.comments
        };
    }
    postComment = async () => {
        //we want to just add this comment to the specific document with the below pid and sid
        //so we'll send all this data then the service worker will extract pid sid, and the comment data
        //do a look up on pid-sid, then append its array (update) with the comment data in this json
        var d = new Date();
        var time_data = d.getDate();
        let comment_data = {
            "primary_id": this.props.pid,
            "secondary_id": this.props.sid,
            "user": "anonymous",
            "profilePic": "https://bootdey.com/img/Content/user_1.jpg",
            "time": time_data,
            "text": this.commentText //textbox ref'd in the component above
        };
        let article_group_comments = await commentService.addComment(comment_data);
    }
    render() {
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