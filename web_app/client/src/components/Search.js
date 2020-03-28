import React, { Component } from 'react';
import { FormControl, InputGroup }  from 'react-bootstrap'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            typingTimeout: 0,
            searchText: ''
        }
    }

    checkForEnter = (e) => {
        if (e.key === "Enter") {
            this.props.search(this.state.searchText);
        }
    }

    handleChange = (e) => {
        const searchTerm = e.target.value;
        this.setState({
            searchText: e.target.value
        });
        
        if (this.state.typingTimeout) clearTimeout(this.state.typingTimeout);
        this.state.typingTimeout = setTimeout(() => {
            this.props.search(searchTerm);
        }, 300);
        
    }

    render() {
        return (
            <InputGroup>
                <FormControl type="text" className="searchTerm" placeholder="Search..." onChange={e => this.handleChange(e)} onKeyPress={e => this.checkForEnter(e)} value={this.state.searchText} />
                <InputGroup.Append>
                    <button type="submit" className="searchButton" onClick={e => this.props.search(this.state.searchText)}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
}

export default Search;