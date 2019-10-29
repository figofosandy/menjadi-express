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
    const input={
        firstName:req.body.firstName,
        lastName:req.body.lastName
    } // menambahkan value dari input ke field Model
    var person=new PersonModel(input) // Membuat model baru
    var result=await person.save() // Jalankan query create
    const respon={
        statusCode:200,
        error:"",
        message:"created",
        content:result
    }
    res.json(respon)
})

// create route request get for /profile/list
app.get('/profile/list',async(req,res)=>{
    var result=await PersonModel.find().exec() // Jalankan query find
    const respon={
        statusCode:200,
        error:"",
        message:"List founded",
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
        message:"Detail founded",
        content:result
    }
    res.json(respon).status(respon.statusCode)
})

// create put request get for /profile/update/:id
app.put('/profile/update/:id',async(req,res)=>{
    var result=await PersonModel.findByIdAndUpdate(req.params.id,
        {
            firstName:req.body.firstName,
            lastName:req.body.lastName
        }
    ).exec()
    const respon={
        statusCode:200,
        error:"",
        message:"Detail changed",
        content:result
    }
    res.json(respon)
})

