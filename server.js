const fs = require('fs'),
    https = require('https'),
    express = require('express'),
    Session = require('express-session'),
    FileStore = require('session-file-store')(Session),
    fileUpload = require('express-fileupload'),
    bodyParse = require('body-parser'),
    config = require('config'),
    middleware = require('connect-ensure-login'),
    scheduler = require('./cron/scheduler'),
    options = {
        key: fs.readFileSync(__dirname + '/certs/selfsigned.key'),
        cert: fs.readFileSync(__dirname + '/certs/selfsigned.crt'),
    },
    port = 8888;
const passport = require('./auth/passport');
const app = express();
mongoose.connect('mongodb://127.0.0.1/nodeScheduler');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/src', express.static(__dirname + '/public'));
app.use('/media', express.static(__dirname + '/media'));

app.use(fileUpload());

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json());
app.use(Session({
    store: new FileStore(),
    secret: config.get('sessionSecret'),
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/login', require('./routes/login'));

app.get('/',
    function (req, res) {
        res.render('app', {user: req.user});
    });

https.createServer(options, app).listen(port, function(){
    console.log("Express server listening on port " + port);
});