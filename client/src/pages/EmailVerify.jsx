import axios from 'axios'
import React, { useRef,useContext, useEffect} from 'react'
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router'
import { toast } from 'react-toastify';


const EmailVerify = () => {
  const navigate=useNavigate()
  const inputRef = useRef([])
  axios.defaults.withCredentials=true;
const {backendUrl,isLoggedin,userData,getUserData}=useContext(AppContent)  
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRef.current.length - 1) {
      inputRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRef.current[index - 1].focus()
    }
  }

  const handelPast=(e)=>{
    const past=e.clipboardData.getDtata('text')
      const pastArray=past.split('')
    pastArray.forEach((char,index)=>{
      if(inputRef.current[index]){
        inputRef.current[index].value=char;
      }
    })
    
  }


  const onSubmitHandeler=async(e)=>{
    try{
      e.preventDefault();
      const otpArray=inputRef.current.map(e=>e.value)
      const otp=otpArray.join('')
      const {data}=await axios.post(backendUrl + '/api/auth/verify-account', { otp })

      if(data.success){
        toast.success(data.message)
        getUserData()
        navigate('/')
      }else{
        toast.error(data.message)
      }
    }catch(error){
      toast.error(error.message)
    }
  }
useEffect(()=>{
  isLoggedin&&userData&&userData.isAccountVerified&&navigate('/')
},[isLoggedin,userData])




  return (
    <div>
      <form  onSubmit={onSubmitHandeler}className="otp">
        <h1>Email verify OTP</h1>
        <p>Enter the 6 digit code sent to your email</p>
        <div className="enter" onPaste={handelPast}>
          {Array(6).fill(0).map((_, index) => (
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
        <button className="otpbtn">Verify email</button>
      </form>
    </div>
  )
}

export default EmailVerify
