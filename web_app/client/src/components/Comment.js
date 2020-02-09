import React, { Component } from 'react'
import Media from 'react-bootstrap/Media'

class Comment extends Component {
    render() {
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
                <span className="text-muted float-right">
                    <small className="text-muted">{this.props.time}</small>
                </span>
                <strong className="text-success mt-0">{this.props.user}</strong>
                <p>
                    {this.props.text}
                </p>
            </div>
        </Media> 
      );
    }
}

export default Comment;