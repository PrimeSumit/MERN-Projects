import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Register a new user
export const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login a user and generate JWT
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // console.log('Stored Password:', user.password);
        // console.log('Entered Password:', password);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password Valid:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true, // Prevents client-side access to the cookie
            sameSite: 'strict', // Protects against CSRF attacks
            secure: process.env.NODE_ENV !== 'development', // Only send over HTTPS in production
        });

        res.status(200).json({ token, message: 'Login successful' ,user: { id: user._id, name: user.name, email: user.email, role: user.role },});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Logout a user (JWT is stateless; we rely on client-side token deletion or blacklisting)
export const logoutUser = (req, res) => {
    try {
        if (!req.cookies.jwt) {
          return res.status(400).json({ message: "No active session to log out" });
        }
        res.cookie('jwt', '', {
            maxAge: 0, // Expire immediately
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
        });
        res.status(200).json({message:"logged out successfully"})
      } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" }); 
      }
    
};

