import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from "react-router-dom";
import Intro from './components/Intro';
import Golang from './components/Golang';
import Spring from './components/Spring';
import Kotlin from './components/Kotlin';
import Python from './components/Python';
import Terraform from './components/Terraform';
import Redmine from './components/Redmine';
import Github from './components/Github';

//const fs = require('fs');

function App() {
  return (
    <Router>
      <div class="sidebar">
        <ul>
          <li><Link to="/">Intro</Link></li>
          <li><Link to="/Golang/">Golang JWT</Link></li>
          <li><Link to="/Spring/">Spring Blog</Link></li>
          <li><Link to="/Kotlin/">Todo List</Link></li>
          <li><Link to="/Python/">ML<br></br>(집 값 예측)</Link></li>
          <li><Link to="/Terraform/">Terraform</Link></li>
          <li><Link to="/Redmine/">Redmine</Link></li>
          <li><Link to="/Github/">Github</Link></li>
        </ul>
      </div>
     <Route exact path="/" component={Intro} />
     <Route path="/Golang/" component={Golang} />
     <Route path="/Spring/" component={Spring} />
     <Route path="/Kotlin/"  component={Kotlin} />
     <Route path="/Python/"  component={Python} />
     <Route path="/Terraform/" component={Terraform} />
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
