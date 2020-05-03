import React, { Component } from "react";
import Article from "./Article";
import CommentSection from "./CommentSection";
import commentService from "./../services/commentService";
import votesService from "./../services/votesService";
import { Accordion, Card, Button, Carousel, Alert } from "react-bootstrap";
import DefaultImage from "../assets/onErrorFallback.png";
import userService from "../services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleUp } from "@fortawesome/free-solid-svg-icons";

class ArticleGroup extends Component {
  constructor(props) {
    super(props);
    //for comment section to use when inserting a new comment (taking with it the most udpated vote vals)
    this.state = {
      leftVotes: 0,
      rightVotes: 0,
      comments: [], //cache -> set upon accordion click,
      accordionShowing: false,
      showAlert: false
    };
  }

  componentDidMount() {
    this.loadVotes(this.props.pid, this.props.sid)
  }


  componentDidUpdate(prevProps, prevState) {
    if (this.props.pid !== prevProps.pid || this.props.sid !== prevProps.sid) {
      this.loadVotes(this.props.pid, this.props.sid);
    }
  } 

  //on upvote press
  handleUpvotes = async (side) => {
    if (!this.props.authUser) {
      // Don't let them upvote
      this.setState({
        showAlert: true,
      });
      return;
    }

    if (side === "left") {
      if (this.props.voteDirection > -1) {
        this.updateVotes(-1, 1, this.props.voteDirection === 1 ? -1 : 0);
      } else {
        //if is pressed -> undo upvote
        this.updateVotes(0, -1, 0);
      }
    } else if (side === "right") {
      if (this.props.voteDirection < 1) {
        this.updateVotes(1, this.props.voteDirection === -1 ? -1 : 0, 1);
      } else {
        //if is pressed -> undo upvote
        this.updateVotes(0, 0, -1);
      }
    }
  };

  loadVotes = async (pid, sid) => {
    const vote_group = await votesService.getVotes(pid, sid);

    if (vote_group) {
      this.setState({
        leftVotes: vote_group.left_votes,
        rightVotes: vote_group.right_votes
      });
    } else {
      this.setState({
        leftVotes: 0,
        rightVotes: 0
      });
    }
  };

  updateVotes(voteDirection, addToLeft, addToRight) {
    const pid = this.props.pid;
    const sid = this.props.sid;

    this.setState(oldState => ({
      leftVotes: oldState.leftVotes + addToLeft,
      rightVotes: oldState.rightVotes + addToRight
    }), () => votesService.addVotes(pid, 
      sid, 
      this.state.leftVotes,
      this.state.rightVotes
    ));
    
    this.props.upvote(this.props.id, voteDirection);
  }

  getImagesToDisplay() {
    return this.props.images.map((item, idx) => {
      if (idx < 3) {
        return (
          <Carousel.Item key={idx}>
            <img onError={this.addDefaultImg} src={item.src} alt={item.sourceName} />
            <Carousel.Caption>
              <p>{item.sourceName}</p>
            </Carousel.Caption>
          </Carousel.Item>
        );
      }
    });
  }

  addDefaultImg = (event) => {
    event.target.src = DefaultImage;
  };

  //run on accordion expansion
  handleAccordion = async () => {
    // Only fetch comments when user opens the accordion
    if (!this.state.accordionShowing) {
      //check if we've already checked for comments before (in cache/state):
      let pid = this.props.pid;
      let sid = this.props.sid;

      if (this.state.comments.length === 0) {
        //empty -> not filled with comments from previous API call
        let article_group_comments = await commentService.getComments(pid, sid);
        if (article_group_comments) {
          this.setState({
            //use service worker to get comments on mongodb lookup
            comments: article_group_comments.group_comments,
          });
        }
      }
    }
    // keep track of if the accordion is showing or not
    this.setState({
      accordionShowing: !this.state.accordionShowing,
    });
  };
  //get called within CommentSection
  postComment = async (pid, sid, comment) => {
    //we want to just add this comment to the specific document with the below pid and sid
    //so we'll send all this data then the service worker will extract pid sid, and the comment data
    //do a look up on pid-sid, then append its array (update) with the comment data in this json
    let comment_data = {
      primary_id: pid,
      secondary_id: sid,
      group_comments: [
        {
          user: this.props.authUser.displayName,
          uid: this.props.authUser.uid,
          profilePic: this.props.authUser.photoUrl,
          text: comment,
        },
      ],
    };

    const commentDataUser = {
      primary_id: pid,
      secondary_id: sid,
      comment: comment,
    };

    
    userService.addComment(this.props.authUser.uid, commentDataUser);
    const resp = await commentService.addComment(comment_data);
    
    if (resp) {
      comment_data.group_comments[0].time = resp.commentTime;
    } else {
      console.error("Unable to add comment");
    }
    //then append to this.state.comments so the change gets reflected
    this.setState(oldState => ({
      comments: oldState.comments.concat([comment_data.group_comments[0]]),
    }));
  };

  alertNotSignedIn = () => {
    if (this.state.showAlert) {
      return (
        <Alert
          variant="danger"
          onClose={() => this.setState({ showAlert: false })}
          dismissible
        >
          You need to be signed in to vote!
        </Alert>
      );
    }
    return null;
  };

  render() {
    let leftUpvoteButton;
    let rightUpvoteButton;
    //change/rerender upvote button if its already been pressed
    if (this.props.voteDirection === -1) {
      leftUpvoteButton = (
        <FontAwesomeIcon className='upvote-button-left' onClick={() => this.handleUpvotes('left')} icon={faArrowAltCircleUp} color='rgb(20,90,188)' size='3x' />
      );
    } else {
      //not pressed
      leftUpvoteButton = (
        <FontAwesomeIcon className='upvote-button-left' onClick={() => this.handleUpvotes('left')} icon={faArrowAltCircleUp} color='grey' size='3x' />
      );
    }
    //change/rerender upvote button if its already been pressed
    if (this.props.voteDirection === 1) {
      rightUpvoteButton = (
        <FontAwesomeIcon className='upvote-button-right' onClick={() => this.handleUpvotes('right')} icon={faArrowAltCircleUp} color='rgb(188,23,12)' size='3x' />
      );
    } else {
      //not pressed
      rightUpvoteButton = (
        <FontAwesomeIcon className='upvote-button-right' onClick={() => this.handleUpvotes('right')} icon={faArrowAltCircleUp} color='grey' size='3x' />
      );
    }
    
    return (
      <div>
        {this.alertNotSignedIn()}
        <div className="container grouped-articles shadow bg-light rounded">
          <div className="row justify-content-center">
            <Carousel interval={null} slide={false}>
              {this.getImagesToDisplay()}
            </Carousel>
          </div>
          {this.props.tags.map((t, idx) => {
            return (
              <span key={idx} className="badge badge-secondary">
                #{t}
              </span>
            );
          })}
          <div className="row">
            <div className="card-deck-wrapper">
              <div className="card-deck">
                <div>
                  <div
                    id="number"
                    className="p-3 mb-2 mt-2 bg-info text-white votes"
                  >
                    {this.state.leftVotes}
                  </div>
                  {leftUpvoteButton}
                </div>
                <Article
                  key={0}
                  title={this.props.leftArticle.title}
                  content={this.props.leftArticle.description}
                  source={this.props.leftArticle.source_name}
                  bias={this.props.leftArticle.bias}
                  link={this.props.leftArticle.orig_link}
                  published={this.props.leftArticle.publish_date}
                />

                <Article
                  key={1}
                  title={this.props.rightArticle.title}
                  content={this.props.rightArticle.description}
                  source={this.props.rightArticle.source_name}
                  bias={this.props.rightArticle.bias}
                  link={this.props.rightArticle.orig_link}
                  published={this.props.rightArticle.publish_date}
                />
                <div>
                  <div
                    id="number"
                    className="p-3 mb-2 mt-2 bg-info text-white votes"
                  >
                    {this.state.rightVotes}
                  </div>
                  {rightUpvoteButton}
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center bg-white">
            <div className="col no-padding">
              <Accordion>
                <Card>
                  <Card.Header>
                    <Accordion.Toggle
                      as={Button}
                      variant="link"
                      eventKey="0"
                      onClick={this.handleAccordion}
                    >
                      Comments
                    </Accordion.Toggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="0">
                    <Card.Body>
                      <CommentSection
                        comments={this.state.comments}
                        authUser={this.props.authUser}
                        pid={this.props.pid}
                        sid={this.props.sid}
                        postComment={this.postComment}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ArticleGroup;
