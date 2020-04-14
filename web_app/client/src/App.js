import React, { Component } from 'react';
import HomePage from './components/HomePage';
import * as ROUTES from './constants/routes';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { withFirebase } from './components/Firebase';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { AuthUserContext } from './components/Session';
import MainNavbar from './components/MainNavbar';
import articleService from './services/articleService';
import ProfilePage from './components/Profile';
import userService from './services/userService';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: false,
      article_data: [],
      userInfo: null
    };
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser ? this.setState({ authUser }, () => this.getUserInfo()) : this.setState({ authUser: null, userInfo: null });
    });
    this.getRecentArticles();
  }

  componentWillUnmount() {
    this.listener();
  }

  getUserInfo = async () => {
    const res = await userService.getUser(this.state.authUser.uid);
    this.setState({
      userInfo: res
    });
  }
  
  PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => (
      this.state.authUser
        ? <Component {...props} />
        : <Redirect to={ROUTES.SIGN_IN} />
    )} />
  )

  search = async (searchTerm) => {
    if (searchTerm === "") {
      this.getRecentArticles();
      return;
    }

    this.setState(
      {
        loading: true
      }
    );
    let res = await articleService.search(searchTerm);
    this.setState(
      {
        loading: false,
        article_data: res
      }
    );
  };

  getRecentArticles = async () => {
    this.setState({
      loading: true,
    });
    let res = await articleService.getRecentArticles();
    this.setState({
      loading: false,
      article_data: res
    });
  };

  handleUpvote = (pid, sid, voteDirection) => {

    this.setState(oldState => {
      let foundVote = false;
      const newUserInfo = {...oldState.userInfo};
      
      const newUpvotes = oldState.userInfo.upvotes.map((vote) => {
        if (vote.primary_id === pid && vote.secondary_id === sid) {
          vote.voteDirection = voteDirection;
          foundVote = true;
        } 
        return vote;
      });

      if (!foundVote) {
        newUpvotes.push({
          primary_id: pid,
          secondary_id: sid,
          voteDirection: voteDirection
        });
      }

      newUserInfo.upvotes = newUpvotes;

      return {
        userInfo: newUserInfo
      }
    }, () => userService.upvote(this.state.authUser.uid, 
      pid, 
      sid, 
      voteDirection
    ));
  }

  render() {
    return (
      <AuthUserContext.Provider value={this.state.authUser}>
        <Router>
          <div>
            <MainNavbar search={this.search} loading={this.state.loading} />
            <Route exact path={ROUTES.HOME} render={(props) => <HomePage {...props} 
              article_data={this.state.article_data} 
              authUser={this.state.authUser}
              loading={this.state.loading}
              upvotes={this.state.userInfo ? this.state.userInfo.upvotes : null}
              handleUpvote={this.handleUpvote} /> } 
            />
            <Route path={ROUTES.SIGN_UP} component={SignUp} />
            <Route path={ROUTES.SIGN_IN} component={SignIn} />
            <Route path={ROUTES.PASSWORD_FORGET} component={SignIn} />
            <this.PrivateRoute path={ROUTES.PROFILE_PAGE} component={ProfilePage} />
          </div>
        </Router>
      </AuthUserContext.Provider>
    )
  }
}

export default withFirebase(App);
