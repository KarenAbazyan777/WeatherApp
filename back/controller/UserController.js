const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id)=>{
    const payload = {
        id,
        
    }

    return jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:'24h'});
}


class UserController {
    async signup(req,res,next) {
       try {

            const {username,userlname,useremail,userpassword} = req.body;
            const candidate =  await User.findOne({useremail}); 
                if(candidate){
                   return res.status(400).json({message:"user with  this email already exists"});
            }

            const hashpassword =  bcrypt.hashSync(userpassword,7);
          
            const user = new User({username, userlname, userpassword: hashpassword,useremail}); 
            await user.save();    
            return res.status(200).json({message:'The user was successfully created'});
        
       } catch (error) {
           
       }
    }

    async signin (req,res) {
        try {
            
            const {useremail,userpassword} = req.body;
            const user = await User.findOne({useremail});
            
            if(!user){
                return res.status(400).json({message: 'user was not fined'});
            }
            
            const validPassword =  bcrypt.compareSync(userpassword,user.userpassword);
            if(!validPassword){
                return res.status(400).json({message: "wrong password"});
            }
           
            const token = generateAccessToken(user._id);
            return res.json({token,useremail});

        } catch (error) {
            console.log(error);
            res.status(400).json({message: "Signin error"})
        }
    } 

    async myAccount(req,res,next){
        try {
            const {useremail} = req.body;
            const user = await User.findOne({useremail});
            
            if(!user){
                return res.status(400).json({message: 'user was not fined'});
            }

            return res.json(user);
            
        } catch (error) {
            
        }
    }

    async addPlaces(req,res,next){

        try {
            const {useremail,place} = req.body;
            const user = await User.findOne({useremail});
            
           if(user.places.includes(place)){
                return res.status(400).json({message:'place already be added'})
           }

           user.places.push(place);
           user.save();

            return res.json(user.places);
            
        } catch (error) {
            
        }

    }

    async deletePlace(req,res,next){

        try {
            const {useremail,place} = req.body;
            const user = await User.findOne({useremail});
            
            const index = user.places.indexOf(place);
            user.places.splice(index,1);
            user.save();

            return res.json(user.places);
            
        } catch (error) {
            
        }

    }

    async deleteAccount(req,res,next){

        try {
            const {useremail} = req.body;
            await User.findOneAndRemove({useremail});
            
            return res.json('user was deleted')
        } catch (error) {
            return res.json('dont')
        }

    }

    async resetpassword (req,res) {
        try {
            
            const {useremail,userpassword} = req.body;
            const user = await User.findOne({useremail});
            
            if(!user){
                return res.status(400).json({message: 'user was not fined'});
            }
            
            const hashpassword =  bcrypt.hashSync(userpassword,7);

            user.userpassword = hashpassword;
            user.save();
            return res.status(200).json({message:"password was changed"})

        } catch (error) {
           
        }
    } 




     
}

module.exports = new UserController();