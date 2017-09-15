var express = require('express');
var router = express.Router();
var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'prk',
    password : 'prk',
    database : 'prk'
});
var passport = require('passport');

connection.connect();

var authMiddleware = function (req,res,next) {
    if(req.session.user){
        next();
    }else{
        return res.redirect('/');
    }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET register. */
router.get('/register', function(req, res, next) {
    res.render('register');
});

/* GET home. */
router.get('/home',authMiddleware,function(req, res, next) {
    res.render('home',{user: req.session.user});
});

/* GET logout. */
router.get('/logout',function(req, res, next) {
    // req.session.destroy(); //Deleting all sessions
    req.session.destroy('user'); // Deleting value from KEY
    res.redirect('/');
});

/* POST register. */
router.post('/doRegister', function(req, res, next) {
    var username = req.body.username;
    var gender = req.body.gender;
    var password = req.body.password;
    var email = req.body.email;

    var sql = "INSERT INTO users VALUES (?,?,?,?,?)";
    var values = [null,username,gender,password,email];

    connection.query(sql,values,function (err,results) {
        //Results bakal ada isi nya kalau "SELECT"
        //Jalan ketika query selesai
        if(err){
            console.log(err);
            throw err; //Untuk nge-break
        }

        return res.redirect('/');
    });
});

/* GET register. */
router.post('/doLogin', function(req, res, next) {
    var credential = req.body.credential; // email | username;
    var password = req.body.password; // password

    var sql = "SELECT * FROM users WHERE (username = ? OR email = ? ) AND password = ?";
    var values = [credential,credential,password];
    
    connection.query(sql,values,function (err, results) {
        if(err){
            console.log(err);
            throw err; //Untuk nge-break
        }

        if(results.length == 0){
            return res.redirect('/');
        }

        req.session.user = results[0];

        return res.redirect('/home');
    });
    
});

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] })); //scope untuk jadi permission agar bisa diambil emailnya

router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    // req.session.user = req.user; //simpen hasil dari API facebook ke session
    // return res.redirect('/home'); //lgsung redirect ke halaman home ketika sudah berhasil login

    //Cek email difacebook, terdaftar tidak

    var sql = "SELECT * FROM users WHERE email = ?";
    var values = [req.user.emails[0].value];

    connection.query(sql,values,function (err,results) {
        if(err){
            console.log(err);
            throw err;
        }

        if(results.length == 0){
            req.session.email = req.user.emails[0].value;
            return res.redirect('/register');
        }else{
            req.session.user = results[0];
            return res.redirect('/home');
        }
    });
});



module.exports = router;
