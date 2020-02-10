import React, { Component } from 'react';
import Article from './Article';
import CommentSection from './CommentSection'
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Carousel  from 'react-bootstrap/Carousel'
import DefaultImage from '../onErrorFallback.png'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        const chosenArticle = this.props.article_data.most_similar_article;
        this.state = {
            leftArticle: this.props.article_data.bias <= chosenArticle.bias ? this.props.article_data : chosenArticle,
            rightArticle: this.props.article_data.bias > chosenArticle.bias ? this.props.article_data : chosenArticle,
            tags: this.getTagsToDisplay(this.props.article_data.tags, chosenArticle.tags),
            images: this.getImagesToDisplay(this.props.article_data.images, chosenArticle.images, this.props.article_data.source_name, chosenArticle.source_name)
        };
    }

    componentWillReceiveProps(newProps) {
        const chosenArticle = newProps.article_data.most_similar_article;

        this.setState({
            leftArticle: newProps.article_data.bias <= chosenArticle.bias ? newProps.article_data : chosenArticle,
            rightArticle: newProps.article_data.bias > chosenArticle.bias ? newProps.article_data : chosenArticle,
            tags: this.getTagsToDisplay(newProps.article_data.tags, chosenArticle.tags),
            images: this.getImagesToDisplay(newProps.article_data.images, chosenArticle.images, newProps.article_data.source_name, chosenArticle.source_name)
        });
    }

    getTagsToDisplay(tags1, tags2) {
        const doNotDisplayTags = new Set([
            'cnn', 'fox', 'breitbart', 'huffington-post', 
            'washington-post', 'washington-times',
            'this', 'that', 'he', 'she', 'politics', 'false', 'true'
        ]);
        let arr = tags1.concat(tags2);
        arr = arr.filter(item => {
            return !doNotDisplayTags.has(item);
        }).sort();
        // only show a max of 5 tags
        let len = arr.length;
        len = len > 5 ? 5 : len;

        return arr.slice(0, len);
    }

    getImagesToDisplay(images1, images2, source1, source2) {
        let images = [];
        images = images1.map((item, idx) => {
            return (
                <Carousel.Item key={idx}>
                    <img 
                        onError={this.addDefaultImg}
                        src={item}
                        alt={source1}
                    />
                    <Carousel.Caption>
                        <p>{source1}</p>
                    </Carousel.Caption>
                </Carousel.Item>
            )
        });
        const curIdx = images.length + 1;

        images = images.concat(
            images2.map((item, idx) => {
                return (
                    <Carousel.Item key={idx + curIdx} >
                        <img 
                            onError={this.addDefaultImg}
                            className="img-fluid"
                            src={item}
                            alt={source2}
                        />
                        <Carousel.Caption>
                            <p>{source2}</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                )
            })
        );
        return images;
    }

    addDefaultImg = (event) => {
        event.target.src = DefaultImage;
    }

    render() {
        return (
            <div className="container grouped-articles shadow bg-light rounded">
                <div className="row justify-content-center">
                    <Carousel interval={null} slide={false} >
                        {this.state.images.map((img) => img)}
                    </Carousel>
                </div>
                {this.state.tags.map((t, idx) => {
                    return (
                        <span key={idx} className="badge badge-secondary">#{t}</span>
                    )
                })}
                <div className="row">
                    <div className="card-deck-wrapper">
                        <div className="card-deck">
                            <Article key={0} title={this.state.leftArticle.title}
                                content={this.state.leftArticle.description}
                                source={this.state.leftArticle.source_name}
                                bias={this.state.leftArticle.bias}
                                link={this.state.leftArticle.orig_link}
                                published={this.state.leftArticle.publish_date} />
                            <Article key={1} title={this.state.rightArticle.title}
                                content={this.state.rightArticle.description}
                                source={this.state.rightArticle.source_name}
                                bias={this.state.rightArticle.bias}
                                link={this.state.rightArticle.orig_link}
                                published={this.state.rightArticle.publish_date} />
                        </div>
                    </div>
                </div>
                <div className="container bg-white">
                    <Accordion>
                      <Card>
                        <Card.Header>
                          <Accordion.Toggle as={Button} variant="Secondary" eventKey="0">
                            Discussion
                          </Accordion.Toggle>
                        </Card.Header>
                        <Accordion.Collapse eventKey="0">
                            <CommentSection comments={this.props.comment_data}/>
                        </Accordion.Collapse>
                      </Card>
                    </Accordion>
                </div>
            </div>
        )
    }
}

export default ArticleGroup;
