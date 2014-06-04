$(document).ready(function () {
    $('button').children('.loader').toggle(); //hides the loader
    $('#tblResult').toggle(); //hides the table

    $('button').click(function () {
        $('button').children('.glyphicon').toggle();
        $('button').children('.loader').toggle();

        $.ajax('api/gettweets', {
            method: 'GET',
            success: function () {
                console.log('success!');
            }
        });
    });
});