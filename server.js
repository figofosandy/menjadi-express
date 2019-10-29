const express=require('express') // importing module express
const app=express(); 
const port=3007

// create route request get for root
app.get('/',(req,res)=>res.send('Hello World!'))

// run server
app.listen(port,()=>console.log(`Server listening on port ${port}`))

// create route request post for /hello
app.post('/hello',function(req,res){
    const respon={
        statusCode:200,
        error:"",
        message:"Hello JSON"
    }
    res.json(respon)
})