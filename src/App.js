import React,{useState} from 'react';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import "../node_modules/bootstrap/dist/js/bootstrap.bundle"
import {Switch,Route, Redirect} from 'react-router-dom';
import Home from './Home'
import About from './About'
import Courses from './Courses'
import Contact from './Contact'
import Navbar from './Navbar'
import {createGlobalStyle,ThemeProvider} from 'styled-components'

const GlobalStyle=createGlobalStyle`
body{
  background-color:${props=>props.theme.mode=='dark'?'#111':'#fff'};
  color:${props=>props.theme.mode==='dark'?'#fff':'#111'};
}

`;





const App=()=> {
  const[theme,setTheme]=useState({mode:'dark'})
  return (
    <ThemeProvider theme={theme}>
  
    <>
  <GlobalStyle />
    <Navbar />
    <Switch>
   <Route exact path="/" component={Home}></Route>
   <Route  exact path="/about" component={About}></Route>
   <Route  exact path="/courses" component={Courses}></Route>
   <Route  exact path="/contact" component={Contact}></Route>
   <Redirect to="/"></Redirect>
   </Switch>
   </>
   </ThemeProvider>
  
  );
}

export default App;
