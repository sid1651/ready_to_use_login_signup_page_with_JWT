import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContent = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(false);

  axios.defaults.withCredentials=true;


  const getAuthState=async()=>{
    try{
       const {data}=await axios.get(backendUrl+'/is-auth');
       if(data.success){
        setIsLoggedin(true)
        getUserData()
       }
    }catch(error){
      toast.error(error.message)
    }
  }
useEffect(()=>{
getAuthState();
 },[])
  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/data')
      data.success ? setUserData(data.userData) : toast.error(error.message)
    } catch (error) {
      toast.error(data.message)
    }
  }




 


  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData
  };

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  );
};
