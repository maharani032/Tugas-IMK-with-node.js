require( 'dotenv' ).config();
const express = require( "express" );
const ejs = require( "ejs" );
const mongoose = require( "mongoose" );
const session = require( 'express-session' );
const passport = require( "passport" );
const passportLocalMongoose = require( "passport-local-mongoose" );
const GoogleStrategy = require( 'passport-google-oauth20' ).Strategy;
const findOrCreate = require( 'mongoose-findorcreate' );
const marked = require( 'marked' );
const createDomPurify = require( 'dompurify' );
const { JSDOM } = require( 'jsdom' );
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
mongoose.set( "useCreateIndex", true );
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
    email: String,
    password: String,
    googleId: String
} );
postSchema.pre( "validate", function ( next ) 
{
    if ( this.content ) {
        this.html = dompurify.sanitize( marked( this.content ) )
    }

    next()
} );

// userSchema.plugin( encrypt, { secret: process.env.SECRET, encryptedFields: [ "password" ] } );
userSchema.plugin( passportLocalMongoose );

userSchema.plugin( findOrCreate );
// postSchema.index( { 'content': 'text' } );
const Post = new mongoose.model( "Post", postSchema );
const User = new mongoose.model( "User", userSchema );

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
    callbackURL: "http://localhost:3000/auth/google/refrain",
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
//close database

app.get( '/', ( req, res ) =>
{
    res.render( "main" )
} );
app.get( '/auth/google',
    passport.authenticate( 'google', { scope: [ 'profile' ] } )
);
app.get( '/auth/google/refrain',
    passport.authenticate( 'google', { failureRedirect: '/login' } ),
    function ( req, res )
    {
        // Successful authentication, redirect home.
        res.redirect( '/Home' );
    } );
app.get( "/quotes", ( req, res ) =>
{
    res.render( "quotes" )
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
app.get( "/about", ( req, res ) =>
{
    Post.find( {}, ( err, posts ) =>
    {
        res.render( "about", {
            posts: posts
            // genre: "Romance"
        } )
    } )
} );
app.get( "/Comedy/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Comedy" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                res.render( "post", {
                    post: post
                } );
            }
        }
    } );
} );
app.get( "/Horror/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Horror" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                res.render( "post", {
                    post: post
                } );
            }
        }
    } );
} );
app.get( "/Romance/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Romance" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                res.render( "post", {
                    post: post
                } );
            }
        }
    } );
} );
app.get( "/register", ( req, res ) =>
{
    res.render( "register" )
} );
app.get( "/login", ( req, res ) =>
{
    res.render( "login" )
} );
app.get( "/logout", function ( req, res )
{
    req.logout();
    res.redirect( "/" );
} );
app.get( "/Home", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "menu-akun" )
    } else {
        res.redirect( "/" )
    }
} )
app.get( "/Home/Qoutes", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "quotes-akun" )
    } else {
        res.redirect( "/quotes" )
    }
} )
app.get( "/Home/Romance", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        Post.find( { genre: "Romance" }, ( err, posts ) =>
        {
            res.render( "comedy-akun", {
                posts: posts,
                genre: "Romance"
            } )

        } )
    } else {
        res.redirect( "/" )
    }
} );
app.get( "/Home/Horror", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        Post.find( { genre: "Horror" }, ( err, posts ) =>
        {
            res.render( "comedy-akun", {
                posts: posts,
                genre: "Horror"
            } )
        } )
    } else {
        res.redirect( "/" )
    }
} );
app.get( "/Home/Comedy", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        Post.find( { genre: "Comedy" }, ( err, posts ) =>
        {
            res.render( "comedy-akun", {
                posts: posts,
                genre: "Comedy"
            } )

        } )
    } else {
        res.redirect( "/" )
    }
} );
app.get( "/Home/About", ( req, res ) =>
{
    Post.find( {}, ( err, posts ) =>
    {
        res.render( "about-akun", {
            posts: posts
            // genre: "Romance"
        } )
    } )
} )
app.get( "/Home/Comedy/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        Post.findOne( { title: topic, genre: "Comedy" }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {
                    res.render( "post-akun", {
                        post: post
                    } );
                }
            }
        } );
    }
} );
app.get( "/Home/Romance/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        Post.findOne( { title: topic, genre: "Romance" }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {
                    res.render( "post-akun", {
                        post: post
                    } );
                }
            }
        } );
    }
} );
app.get( "/Home/Horror/:posttitle", ( req, res ) =>
{
    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        Post.findOne( { title: topic, genre: "Horror" }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {
                    res.render( "post-akun", {
                        post: post
                    } );
                }
            }
        } );
    }
} );
app.get( "/profile", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "profile" )
    } else {
        res.redirect( "/" )
    }
} );
app.get( "/profile/add-story", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "profile-add" )
    } else {
        res.redirect( "/" )
    }
} )
app.post( "/login", ( req, res ) =>
{
    const user = new User( {
        username: req.body.username,
        password: req.body.password
    } );
    req.login( user, function ( err )
    {
        if ( err ) {
            console.log( err );
        } else {
            passport.authenticate( "local" )( req, res, function ()
            {
                res.redirect( "/Home" );
            } );
        }
    } );

} );
app.post( "/register", function ( req, res )
{
    User.register( { username: req.body.username },
        req.body.password, function ( err, user )
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
app.post( "/profile", ( req, res ) =>
{
    const post = new Post( {
        title: req.body.postTitle,
        content: req.body.postBody,
        genre: req.body.postGenre,
        write: req.body.postPenulis,
        Deskripsi: req.body.postDeskripsi
    } );
    post.save();

    res.redirect( "/Home" )
} );
let port = process.env.PORT;
if ( port == null || port == "" ) {
    port = 3000;
}
app.listen( port, () => console.log( "server up" ) );