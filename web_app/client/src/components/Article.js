import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBalanceScaleLeft, faBalanceScaleRight, faBalanceScale } from '@fortawesome/free-solid-svg-icons';

class Article extends Component {
    getPartyColor(bias) {
        switch (bias) {
            case -2:
                return "far-left";
            case -1:
                return "left";
            case 1:
                return "right";
            case 2:
                return "far-right";
            default:
                return "mid";
        }
    };

    getScale = (bias) => {
        if (bias < 0) {
            return <FontAwesomeIcon icon={faBalanceScaleLeft} color='#145abc' />;
        } else if (bias > 0) {
            return <FontAwesomeIcon icon={faBalanceScaleRight} color='#bc170c' />;
        } else {
            return <FontAwesomeIcon icon={faBalanceScale} />;
        }
    }

    removeHTMLFromString = (html) => {
        let elem = document.createElement('div');
        elem.innerHTML = html;
        const text = elem.textContent;
        elem.textContent = '';
        return text;
    }

    render() {
        return (
            <div className="article card bg-light rounded">
                <div className="card-body">
                    <h5 className="card-title"><a className="card-title-a" href={this.props.link} target="_blank" rel="noopener noreferrer">{this.removeHTMLFromString(this.props.title)}</a></h5>
                    <p className="card-text">{this.removeHTMLFromString(this.props.content)}</p>
                </div>
                <div className="card-footer text-muted">
                    <span className='card-link'>{this.getScale(this.props.bias)}</span>
                    <span className="card-link banner-source">{this.props.source}</span>
                    <span className="card-link">{this.props.published.substr(0,10)}</span>
                </div>
            </div>

        )
    }
}

export default Article;
