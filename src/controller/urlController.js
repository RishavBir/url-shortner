const mongoose = require ("mongoose")
const urlModel = require ("../models/urlModel.js")
const validUrl = require ("valid-url")
const shortid= require ("shortid")
const redis = require("redis");
const {promisify} = require ("util");

 //connect with redis

const redisClient = redis.createClient(
    17450,
    "redis-17450.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true}
);
redisClient.auth("861FANU5CYg9DBmJfHclUacggZsSCUWR", function (err){
 if(err) throw err;
});

redisClient.on("connect", async function(){
    console.log("Connected to Redis..");
});

//connection setup for redis

const SET_ASYNC = promisify( redisClient.SET).bind(redisClient)
const GET_ASYNC = promisify ( redisClient.GET).bind(redisClient)



 const baseUrl = 'http://localhost:3000'


const createUrl = async (req, res) => {
    let data=req.body
       
     let longUrl =req.body.longUrl

     if(!data.longUrl) {
             return res.status(400).send({status:false, msg: "plz enter Long url"})
    }
    
      if (validUrl.isUri(data.longUrl)) {
        try {
  
            let geturl = await GET_ASYNC(`${longUrl}`)
            if(geturl) return res.status(200).send({status:true,message:"already in redis",data:JSON.parse(geturl)})

            let url = await urlModel.findOne({ longUrl:data.longUrl })

            if (url) {
                res.status(200).send({status:true,message:"present in DB success",data:url})
            }
            else {  data.urlCode = shortid.generate()
                 data.shortUrl = baseUrl + '/' + data.urlCode
               
                 let url=await urlModel.create(data)
                             
                 await SET_ASYNC(`${data.shortUrl}`,`${longUrl}`)
                 await SET_ASYNC(`${longUrl}`,JSON.stringify({data}))
                
                res.status(201).send({ status: true, data: data})
            }
        }

        catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
        }
    } else {
        res.status(400).send({ status: false, message: 'Invalid longUrl' })
    }
}

// //************************************************************************************** */

const getUrl = async (req, res) => {
    try {
  
        let geturl = await GET_ASYNC(`${req.params.urlCode}`)
        
        let x= JSON.parse(geturl)
       
        if(geturl) {
        return res.redirect(x.data.longUrl)}
        else {
        const url = await urlModel.findOne({
            urlCode: req.params.urlCode
        })
        if (url) {
            return res.redirect(url.longUrl)
        }
        else {
            return res.status(404).send({status: false, message: 'No URL Found'})
        }
      }
}

    catch (err) {
        console.error(err)
        res.status(500).send('Server Error')
    }
}






module.exports.createUrl=createUrl
module.exports.getUrl=getUrl