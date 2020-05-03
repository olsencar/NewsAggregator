import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';

const AboutUs = () => {
  return (
    <div className="about-container">
      <h1>About Purple News</h1>
        <p>As accessibility to online news sources increases, so does the extremity of confirmation
        bias and echo-chambers. Purple News was began and driven by a passion to fight these issues
        within modern media.</p>
        <p>Our bias information for each news source is taken from <a href="https://www.allsides.com/media-bias/media-bias-chart">this</a> media bias chart by AllSides.</p>
    </div>
  );
}

export default AboutUs;
