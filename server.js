var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var cors = require('cors');
var _ = require('lodash');
var Promise = require("bluebird");

var mongoose = require('mongoose');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
// Twilio Credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

// mongoose.connect(process.env.MONGODB_URI);
// var mongo = mongoose.connection;
// mongo.on('error', console.error.bind(console, 'connection error:'));
// mongo.once('open', function() {
//   // we're connected!
// });

var db = require('./db');

var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI;

var users = [
    {
        userId: 1,
        name: "Mom",
        phone: '+11234567890'
    },
    {
        userId: 2,
        name: "Brother",
        phone: '+11234567890'
    },
    {
        userId: 3,
        name: "Grandma",
        phone: '+11234567890'
    },
    {
        userId: 4,
        name: "Uncle",
        phone: '+11234567890'
    },
    {
        userId: 5,
        name: "Dad",
        phone: '+11234567890'
    }
];


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});




// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: false }));
app.use(require('body-parser').json({ extended: false }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('ionic/www'));

// Define routes.
// app.get('/',
//   function(req, res) {
//     res.render('home', { user: req.user });
//   });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.get('/messages',
    function(req, res){
        MongoClient.connect(url, function(err, db) {
            if (err) console.error('error querying mongo150', err);
            var dbo = db.db("heroku_jtgx7hwp");
            var query = { chatId: 0 };
            dbo.collection("messages").find(query).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
                res.json(result);
            });
        });
});

app.options('/messages', cors({origin:false})) // enable pre-flight request for DELETE request
app.post('/messages',
    function(req, res){
    var messages = req.body.messages;
    var newmsg = messages.slice(-1)[0];

        MongoClient.connect(url, function(err, db) {
            if (err) console.error('error querying mongo185', err);
            var dbo = db.db("heroku_jtgx7hwp");
            var query = { chatId: 0 };
            var newvalues = { $set: {messages: messages } };
            dbo.collection("messages").updateOne(query, newvalues, function(err, result) {
                if (err) console.error('error updating mongo190', err);
                console.log("1 document updated");
                db.close();
                res.end();
            });
        });

        var foundUsers = _.filter(users, function(item){
            return item.userId == newmsg.userId;
        });

        users.forEach(function(item){
            client.messages
                .create({
                    to: item.phone,
                    from: process.env.TWILIO_PHONE_NUMBER || '+11234567890',
                    body: foundUsers[0].name + " - " + newmsg.text,
                }).then(function(result){
                console.log(result);
            });
        });
});

app.get('/reset',
    function(req, res){
    var messages = [
        // {
        //     userId: 5,
        //     text: "Can you pick up the kids from school today?"
        // }
    ];

        MongoClient.connect(url, function(err, db) {
            if (err) console.error('error querying mongo208', err);
            var dbo = db.db("heroku_jtgx7hwp");
            var query = { chatId: 0 };
            var newvalues = { $set: {messages: messages } };
            dbo.collection("messages").updateOne(query, newvalues, function(err, result) {
                if (err) console.error('error resetting mongo213', err);
                console.log("1 document updated");
                db.close();
                res.end();
            });
        });
    });

app.post('/sms',
    function(req, res){
    const twiml = new MessagingResponse();

    // twiml.message('The Robots are coming! Head for the hills!');
    console.log('twilio request', req.body);

    var fromNumber = req.body.From;
    var foundUsers = _.filter(users, function(item){
        return item.phone == fromNumber;
    });

        users.forEach(function(item){
            if(item.phone != fromNumber){
                client.messages
                    .create({
                        to: item.phone,
                        from: process.env.TWILIO_PHONE_NUMBER || '+11234567890',
                        body: foundUsers[0].name + " - " + req.body.Body,
                    }).then(function(result){
                    console.log(result);
                });
            }

        });

    MongoClient.connect(url, function(err0, db) {
        if (err0) throw err0;
        var dbo = db.db("heroku_jtgx7hwp");
        var query = { chatId: 0 };
        dbo.collection("messages").find(query).toArray(function(err, result) {
            if (err) console.error('error querying mongo252', err);
            console.log(result);
            db.close();
            // return result.messages;

            var messages = result[0].messages;
            messages.push({
                userId: foundUsers[0].userId,
                text: req.body.Body,
                time: new Date()
            });

            MongoClient.connect(url, function(err2, db2) {
                if(err2) console.error('error querying mongo265', err2);
                var dbo2 = db2.db("heroku_jtgx7hwp");
                var query2 = { chatId: 0 };
                var newvalues = { $set: {messages: messages } };
                dbo2.collection("messages").updateOne(query2, newvalues, function(err3, result2) {
                    if (err3) console.error('error updating mongo270', err3);
                    console.log("1 document updated");
                    db2.close();
                    return true;
                });
            });

        });
    });

    // res.writeHead(200, {'Content-Type': 'text/xml'});
    // res.end(twiml.toString());
    res.end();
});

function getMessages(){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("heroku_jtgx7hwp");
        var query = { chatId: 0 };
        dbo.collection("messages").find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            db.close();
            return result.messages;
        });
    });
}

function saveMessages(messages){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("heroku_jtgx7hwp");
        var query = { chatId: 0 };
        var newvalues = { $set: {messages: messages } };
        dbo.collection("messages").updateOne(query, newvalues, function(err, result) {
            // if (err) throw err;
            console.log("1 document updated");
            db.close();
            return true;
        });
    });
}

app.listen(process.env.PORT || 3000);
