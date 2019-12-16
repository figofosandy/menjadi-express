const mongoose=require(`./mongooseConnection`)
const db=mongoose.connection
db.on(`error`,console.error.bind(console,`connection error`))
db.once(`open`,()=>console.log(`Connected`))

const Task=mongoose.model(`Task`,{
    id:Number,
    title:String,
    description:String,
    startedAt:Date,
    finishAt:Date,
    dueDate:Date,
    comments:[String],
    status:{
        type:String,
        enum:[`new`,`in-progress`,`finish`]
    }
})

const fields=[]
Task.schema.eachPath(field=>fields.push(field))

const notFoundResponse={
    statusCode:404,
    error:`Not Found`,
    message:`Not found`
}

const badRequestResponse={
    statusCode:400,
    error:`Bad Request`,
    message:`Invalid request input`
}

const conflictResponse={
    statusCode:409,
    error:`Conflict`,
    message:`Conflict request input`
}

const rootHandler=(request,h)=>{
    return h.response(`This is a root route`).code(200)
}

const tasksGetHandler=async(request,h)=>{
    const query=request.query
    const isEmpty=JSON.stringify(query)==`{}`
    if(isEmpty){
        const result= await Task.find({status:{$in:[`new`,`in-progress`]}},{_id:0,__v:0})
                                .sort({dueDate:1,title:1})
                                .lean()
        return h.response(result).code(200)
    } else {
        const sortBy=query.sort?query.sort:`dueDate`
        const offset=query.offset?parseInt(query.offset):0
        const limit=query.limit?parseInt(query.limit):(query.dueDate?Number.MAX_SAFE_INTEGER:10)
        const filter=query.filter?query.filter:{status:{$in:[`new`,`in-progress`]}}
        if(!fields.some(field=>field==sortBy)){
            return h.response(badRequestResponse).code(400)
        }
        if(query.dueDate){
            Object.assign(filter,{dueDate:new Date(query.dueDate)})
        }
        const result=await Task.find(filter,{_id:0,__v:0},)
            .sort({[sortBy]:1,dueDate:1,title:1})
            .skip(offset)
            .limit(limit)
            .lean()
        return h.response(result).code(200)
    }
}

const getDetail=async(taskId)=>{
    return Task.findOne({id:taskId,status:{$in:[`new`,`in-progress`]}},{_id:0,__v:0}).lean()
}

const tasksDetailGetHandler=async (request,h)=>{
    const taskId=request.params.id
    const detail=await getDetail(taskId)
    if(!detail){   
        return h.response(notFoundResponse).code(404)
    }
    return h.response(detail).code(200)
}

const tasksPostHandler=async (request,h)=>{
    const payload=request.payload
    const tasks=await Task.aggregate([
        {
            $group:{
                _id:`max`,
                maxId:{
                    $max:`$id`,
                },
                titles:{
                    $push:`$title`
                }
            }
        }
    ])
    const getNextId=maxId=>{
        return maxId+1
    }
    if(tasks[0]){
        const titleAvailability=tasks[0].titles.some(title=>title==payload.title)
        if(titleAvailability){
            return h.response(conflictResponse).code(409)
        }
    }
    const nextId=getNextId(tasks[0]?tasks[0].maxId:0)
    Object.assign(payload,{id:nextId,status:`new`})
    await Task.insertMany([payload])
    return h.response(payload).code(201)
}

const tasksPutHandler=async (request,h)=>{
    const id=request.params.id
    const payload=request.payload
    if(payload.id&&payload.id!=id){
        return h.response(conflictResponse).code(409)
    }
    const filter={
        id:id,
        status:{$in:[`new`,`in-progress`]}
    }
    if(payload.title){
        Object.assign(filter,{title:payload.title})
    }
    const comments=payload.comments?payload.comments:[]
    delete payload.comments
    const updatedTask=await Task.findOneAndUpdate(filter,
        {
            $set:payload,
            $push:{
                comments:{
                    $each:comments
                }
            }
        },
        {new:true,projection:{_id:0,__v:0}})
        .lean()
    if(!updatedTask){
        return h.response(notFoundResponse).code(404)
    }
    return h.response(updatedTask).code(202)
}

const tasksAction=async(id,action)=>{
    const actionResult={
        result:null,
        error:null
    }
    if(action.toLowerCase()=='start'){
        const result=await Task.findOneAndUpdate(
            {id:id,status:'new'},
            {status:'in-progress',startedAt:Date.now()},
            {new:true,projection:{_id:0,__v:0}})
            .lean()
        if(!result){
            actionResult.error=notFoundResponse
        }
        actionResult.result=result
    } else if(action.toLowerCase()=='finish'){
        const result=await Task.findOneAndUpdate(
            {id:id,status:'in-progress'},
            {status:'finish',finishAt:Date.now()},
            {new:true,projection:{_id:0,__v:0}})
            .lean()
        if(!result){
            actionResult.error=notFoundResponse
        }
        actionResult.result=result
    } else {
        actionResult.error=badRequestResponse
    }
    return actionResult
}

const tasksActionHandler=async (request,h)=>{
    const {id,action}=request.params
    const actionResult=await tasksAction(id,action)
    if(actionResult.error){
        return h.response(actionResult.error).code(actionResult.error.statusCode)
    }
    return h.response(actionResult.result).code(202)
}

module.exports={rootHandler,tasksGetHandler,tasksDetailGetHandler,tasksPostHandler,tasksPutHandler,tasksActionHandler,getDetail}