const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const app = express();
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv')


dotenv.config({ path: './config/config.env' })




app.use(methodOverride('_method'));


const mongoURI = 'mongodb+srv://Test:Test@cluster0.xck0h.mongodb.net/ABC?retryWrites=true&w=majority';
const conn = mongoose.createConnection(mongoURI, (error, client) => {
    if (error)
        console.log(err);

    else {
        console.log("Connected to db");
    }
});

//GFS
let gfs;
conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});


// Create Storage Engine
const storage = new GridFsStorage({
    url: 'mongodb+srv://Test:Test@cluster0.xck0h.mongodb.net/ABC?retryWrites=true&w=majority',
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }

                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads',
                    metadata: process.env.GOOGLE_CLIENT_SECRET1

                };
                resolve(fileInfo);
            });
        });
    }
});
var user;
const upload = multer({ storage });



app.post('/users/upload', upload.single('file'), (req, res) => {



    res.redirect('/dashboard');
});





app.get('/dashboard/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {

            return res.status(404).json({
                err: 'No files exist'
            });
        }

        console.log(files);
        // Files exist
        return res.json(files);
    });
});

app.get('/userfiles', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {

            return res.status(404).json({
                err: 'No files exist'
            });
        }


        const user_id = process.env.GOOGLE_CLIENT_SECRET1;
        var items = [];

        for (i = 0; i < files.length; i++) {


            if (files[i].metadata === user_id.toString()) {

                items.push(files[i]);
            }
        }

        // Files exist
        return res.json(items);
    });
});







//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');



//BodyParser

app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
    session({
        secret: 'secrettexthere',
        resave: true,
        saveUninitialized: true
    })
);

const t = require('./config/passport');
t.method(passport);


app.use(passport.initialize());
app.use(passport.session());

// connect flash 

app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
const PORT = process.env.PORT || 5000;




app.listen(PORT, console.log("server is started on port 5000"));