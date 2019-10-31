const Mongoose=require('mongoose') // importing module mongoose
Mongoose.connect('mongodb+srv://admin:p4ssw0rd@cluster0-gkszh.mongodb.net/test?retryWrites=true&w=majority') // konek ke server mongodb
module.exports=Mongoose
