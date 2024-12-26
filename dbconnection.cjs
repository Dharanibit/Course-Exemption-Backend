const {MongoClient} = require('mongodb')
let dbconnection
function connectToDb(callback){
    dbconnection = MongoClient.connect('mongodb://127.0.0.1:27017/CourseExemption').then(function(client){
        dbconnection = client.db()
        console.log("connected")
        callback()
    }).catch(function(error){
        callback(error)
    })
    
}
function getDb(){
    return dbconnection
}
module.exports = {connectToDb,getDb}