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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null,
      loading: false,
      article_data: []
    };
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser ? this.setState({ authUser }) : this.setState({ authUser: null });
    });
    this.getRecentArticles();
  }

  componentWillUnmount() {
    this.listener();
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

  render() {
    return (
      <AuthUserContext.Provider value={this.state.authUser}>
        <Router>
          <div>
            <MainNavbar search={this.search} loading={this.state.loading} />
            <Route exact path={ROUTES.HOME} render={(props) => <HomePage {...props} 
              article_data={this.state.article_data} 
              authUser={this.state.authUser}
              loading={this.state.loading} /> } 
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
