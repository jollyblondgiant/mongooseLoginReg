var express, app, bodyParser, server, mongoose, session, flash, path, bcrypt, uniqueValidator


express = require('express'); 
crypto = require("crypto");
app = express();
session = require("express-session");
bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
path = require('path')
flash = require('express-flash')
app.use(flash());
bcrypt = require('mongoose-bcrypt')
app.use(session({
    secret:"gnomon",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}))
//PATHS
app.use(express.static(path.join(__dirname, '/static')));
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs');
server = app.listen(1337)
// MONGOOSE_DB
mongoose = require('mongoose')
uniqueValidator = require('mongoose-unique-validator');
mongoose.promise = global.Promise
mongoose.connect('mongodb://localhost/mongoLoginReg')

//SCHEMA
var UserSchema = new mongoose.Schema({
    email: {
        type: String, 
        unique: true,
        required:[true, "'Email' field required"],
        validate: {
            validator: function(v){
                return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}/.test(v)
            },
            message: "Invalid email!"
        }
    },
    first_name: {type: String, required: [true, "'Name' fields are required"]},
    last_name: {type: String, required: [true, "'Name' fields are required"]},
    password: {type: String, required: [true, "Please enter a password"], bcrypt:true},
    birthday: {type: Date, required:[true, "Please enter a birth date"]},
    hash: String,
    salt: String,
})
UserSchema.plugin(require("mongoose-bcrypt"))
UserSchema.plugin(uniqueValidator, { message: '{PATH} already in use' });
mongoose.model('User', UserSchema)
var User = mongoose.model('User')
//ROUTES
app.get('/', function(req, res){
    
    res.render('index')
})

app.post('/register', function(req, res){
    var user = new User
    user.first_name = req.body.first_name
    user.last_name = req.body.last_name
    user.birthday = req.body.bday
    user.email = req.body.email
    user.password = req.body.password
    user.save(function(err){
        if(err){
            for(var key in err.errors){
                req.flash('registration', err.errors[key].message)
            }
            res.redirect('/')
        }else{
            res.redirect('/')
        }
    })   
    
})

app.post('/login', function(req,res){
    var email, password, session
    session = req.session
    email = req.body.loginEmail
    password = req.body.loginPw
    User.findOne({'email': email}, function(req, user){
        if (user == null){

        }
        else{
            user.verifyPassword(password, function(err, valid){
                if(err){
                }
                else if(valid){
                    session.userid = user.id
                    res.redirect('/dash')
                }
                else{
                    res.redirect('/')
                }
            })
        }
    })
    
})
app.get('/dash', function(req, res){
   
    if(req.session.userid){
      
        User.findById(req.session.userid, function(err, user){
         
        res.render('dash', {'user':user})
        })
        
    }
    else{
        res.redirect('/')
    }
})