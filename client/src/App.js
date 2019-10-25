import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import Documents from './components/Documents';
import NotFound from './components/NotFound';

import './App.css';

function App() { 
  return (
    <div className="App">
      <BrowserRouter>
        <AppNavbar />
        <Switch>
          <Route exact path="/" component={Home} />
          {/* bypass authentication while still developing */}
          {/* <PrivateRoute path="/documents" component={Documents} /> */}
          <Route path="/documents" component={Documents}/>
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
