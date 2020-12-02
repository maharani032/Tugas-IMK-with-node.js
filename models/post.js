const mongoose = require( 'mongoose' )
const marked = require( 'marked' )
const createDomPurify = require( 'dompurify' )
const { JSDOM } = require( 'jsdom' )
const dompurify = createDomPurify( new JSDOM().window )

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

module.exports = mongoose.model( "Post", postSchema )