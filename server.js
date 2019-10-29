const express=require('express') // importing module express
const app=express(); 
const port=3007
const bodyParser=require('body-parser') // importing module body-parser
const Mongoose=require('./MongoModel/MongoConfig') // importing module for global connection mongoose mongodb

// mongoose : creating new model
const PersonModel=Mongoose.model('person',{
    // namaField:dataType
    firstName:String,
    lastName:String
})

// konfigurasi body-parser
app.use(bodyParser.urlencoded({extended:true})) // menangkap request dalam bentuk form url-encoded
app.use(bodyParser.json()) // menangkap request dalam bentuk json

// run server
app.listen(port,()=>console.log(`Server listening on port ${port}`))

// create route request get for root
app.get('/',(req,res)=>res.send('Hello World!'))

// create route request post for /hello
app.post('/hello',function(req,res){
    const respon={
        statusCode:200,
        error:"",
        message:"Hello JSON",
        content:req.body
    }
    res.json(respon)
})

// create route request post for /profile/create
app.post('/profile/create',async(req,res)=>{
    console.log(req.body) // show input in console
    let statusCode=200
    let error=""
    let message=""
    let result=null
    if(!req.body.firstName||!req.body.lastName){
        statusCode=400
        let missing=""
        if(!req.body.firstName){
            missing+="firstname "
        }
        if(!req.body.lastName){
            missing+="lastname "
        }
        error=missing+"payload is required"
        message=error
    } else {
        const input={
            firstName:req.body.firstName,
            lastName:req.body.lastName
        } // menambahkan value dari input ke field Model
        var person=new PersonModel(input) // Membuat model baru
        result=await person.save() // Jalankan query create
    }
    const respon={
        statusCode:statusCode,
        error:error,
        message:message,
        content:result
    }
    res.status(statusCode).json(respon)
    
})

// create route request get for /profile/list
app.get('/profile/list',async(req,res)=>{
    var result=await PersonModel.find().exec() // Jalankan query find
    const respon={
        statusCode:200,
        error:"",
        message:"List found",
        content:result
    }
    res.json(respon).status(respon.statusCode)
})

// create route request get for /profile/detail/:id
app.get('/profile/detail/:id',async(req,res)=>{
    var result=await PersonModel.findById(req.params.id).exec() // Jalankan query find
    const respon={
        statusCode:200,
        error:"",
        message:"Detail found",
        content:result
    }
    res.json(respon).status(respon.statusCode)
})

// create put request get for /profile/update/:id
app.put('/profile/update/:id',async(req,res)=>{
    var result=await PersonModel.findByIdAndUpdate(req.params.id,req.body).exec()
    var found=await PersonModel.findById(req.params.id)
    const respon={
        statusCode:200,
        error:"",
        message:"Detail changed",
        content:{
            before:result,
            after:found
        }
    }
    res.json(respon)
})

// create delete request get for /profile/delete/:id
app.delete('/profile/delete/:id',async(req,res)=>{
    const checkId=Mongoose.Types.ObjectId.isValid(req.params.id) // check id valid
    let statusCode=200
    let error=""
    let message="Detail deleted"
    let result=null
        // validasi
        if(checkId){
            result=await PersonModel.findByIdAndDelete(req.params.id).exec()
            if(!result) {
                statusCode=404
                error="Request Parameter is invalid"
                message="Object Id not found"    
            }
        } else {
            statusCode=404
            error="Request Parameter is invalid"
            message="Object Id is invalid"  
        }
    const respon={
        statusCode:statusCode,
        error:error,
        message:message,
        content:result
    }
    res.status(statusCode).json(respon)
})