import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";
import Intro from './components/Intro';
import Spring from './components/Spring';
import Kotlin from './components/Kotlin';
import Python from './components/Python';
import Redmine from './components/Redmine';
import Github from './components/Github';

//const fs = require('fs');

function App() {
  return (
    <Router>
      <div class="sidebar">
        <ul>
          <li><Link to="/">Intro</Link></li>
          <li><Link to="/Spring/">Spring (블로그)</Link></li>
          <li><Link to="/Kotlin/">Kotlin (투두리스트)</Link></li>
          <li><Link to="/Python/">Python <br></br>(집 값 예측, 챗 봇)</Link></li>
          <li><Link to="/Redmine/">Redmine</Link></li>
          <li><Link to="/Github/">Github</Link></li>
        </ul>
      </div>
     <Route exact path="/" component={Intro} />
     <Route path="/Spring/" component={Spring} />
     <Route path="/Kotlin/"  component={Kotlin} />
     <Route path="/Python/"  component={Python} />
     <Route path="/Redmine/"  component={Redmine} />
     <Route path="/Github/"  component={Github} />
   </Router>
  );
}

/*
Router(BrowserRouter) (부모)
Route (자식)
exact: path가 완전 일치할 때만 표시(중복방지)
component: 표시하고자 하는 컴포넌트
Link 태그로 비동기 처리 (SPA)
*/

export default App;
