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
var csv = require('csv-parser');
var fs = require('fs');
const nodemailer = require('nodemailer');

const { Parser } = require('json2csv');
const { spawn } = require('child_process');

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

    let { name, email, localhost, usrsonarqube, password, password2 } = req.body;

    console.log({
        name,
        email,
        localhost,
        usrsonarqube,
        password,
        password2
    });

    let errors = [];

    if (!name || !email || !localhost || !usrsonarqube || !password || !password2) {
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
                        `INSERT INTO users (name, email, localhost, usrsonarqube, password)
                        VALUES ($1, $2, $3 , $4, $5)
                        RETURNING id, password` , [name, email, localhost, usrsonarqube, hashedPassword],
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

app.get('/csv', async (req, res) => {
    let username = req.query.username
    let projectName = req.query.projectName
    // call le python de léo


    var result;
    // spawn new child process to call the python script
    const python = spawn('python', ['./leo_python/get_project_scores.py']);
    //get_project_scores(projectName, 9000, 'admin', 'Robin2000')

    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
        result = data.toString();
    });

    // in close event we are sure that stream from child process is closed
    python.on('close', async (code) => {
        console.log(`child process close all stdio with code ${code}`);
        console.log("result : \n", result);

        let fileName = "gamicode.csv"

        // ajout des colonnes
        await updateCsv(username, "./" + fileName)

        //res.header('Content-Type', 'text/csv');
        res.attachment(projectName + ".csv");
        res.sendFile(fileName, {
            root: path.join(__dirname)
        });
    })
});


//fichiers statiques
app.use(express.static('public'))
app.use('/img', express.static(__dirname + 'public/img'))


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


async function getProjects(name) {
    let result = await axios.get(
        `https://api.github.com/users/` + name + `/repos`
    );

    return result;
}

async function updateCsv(username, fileName) {

    let response = await getProjects(username)

    let projects = {};

    let i = 0;
    for (const iterator of response.data) {
        let result = await axios.get(iterator.languages_url);
        projects[iterator.name] = {}

        let getLanguages = Object.getOwnPropertyNames(result.data);
        projects[iterator.name].languages = getLanguages

        let collaborateur = await axios.get(iterator.contributors_url);
        let login = [];
        for (const pseudo of collaborateur.data) {
            login.push(pseudo.login);
            login.join("");
        }
        projects[iterator.name].contributors = login

        i++;

    }
    //console.log(projects)

    var newCsv = [];

    return await new Promise((resolve, reject) => {
        fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', function (row) {
                let projectData = projects[row.Name]
                if (projectData) {
                    row.Languages = projectData.languages
                    row.Contributors = projectData.contributors
                } else {
                    row.Languages = []
                    row.Contributors = []
                }
                newCsv.push(row);
            })
            .on('end', function () {
                const json2csvParser = new Parser();
                const csv = json2csvParser.parse(newCsv);
                fs.writeFileSync(fileName, csv);
                resolve(newCsv)
            })
    });
}


// These id's and secrets should come from .env file.
const CLIENT_ID = '238197358312-hqt8esqfg775uuur56v4l1k2rq32698e.apps.googleusercontent.com';
const CLEINT_SECRET = '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';

async function sendMail() {
    try {
        // const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'gamicode.noreply@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLEINT_SECRET,
                accessToken: 'ya29.a0ARrdaM_5AZ6-wksytDBl2hWgIPt4PY7bwvWURsRpsbPqhXAWZ1ZTwT5TXaSEh_eVXgMFEaw3x8HFlDiZZwZepq1hDnqjMiHIoE7StDQtff53IerPn9z_qx4SICqIdLBiFgQx2MdwPAXi5QLzrNUB44-FVr72',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: 'gamicode.noreply@gmail.com',
            to: 'leo.lebarazer4@gmail.com',
            subject: 'Projet',
            text: 'Votre projet a bien été ajouté! Félicitation',
            html: '<h1>Hello from gmail email using API</h1>',
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }
}

sendMail()
    .then((result) => console.log('Email sent...', result))
    .catch((error) => console.log(error.message));





//updateCsv("Leovicar", "./leo_python/gamicode.csv")