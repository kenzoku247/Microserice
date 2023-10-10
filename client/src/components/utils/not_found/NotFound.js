import React from 'react';
import { Link } from 'react-router-dom';


function NotFound(){
  return <div>
      <h1 class="text">404 Error Page</h1>
<p class="zoom-area">Oops! Looks like you got lost</p>
<section class="error-container">
  <span>4</span>
  <span><span class="screen-reader-text">0</span></span>
  <span>4</span>
</section>
<div class="link-container">
  <Link to="/dashboard" class="more-link">Go to home page</Link>
</div>
  </div>;
};

export default NotFound;
