const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true
    },
    pic:{
        type: String,
        default: "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
},{timestamps: true});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // console.log(enter edPassword, this.password);
    return await bcrypt.compare(enteredPassword, this.password);
    // if(enteredPassword===this.password)
    //   return true;
    // else
    //   return false;
  };
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(this.password);
  });

const User = mongoose.model("User",userSchema);
module.exports= User;