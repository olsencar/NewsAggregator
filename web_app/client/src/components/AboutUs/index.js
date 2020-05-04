import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import { Card, Container, Col, Row } from 'react-bootstrap';

const AboutUs = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col md="9">
          <Card className="shadow">
            <Card.Body>
              <Card.Title>About Purple News</Card.Title>
              <hr />
              <Card.Text>
                As accessibility to online news sources increases, so does the extremity of confirmation
                bias and echo-chambers. Popular media outlets intentionally bias content for user satisfaction.
                Purple News was began and driven by a passion to fight these issues within modern media. Purple News
                scrapes popular news sites and couples politically polarized articles on the same topic for a simple, intuitive
                viewing experience. This allows the user to both visualize the bias in their news and expand their horizons
                in terms of the differing perspectives and ideas they take in.
                <br />
                <br />
                The bias level that we apply to each source is taken from <a href="https://www.allsides.com/media-bias/media-bias-chart" target="_blank" rel="noopener noreferrer">this</a> media bias chart by AllSides. Allsides has performed extensive research to determine the bias level of each of these sources.
              </Card.Text>
              <img src="https://www.allsides.com/sites/default/files/AllSidesMediaBiasChart_Version1.1_11.18.19.jpg" class="BiasChart"/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

  );
}

export default AboutUs;
