import axios from 'axios';
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ better than react-router
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setnewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmited, setIsOtpSubmited] = useState(false);

  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);
  const inputRef = useRef([]);
  axios.defaults.withCredentials = true;

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    const pastedArray = pasted.split('');
    pastedArray.forEach((char, index) => {
      if (inputRef.current[index]) {
        inputRef.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send_reset-otp', { email });
      data.success ? toast.success(data.message) : toast.error(data.message);
      if (data.success) setIsEmailSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };


  const onSubmitOtp=async(e)=>{
    e.preventDefault();
    const otpArray=inputRef.current.map(e=>e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmited(true)
  }

  const onSubmitNewPassword=async(e)=>{
    e.preventDefault();
    try{
      const {data}=await axios.post(backendUrl+'/api/auth/reset-password' , {email,otp,newPassword})
      data.success?toast.success(data.message):toast.error(data.message)
      data.success&&navigate('/login')
    }catch(error){
      toast.error(error.message)
    }

  }

  return (
    <div className="reset">
      {!isEmailSent && (
        <form id="form1" onSubmit={onSubmitEmail}>
          <h1>Reset password</h1>
          <p>Enter your email to receive OTP</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {!isOtpSubmited && isEmailSent && (
        <form onSubmit={onSubmitOtp}id="form2">
          <h1>Email verify OTP</h1>
          <p>Enter the 6 digit code sent to your email</p>
          <div className="enter" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  required
                  className="input"
                  ref={(el) => (inputRef.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
          </div>
          <button type="submit" className="otpbtn">
            Submit
          </button>
        </form>
      )}

      {isOtpSubmited && isEmailSent && (
        <form  onSubmit={onSubmitNewPassword}id="form3">
          <h1>Enter new password</h1>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setnewPassword(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
