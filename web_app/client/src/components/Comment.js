import React, { Component } from 'react'

class Comment extends Component {
    render() {
      return (
        <li className="media">
            <img className="mr-3" src={this.props.profilePic} alt=""></img>
            <div className="media-body">
                <span className="text-muted float-right">
                    <small className="text-muted">{this.props.time}</small>
                </span>
                <strong className="text-success mt-0">{this.props.user}</strong>
                <p>
                    {this.props.text}
                </p>
            </div>
        </li> 
      );
    }
}

export default Comment;