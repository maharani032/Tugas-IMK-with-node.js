require( 'dotenv' ).config()
const dotenv = require( 'dotenv' );
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
const flash = require( 'connect-flash' );
const methodOverride = require( 'method-override' );


app.use( express.static( "public" ) );
app.set( 'view engine', 'ejs' );
app.use( express.urlencoded( {
    extended: true
} ) );
app.use( methodOverride( '_method' ) )
app.use( session( {
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: true
} ) );
app.use( flash() );
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
// mongoose.set( "useCreateIndex", true );
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
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, comment: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    } ]
} );
const userSchema = new mongoose.Schema( {

    fname: String,
    lname: String,

    email: String,
    password: String,
    googleId: String,

    postId: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    } ]
} );
const commentSchema = new mongoose.Schema( {
    userId: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    } ],
    komen: String,
    postId: [ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    } ],
    fname: String,
    lname: String
} )
postSchema.pre( "validate", function ( next ) 
{
    if ( this.content ) {
        this.html = dompurify.sanitize( marked( this.content ) )
    }

    next()
} );


userSchema.plugin( passportLocalMongoose, { usernameLowerCase: true } );
userSchema.plugin( findOrCreate );
const Post = new mongoose.model( "Post", postSchema );
const User = new mongoose.model( "User", userSchema );
const Comment = new mongoose.model( "Comment", commentSchema );
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
    callbackURL: "https://refrain01.herokuapp.com/auth/google/refrain",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function ( accessToken, refreshToken, profile, cb )
    {
        User.findOrCreate( { googleId: profile.id, }, { fname: profile.displayName }, function ( err, user )
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
        } )
    } )
} );
app.get( "/Comedy/:posttitle/:id", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Comedy" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                Comment.find( { postId: req.params.id }, ( err, comments ) =>
                {

                    res.render( "post", {
                        post: post,
                        comments: comments
                    } )
                } );
            }
        }
    } );
} );

app.get( "/Horror/:posttitle/:id", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Horror" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                Comment.find( { postId: req.params.id }, ( err, comments ) =>
                {

                    res.render( "post", {
                        post: post,
                        comments: comments
                    } )
                } );
            }
        }
    } );
} );
app.get( "/Romance/:posttitle/:id", ( req, res ) =>
{
    topic = req.params.posttitle;
    Post.findOne( { title: topic, genre: "Romance" }, ( err, post ) =>
    {
        if ( !err ) {
            if ( !post ) {
                res.redirect( "/" );
            }
            else {
                Comment.find( { postId: req.params.id }, ( err, comments ) =>
                {
                    res.render( "post", {
                        post: post,
                        comments: comments
                    } )
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
        let namef = req.user.fname
        let namel = req.user.lname
        res.render( "menu-akun", {
            namef: namef,
            namel: namel
        } )
    } else {
        res.redirect( "/login" )
    }
} )
app.get( "/Home/Qoutes", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        res.render( "quotes-akun" )
    } else {
        res.redirect( "/login" )
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
        res.redirect( "/login" )
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
        res.redirect( "/login" )
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
        res.redirect( "/login" )
    }
} );
app.get( "/Home/About", ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        Post.find( {}, ( err, posts ) =>
        {
            res.render( "about-akun", {
                posts: posts
            } )
        } )
    } else {
        res.redirect( "/login" )
    }
} )
app.get( "/Home/Comedy/:posttitle/:id", ( req, res ) =>
{
    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        let id = req.user._id;
        Post.findOne( { title: topic, genre: "Comedy", _id: req.params.id }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {
                    Comment.find( { postId: req.params.id }, ( err, comments ) =>
                    {

                        res.render( "post-akun", {
                            post: post,
                            comments: comments
                        } )
                    } );
                }
            }
        } );
    } else {
        res.redirect( "/login" )
    }
} );
app.get( "/Home/Romance/:posttitle/:id", ( req, res ) =>
{

    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        let id = req.user._id;
        Post.findOne( { title: topic, genre: "Romance", _id: req.params.id }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {
                    Comment.find( { postId: req.params.id }, ( err, comments ) =>
                    {
                        res.render( "post-akun", {
                            post: post,
                            comments: comments
                        } )
                    } );
                }
            }
        } );
    } else {
        res.redirect( "/login" )
    }
} );
app.get( "/Home/Horror/:posttitle/:id", ( req, res ) =>
{
    topic = req.params.posttitle;
    if ( req.isAuthenticated() ) {
        let id = req.user._id;
        Post.findOne( { title: topic, genre: "Horror", _id: req.params.id }, ( err, post ) =>
        {
            if ( !err ) {
                if ( !post ) {
                    res.redirect( "/Home" );
                }
                else {

                    Comment.find( { postId: req.params.id }, ( err, comments ) =>
                    {
                        res.render( "post-akun", {
                            post: post,
                            comments: comments
                        } )
                    } );
                }
            }
        } );
    } else {
        res.redirect( "/login" )
    }
} );
app.get( "/profil", ( req, res ) =>
{

    if ( req.isAuthenticated() ) {
        let namef = req.user.fname
        let namel = req.user.lname
        let id = req.user._id;

        Post.find( { userId: id }, ( err, posts ) =>
        {
            res.render( "profile", {
                namef: namef,
                namel: namel,
                posts: posts
            } )
        } )
    } else {
        res.redirect( "/login" )
    }
} );
app.get( "/profil/add-story", ( req, res ) =>
{

    if ( req.isAuthenticated() ) {
        let namef = req.user.fname
        let namel = req.user.lname
        res.render( "profile-add", {
            namef: namef,
            namel: namel
        } )
    } else {
        res.redirect( "/login" )
    }
} );
app.get( "/profil/edit-story/:id", async ( req, res ) =>
{

    if ( req.isAuthenticated() ) {

        let namef = req.user.fname
        let namel = req.user.lname
        const post = await Post.findById( req.params.id )
        res.render( "profile-edit", {
            post: post,
            namef: namef,
            namel: namel
        } )
    }
    else {
        res.redirect( "/login" )
    }
} )

app.post( "/login", passport.authenticate( "local", {
    successRedirect: "/Home",
    failureRedirect: "/login",
    failureFlash: true,
} ) );
app.post( "/register", function ( req, res )
{
    User.register( { username: req.body.username, fname: req.body.fname, lname: req.body.lname },
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
app.post( "/profil", ( req, res ) =>
{
    let id = req.user._id
    const post = new Post( {
        title: req.body.postTitle,
        content: req.body.postBody,
        genre: req.body.postGenre,
        write: req.body.postPenulis,
        Deskripsi: req.body.postDeskripsi,
        userId: id
    } );
    post.save();

    res.redirect( "/Home" )
} );
app.post( "/Home/:genre/:title/comment/:id", ( req, res, post ) =>
{
    if ( req.isAuthenticated() ) {
        let genre = req.params.genre;
        let title = req.params.title;
        let id = req.user._id;
        let post = req.params.id;
        let lname = req.user.lname;
        let fname = req.user.fname;
        const comment = new Comment( {
            userId: id,
            postId: post,
            komen: req.body.Komentar,
            fname: fname,
            lname: lname
        } );
        comment.save();

        res.redirect( "/Home/" + genre + "/" + title + "/" + post )
    } else {
        res.redirect( "/login" )
    }
} );
app.delete( "/profil/:id", async ( req, res ) =>
{
    if ( req.isAuthenticated() ) {
        await Post.findByIdAndDelete( req.params.id )
        res.redirect( "/profil" )
    }

} )
function saveArticleAndRedirect ( path )
{
    return async ( req, res ) =>
    {
        let post = req.post
        post.title = req.body.postTitle
        post.write = req.body.postPenulis
        post.Deskripsi = req.body.postDeskripsi
        post.content = req.body.postBody
        post.useId = req.user._id
        post.genre = req.body.postGenre
        try {
            post = await post.save()
            res.redirect( "/profil" )
        } catch ( express ) {
            res.render( `/profil/edit-story/${ path }`, { post: post } )
        }
    }
}
app.put( "/profil/edit/:id", async ( req, res, next ) =>
{

    req.post = await Post.findById( req.params.id )
    next()
}, saveArticleAndRedirect( 'profil' ) )

app.use( ( req, res ) =>
{
    res.status( 404 ).render( '404' )
} )
app.listen( process.env.PORT || 3000, function ()
{
    console.log( "Express server listening on port %d in %s mode", this.address().port, app.settings.env );
} );