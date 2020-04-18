import React, {Component} from 'react';
import {Link, withRouter, useHistory} from 'react-router-dom';
import {FirebaseContext, withFirebase} from '../Firebase';

import * as ROUTES from '../../constants/routes';


const ResetPasswordPage = () => (
  <div className="reset-container">
    <h1>Reset Password</h1>
    <ResetPasswordForm />
  </div>
);

const INITIAL_STATE = {
  email: '',
  error: null,
};

class ResetPasswordFormBase extends Component {
  state = {
    note: ''
  }

  onClick = () => {
    this.setState({
      note: 'Please check the email that you used to register in order to reset your password.'
    })
  }

  constructor(props) {
    super(props);

    this.state = {...INITIAL_STATE};
  }

  onSubmit = event => {
    const {email} = this.state;

    this.props.firebase
      .doPasswordReset(email).then(() => {
        this.setState({...INITIAL_STATE});

        //this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({error});
      });

    event.preventDefault();
  };

  onChange = event => {
    this.setState({[event.target.name]: event.target.value});
    //this.props.history.push(ROUTES.HOME);
  };

  render() {
    const {email, error, note, showNote} = this.state;

    const isInvalid = email === '';

    return (
      <form className="reset-form" onSubmit={this.onSubmit}>
        <input
          name="email"
          value={this.state.email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <button type="submit" className="resetB" className="btn btn-primary" id="reset-submit" onClick={this.onClick}>
          Reset Password
        </button>
        <p>{this.state.note}</p>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const ResetLink = () => (
  <p>
    Forgot Password? <Link to={ROUTES.PASSWORD_FORGET}>Reset Password</Link>
  </p>
);

export default withRouter(ResetPasswordPage);

const ResetPasswordForm = withRouter(withFirebase(ResetPasswordFormBase));

export {ResetPasswordForm, ResetLink};
