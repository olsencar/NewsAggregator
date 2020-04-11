import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { AuthUserContext } from './Session';

const Profile = () => (
    <div>
        <AuthUserContext.Consumer>
            {authUser => <ProfilePage authUser={authUser} />}
        </AuthUserContext.Consumer>
    </div>
);

class ProfilePage extends Component  {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props.authUser);
        return (
            <Container>
                <Row>
                    <Col>Hi, {this.props.authUser.displayName || this.props.authUser.email}</Col>
                </Row>
            </Container>
        );
    }
}

export default Profile;
export { ProfilePage };