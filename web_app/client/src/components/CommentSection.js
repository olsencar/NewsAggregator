import React, { Component } from 'react'

class CommentSection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: []
        };
    }

    render() {
        return (
          <div className="App container bg-light shadow">
            <header className="App-header">
              <h1 className="App-title">
                Comments
                <span className="px-2" role="img" aria-label="Chat">
                  💬
                </span>
              </h1>
            </header>

            <div className="row">
              <div className="col-4  pt-3 border-right">
                <h6>Say something</h6>
                {/* Comment Form Component */}
              </div>
              <div className="col-8  pt-3 bg-white">
                {/* Comment List Component */}
              </div>
            </div>
          </div>
        );
      }
    }

    export default CommentSection;