require( 'dotenv' ).config();
const express = require( "express" );
const bodyParser = require( "body-parser" );
const ejs = require( "ejs" );
const mongoose = require( "mongoose" );
const session = require( 'express-session' );
const passport = require( "passport" );
const passportLocalMongoose = require( "passport-local-mongoose" );
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const findOrCreate = require( 'mongoose-findorcreate' );
const marked = require( 'marked' )
const createDomPurify = require( 'dompurify' )
const { JSDOM } = require( 'jsdom' )
const dompurify = createDomPurify( new JSDOM().window )

const app = express();

app.use( express.static( "public" ) );
app.set( 'view engine', 'ejs' );
app.use( bodyParser.urlencoded( {
    extended: true
} ) );
app.use( session( {
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
} ) );

app.use( passport.initialize() );
app.use( passport.session() );
//database
mongoose.connect( "mongodb+srv://mahar:tugasimk@cluster0.1sszm.mongodb.net/Refrain?retryWrites=true&w=majority"
    , {
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useNewUrlParser: true,
    } );
const userSchema = new mongoose.Schema( {
    email: String,
    password: String,
    googleId: String,
} );
const postSchema = new mongoose.Schema( {
    Deskripsi: {
        type: String,
        required: true
    },
    write: String,
    title: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    html: {
        type: String,
        requiredt: true
    }
} );
postSchema.pre( "validate", function ( next ) 
{
    if ( this.content ) {
        this.html = dompurify.sanitize( marked( this.content ) )
    }

    next()
} );
userSchema.plugin( passportLocalMongoose );
userSchema.plugin( findOrCreate );
postSchema.index( { 'content': 'text' } );
const User = new mongoose.model( "User", userSchema );
const Post = new mongoose.model( "Post", postSchema );
//close database
passport.use( User.createStrategy() );

passport.serializeUser( function ( user, done )
{
    done( null, user.id );
} );

passport.deserializeUser( function ( id, done )
{
    User.findById( id, function ( err, user )
    {
        done( err, user );
    } );
} );

passport.use( new GoogleStrategy( {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function ( accessToken, refreshToken, profile, cb )
    {
        console.log( profile );

        User.findOrCreate( { googleId: profile.id }, function ( err, user )
        {
            return cb( err, user );
        } );
    }
) );
app.get( '/', ( req, res ) =>
{
    res.render( "main" )
} );

app.get( "/compose", ( req, res ) =>
{
    res.render( "compose" )
} );
app.get( "/:postGenre", ( req, res ) =>
{
    const requestedpostGenre = req.params.postGenre;
    Post.find( { genre: requestedpostGenre }, ( err, posts ) =>
    {
        res.render( "comedy", {
            posts: posts,
            genre: requestedpostGenre
        } )
    } );
} );
app.get( "/:postGenre/:posttitle", ( req, res ) =>
{
    postGenre = req.params.postGenre;
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: postGenre }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {

                res.redirect( "/compose" );
            }
            else {
                res.render( "post", {
                    post: post
                } );
            }
        }
    } );
} )
app.post( "/compose", ( req, res ) =>
{
    const post = new Post( {
        title: req.body.postTitle,
        content: req.body.postBody,
        genre: req.body.postGenre,
        write: req.body.postPenulis,
        Deskripsi: req.body.postDeskripsi
    } );
    post.save();
    res.redirect( "/" )
} );

let port = process.env.PORT;
if ( port == null || port == "" ) {
    port = 3000;
}

app.listen( port, () => console.log( "server up" ) );