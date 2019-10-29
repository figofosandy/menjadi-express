const Mongoose=require('mongoose') // importing module mongoose
Mongoose.connect('mongodb://localhost/belajarMongo') // konek ke server mongodb
module.exports=Mongoose