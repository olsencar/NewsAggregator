import React, { Component } from "react";
import { Navbar, NavItem, Nav, NavDropdown } from "react-bootstrap";
import Search from "./Search";
import * as ROUTES from "../constants/routes";
import { Link } from "react-router-dom";
import "../App.css";
import { AuthUserContext } from "./Session";
import SignOut from "./SignOut";
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MainNavbar = (props) => (
  <AuthUserContext.Consumer>
    {(authUser) => (authUser ? <NavbarAuth {...props} authUser={authUser} /> : <NavbarNonAuth {...props} />)}
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
        <div className="d-flex flex-grow-1">
          <Navbar.Brand href="/">PURPLE NEWS</Navbar.Brand>
          <Search search={this.props.search} />
        </div>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
        >
          <Nav className='ml-auto'>
            <NavDropdown title={<FontAwesomeIcon icon={faUserCircle} size='lg' />} id='account-dropdown' alignRight>
              <NavDropdown.Item as={Link} to={ROUTES.PROFILE_PAGE}>
                {this.props.authUser.displayName}
              </NavDropdown.Item> 
              <NavDropdown.Divider />
              <NavDropdown.Item>
                  <SignOut />
              </NavDropdown.Item>  
            </NavDropdown>
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
        <div className="d-flex flex-grow-1">
          <Navbar.Brand href="/">PURPLE NEWS</Navbar.Brand>
          <Search search={this.props.search} />
        </div>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse
          id="responsive-navbar-nav"
          className="justify-content-center"
        >
          <Nav className='ml-auto'>
            <NavItem href={ROUTES.SIGN_IN}>
              <Nav.Link as={Link} to={ROUTES.SIGN_IN}>
                Log In
              </Nav.Link>
            </NavItem>
            <NavItem href={ROUTES.SIGN_UP}>
              <Nav.Link as={Link} to={ROUTES.SIGN_UP}>
                Sign Up
              </Nav.Link>
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default MainNavbar;
