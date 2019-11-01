// importing module needed
var express=require('express') // module express
var router=express.Router() // module Router
const Models=require('../models/index') // module Models

// GET users listing
router.get('/',function(req,res,next){
    res.send('Hello Todo')
})

// create
router.post('/create',async(req,res)=>{
    console.log(req.body)
    try {
        const todo=await Models.Todo.create(req.body)
        const response={
            statusCode:200,
            error:"",
            message:"Create Model Todo",
            content:todo,
            contentB:req.body
        }
        res.json(response)
    } catch (error) {
        const response={
            statusCode:404,
            error:error.name
        }
        res.status(404).json(response)
    }
})

// read
router.get('/list',async(req,res)=>{
    try {
        const todo=await Models.Todo.findAll({})
        const response={
            statusCode:200,
            error:"",
            message:"List Found",
            content:todo
        }
        res.json(response)
    } catch (error) {
        const response={
            statusCode:404,
            error:error.name
        }
        res.status(404).json(response)
    }
})

// detail
router.get('/detail/:id',async(req,res)=>{
    try {
        const todo=await Models.Todo.findAll({
            where:{
                id:req.params.id
            }
        })
        const response={
            statusCode:200,
            error:"",
            message:"Detail Found",
            content:todo
        }
        res.json(response)
    } catch (error) {
        const response={
            statusCode:404,
            error:error.name
        }
        res.status(404).json(response)
    }
})

// update
router.put('/update/:id',async(req,res)=>{
    try {
        const todo=await Models.Todo.update(
            req.body,
            {
                where:{
                    id:req.params.id
                }
            }        
        )
        const response={
            statusCode:200,
            error:"",
            message:"Data Updated",
            content:todo
        }
        res.json(response)
    } catch (error) {
        const response={
            statusCode:404,
            error:error.name
        }
        res.status(404).json(response)
    }
})

// delete
router.delete('/delete/:id',async(req,res)=>{
    try {
        const todo=await Models.Todo.destroy(
            {
                where:{
                    id:req.params.id
                }
            }        
        )
        const response={
            statusCode:200,
            error:"",
            message:"Data Deleted",
            content:todo
        }
        res.json(response)
    } catch (error) {
        const response={
            statusCode:404,
            error:error.name
        }
        res.status(404).json(response)
    }
})

module.exports=router
