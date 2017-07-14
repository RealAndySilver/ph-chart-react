import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Home from './app/screens/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles.css';
import './assets/react-datepicker.css';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Home} />
  </Router>,
  document.getElementById('container')
);
