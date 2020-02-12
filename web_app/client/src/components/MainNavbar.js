import React, { Component } from 'react'
import { Navbar, FormControl, InputGroup }  from 'react-bootstrap'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class MainNavbar extends Component {
    // <Nav className="mr-auto">
    //     <Nav.Link href="#about">About</Nav.Link>
    // </Nav>
    render() {
        return (
            <Navbar collapseOnSelect sticky="top" expand="sm" bg="red-blue-gradient" variant="dark">
                <Navbar.Brand href="/">PURPLE</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
                    <div className="wrap">
                        <div className="search-container">
                            <InputGroup>
                                <FormControl type="text" className="searchTerm" placeholder="Search" />
                                <InputGroup.Append>
                                    <button type="submit" className="searchButton">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </button>
                                </InputGroup.Append>
                            </InputGroup>
                        </div>
                    </div>
                </Navbar.Collapse>

            </Navbar>
        )
    }
}

export default MainNavbar;