// some helpful code for firebase interaction taken from https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial

import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {FirebaseContext} from '../Firebase';

import * as ROUTES from '../../constants/routes';

const SignUpPage = () => (
  <div className="sign-container">
    <h1>Sign Up</h1>
    <FirebaseContext.Consumer>
      {firebase => <SignUpForm firebase={firebase} />}
    </FirebaseContext.Consumer>
  </div>
);

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
};

class SignUpForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }
  onSubmit = (event) => {
    const {username, email, passwordOne} = this.state;
    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne, username)
      .then(authUser => {
        this.setState({ ...INITIAL_STATE });
        //this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({error});
      });
    event.preventDefault();
  };
  onChange = event => {
    this.setState({[event.target.name]: event.target.value});
  };
  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form className="sign-form" onSubmit={this.onSubmit}>
        <div>
          <input
            className="sign"
            name="username"
            value={username}
            onChange={this.onChange}
            type="text"
            placeholder="Full Name"
          />
        </div>
        <div>
          <input
            className="sign"
            name="email"
            value={email}
            onChange={this.onChange}
            type="text"
            placeholder="Email"
          />
        </div>
        <div>
          <input
            className="sign"
            name="passwordOne"
            value={passwordOne}
            onChange={this.onChange}
            type="password"
            placeholder="Password"
          />
        </div>
        <div>
          <input
            className="sign"
            name="passwordTwo"
            value={passwordTwo}
            onChange={this.onChange}
            type="password"
            placeholder="Confirm Password"
          />
        </div>
        <button disabled={isInvalid} type="submit" className="sign" className="btn btn-primary" id="sign-submit">Sign Up</button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

//const SignUpForm = withRouter(withFirebase(SignUpFormBase));

export default SignUpPage;
export {SignUpForm, SignUpLink};
