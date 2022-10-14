const mongoose = require('mongoose');

// "heroku-postbuild":"NPM_CONFIG_PRODUCTION=false npm install --prefix frontend && npm run build --prefix frontend"

const connectDB=async()=>{
    try{
        const connect = await mongoose.connect("mongodb+srv://sambuddhakoner:Koner@cluster0.zz9wokn.mongodb.net/?retryWrites=true&w=majority",{
            useNewUrlParser: true,
        });

        console.log(`MongoDB connected: ${connect.connection.host}`);
    }catch(err){
        console.log(`Error: ${err.message}`);
        process.exit();
    }
}

module.exports = connectDB