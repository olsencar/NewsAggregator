import React, { Component } from 'react';
import { Container, Row, Col, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import { FirebaseContext } from './Firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';


const Profile = () => (
    <div>
        <FirebaseContext.Consumer>
            {firebase => <ProfilePage authUser={firebase.auth.currentUser} firebase={firebase} />}
        </FirebaseContext.Consumer>
    </div>
);

class ProfilePage extends Component  {
    constructor(props) {
        super(props);
        this.state = {
            displayName: '',
            password: '',
            confirmPassword: '',
            currentPassword: '',
            errMessage: ''
        }
    }

    handleDisplayNameChange = (e) => {
        this.setState({
            displayName: e.target.value
        });
    }

    handlePasswordChange = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    changePassword = async (e) => {
        const err = await this.props.firebase.doPasswordUpdate(this.state.currentPassword, this.state.password);
        if (err) {
            this.setState({
                errMessage: err
            });
        }
    }

    changeDisplayName = (e) => {
        this.props.firebase.doUpdateDisplayName(this.state.displayName);
    }

    displayNameForm = () => {
        if (this.props.authUser.displayName) {
            return (
                <div>
                    <label htmlFor='displayNameInput'>Display Name</label>
                    <InputGroup controlId='displayNameForm.ControlInput'>
                        <FormControl type='text' id='displayNameInput' placeholder='Change your display name' onChange={this.handleDisplayNameChange} value={this.state.displayName} autoComplete='new-username' />
                    </InputGroup>
                    {
                        this.state.displayName.length > 0 ? (
                            <Button onClick={this.changeDisplayName} variant="primary" type="submit">
                                Update
                            </Button>
                        ) : null
                    }
                </div>
            );
        } else {
            return (
                <div>
                    <label htmlFor='displayNameInput'>Display Name</label>
                    <InputGroup className='mb-3'>
                        <FormControl type='text' id='displayNameInput' placeholder='Enter your display name' onChange={this.handleDisplayNameChange} value={this.state.displayName} autoComplete='new-username' />
                    </InputGroup>
                    {
                        this.state.displayName.length > 0 ? (
                            <Button onClick={this.changeDisplayName} variant="primary" type="submit">
                                Update
                            </Button>
                        ) : null
                    }
                </div>
            )
        }
    };

    changePasswordForm = () => {
        return (
            <div>
                <label htmlFor='password-input'>Password</label>
                <InputGroup className='mb-3'>
                    <FormControl type='password' placeholder='Change your password' onChange={this.handlePasswordChange} value={this.state.password} autoComplete='new-password' isInvalid={this.state.password.length < 6} />
                    <FormControl.Feedback type='invalid'>Password must be longer than 6 characters.</FormControl.Feedback>
                </InputGroup>
                {
                    this.state.password.length >= 6 ? (
                        <>
                            <InputGroup className='mb-3'>
                                <FormControl type='password' placeholder='Confirm Password' onChange={(e) => this.setState({confirmPassword: e.target.value})} value={this.state.confirmPassword} isValid={this.state.password === this.state.confirmPassword} />
                            </InputGroup>
                            <InputGroup className='mb-3'>
                                <FormControl type='password' placeholder='Current Password' onChange={(e) => this.setState({currentPassword: e.target.value})} value={this.state.currentPassword} />
                            </InputGroup>
                        </>
                    ) : null
                }
                {
                    this.state.password.length >= 6 
                    && this.state.password === this.state.confirmPassword
                    && this.state.currentPassword.length > 0 ? (
                        <Button variant="primary" type="submit" onClick={this.changePassword}>
                            Change Password
                        </Button>
                    ) : null
                }
                {this.state.errMessage}
            </div>
        );
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col><h3>Hi, {this.props.authUser.displayName || this.props.authUser.email}</h3></Col>
                </Row>
                <Row>
                    <Col>
                        {this.displayNameForm()}
                    </Col>
                </Row>
                <Row>
                    <Col>{this.changePasswordForm()}</Col>
                </Row>
            </Container>
        );
    }
}

export default Profile;
export { ProfilePage };