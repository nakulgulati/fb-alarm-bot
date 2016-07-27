'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const timer = require('timers')
const app = express()

const token = "EAADaiWX7pE0BAJBXkBNCOZAwdTPiH7dIG5sb7ZBfrR4cdpab1s5R8NjLbr1yuFTprQtzM0w1ea2Wl9rUhoHSbl1DfhJZCLn7cZBZB6AA2dEHpYczohf3ZC1p2qLfvUQy2y71ZApiqOCglCo4QDyTItND4EqosmvtC50o9T6DzE8ZBAZDZD"

function sendTextMessage(sender, text) {
    console.log("-----sending message--------")
    let messageData = { text: text }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData,
        }
    }, function (error, response, body) {
        // if (error) {
        //     console.log('Error sending messages: ', error)
        // } else if (response.body.error) {
        //     console.log('Error: ', response.body.error)
        // }
        // console.log('___');
        // console.log(body);
        // console.log('___');
    })
}

function processMessageWithWit(message, sender) {
    console.log('calling wit api');
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
    }, (error, res, body) => {
        let data = JSON.parse(body);

        let message = "PING!!!"

        if (data.entities.duration) {
            let duration = data.entities.duration[0].normalized.value;
            sendTextMessage(sender, "Timer set for " + duration + " seconds")


            if (data.entities.reminder) {
                console.log("--------reminder-----")
                message += " " + data.entities.reminder[0].value;
                console.log(message);
            }

            if (data.entities.freq) {
                console.log("interval query");
                timer.setInterval((message) => {
                    sendTextMessage(sender, message)
                }, duration * 1000);
            } else {
                console.log("one time query");
                timer.setTimeout(() => {
                    console.log("-----otq----")
                    console.log(message)
                    sendTextMessage(sender, message);
                }, duration * 1000)
            }

        } else if (data.entities.number) {
            let duration = data.entities.number[0].value;
            sendTextMessage(sender, "Timer set for " + duration + " milliseconds")

            if (data.entities.freq) {
                console.log("interval query");
                timer.setInterval(() => {
                    sendTextMessage(sender, "PING!!!")
                }, duration);
            } else {
                console.log("one time query");
                timer.setTimeout(() => {
                    sendTextMessage(sender, "PING!!!");
                }, duration)
            }
        }


    })
}

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

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
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.message) {
                    receivedMessage(messagingEvent);
                }
            });
        });
        res.sendStatus(200)
    }
    res.sendStatus(200)
})

function receivedMessage(event) {
    let text = event.message.text;
    let sender = event.sender.id;

    processMessageWithWit(text, sender);
}


// Spin up the server
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'))
})