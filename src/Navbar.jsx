import React from 'react';
import { NavLink } from 'react-router-dom';
import './index1.css';
import HomeIcon from '@material-ui/icons/Home';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import InfoIcon from '@material-ui/icons/Info';
import LaptopIcon from '@material-ui/icons/Laptop';

const Navbar=()=>{
    return (
        <div className="container-fluid nav_bg ">
        <div className='row'>
          <div className="col-10 mx-auto">
         
        <nav className="navbar navbar-expand-lg navbar-dark n  ">
      
        <NavLink exact  className="navbar-brand" to="/">
      
        Codingyaan</NavLink>
        <button className="navbar-toggler" type="button" data-toggle="collapse" 
        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" 
        aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item active">
              <NavLink activeClassName="menu_active" className="nav-link" to="/">
               <HomeIcon></HomeIcon> Home 
               </NavLink>
            </li>
            <li className="nav-item">
              <NavLink activeClassName="menu_active" className="nav-link" to="/courses">
              <LaptopIcon></LaptopIcon>  Courses</NavLink>
            </li>
            <li className="nav-item">
              <NavLink  activeClassName="menu_active"className="nav-link" to="/about">
              <InfoIcon></InfoIcon>  About</NavLink>
            </li>
            <li className="nav-item">
            <NavLink  activeClassName="menu_active"className="nav-link" to="/contact">
            <ContactMailIcon></ContactMailIcon>  Contact</NavLink>
          </li>
          </ul>
          
        </div>
      </nav>
      </div>
      </div>
      </div>
    );
};


export default Navbar;