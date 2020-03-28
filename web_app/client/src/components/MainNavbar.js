import React, { Component } from 'react'
import { Navbar }  from 'react-bootstrap'
import Search from './Search';

class MainNavbar extends Component {

    render() {
        return (
            <Navbar collapseOnSelect sticky="top" expand="sm" bg="red-blue-gradient" variant="dark">
                <Navbar.Brand href="/">PURPLE NEWS</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
                    <div className="search-bar-wrapper">
                        <div className="search-container">
                            <Search search={this.props.search} />
                        </div>
                    </div>
                </Navbar.Collapse>

            </Navbar>
        )
    }
}

export default MainNavbar;