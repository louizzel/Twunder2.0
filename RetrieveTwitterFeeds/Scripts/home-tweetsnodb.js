$(document).ready(function () {
    $('button').children('.loader').toggle();
    $('#tblResult').toggle();

    $('button').click(function () {
        $('button').children('.glyphicon').toggle();
        $('button').children('.loader').toggle();
        $('button').addClass('disabled');
        
        $.ajax('/api/gettweetsnodb', {
            method: 'GET',
            data: { 'query': $('#search_term').val() },
            success: function (data) {
                console.dir(data);
                $('#tblResult').toggle();
                
                for (var ctr = 0 ; ctr < data.length ; ctr++) { //data[ctr].CreatedAt
                    $('#tbodyResult').append('<tr><td>' + data[ctr].StatusID  + '</td><td>' + data[ctr].User.Identifier.ScreenName + '</td><td>' + data[ctr].Text + '</td></tr>');
                }
            },
            fail: function () {
                console.log('fail');
            }
        }).done(function () {
            $('button').removeClass('disabled');
            $('button').children('.glyphicon').toggle();
            $('button').children('.loader').toggle();
        });
    });
});