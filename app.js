require('dotenv').config()
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const cors = require('cors')
const socket = require('./controller/socket/create')
const connectDB = require('./utilities/connection')
const authRoute = require('./routes/auth/routes')
const roleRoute = require('./routes/roles/routes')
const memberRoute = require('./routes/members/routes')
const taskRoute = require('./routes/tasks/routes')
const bucketRoute = require('./routes/buckets/routes')
const attendanceRoute = require('./routes/attendance/routes')
const reportRoute = require('./routes/reports/routes')
const leaveRoute = require('./routes/leave/routes')

//JSON MIDDLEWARE
app.use(express.json())
const corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions))

mongoose.set('runValidators', true);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000 // 30 seconds
});


mongoose.connection.once('open', () => {
  console.log("Well done!, connected with mongoDB database");
}).on('error', error => {
  console.log("Oops! database connection error: " + error);
});

//ROUTES
app.get('/', (req, res) => {
  res.send('To-Do Your Task')
})
app.use('/auth', authRoute)
app.use('/role', roleRoute)
app.use('/member', memberRoute)
app.use('/task', taskRoute)
app.use('/bucket', bucketRoute)
app.use('/attendance', attendanceRoute)
app.use('/report', reportRoute)
app.use('/leave', leaveRoute)

//Error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' })
  }
  next()
})

//MONGO DB CONNECTION
// connectDB();

//SERVER
app.listen(process.env.PORT, () => {
  console.log(`Server is run on http://localhost:${process.env.PORT}`)
})
