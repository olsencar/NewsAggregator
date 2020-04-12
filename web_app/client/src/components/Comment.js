import React, { Component } from 'react'
import Media from 'react-bootstrap/Media'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

class Comment extends Component {
    render() {
      const commentTime = new Date(this.props.time).toLocaleString("en-US")
      return (
        <Media as="li">
            <FontAwesomeIcon icon={faUser} size='lg' color='grey' />
            <div className="text-left ml-2">
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