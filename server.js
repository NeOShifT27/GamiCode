const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require("path");
const axios = require('axios');
const cors = require('cors');
const initializePasseport = require('./passportConfig');
const ftch = require('node-fetch');
initializePasseport(passport);

const PORT = process.env.PORT || 4000;

app.set('view engine', 'ejs');

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});

async function getData() {

    const headers = {
        'Accept': 'application/json',
        'api-token': 'ncJr9anvrOZMsA8nV0ll'

    };

    // fetch('https://app.codacy.com/api/v3/version',
    //     {
    //         method: 'GET',

    //         headers: headers
    //     })
    //     .then(function (res) {
    //         return res.json();
    //     }).then(function (body) {
    //         console.log(body);
    //     });
}

getData()
// app.get('/test', async (req, res) => {
//     try {


//         res.send(result.data)
//     }
//     catch (error) {
//         console.log(error)
//     }
// });

app.get('/users/register', (req, res) => {
    res.render('register');
});

app.get('/users/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'Vous êtes déconnecté ');
    res.redirect('/users/login');
})
app.get('/users/login', (req, res) => {
    if (req.user !== undefined) {
        res.redirect('/users/dashboard')
    } else {
        res.render('login');

    }

});


app.route('/users/dashboard').get(isreallylogin, (req, res) => {
    res.render('dashboard', { user: req.user.name });
});

function isreallylogin(req, res, next) {
    if (req.user !== undefined) {
        next()
    } else {
        res.redirect('/users/login')
    }
}

// app.get('/users/dashboard2', async (req, res) => {

//     let names = await pool.query(
//         `SELECT * FROM users`)
//     res.status(200).json(names.rows)
// })

app.post('/users/register', async (req, res) => {

    let { name, email, password, password2 } = req.body;

    console.log({
        name,
        email,
        password,
        password2
    });

    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ message: "A renseigner" });
    }

    if (password.length < 6) {
        errors.push({ message: "6 caractères minimums" });
    }

    if (password != password2) {
        errors.push({ message: "Le mot de passe doit être le même" });
    }

    if (errors.length > 0) {
        res.render('register', { errors })
    } else {
        //sinon s'il s'est bien enregistré

        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users WHERE email= $1`, [email], (err, results) => {
                if (err) {
                    throw err
                }
                console.log(results.rows);

                if (results.rows.length > 0) {
                    errors.push({ message: 'Email déjà enregistré' });
                    res.render('register', { errors });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password)
                        VALUES ($1, $2, $3)
                        RETURNING id, password` , [name, email, hashedPassword],
                        (err, results) => {
                            if (err) {
                                throw err
                            }
                            console.log(results.rows);
                            req.flash('success_msg', 'Vous êtes désormais enregistré. Veuillez vous connecter');
                            res.redirect('/users/login');
                        }
                    )
                }
            }
        )
    }
});

app.post('/users/login', passport.authenticate('local', {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
}));


//fichiers statiques
app.use(express.static('public'))
app.use('/img', express.static(__dirname + 'public/img'))


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

