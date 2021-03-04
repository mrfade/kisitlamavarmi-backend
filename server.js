const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql-await')
const cors = require('cors')
const moment = require('moment-timezone')
require('dotenv').config()

const app = express()

// parse requests of content-type - application/json
app.use(bodyParser.json())

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

const whitelist = [
    'http://localhost:3000',
    'http://kisitlamavarmi.sunucum.cloud',
    'https://kisitlamavarmi.sunucum.cloud',
    'https://kisitlamavarmi-frontend.pages.dev'
]
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(400).send()
})

const connection = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
})

app.get("/", async (req, res) => {
    let cities = [], statuses = []

    try {
        statuses = await connection.awaitQuery('SELECT * FROM statuses')
        cities = await connection.awaitQuery('SELECT * FROM cities')

        statuses = statuses.map(item => {
            try {
                item.detail = JSON.parse(item.detail)
            } catch (error) {
                item.detail = []
            }

            try {
                item.last_updated = moment(item.last_updated + ' +0000').format('YYYY-MM-DDTHH:mm:ss.SSSZ')
            } catch (error) {
                item.last_updated = null
            }

            return item
        })

        cities = cities.map(item => {
            item.code = item.code.toString()
            return item
        })
    } catch (error) {
        console.error(error)

        res.status(500).json({
            message: "Error"
        })
    }

    res.json({
        statuses,
        cities,
        test: 'test'
    })
})

// set port, listen for requests
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`)
})