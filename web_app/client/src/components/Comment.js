import React, { Component } from 'react'
import Media from 'react-bootstrap/Media'

class Comment extends Component {
    render() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const commentTime = new Date(this.props.time).toLocaleString("en-US")
      return (
        <Media as="li">
            <img
              width={64}
              height={64}
              className="mr-3"
              src={this.props.profilePic}
              alt=""
            />
            <div className="text-left">
              <strong className="text-success mt-0">{this.props.user}</strong>
              <span className="text-muted float-right">
                  &nbsp;
                  <small className="text-muted">{commentTime}</small>
              </span>
              <p>
                  {this.props.text}
              </p>
            </div>
        </Media> 
      );
    }
}

export default Comment;