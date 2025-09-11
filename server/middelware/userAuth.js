import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    console.log("📥 [AUTH MIDDLEWARE] Checking token...");
    const { token } = req.cookies;
    console.log("🍪 [AUTH MIDDLEWARE] Token from cookies:", token);

    if (!token) {
        console.log("❌ [AUTH MIDDLEWARE] No token found");
        return res.json({ success: false, message: "not authorised. login again" });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ [AUTH MIDDLEWARE] Token decoded:", tokenDecode);

        if (!req.body) req.body = {}; // ✅ Prevent undefined body error
        req.body.userId = tokenDecode.id;
        console.log("✅ [AUTH MIDDLEWARE] userId set in req.body:", req.body.userId);

        next();
    } catch (error) {
        console.error("🔥 [AUTH MIDDLEWARE] Error:", error.message);
        res.json({ success: false, message: 'invalid token' });
    }
};

export default userAuth;
