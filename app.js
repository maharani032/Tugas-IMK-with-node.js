require( 'dotenv' ).config();
const express = require( "express" );
const ejs = require( "ejs" );
const mongoose = require( "mongoose" );
const session = require( 'express-session' );
const passport = require( "passport" );
const passportLocalMongoose = require( "passport-local-mongoose" );
const localStrategy = require( "passport-local" ).Strategy;
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const findOrCreate = require( 'mongoose-findorcreate' );
const marked = require( 'marked' );
const createDomPurify = require( 'dompurify' );
const { JSDOM } = require( 'jsdom' );
const encrypt = require( "mongoose-encryption" );
const dompurify = createDomPurify( new JSDOM().window )
const app = express();

app.use( express.static( "public" ) );
app.set( 'view engine', 'ejs' );
app.use( express.urlencoded( {
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
    },
    time: {
        type: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
} );
const userSchema = new mongoose.Schema( {
    nama: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    post: { type: [ postSchema ] }
} );
postSchema.pre( "validate", function ( next ) 
{
    if ( this.content ) {
        this.html = dompurify.sanitize( marked( this.content ) )
    }

    next()
} );

userSchema.plugin( encrypt, { secret: process.env.SECRET, encryptedFields: [ "password" ] } );
userSchema.plugin( passportLocalMongoose );
// userSchema.plugin( findOrCreate );
// postSchema.index( { 'content': 'text' } );
const Post = new mongoose.model( "Post", postSchema );
const User = new mongoose.model( "User", userSchema );

passport.use( User.createStrategy() );
passport.serializeUser( function ( user, done )
{
    done( null, user );
} );

passport.deserializeUser( function ( user, done )
{
    done( null, user );
} );
//close database
app.get( "/register", ( req, res ) =>
{
    res.render( "register" )
} );
app.get( "/login", ( req, res ) =>
{
    res.render( "login" )
} );
app.get( '/', ( req, res ) =>
{
    res.render( "main" )
} );
app.get( "/Comedy", ( req, res ) =>
{
    Post.find( { genre: "Comedy" }, ( err, posts ) =>
    {
        res.render( "comedy", {
            posts: posts,
            genre: "Comedy"
        } )
    } )
} );
app.get( "/Romance", ( req, res ) =>
{
    Post.find( { genre: "Romance" }, ( err, posts ) =>
    {
        res.render( "comedy", {
            posts: posts,
            genre: "Romance"
        } )
    } )
} );
app.get( "/Horror", ( req, res ) =>
{
    Post.find( { genre: "Horror" }, ( err, posts ) =>
    {
        res.render( "comedy", {
            posts: posts,
            genre: "Horror"
        } )
    } )
} );

app.get( "/logout", function ( req, res )
{
    req.logout();
    res.redirect( "/" );
} );

// app.get( "/compose", ( req, res ) =>
// {
//     res.render( "compose" )
// } );

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

app.post( "/register", function ( req, res )
{

    User.register( { username: req.body.username }, req.body.password, function ( err, user )
    {
        if ( err ) {
            console.log( err );
            res.redirect( "/register" );
        } else {
            passport.authenticate( "local" )( req, res, function ()
            {
                res.redirect( "/Home" );
            } );
        }
    } );
} );

app.get( "/Home", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "menu-akun" )
    } else {
        res.redirect( "/" )
    }
} )
app.post( "/login", function ( req, res )
{
    const user = new User( {
        username: req.body.username,
        password: req.body.password
    } );

    req.login( user, function ( err )
    {
        if ( err ) { return next( err ); }
        return res.redirect( "/Home" );
    } );

} );
app.get( "/profile", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "profile" )
    } else {
        res.redirect( "/" )
    }
} )

let port = process.env.PORT;
if ( port == null || port == "" ) {
    port = 3000;
}
app.listen( port, () => console.log( "server up" ) );