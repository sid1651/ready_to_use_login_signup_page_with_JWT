import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContent);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(backendUrl + '/api/auth/logout');
            if (data.success) {
                setIsLoggedin(false);
                setUserData(false);
                navigate('/');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };


    const sendVerificartionOtp= async()=>{
        
            try{
            axios.defaults.withCredentials=true;

            const {data}=await axios.post(backendUrl+'/api/auth/send-verify-otp')

            if(data.success){
            navigate('/email-verify')
            toast.success(data.message)
            }else{
                toast.error(data.message)
            }
            }catch(error){
toast.error(error.message)
            }
            
        
    }
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="navbar">
            <img
                className="navbar-logo"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuyK9oaIYnSWqW3waOIj14bUudBZ_8KoWIlw&s"
                alt="loading..."
                onClick={() => navigate('/')}
            />

            <div className="navbar-right">
                {userData ? (
                    <div className="user-menu" ref={dropdownRef}>
                        <div className="avatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            {userData.name[0].toUpperCase()}
                        </div>
                        {isDropdownOpen && (
                            <ul className="dropdown">
                                {!userData.isAccountVerified && <li onClick={sendVerificartionOtp}>Verify Email</li>}
                                <li onClick={logout}>Logout</li>
                            </ul>
                        )}
                    </div>
                ) : (
                    <button className="login-btn" onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
