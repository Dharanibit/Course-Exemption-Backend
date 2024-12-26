const express =require('express')
const cors =require('cors')
const mongoose = require("mongoose");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");
const GridFsStorage = require("multer-gridfs-storage");
const {connectToDb, getDb} = require('./dbconnection.cjs')
const { MongoDBCollectionNamespace, ObjectId,GridFSBucket } = require('mongodb')
const bodyparser = require('body-parser')
const app = express()
app.use(bodyparser.json())
app.use(cors())
app.use("/files", express.static("files"));

connectToDb(function(error){
    if(error){
        console.log('Could not establish connection')
        console.log(error)
    }
    else{
       
        app.listen(3000)
        db = getDb()
        console.log(`Listening on port 3000`)
        
        
    }
})

// const storage1 = multer.memoryStorage();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});


const upload = multer({ storage: storage });


app.get('/',function(request,response){
    response.send('working fine')
})

app.get('/get-students', function(request, response) {
    
    const entries = []
    db.collection('Students')
    .find()
    .forEach(entry => entries.push(entry))
    .then(function() {
        response.status(200).json(entries)
    }).catch(function() {
        response.status(404).json({
            "status" : "Could not fetch documents from Students collection"
        })
    })
})

app.get('/get-faculty', function(request, response) {
    
    const entries = []
    db.collection('Faculty')
    .find()
    .forEach(entry => entries.push(entry))
    .then(function() {
        response.status(200).json(entries)
    }).catch(function() {
        response.status(404).json({
            "status" : "Could not fetch documents from Faculty Collection"
        })
    })
})

app.get('/get-internreport', function(request,response){
    const entries = []
    db.collection('InternReport').find()
    .forEach(entry => entries.push(entry)).then(function(){
        response.status(200).json(entries)
    }).catch(function(){
        response.status(404).json({
            "status":"Could not fetch documents from InternReport Collection"
        })
    })
})

app.post('/add-request', function(request,response){
    db.collection('Requests').insertOne(request.body).then(function(){
        response.status(201).json({
            "status":"entry added successfully in Requests Collection"
        })
    }).catch(function(){
            response.status(500).json({
                "status":"entry not added in Requests Collection"
            })
    })
})

app.get('/get-requests', function(request, response) {
    
    const entries = []
    db.collection('Requests')
    .find()
    .forEach(entry => entries.push(entry))
    .then(function() {
        response.status(200).json(entries)
    }).catch(function() {
        response.status(404).json({
            "status" : "Could not fetch documents from Requests Collection"
        })
    })
})

app.patch('/update/:id', async function(request, response) {
    const idval = request.params.id;
    console.log(idval);
    const update = request.body;
    // const entries =[]
    // let objid
    // let mongoid

    try {
        const entries = await db.collection('Requests').find({},{ id: idval }).toArray();
        console.log(entries)
        if (entries.length > 0) {
            const mongoid = entries[0]._id.toString();
            console.log("Object id is:", mongoid);
    
            if (ObjectId.isValid(mongoid)) {
                await db.collection('Requests').updateOne(
                    { _id: mongoid },
                    { $set: request.body }
                );
                response.status(200).json({ "status": "Entry updated successfully in the Requests Collection" });
            } else {
                response.status(400).json({ "status": "ObjectId is not valid" });
            }
        } else {
            response.status(404).json({ "status": "Entry not found" });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ "status": "Update not successful" });
    }
    
});

app.post("/upload-files", upload.single("file"), async (req, res) => {
    console.log(req.file);
    const id = req.body.id;
    const fileName = req.file.filename;
    try {
      await db.collection('PdfDetails').insertOne({ id: id, pdf: fileName }).then(function(){
        res.send({ status: "ok", "filepath": req.file.path });
      })
      .catch(function(){
        response.status(404).json({"error": "error inserting document"})
      });
      
    } catch (error) {
      res.json({ status: error });
    }
  });

  

