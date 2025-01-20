import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    // console.log('Cookies:', req.cookies);
    const token = req.cookies?.jwt; 
    if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Decoded Token:', decoded);
        req.user = decoded; 
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message); 
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied: Insufficient role permissions' });
        }
        next();
    };
};
