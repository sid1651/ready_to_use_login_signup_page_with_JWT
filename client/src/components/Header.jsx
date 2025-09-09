import React, { useContext } from 'react';
import { AppContent } from '../context/AppContext';


const Header = () => {
  const {userData}=useContext(AppContent)
  console.log(userData.name)
  return (
    <header className="header">
      <div className="header-content">
        <h1>Hey {userData?userData.name:'Devoloper'}</h1>
        
        <h1>Welcome to Our Platform 🚀</h1>
        
        <p>
          Discover amazing features, connect with people, and unlock endless possibilities. 
          Experience a new way to interact in the digital world.
        </p>
        <button className="get-started">Get Started</button>
      </div>
      <div className="header-image">
        <img  className="logo" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuyK9oaIYnSWqW3waOIj14bUudBZ_8KoWIlw&s" alt="loding..."/>
      </div>
    </header>
  );
};

export default Header;
