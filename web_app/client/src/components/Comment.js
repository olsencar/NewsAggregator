import React, { Component } from 'react'

class Comment extends Component {
    render() {
      return (
        <li className="media">
            <div className="media-body">
                <span className="text-muted pull-right">
                    <small className="text-muted">{this.props.time}</small>
                </span>
                <strong className="text-success">{this.props.user}</strong>
                <p>
                    {this.props.text}
                </p>
            </div>
        </li> 
      );
    }
}

export default Comment;