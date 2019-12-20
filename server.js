const Hapi=require('@hapi/hapi')
const Joi=require('@hapi/joi')
const Bcrypt=require('bcrypt')
const qs=require('qs')

const users={
    user:{
        username:'user',
        password:'$2a$04$BB3BAXMwyqkRhPjs7kUgXuWn7.pYxNXHyyDzD3fDo5xACgF2KFsCi',
        name:'Just User',
        id:'123456'
    }
}

const validate=async(request,username,password)=>{
    const user=users[username]
    if(!user){
        return {credentials:null,isValid:false}
    }
    const isValid=await Bcrypt.compare(password, user.password)
    const credentials={id:user.id,name:user.name}
    return {isValid,credentials}
}

const getDate=(date)=>{
    const thisDate=new Date(date)
    return thisDate.toISOString().slice(0,10)
}

const getDateLog=(date)=>{
    return `logs/${getDate(date)}.log`
}

const start=async()=>{
    const {rootHandler,tasksGetHandler,tasksDetailGetHandler,tasksPostHandler,tasksPutHandler,tasksActionHandler,getDetail}=require('./handler')
    const server=Hapi.server({
        port:PROCESS.ENV.PORT||80,
        host:'0.0.0.0',
        query:{
            parser:(query)=>qs.parse(query)
        }
    })
    
    await server.register(require('@hapi/basic'))

    await server.register({
        plugin:require('hapi-pino'),
        options:{
            prettyPrint:process.env.NODE_ENV!=='production',
            redact:['req.headers.authorization'],
            stream:getDateLog(Date.now())
        }
    })

    server.auth.strategy('simple','basic',{validate})

    server.route({
        method:'GET',
        path:'/',
        handler:rootHandler
    })
    
    server.route({
        method:'GET',
        path:'/tasks',
        handler:tasksGetHandler,
        options:{
            auth:'simple',
            validate:{
                query:{
                    sort:Joi.string(),
                    offset:Joi.number().integer().min(0),
                    limit:Joi.number().integer().min(1),
                    filter:Joi.object(),
                    dueDate:Joi.date()
                }
            }
        }
    })

    server.route({
        method:'GET',
        path:'/tasks/{id}',
        handler:tasksDetailGetHandler,
        options:{
            auth:'simple',
            validate:{
                params:{
                    id:Joi.number().integer().min(1)
                }
            }
        }
    })

    server.route({
        method:'POST',
        path:'/tasks',
        handler:tasksPostHandler,
        options:{
            auth:'simple',
            validate:{
                payload:{
                    id:Joi.forbidden(),
                    title:Joi.string().regex(/^[a-zA-Z]+(\s*[a-zA-Z])*$/).required(),
                    description:Joi.string().regex(/^[a-zA-Z]+(\s*[a-zA-Z])*$/).required(),
                    dueDate:Joi.date().min(getDate(Date.now())).required(),
                    comments:Joi.array().required(),
                    status:Joi.forbidden()
                }
            }
        }
    })

    server.route({
        method:'PUT',
        path:'/tasks/{id}',
        handler:tasksPutHandler,
        options:{
            auth:'simple',
            validate:{
                params:{
                    id:Joi.number().integer()
                },
                payload:{
                    id:Joi.number().integer(),
                    title:Joi.string().regex(/^[a-zA-Z]+(\s*[a-zA-Z])*$/),
                    description:Joi.string().regex(/^[a-zA-Z]+(\s*[a-zA-Z])*$/),
                    dueDate:Joi.date().min(getDate(Date.now())),
                    comments:Joi.array(),
                    status:Joi.forbidden()
                }
            }
        }
    })

    server.route({
        method:'POST',
        path:'/tasks/{id}/{action}',
        handler:tasksActionHandler,
        options:{
            auth:'simple',
            validate:{
                params:{
                    id:Joi.number().integer(),
                    action:Joi.string()
                }
            }
        }
    })

    await server.start()

    process.on('unhandledRejection',(err)=>{
        console.log(err)
        process.exit(1)
    })
    
    return server
}

module.exports={start}
