
const express = require('express')
const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require('../models/urlModel')

const redis = require("redis")

const { promisify } = require("util")

//********************************************************************************************************* */

//connect with redis

const redisClient = redis.createClient(
    17450,
    "redis-17450.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("861FANU5CYg9DBmJfHclUacggZsSCUWR", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)


const isValid = function (value) {

    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false

    return true;
}

const baseUrl = 'http://localhost:3000'

//************************************************************************************************************* */

// First API

const createUrl = async (req, res) => {

    try {
        let data = req.body

        let longUrl = req.body.longUrl

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Empty, body must be required" })
        }

        if (!isValid(longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is invalid" })
        }

        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, message: 'Invalid longUrl' })  // here Uri means Uniform Resource Identifier
        }


        let geturl = await GET_ASYNC(`${longUrl}`)
        if (geturl)
            return res.status(200).send({ status: true, message: "already in redis", data: JSON.parse(geturl) })
        console.log(geturl)

        let url = await urlModel.findOne({ longUrl: data.longUrl })
        if (url) {
            res.status(200).send({ status: true, message: "present in DB success", data: url })
            console.log(url)
        }
        else {
            data.urlCode = shortid.generate().toLowerCase()
            data.shortUrl = baseUrl + '/' + data.urlCode

            let url = await urlModel.create(data)

            await SET_ASYNC(`${data.shortUrl}`, `${longUrl}`)
            await SET_ASYNC(`${longUrl}`, JSON.stringify({ data }))

            res.status(201).send({ status: true, data: data })
        }
    }

    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
}

//***********************************************************************************************************

// second API

const getUrl = async (req, res) => {

    try {
        let geturl = await GET_ASYNC(`http://localhost:3000/${req.params.urlCode}`)

        if (geturl) {
            return res.redirect(geturl)  // "came from redis"
        }
        else {
            const url = await urlModel.findOne({ urlCode: req.params.urlCode })  // "came from db"
            if (url) {
                return res.redirect(url.longUrl)
            }
            else {
                return res.status(404).send({ status: false, message: 'No URL Found' })
            }
        }
    }

    catch (err) {
        res.status(500).send('Server Error')
    }
}



module.exports.getUrl = getUrl
module.exports.createUrl = createUrl










































