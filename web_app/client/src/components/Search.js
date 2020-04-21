import React, { Component } from 'react';
import { InputGroup }  from 'react-bootstrap'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            typingTimeout: 0,
            searchText: ''
        }

        this.searchForm = React.createRef();
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
        
        this.setState({
            typingTimeout: setTimeout(() => {
                this.props.search(searchTerm);
            }, 300)
        });
        
    }

    formFocus = (e) => {
        console.log("Focusing");
        this.searchForm.current.focus();
    }

    render() {
        return (
            <form className="my-auto search-form">
                <InputGroup>
                <input type="text" className="form-control border border-right-0" placeholder="Search..." 
                    value={this.state.searchText}
                    onChange={this.handleChange} 
                    onKeyDown={this.checkForEnter}/>
                <span className="input-group-append">
                    <button className="btn btn-outline-light border border-left-0" type="button">
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </span>
                </InputGroup>
            </form>
        );
    }
}

export default Search;