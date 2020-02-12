import React, { Component } from 'react'
import { Nav, Navbar, Form, FormControl, Button }  from 'react-bootstrap'

class MainNavbar extends Component {
    render() {
        return (
            <Navbar collapseOnSelect expand="sm" bg="red-blue-gradient" variant="dark">
                <Navbar.Brand href="/">PURPLE</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#about">About</Nav.Link>
                    </Nav>
                    <Form inline>
                        <FormControl type="text" placeholder="Search" className="mr-auto" />
                        <Button variant="outline-info">Search</Button>
                    </Form>
                </Navbar.Collapse>

            </Navbar>
        )
    }
}

export default MainNavbar;