// some helpful code for firebase interaction taken from https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SignOutButton from '../SignOut';
import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';

const Navigation = ({userAuth}) => (
  <div>{userAuth ? <NavigationAuth /> : <NavigationNonAuth />}</div>
);

class NavigationAuth extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false,
    }
    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();

    this.setState({ showMenu: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  }

  closeMenu() {
    this.setState({ showMenu: false }, () => {
      document.removeEventListener('click', this.closeMenu);
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.showMenu}>
          User Options
        </button>
        {
          this.state.showMenu ? (
          <ul>
            <li>
              <SignOutButton />
            </li>
          </ul>
      )
      : (
        null
      )
    }
    </div>
  );
  }
}

class NavigationNonAuth extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false,
    }
    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();

    this.setState({ showMenu: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  }

  closeMenu() {
    this.setState({ showMenu: false }, () => {
      document.removeEventListener('click', this.closeMenu);
    });
  }

  render() {
    return(
      <div>
        <button onClick={this.showMenu}>
          User Options
        </button>
        {
          this.state.showMenu ? (
          <ul>
            <li>
              <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
            </li>
            <li>
              <Link to={ROUTES.SIGN_IN}>Sign In</Link>
            </li>
          </ul>
      )
      : (
        null
      )
    }
    </div>
  );
  }

}

export default Navigation;
