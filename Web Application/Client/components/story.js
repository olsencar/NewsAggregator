import React, { Component } from 'react'

class Story extends Component {
    constructor() {
        super()
        this.state = {
            title: "Donald Trump Impeachment Hearing",
            description: "Today at the hearing, Donald Trump testified on behalf of himself...",
            origLink: "https://www.cnn.com/2019/11/16/politics/mark-sandy-deposition-impeachment-inquiry/index.html",
            publishDate: "2019-11-16"
        }
    }
    render() {
        return (
            <div className="story-container">
                <div className="story-title">{this.state.title}</div>
            <div className="story-desc">{this.state.description}</div>
                <div className="story-link-orig">
                    <a href={this.state.origLink}>Link to article</a>
                </div>
                <div className="story-publish-date">{this.state.publishDate}</div>
            </div>
        )
    }
}

export default Story;