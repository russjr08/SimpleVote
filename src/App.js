import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';

import Home from './routes/Home';
import Voter from './routes/Voter'

import './App.css';
import 'semantic-ui-css/semantic.min.css'

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Menu inverted>
            <Menu.Item header>
              <Link to="/">Simple Vote</Link>
            </Menu.Item>
          </Menu>

          <Route exact path="/" component={Home} />            
          <Route path="/session/:sessionKey" component={Voter} />

        </div>
      </Router>
    );
  }
}

export default App;
