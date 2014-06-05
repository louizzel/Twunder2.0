$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    $('button').children('.loader').toggle();
    $('#tblResult').toggle();
    $('#timeSpent').toggle();

    $('button').click(function () {
        sinceID = 0;
        status = true;
        tweetCount = 0;
        time = new Date();
        query = $('#search_term').val()

        $('button').children('.glyphicon').toggle();
        $('button').children('.loader').toggle();
        $('button').addClass('disabled');
        $('#timeSpent').toggle().html('Time Start = ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());

        $.ajax('/api/gettweetsnodb', {
            method: 'GET',
            data: { 'query': query },
            success: function (data) {
                status = true;
                tweetCount = data.length;
                sinceID = data[0].StatusID;

                $('#tblResult').toggle();
                
                for (var ctr = 0 ; ctr < data.length ; ctr++) { //data[ctr].CreatedAt
                    $('#tbodyResult').append('<tr><td>' + (ctr + 1) + '-' + data[ctr].StatusID  + '</td><td>' + data[ctr].User.Identifier.ScreenName + '</td><td>' + data[ctr].Text + '</td></tr>');
                }

                time = new Date();                
                $('#count').html('Count: ' + tweetCount);
                $('#timeSpent').append('<br />Time End = ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());
            },
            fail: function () {
                console.log('fail');
                status = false;
            }
        }).done(function () {
            $('button').removeClass('disabled');
            $('button').children('.glyphicon').toggle();
            $('button').children('.loader').toggle();
            if (status) {
                status = false;
                setInterval(function () {
                    $.ajax('/api/gettweetsnodb', {
                        method: 'GET',
                        data: { 'query': query, 'sinceID': sinceID },
                        success: function (data) {
                            status = true;
                            if (data.length > 0) {
                                sinceID = data[data.length - 1].StatusID;
                                tweetCount += data.length;

                                for (var ctr = 0 ; ctr < data.length; ctr++) {
                                    $('#tbodyResult').prepend('<tr><td>' + (ctr + 1) + '-' + data[ctr].StatusID + '</td><td>' + data[ctr].User.Identifier.ScreenName + '</td><td>' + data[ctr].Text + '</td></tr>');
                                }

                                $('#count').html('Count: ' + tweetCount);
                            }
                        }, fail: function () {
                            status = false;
                            clearInterval();
                        }
                    });
                }, 30000);
            } else {
                clearInterval();
            }
        });
    });
});