$( '.circle a.comedy' ).on( 'click', function ()
{
    $( $( '.circle' ).get().reverse() ).each( function ( index )
    {
        $( this ).delay( 500 * index ).fadeOut( 500 );
    } );
    setTimeout( function ()
    {
        window.location.href = 'Comedy'
    }, 1500 )
} )

$( '.circle a.horror' ).on( 'click', function ()
{
    $( $( '.circle' ).get().reverse() ).each( function ( index )
    {
        $( this ).delay( 500 * index ).fadeOut( 500 );
    } );
    setTimeout( function ()
    {
        window.location.href = 'Horror'
    }, 1500 )
} )

$( '.circle a.romance' ).on( 'click', function ()
{
    $( $( '.circle' ).get().reverse() ).each( function ( index )
    {
        $( this ).delay( 500 * index ).fadeOut( 500 );
    } );
    setTimeout( function ()
    {
        window.location.href = 'Romance'
    }, 1500 )
} )





$( '.circle' ).hide();
$( '.circle' ).each( function ( index )
{
    $( this ).delay( 500 * index ).fadeIn( 500 );
} );









