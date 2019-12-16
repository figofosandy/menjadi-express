const mongoose=require('mongoose')
const config=require('./config.json')
require('dotenv').config()
const uri=config[process.env.NODE_ENV.toLowerCase()].uri
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true})
mongoose.set('debug', true)
module.exports=mongoose