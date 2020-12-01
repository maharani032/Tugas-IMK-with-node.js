( function ()
{
    var docElem = window.document.documentElement, didScroll, scrollPosition;

    function noScrollFn ()
    {
        window.scrollTo( scrollPosition ? scrollPosition.x : 0, scrollPosition ? scrollPosition.y : 0 );
    }

    function noScroll ()
    {
        window.removeEventListener( 'scroll', scrollHandler );
        window.addEventListener( 'scroll', noScrollFn );
    }

    function scrollFn ()
    {
        window.addEventListener( 'scroll', scrollHandler );
    }

    function canScroll ()
    {
        window.removeEventListener( 'scroll', noScrollFn );
        scrollFn();
    }

    function scrollHandler ()
    {
        if ( !didScroll ) {
            didScroll = true;
            setTimeout( function () { scrollPage(); }, 60 );
        }
    };

    function scrollPage ()
    {
        scrollPosition = { x: window.pageXOffset || docElem.scrollLeft, y: window.pageYOffset || docElem.scrollTop };
        didScroll = false;
    };

    scrollFn();

    [].slice.call( document.querySelectorAll( '.morph-button' ) ).forEach( function ( bttn )
    {
        new UIMorphingButton( bttn, {
            closeEl: '.icon-close',
            onBeforeOpen: function ()
            {
                noScroll();
            },
            onAfterOpen: function ()
            {
                canScroll();
            },
            onBeforeClose: function ()
            {
                noScroll();
            },
            onAfterClose: function ()
            {
                canScroll();
            }
        } );
    } );

    [].slice.call( document.querySelectorAll( 'form button' ) ).forEach( function ( bttn )
    {
        bttn.addEventListener( 'click', function ( ev ) { ev.preventDefault(); } );
    } );
} )();