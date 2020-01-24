import React, { Component } from 'react'
import Article from './Article'

class ArticleGroup extends Component {
    constructor(props) {
        super(props);
        let similarArticles = this.props.data.similar_articles;
        let chosenArticle = similarArticles[0];
        for (let i = 0; i < similarArticles.length; i++) {
            if (similarArticles[i].bias !== this.props.data.bias) {
                chosenArticle = similarArticles[i];
                break;
            }
        }
        this.state = {
            leftArticle: this.props.data.bias <= chosenArticle.bias ? this.props.data :chosenArticle,
            rightArticle: this.props.data.bias > chosenArticle.bias ? this.props.data : chosenArticle
        };
    }

    getImageToDisplay() {
        let leftImages = this.state.leftArticle.images;
        let rightImages = this.state.rightArticle.images;
        let maxWidth = 0;
        let imgToKeep = new Image();
        for (let i = 0; i < leftImages.length; i++) {
            let img = new Image();
            img.src = leftImages[i];
            if (img.naturalWidth > maxWidth) {
                maxWidth = img.naturalWidth;
                imgToKeep = img;
            }
        }
        for (let i = 0; i < rightImages.length; i++) {
            let img = new Image();
            img.src = rightImages[i];
            if (img.naturalWidth > maxWidth) {
                maxWidth = img.naturalWidth;
                imgToKeep = img;
            }
        }
        console.log(imgToKeep.src);
        return imgToKeep;
    }

    render() {
        let img = this.getImageToDisplay();
        
        if (img.naturalWidth > 350) {
            return (
                <div className="container grouped-articles">
                    <div className="row">
                        <img src={img.src} className="article-grp-img" alt="..."></img>
                    </div>
                    <div className="row">
                        <div className="col left-article article-container">
                            <Article key={0} title={this.state.leftArticle.title} 
                                content={this.state.leftArticle.description}
                                source={this.state.leftArticle.source_name}
                                bias={this.state.leftArticle.bias}
                                link={this.state.leftArticle.orig_link}
                                published={this.state.leftArticle.publish_date} />
                        </div>
                        <div className="col right-article article-container">
                            <Article key={1} title={this.state.rightArticle.title}
                                content={this.state.rightArticle.description}
                                source={this.state.rightArticle.source_name}
                                bias={this.state.rightArticle.bias}
                                link={this.state.rightArticle.orig_link}
                                published={this.state.rightArticle.publish_date} />
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="container grouped-articles">
                    <div className="row">
                        <div className="col left-article article-container">
                            <Article key={0} title={this.state.leftArticle.title}
                                image={this.state.leftArticle.images[0]}
                                content={this.state.leftArticle.description}
                                source={this.state.leftArticle.source_name}
                                bias={this.state.leftArticle.bias}
                                link={this.state.leftArticle.orig_link}
                                published={this.state.leftArticle.publish_date} />
                        </div>
                        <div className="col right-article article-container">
                            <Article key={1} title={this.state.rightArticle.title}
                                image={this.state.rightArticle.images[0]}
                                content={this.state.rightArticle.description}
                                source={this.state.rightArticle.source_name}
                                bias={this.state.rightArticle.bias}
                                link={this.state.rightArticle.orig_link}
                                published={this.state.rightArticle.publish_date} />
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default ArticleGroup;