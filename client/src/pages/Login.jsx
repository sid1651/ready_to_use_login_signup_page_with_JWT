import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify'

const Login = () => {
    const navigate = useNavigate();
    const [state, setState] = useState("Sign Up")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { backendUrl, setIsLoggedin,getUserData } = useContext(AppContent)   // ✅ fixed naming

    const onSubmitHandler = async (e) => {
        
        try {
            console.log("Form submit:", { state, name, email, password, backendUrl });
            e.preventDefault()
            if (state === 'Sign Up') {
                
            axios.defaults.withCredentials=true;
                const { data } = await axios.post(
                    backendUrl + '/api/auth/register',
                    { name, email, password }
                )
                if (data.success) {
                    setIsLoggedin(true) 
                    getUserData()  // ✅ fixed naming
                    navigate('/')
                } else {
                    toast.error(error.message)
                }
            } else {
                const { data } = await axios.post(
                    backendUrl + '/api/auth/login',
                    { email, password }
                )
                if (data.success) {
                    setIsLoggedin(true)  
                    getUserData() // ✅ fixed naming
                    navigate('/')
                } else {
                    toast.error(error.message)
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    }

    return (
        <div className='login-page'>
            <div className='login-container'>
                {/* Logo */}
                <img
                    onClick={() => navigate('/')}
                    className='login-logo'
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuyK9oaIYnSWqW3waOIj14bUudBZ_8KoWIlw&s"
                    alt="logo"
                />

                {/* Header */}
                <div className='login-header'>
                    <h2 className='login-title'>{state === "Sign Up" ? "Create Account" : 'Login'}</h2>
                    <p className='login-subtitle'>{state === "Sign Up" ? "Create Your Account" : 'Login to Your Account!'}</p>
                </div>

                {/* Form */}
                <form className='login-form' onSubmit={onSubmitHandler}>
                    {state === 'Sign Up' && (
                        <div className='form-group'>
                            <img className='input-icon' src="https://img.icons8.com/ios-filled/50/000000/user.png" alt="Full Name" />
                            <input
                                onChange={e => setName(e.target.value)}
                                value={name}
                                className='form-input'
                                type="text"
                                placeholder='Full Name'
                                required
                            />
                        </div>
                    )}

                    <div className='form-group'>
                        <img className='input-icon' src="https://img.icons8.com/ios-filled/50/000000/new-post.png" alt="Email" />
                        <input
                            className='form-input'
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            type="email"
                            placeholder='Email Id'
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <img className='input-icon' src="https://img.icons8.com/ios-filled/50/000000/lock.png" alt="Password" />
                        <input
                            className='form-input'
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            type="password"
                            placeholder='Password'
                            required
                        />
                    </div>

                    <p className='forgot-password' onClick={() => navigate("/reset-password")}>Forgot Password?</p>
                    <button className='form-button' type="submit">{state}</button>

                    {state === 'Sign Up' ? (
                        <p className='toggle-text'>
                            Already have an Account?
                            <span className='toggle-link' onClick={() => setState('Login')}> Login here</span>
                        </p>
                    ) : (
                        <p className='toggle-text'>
                            Don't have an Account?
                            <span className='toggle-link' onClick={() => setState('Sign Up')}> Sign up here</span>
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Login
