import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import PrivateRoute from './components/routes/PrivateRoute';
import AppNavbar from './components/navbar/AppNavbar';
import Home from './components/Home';
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
          <PrivateRoute exact path="/documents" component={Documents} />
          <Route path="/" component={NotFound} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
