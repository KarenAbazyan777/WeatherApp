const {Schema,model} = require('mongoose');

const UserSchema = new Schema({
    username:{type: String, required : true, trim: true},
    userlname:{type: String, required : true, trim: true},
    useremail:{type: String ,unique : true , required : true, lowercase: true, trim: true},
    userpassword:{type: String, required : true, select: false},
    places:{type: [String], default: []},
    resetPasswordToken:{type: String, select: false},
    resetPasswordExpires:{type: Date, select: false},
    // No default on purpose: accounts created before email verification existed
    // have no value (undefined) and can still sign in. New accounts get `false`.
    isVerified:{type: Boolean},
    verifyToken:{type: String, select: false},
    verifyExpires:{type: Date, select: false}
}, { timestamps: true })

module.exports = model("User",UserSchema);
