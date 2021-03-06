const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
var User = require('./UserModel');
var Exercise = require('./ExerciseModel');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://laolao:laolao123@heaventask.com/sailao', { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res)=> {
    var user = new User({
        username: req.body.username
    });

    user.save((err, data)=>{
        if(err) res.send('username already taken');
        res.json(data);
    });
})

app.get('/api/exercise/users', (req, res)=> {
    User.find({},{select: '_id username'}).
    select('username _id').
    then(data=> {
        res.json(data);
    })
})

app.post('/api/exercise/add', async(req, res)=> {
    var user = await User.findById(req.body.userId);
    
    user ? userId = user._id : res.json(user, 'user not found')

    var date = req.body.date ? req.body.date : new Date();

    var exercise = new Exercise({
        userId: userId,
        description: req.body.description,
        duration: req.body.duration,
        date: date
    });
    exercise.save(async(err, result)=>{
        if(err) console.log(err);
        await User.findOneAndUpdate({_id: req.body.userId},{
            $push: {
                log: result._id
            }
        });
        res.json({
            username: user.username,
            description: result.description,
            duration: result.duration,
            _id: result._id,
            date: formatDate(result.date)
        })
    })
})

function formatDate(date) {
    var days = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Satur'];
    var monthNames = [
      "Jan", "Feb", "March",
      "April", "May", "June", "July",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = date.getDay();
    var date_num = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
  
    return days[day] + ' ' + monthNames[monthIndex] + '  '+ date_num +' ' + year;
}

app.get('/api/exercise/log', (req, res) => {
    var matches = {};
    var options = {};
    var limit = req.query.limit;
    var from = req.query.from;
    var to = req.query.to;
    if(limit){
        options = {...options, limit: limit}
    }
    if(from && to){
        matches = {
            ...matches, date: {
                "$gte": new Date(from), "$lt": new Date(to)
            }
        }
    }
    User.findById(req.query.userId).
    populate({path: 'log', select:'description duration date', options: options, match: matches}).
    exec((err, user)=>{
        if(!user){
            res.json('user not found')
        }
        res.json({
            _id: user._id,
            username: user.username,
            count: user.log.length,
            log: user.log.map(({description, duration, date})=>{
                return {
                    description : description,
                    duration : duration,
                    date: formatDate(date)
                }
            })
        })
    })
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
