import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../config/model/userModel.js';
import transporter from "../config/nodemailer.js";

// ================= REGISTER =================
export const register = async (req, res) => {
    console.log("📥 [REGISTER] Incoming request body:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        console.log("❌ [REGISTER] Missing details");
        return res.json({ success: false, message: 'missing Details' });
    }

    try {
        console.log("🔍 [REGISTER] Checking existing user...");
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            console.log("⚠️ [REGISTER] User already exists:", existingUser);
             return res.json({ success: false, message: 'user already exist' });
        }

        console.log("🔐 [REGISTER] Hashing password...");
        const hashedpassword = await bcrypt.hash(password, 10);

        console.log("🆕 [REGISTER] Creating new user...");
        const user = new userModel({ name, email, password: hashedpassword });
        await user.save();
        console.log("✅ [REGISTER] User saved:", user);

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log("🔑 [REGISTER] JWT generated:", token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("🍪 [REGISTER] Cookie set successfully");

        console.log("📧 [REGISTER] Sending welcome email to:", email);
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Hi, welcome",
            text: `Welcome ${name}, it is nice to welcome you!`
        });
        console.log("✅ [REGISTER] Email sent");

        res.json({
            success: true,
            message: 'User registered successfully',
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        console.error("🔥 [REGISTER] Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// ================= LOGIN =================
export const login = async (req, res) => {
    console.log("📥 [LOGIN] Request body:", req.body);

    const { email, password } = req.body;
    if (!email || !password) {
        console.log("❌ [LOGIN] Missing email or password");
        return res.json({ success: false, message: 'email and password are required' });
    }

    try {
        console.log("🔍 [LOGIN] Checking user...");
        const user = await userModel.findOne({ email });
        if (!user) {
            console.log("❌ [LOGIN] Invalid user");
            return res.json({ success: false, message: 'invalid user' });
        }

        console.log("🔐 [LOGIN] Comparing password...");
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ [LOGIN] Invalid password");
            return res.json({ success: false, message: 'invalid password' });
        }

        console.log("✅ [LOGIN] Password matched");
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log("🔑 [LOGIN] Token generated:", token);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        console.log("🍪 [LOGIN] Cookie set successfully");

        return res.json({ success: true });

    } catch (error) {
        console.error("🔥 [LOGIN] Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// ================= LOGOUT =================
export const logout = async (req, res) => {
    console.log("📥 [LOGOUT] Clearing token cookie...");
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        console.log("✅ [LOGOUT] Logged out");
        return res.json({ success: true, message: "logged out" });
    } catch (error) {
        console.error("🔥 [LOGOUT] Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// ================= SEND OTP =================
export const sendVerifyOtp = async (req, res) => {
    console.log("📥 [SEND OTP] Request body:", req.body);
    try {
        const { userId } = req.body;
        console.log("🔍 [SEND OTP] userId:", userId);

        const user = await userModel.findById(userId);
        console.log("✅ [SEND OTP] User found:", user);

        if (user.isAccountVerified) {
            console.log("⚠️ [SEND OTP] Account already verified");
            return res.json({ success: false, message: "Account already verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        console.log("🔢 [SEND OTP] Generated OTP:", otp);

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        console.log("✅ [SEND OTP] OTP saved to user:", user);

        console.log("📧 [SEND OTP] Sending email...");
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Account verification OTP",
            text: `Your OTP is ${otp}. Verify your account with this OTP.`
        });
        console.log("✅ [SEND OTP] Email sent");

        res.json({ success: true, message: "OTP verification mail has been sent" });

    } catch (error) {
        console.error("🔥 [SEND OTP] Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// ================= VERIFY EMAIL =================
export const verifyEmail = async (req, res) => {
    console.log("📥 [VERIFY EMAIL] Request body:", req.body);

    const { userId, otp } = req.body;
    console.log('userId is also coming', userId, 'otp is coming', otp);

    if (!userId || !otp) {
        console.log("❌ [VERIFY EMAIL] Missing details");
        return res.json({ success: false, message: 'Missing Details' });
    }

    try {
        console.log("🔍 [VERIFY EMAIL] Finding user...");
        const user = await userModel.findById(userId);
        if (!user) {
            console.log("❌ [VERIFY EMAIL] User not found");
            return res.json({ success: false, message: "user not found" });
        }

        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            console.log("❌ [VERIFY EMAIL] Invalid OTP");
            return res.json({ success: false, message: "invalid otp" });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            console.log("❌ [VERIFY EMAIL] OTP expired");
            return res.json({ success: false, message: 'otp expired' });
        }

        console.log("✅ [VERIFY EMAIL] OTP valid");
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        console.log("✅ [VERIFY EMAIL] Account verified successfully");

        return res.json({ success: true, message: "otp verified successfully" });

    } catch (error) {
        console.error("🔥 [VERIFY EMAIL] Error:", error);
        return res.json({ success: false, message: error.message });
    }
};
  

export const isAuthenticated=async(req,res)=>{
    try{
return res.json({success:true})
    }catch(error){
        register.json({success:false,message:error.message})
    }
}


export const sendResetOtp=async(req,res)=>{
const {email}=req.body;
if(!email){
    return res.json({success:false,message:'email is required'})
}
try{
const user=await userModel.findOne({email})
if(!user){
    return res.json({success:false,message:'user not found'})
}
const otp = String(Math.floor(100000 + Math.random() * 900000));
        console.log("🔢 [SEND OTP] Generated OTP:", otp);

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15  * 60 * 1000;
        await user.save();
        console.log("✅ [SEND OTP] OTP saved to user:", user);

        console.log("📧 [SEND OTP] Sending email...");
        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "password reset otp",
            text: `Your OTP for reseting your password ${otp}. `

            
        });
        return res.json({success:true,message:'pasword reset otp'})
}catch(error){
    res.json({success:false,message:error.message})
}
}




export const resetPassword=async(req,res)=>{
    const {email,otp,newPassword}=req.body;
    if(!email||!otp||!newPassword){
        return res.json({success:false,message:'otp password and email is required'})
    }

    try{
const user=await userModel.findOne({email});

if(user.resetOtp===""||user.resetOtp!==otp){
    return res.json({success:false,message:'invalid otp'})
}


if(user.resetOtpExpireAt<Date.now()){
    return res.json({success:false,message:"otp Expierd"})
}

const hashedPassword=await bcrypt.hash(newPassword,10)
user.password=hashedPassword;
user.resetOtp="";
user.resetOtpExpireAt=0;
await user.save();
return res.json({success:true,message:'password has been suceesfully reset'})
    }catch(error){
return res.json({success:false,message:error.message})
    }
}