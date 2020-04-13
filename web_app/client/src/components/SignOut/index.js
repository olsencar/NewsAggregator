import React from 'react';
import { withFirebase } from '../Firebase';
import { withRouter } from 'react-router-dom';
import {compose} from 'recompose';

const signOut =  (props) => {
  props.firebase.doSignOut();
  props.history.push('/');
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

