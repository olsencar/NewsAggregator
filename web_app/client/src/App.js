import React, { Component } from 'react';

import HomePage from './components/HomePage';
import * as ROUTES from './constants/routes';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { withFirebase } from './components/Firebase';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { AuthUserContext } from './components/Session';
import MainNavbar from './components/MainNavbar';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: null
    };
  }

  componentDidMount() {
    console.log(this.props);
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser ? this.setState({ authUser }) : this.setState({ authUser: null });
    });
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <AuthUserContext.Provider value={this.state.authUser}>
        <Router>
          <div>
            <MainNavbar authUser={this.state.authUser} />
            <Route exact path={ROUTES.HOME} component={HomePage} />
            <Route path={ROUTES.SIGN_UP} component={SignUp} />
            <Route path={ROUTES.SIGN_IN} component={SignIn} />
            <Route path={ROUTES.PASSWORD_FORGET} component={SignIn} />
          </div>
        </Router>
      </AuthUserContext.Provider>
    )
  }
}

export default withFirebase(App);
