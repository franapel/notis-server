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

app.get('/', (req, res) => {
    res.sendFile('notificationForm.html', { root: __dirname })
})

app.listen(5000, () => {
    console.log('Server listening on port 5000')
})