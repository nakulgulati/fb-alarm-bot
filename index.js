'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const token = "EAADaiWX7pE0BAJBXkBNCOZAwdTPiH7dIG5sb7ZBfrR4cdpab1s5R8NjLbr1yuFTprQtzM0w1ea2Wl9rUhoHSbl1DfhJZCLn7cZBZB6AA2dEHpYczohf3ZC1p2qLfvUQy2y71ZApiqOCglCo4QDyTItND4EqosmvtC50o9T6DzE8ZBAZDZD"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function processMessageWithWit(message) {
    request({
        url: 'https://api.wit.ai/message',
        method: 'GET',
        qs: {
            v: '20160526',
            q: message
        },
        headers: {
            Authorization: 'Bearer CHTPIYZYD5NSPUNCCXPCT63Y4KRXJB64' 
        }
    }, (error, res, body)=>{
        console.log(body);
    })
}

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            // sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
            sendTextMessage(sender, "processing request")
            processMessageWithWit(text)
        }
    }
    res.sendStatus(200)
})


// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})