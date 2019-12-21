const {start}=require('./server')

start()
    .then((server)=>{
        console.log(`Server running on ${server.info.uri}`)
    })
