const {start}=require('./server')

start(`mongodb://localhost/dkata`)
    .then((server)=>{
        console.log(`Server running on ${server.info.uri}`)
    })