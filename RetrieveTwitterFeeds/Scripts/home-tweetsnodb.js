$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    var allResults = 'Date,Twitter ID,Tweet';
    $('button').children('.loader').toggle();
    $('#tblResult').toggle();
    //$('#timeSpent').toggle();
    $('#btnExport').toggle();

    $('button').click(function () {
        sinceID = 0;
        status = true;
        tweetCount = 0;
        time = new Date();
        query = $('#search_term').val()

        $('button').children('.glyphicon').toggle();
        $('button').children('.loader').toggle();
        $('button').addClass('disabled');
        
        //$('#timeSpent').toggle().html('Time Start = ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());

        $.ajax('/api/gettweetsnodb', {
            method: 'GET',
            data: { 'query': query },
            success: function (data) {
                status = true;
                tweetCount = data.length;
                sinceID = data[0].StatusID;

                $('#tblResult').toggle();
                
                for (var ctr = 0 ; ctr < data.length ; ctr++) {
                    $('#tbodyResult').append('<tr><td><img src="' + data[ctr].User.ProfileImageUrl + '" alt="' + data[ctr].User.Identifier.ScreenName + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data[ctr].CreatedAt)).toLocaleString() + '</span><div><span><strong>' + data[ctr].User.Name + '</strong></span><span class="tweet-username">' + data[ctr].User.Identifier.ScreenName + '</span></div><div>' + data[ctr].Text + '</div></td></tr>');
                    allResults += '\n' + (new Date(data[ctr].CreatedAt)).toLocaleString() + ',' + data[ctr].User.Identifier.ScreenName + ',' + data[ctr].Text;
                }
                
                //time = new Date();                
                //$('#count').html('Count: ' + tweetCount);
                //$('#timeSpent').append('<br />Time End = ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds());
            },
            fail: function () {
                console.log('fail');
                status = false;
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
                                    allResults = (new Date(data[ctr].CreatedAt)).toLocaleString() + ',' + data[ctr].User.Identifier.ScreenName + ',' + data[ctr].Text + '\n' + allResults;
                                }

                                //$('#count').html('Count: ' + tweetCount);
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

    $('#btnExport').click(function () {
        var csvContent = "data:text/csv;charset=utf-8";
        csvContent += allResults;
        var encodedUri = encodeURI(csvContent);
        ////window.open(encodedUri);
        //var link = document.createElement('a');
        //link.setAttribute('href', encodedUri);
        //link.setAttribute('download', 'tweet_results.csv');
        //link.click();

        var pom = document.createElement('a');
        var csvContent = allResults; //here we load our csv data 
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        pom.href = url;
        pom.setAttribute('download', 'foo.csv');
        pom.click();
    });
});