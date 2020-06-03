import React from "react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Main from "../src/components/Main/Main";
import ConsultRequire from "./components/ConsultRequire/ConsultRequire";
import Test from "./components/Supermarket/Test";
import Signup from "../src/components/User/Signup";
import SignupDetail from "../src/components/User/SignupDetail";
import Login from "../src/components/User/Login";
import Matching from "../src/components/Matching/Matching";
import ConsultDetail from "../src/components/Common/ConsultDetail";
import PortfolioDetail from "../src/components/Portfolio/PortfolioDetail";
import PortfolioWrite from "../src/components/Portfolio/PortfolioWrite";
import Stylist from "./components/Stylist/Stylist";
import Chatting from "./components/Chatting/Chatting";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Main} exact />
          <Route path="/consult" component={ConsultRequire} exact />
          <Route path="/test" component={Test} />
          <Route path="/signup" component={Signup} exact />
          <Route path="/signup/detail" component={SignupDetail} exact />
          <Route path="/login" component={Login} />
          <Route path="/match" component={Matching} />
          <Route path="/consult/detail" component={ConsultDetail} />
          <Route path="/portfolio/write" component={PortfolioWrite} />
          <Route path="/portfolio/:portfolioNo" component={PortfolioDetail} />
          <Route path="/stylist" component={Stylist} />
          <Route path="/chatting" component={Chatting} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
