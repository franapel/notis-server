require('dotenv').config()
const express = require('express')
const webpush = require('web-push')
const cors = require('cors')
const app = express()
const users = require('./users')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
)

const findUser = (userId) => {
    const user = users.find(user => user.id === userId)
    return user
}

app.post('/subscription', (req, res) => {
    const userId = req.body.userId
    const subscription = req.body.subscription
    const user = findUser(userId)
    if (user) {
        user.subscription = subscription
        const payload = JSON.stringify({
            title: 'OkBill',
            body: 'Suscrito a las Notificaciones'
        })
        webpush.sendNotification(user.subscription, payload)
        res.send({ success: true })
    } else {
        res.send({ success: false })
    }
    
})

app.get('/user/:id', (req, res) => {
    const user = findUser(req.params.id)
    if (user) {
        res.send({ success: true, user: user })
    } else {
        res.send({ success: false, msg: 'Wrong ID' })
    }
})

app.post('/notification', (req, res) => {
    const userId = req.body.userId
    const msg = req.body.msg
    const user = findUser(userId)
    if (user) {
        if (user.subscription && user.subscription.endpoint) {
            const payload = JSON.stringify({
                title: 'OkBill',
                body: msg
            })
            webpush.sendNotification(user.subscription, payload)
            res.send({ success: true })
        } else {
            console.log('usuario no suscrito')
            res.send({ success: true })
        }        
    } else {
        res.send({ success: false, msg: 'Wrong ID' })
    }
})

app.get('/', (req, res) => {
    res.sendFile('notificationForm.html', { root: __dirname })
})

app.listen(5000, () => {
    console.log('Server listening on port 5000')
})