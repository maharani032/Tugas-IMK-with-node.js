$(function () {
    $('.circle').hide().each(function (index) {
        $(this).delay(500 * index).fadeIn(500);
    })
});

$(function () {
    $('.name-table .profile').hide();
    $('.name-table').each(function (index) {
        
        $(this).delay(1500 * index).animate({
            paddingLeft: '-=1000',
            opacity: '+=5'

        }, 1500, function () {
                $('.name-table .profile').each(function (aa){
                    $(this).delay(1500 * aa).fadeIn(1000);
                })
        });
       
    });
   
});