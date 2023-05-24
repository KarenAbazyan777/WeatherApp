const {Schema,model} = require('mongoose');

const UserSchema = new Schema({
    username:{type: String, required : true},
    userlname:{type: String, required : true},
    useremail:{type: String ,unique : true , required : true},
    userpassword:{type: String, required : true},
    places:{type:Array}
})

module.exports = model("User",UserSchema);