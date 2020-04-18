// some helpful code for firebase interaction taken from https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial

import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {FirebaseContext} from '../Firebase';
import {compose} from 'recompose';
import {SignUpLink} from '../SignUp';
import {ResetLink} from '../ForgotPassword';
import {withFirebase} from '../Firebase';
import * as ROUTES from '../../constants/routes';

const SignInPage = () => (
  <div className="sign-container">
    <h1>Sign In</h1>
    <FirebaseContext.Consumer>
      {firebase => <SignInForm firebase={firebase} />}
    </FirebaseContext.Consumer>
    <SignUpLink />
    <ResetLink />
  </div>
);

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }
  onSubmit = event => {
    const {email, password} = this.state;
    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });
    event.preventDefault();
  };
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };
  render() {
    const { email, password, error } = this.state;
    const isInvalid = password === '' || email === '';
    return (
      <form className="sign-form" onSubmit={this.onSubmit}>
        <div>
          <input
            className="sign"
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email"
            autoComplete='username'
          />
        </div>
        <div>
        <input
          className="sign"
          name="password"
          value={password}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
          autoComplete='current-password'
        />
        </div>
        <div>
        <button disabled={isInvalid} type="submit" className="sign" className="btn btn-primary" id="sign-submit">
          Sign In
        </button>
        </div>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}
const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);

export default SignInPage;
export { SignInForm };
