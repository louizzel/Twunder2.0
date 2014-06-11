$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    var newestDate = new Date();
    var oldestDate = new Date();
    var allResults = '';
    $('button').children('.loader').toggle();
    $('#tblResult').toggle();
    $('#timeSpent').toggle();
    $('#btnExport').toggle();

    $(".advanced-search").click(function () {

    });

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
                if (data.length > 0) {
                    status = true;
                    tweetCount = data.length;
                    sinceID = data[0].StatusID;

                    $('#tblResult').toggle();

                    for (var ctr = 0 ; ctr < data.length ; ctr++) {
                        $('#tbodyResult').append('<tr><td><img src="' + data[ctr].User.ProfileImageUrl + '" alt="' + data[ctr].User.Identifier.ScreenName + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data[ctr].CreatedAt)).toLocaleString() + '</span><div><span><strong>' + data[ctr].User.Name + '</strong></span><span class="tweet-username">' + data[ctr].User.Identifier.ScreenName + '</span></div><div>' + data[ctr].Text + '</div></td></tr>');
                        allResults += (new Date(data[ctr].CreatedAt)).toLocaleString() + ',' + data[ctr].User.Identifier.ScreenName + ',' + data[ctr].Text.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
                    }

                    time = new Date();                
                    $('#count').html('Count: ' + tweetCount).removeClass('alert-danger').addClass('alert-success');
                    $('#timeSpent').append('<br />Time End = ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());
                } else {
                    $('#count').html('No tweets retrieved with that query.').addClass('alert-danger');
                }
            },
            fail: function () {
                status = false;
                console.log('fail');
                $('#count').html('Error encountered. Please refresh the page and search again.').addClass('alert-danger').removeClass('alert-success');
            }
        }).done(function () {
            $('#btnExport').toggle();
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
                                    $('#tbodyResult').prepend('<tr><td><img src="' + data[ctr].User.ProfileImageUrl + '" alt="' + data[ctr].User.Identifier.ScreenName + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data[ctr].CreatedAt)).toLocaleString() + '</span><div><span><strong>' + data[ctr].User.Name + '</strong></span><span class="tweet-username">' + data[ctr].User.Identifier.ScreenName + '</span></div><div>' + data[ctr].Text + '</div></td></tr>');
                                    allResults = (new Date(data[ctr].CreatedAt)).toLocaleString() + ',' + data[ctr].User.Identifier.ScreenName + ',' + data[ctr].Text.replace(/(\r\n|\n|\r)/gm, " ") + '\n' + allResults;
                                }

                                $('#count').html('Count: ' + tweetCount);
                            }
                        }, fail: function () {
                            status = false;
                            clearInterval();
                        }
                    });
                }, 20000);
            } else {
                clearInterval();
            }
        });
    });

    $('#btnExport').click(function () {        
        var anchor = document.createElement('a');
        var csvContent = 'Date,Twitter ID,Tweet\n' + allResults;
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        anchor.href = url;
        anchor.setAttribute('download', 'Tweets for ' + query + '.csv');
        anchor.click();
    });
});