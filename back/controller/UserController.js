const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/mailer');

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const { CLIENT_URL } = require('../config'); // frontend address used in email links

// Accepts only a normal, non-empty string. Anything else (an object like
// {"$gt": ""}, a number, a huge text) returns null, so it never reaches a query.
const cleanPlace = (place) => {
    if (typeof place !== 'string') return null;
    const trimmed = place.trim();
    return trimmed && trimmed.length <= 100 ? trimmed : null;
};

// Only a hash of the reset token is stored, like a password.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateAccessToken = (id)=>{
    const payload = { id };
    return jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:'24h'});
}

// Creates a new one-time confirmation link for `user`, saves the user and emails the link.
// Returns false if the email could not be sent (the account is still saved,
// so the user can ask for the link again later).
const startEmailVerification = async (user) => {
    const token = crypto.randomBytes(32).toString('hex');
    user.isVerified = false;
    user.verifyToken = hashToken(token);
    user.verifyExpires = Date.now() + VERIFY_TOKEN_TTL_MS;
    await user.save();
    try {
        await sendVerificationEmail(user.useremail, user.username, `${CLIENT_URL}/verify/${token}`);
        return true;
    } catch (error) {
        console.error(`❌ Could not send confirmation email to ${user.useremail}: ${error.message}`);
        return false;
    }
};


class UserController {
    async signup(req,res,next) {
        try {
            const {username,userlname,useremail,userpassword} = req.body;

            if (!username || !userlname || !useremail || !userpassword) {
                return res.status(400).json({message: "All fields are required"});
            }
            if (userpassword.length < 6) {
                return res.status(400).json({message: "Password must be at least 6 characters"});
            }

            const email = useremail.toLowerCase().trim();
            const candidate = await User.findOne({useremail: email});
            if(candidate){
                return res.status(409).json({message:"User with this email already exists"});
            }

            const hashpassword = await bcrypt.hash(userpassword, SALT_ROUNDS);
            const user = new User({username, userlname, userpassword: hashpassword, useremail: email});
            const sent = await startEmailVerification(user); // saves the user and sends the link

            return res.status(201).json({
                message: sent
                    ? "Account created. Check your email to confirm it."
                    : "Account created, but the confirmation email could not be sent. Try \"Send the link again\" on the sign-in page.",
                emailSent: sent,
            });
        } catch (error) {
            next(error);
        }
    }

    async signin(req,res,next) {
        try {
            const {useremail,userpassword} = req.body;
            if (!useremail || !userpassword) {
                return res.status(400).json({message: "Email and password are required"});
            }

            const user = await User.findOne({useremail: useremail.toLowerCase().trim()}).select('+userpassword');
            const validPassword = user && await bcrypt.compare(userpassword, user.userpassword);

            if(!validPassword){
                return res.status(401).json({message: "Invalid email or password"});
            }

            // Checked only after the password, so a stranger can't use this
            // message to find out which emails are registered.
            if(user.isVerified === false){
                return res.status(403).json({
                    message: "Please confirm your email first. Check your inbox for the link.",
                    code: "EMAIL_NOT_VERIFIED",
                });
            }

            const token = generateAccessToken(user._id);
            return res.json({token, useremail: user.useremail});
        } catch (error) {
            next(error);
        }
    }

    async myAccount(req,res,next){
        try {
            // .lean() returns a plain object: faster, and we only read it here.
            const user = await User.findById(req.user.id).lean();
            if(!user){
                return res.status(404).json({message: 'User not found'});
            }
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async addPlaces(req,res,next){
        try {
            const place = cleanPlace(req.body.place);
            if (!place) {
                return res.status(400).json({message: 'Place is required'});
            }

            // One atomic query: add the place only if it is not in the list yet.
            // Two requests at the same time can no longer overwrite each other.
            const user = await User.findOneAndUpdate(
                {_id: req.user.id, places: {$ne: place}},
                {$push: {places: place}},
                {new: true, projection: {places: 1}}
            );

            if(!user){
                // Nothing matched: either the place is already there, or no such user.
                const exists = await User.exists({_id: req.user.id});
                return exists
                    ? res.status(409).json({message: 'Place already added'})
                    : res.status(404).json({message: 'User not found'});
            }
            return res.json(user.places);
        } catch (error) {
            next(error);
        }
    }

    async deletePlace(req,res,next){
        try {
            const place = cleanPlace(req.body.place);
            if (!place) {
                return res.status(400).json({message: 'Place is required'});
            }

            // One atomic query: remove the place from the list.
            const user = await User.findByIdAndUpdate(
                req.user.id,
                {$pull: {places: place}},
                {new: true, projection: {places: 1}}
            );
            if(!user){
                return res.status(404).json({message: 'User not found'});
            }
            return res.json(user.places);
        } catch (error) {
            next(error);
        }
    }

    async deleteAccount(req,res,next){
        try {
            const user = await User.findByIdAndDelete(req.user.id);
            if(!user){
                return res.status(404).json({message: 'User not found'});
            }
            return res.json({message: 'User was deleted'});
        } catch (error) {
            next(error);
        }
    }

    // User opened the link from the confirmation email.
    async verifyemail(req,res,next) {
        try {
            const {token} = req.body;
            if (typeof token !== 'string' || !token) {
                return res.status(400).json({message: "Token is required"});
            }

            const user = await User.findOne({
                verifyToken: hashToken(token),
                verifyExpires: {$gt: Date.now()},
            });
            if (!user) {
                return res.status(400).json({message: "This link is invalid or has expired"});
            }

            user.isVerified = true;
            user.verifyToken = undefined;
            user.verifyExpires = undefined;
            await user.save();

            return res.json({message: "Email confirmed. You can sign in now."});
        } catch (error) {
            next(error);
        }
    }

    // "Send the email again" (lost email or expired link).
    async resendverification(req,res,next) {
        try {
            const {useremail} = req.body;
            if (typeof useremail !== 'string' || !useremail) {
                return res.status(400).json({message: "Email is required"});
            }

            // Same answer in every case, so this can't be used to find accounts.
            const answer = {message: "If this account needs confirmation, a new link was sent"};

            const user = await User.findOne({useremail: useremail.toLowerCase().trim()});
            if (user && user.isVerified === false) {
                await startEmailVerification(user);
            }
            return res.json(answer);
        } catch (error) {
            next(error);
        }
    }

    // Step 1: user enters email, we email them a one-time link.
    async forgotpassword(req,res,next) {
        try {
            const {useremail} = req.body;
            if (!useremail) {
                return res.status(400).json({message: "Email is required"});
            }

            // Same answer whether the email exists or not,
            // so nobody can use this form to find registered emails.
            const answer = {message: "If this email is registered, a reset link was sent"};

            const user = await User.findOne({useremail: useremail.toLowerCase().trim()});
            if (!user) {
                return res.json(answer);
            }

            const token = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = hashToken(token);
            user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
            await user.save();

            const link = `${CLIENT_URL}/resetpassword/${token}`;
            await sendPasswordResetEmail(user.useremail, link);

            return res.json(answer);
        } catch (error) {
            next(error);
        }
    }

    // Step 2: user opens the link and sends the token with a new password.
    async resetpassword(req,res,next) {
        try {
            const {token,userpassword} = req.body;
            if (!token || !userpassword || userpassword.length < 6) {
                return res.status(400).json({message: "Token and password (6+ chars) are required"});
            }

            const user = await User.findOne({
                resetPasswordToken: hashToken(token),
                resetPasswordExpires: {$gt: Date.now()},
            });
            if(!user){
                return res.status(400).json({message: 'Reset link is invalid or expired'});
            }

            user.userpassword = await bcrypt.hash(userpassword, SALT_ROUNDS);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            // The reset link arrived by email, so the email is proven too.
            if (user.isVerified === false) {
                user.isVerified = true;
                user.verifyToken = undefined;
                user.verifyExpires = undefined;
            }
            await user.save();
            return res.json({message: "Password was changed"});
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
