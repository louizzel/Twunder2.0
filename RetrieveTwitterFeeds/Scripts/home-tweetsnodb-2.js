$(document).ready(function () {
    var sinceID = 0;
    var query = "";
    var maxID = 0;
    var status = true;
    var tweetCount = 0;
    var time = new Date();
    var newestDate = new Date();
    var oldestDate = new Date();
    var allResults = '';
    var gatherMore = true;
    $('button').children('.loader').toggle();
    $('#tblResult').toggle();
    $('#timeSpent').toggle();
    $('#btnExport').toggle();
    $('#toDate').attr('disabled', '');

    $(".advanced-search").click(function () {
    });

    $("#fromDate").datepicker({
        minDate: -7,
        maxDate: 0,
        showAnim: 'clip',
        onSelect: function () {
            var fromDate = new Date($('#fromDate').val());
            $('#toDate').removeAttr('disabled');
            $('#toDate').datepicker('option', 'minDate', Math.floor((fromDate - new Date()) / (1000 * 3600 * 24)) + 1);
        }
    });

    $('#toDate').datepicker({
        minDate: 0,
        maxDate: 0
    });

    $('button').click(function () {
        $('button').children('.glyphicon').toggle();
        $('button').children('.loader').toggle();
        $('button').addClass('disabled');
        query = $('#search_term').val();
        var gather = setInterval(function () {
            if (gatherMore) {
                gatherMore = false;
                $.ajax('/api/gettweetsnodb', {
                    method: 'GET',
                    data: { 'query': query, 'maxID': maxID },
                    success: function (data) {
                        if (data.length > 1) {                            
                            maxID = data[data.length - 1].StatusID;

                            $('#tblResult').show();

                            for (var ctr = 0 ; ctr < data.length - 1 ; ctr++) {
                                $('#tbodyResult').append('<tr><td><img src="' + data[ctr].User.ProfileImageUrl + '" alt="' + data[ctr].User.Identifier.ScreenName + '" class="img-rounded tweet-photo"><span class="tweet-date">' + (new Date(data[ctr].CreatedAt)).toLocaleString() + ' ' +  data[ctr].StatusID + ' ' + (++tweetCount) + '</span><div><span><strong>' + data[ctr].User.Name + '</strong></span><span class="tweet-username">' + data[ctr].User.Identifier.ScreenName + '</span></div><div>' + data[ctr].Text + '</div></td></tr>');
                                allResults += (new Date(data[ctr].CreatedAt)).toLocaleString() + ',' + data[ctr].User.Identifier.ScreenName + ',' + data[ctr].Text.replace(/(\r\n|\n|\r)/gm, " ") + '\n';
                            }
                            gatherMore = true;
                            
                        }
                        else {
                            gatherMore = false;
                            clearInterval(gather);
                            console.log("length is 1");
                            $('#count').html('Count: ' + tweetCount);
                            $('button').children('.glyphicon').toggle();
                            $('button').children('.loader').toggle();                            
                            $('button').removeClass('disabled');
                        }
                    }, fail: function (data) {
                        gatherMore = false;
                        $('#count').html('Error encountered. Please refresh the page and search again').addClass('alert-danger').removeClass('alert-success');
                    }
                }).done(function () {
                    console.log("false and done");
                });
            }
        }, 500);
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