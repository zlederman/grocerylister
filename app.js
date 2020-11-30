const express = require('express');
const mongoose = require("mongoose");
const request = require('request');
const http  = require('http');
const grocerylist = require('./model.js')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
require('dotenv').config()
const app = express();

var bodyParser = require('body-parser');
console.log(process.env.PASS)

const uri = `mongodb+srv://eigenShmector:${process.env.PASS}@cluster0.kgaoe.mongodb.net/db?retryWrites=true&w=majority`;
 try{
     mongoose.connect(uri,{ 
        useNewUrlParser: true,
        useUnifiedTopology: true });
    console.log("success")
}catch(err){
    console.log(err)
 }

const PORT = process.env.PORT || 3000;
app.use(express.static('.')); //this will need to change
app.use(bodyParser.urlencoded({ extended: false}));
// parse application/json

var headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic Z3JvY2VyeS0xMzBmZDJkYTcyNTQwNTM0ODc3ZmE2ODc0YzQ0ZDk5NTM1Mzg2NDExMzg3NTc0MjYzOTA6OGZ6bDhnOHFPam55S1pZdThHOEVFMWRsODhhRGlxcXNMajhSUldsMA=='
};

var dataString = 'grant_type=client_credentials&scope=product.compact'

var authOptions = {
    url: 'https://api.kroger.com/v1/connect/oauth2/token',
    method: 'POST',
    headers: headers,
    body: dataString
};


app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.render(`./index.html`)
});


app.post('/sms',(req,res)=>{
    const twiml = new MessagingResponse();
    testdata = req.body.Body;
    //need to parse commands and data 
    if(testdata.indexOf("add ") !== -1 || testdata.indexOf("Add ") !== -1){
        testdata = testdata.substring(4,testdata.length);
        request.post(authOptions, (error,response,body) =>{
            if(!error  || response.statusCode == 200){
                var access_token = JSON.parse(body).access_token
                var settings = {
                    url: "https://api.kroger.com/v1/products?filter.term="+testdata,
                    headers: {
                      'Content-type': "application/json",
                      'Authorization': "Bearer " + access_token
                    }
                  
                  }
                request.get(settings,(error, response, body)=>{
                    
                    data = JSON.parse(body).data;
                    console.log(data)
                    var items = data.map((item)=>{return item.description});
                    
                    grocerylist.find({}).sort('date').exec((err, docs) => {
                        recentList = docs[0]
                        if(recentList.items.indexOf(items[0]) > -1){
                            recentList.items.push(items[0])
                            recentList.save();
                            twiml.message(`Your item: ${items[0]} has been added`)
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        }else{
                            twiml.message(`${items[0]} is already in your list`)
                            res.writeHead(200, {'Content-Type': 'text/xml'});
                            res.end(twiml.toString());
                        }
                        
                     });
               
                    
    
                })
            }else{
                console.log(error)
            }
        })
    }

    if(testdata.indexOf("new") !== -1 || testdata.indexOf("New") !== -1){
        console.log("we working?")
        var datetime = new Date();
        list  = new grocerylist({list:[""],date:datetime.toISOString().slice(0,10)});
        list.save();
        twiml.message("New list created: "+datetime.toISOString().slice(0,10));
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());
    }

    if(testdata.indexOf("view") !== -1 || testdata.indexOf("View") !== -1){
        console.log("hello?")
        grocerylist.find({}).sort('date').exec((err, docs) => {
            console.log("?")
            recentList = docs[0]
           
            twiml.message(recentList.items.toString());
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiml.toString());
         });
    }
    // console.log(authOptions)

})

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));