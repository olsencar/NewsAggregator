import React, { Component } from "react";
import { Navbar, NavItem, Nav, Button } from "react-bootstrap";
import Search from "./Search";
import * as ROUTES from "../constants/routes";
import { Switch } from "react-router-dom";
import SignUpPage from "./SignUp/index";
import SignInPage from "./SignIn/index";
import { Link, Route } from "react-router-dom";
import "../App.css";
import { AuthUserContext } from "./Session";
import SignOut from "./SignOut";

const MainNavbar = () => (
    <AuthUserContext.Consumer>
        {(authUser) => (authUser ? <NavbarAuth /> : <NavbarNonAuth />)}
    </AuthUserContext.Consumer>
)

class NavbarAuth extends Component {
    render() {
      return (
        <Navbar
          collapseOnSelect
          sticky="top"
          expand="sm"
          bg="red-blue-gradient"
          variant="dark"
        >
          <Navbar.Brand href="/">PURPLE NEWS</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse
            id="responsive-navbar-nav"
            className="justify-content-center"
          >
            <Nav className='ml-auto'>
              <NavItem>
                <SignOut />
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      );
    }
  }


class NavbarNonAuth extends Component {
  render() {
    return (
      <Navbar
        collapseOnSelect
        sticky="top"
        expand="sm"
        bg="red-blue-gradient"
        variant="dark"
      >
        <Navbar.Brand href="/">PURPLE NEWS</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
          className="justify-content-center"
        >
          <Nav className='ml-auto'>
            <NavItem href={ROUTES.SIGN_IN}>
              <Nav.Link as={Link} to={ROUTES.SIGN_IN}>
                Log in
              </Nav.Link>
            </NavItem>
            <NavItem href={ROUTES.SIGN_UP}>
              <Nav.Link as={Link} to={ROUTES.SIGN_UP}>
                Register
              </Nav.Link>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default MainNavbar;
