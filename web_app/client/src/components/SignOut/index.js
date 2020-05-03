import React from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router-dom';
import {compose} from 'recompose';
import { HOME } from '../../constants/routes'

const signOut = (props) => {
  props.firebase.doSignOut()
  props.history.push(HOME);
}

const SignOutButton = (props) => (
  <div onClick={ e => signOut(props)}>
    Sign Out
  </div>
);

const SignOutBase = compose(
  withRouter,
  withFirebase,
)(SignOutButton);

export default SignOutBase;

