// some helpful code for firebase interaction taken from https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial

import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navigation from '../Navigation';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import HomePage from '../../App.js';
//import AccountPage from '../Account';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

class Routing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userAuth: null,
    };
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(userAuth => {
      userAuth ? this.setState({ userAuth }) : this.setState({ userAuth: null });
    });
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return(
      <Router>
        <div>
          <Navigation userAuth={this.state.userAuth} />
          <hr/>
          <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
          <Route path={ROUTES.SIGN_IN} component={SignInPage} />
          <Route path={ROUTES.HOME} component={HomePage} />
        </div>
      </Router>
    );
  }
}
export default withFirebase(Routing);
