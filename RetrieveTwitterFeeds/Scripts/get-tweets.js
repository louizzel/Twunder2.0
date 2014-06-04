$(document).ready(function () {
    var shouldRefresh = false;
    var key = '';
    var sinceID = '';
    var totalCount = 0;
    var unreadCount = 0;

    $('#btnSubmit').click(function () {
        shouldRefresh = true;
        if ($('#strQuery').val() != '' && $('#strQuery').val() != undefined) {

            key = $('#strQuery').val();

            $('tbody').html('');
            $('table').addClass('no-display');
            $('span.spinner').removeClass('no-display');
            $('button').attr('disabled', 'disabled');
            $('.no-content').addClass('no-display');

            $.ajax('/api/getoldtweets', {
                method: 'GET',
                data: { 'query': key }
            }).done(function (e) {
                $('.error').addClass('no-display');
                $('tbody').html('');
                if (e.length > 0) {
                    $('table').removeClass('no-display');
                    
                    for (var ctr = 0 ; ctr < e.length; ctr++) {
                        $('tbody').append('<tr class="warning">' + '<td>' + (new Date(e[ctr].CreatedAt)).toLocaleString() + '</td>' + '<td>' + e[ctr].Name + '</td>' + '<td>' + e[ctr].Username + '</td>' + '<td>' + e[ctr].Content + '</td></tr>');
                    }
                }
            }).fail(function (e) {
                $('.error').removeClass('no-display');
            });

            $.ajax('/api/gettweets', {
                method: 'GET',
                data: { 'query': key }
            }).done(function (e) {
                if (e.length > 0) {
                    sinceID = e[0].StatusID;
                    $('.no-content').addClass('no-display');
                    var x = $('tbody').html();
                    if ($('tbody').html() != '') {
                        for (var ctr = e.length-1 ; ctr >= 0; ctr--) { //nakadescending
                            $('tbody').prepend('<tr>' + '<td>' + (new Date(e[ctr].CreatedAt)).toLocaleString() + '</td>' + '<td>' + e[ctr].User.Name + '</td>' + '<td>' + e[ctr].User.Identifier.ScreenName + '</td>' + '<td>' + e[ctr].Text + '</td></tr>');
                            totalCount++;
                        }
                    } else {
                        for (var ctr = 0 ; ctr < e.length; ctr++) { //nakadescending
                            $('tbody').append('<tr>' + '<td>' + (new Date(e[ctr].CreatedAt)).toLocaleString() + '</td>' + '<td>' + e[ctr].User.Name + '</td>' + '<td>' + e[ctr].User.Identifier.ScreenName + '</td>' + '<td>' + e[ctr].Text + '</td></tr>');
                            totalCount++;
                        }
                    }
                    console.log('initial tweets retrieved: ' + totalCount + ' on ' + (new Date()).toLocaleString());
                    $('table').removeClass('no-display');

                    setInterval(function () {
                        if (shouldRefresh && key != '' && key != undefined) {
                            shouldRefresh = false;
                            $('.success').removeClass('success');
                            $.ajax('/api/gettweets', {
                                method: 'GET',
                                data: { 'query': key, 'sinceID': sinceID }
                            }).done(function (e) {
                                if (e.length > 0) {
                                    for (var ctr = (e.length - 1) ; ctr >= 0 ; ctr--) {
                                        if (e[ctr].StatusID > sinceID) {
                                            $('tbody').prepend('<tr class="success">' + '<td>' + (new Date(e[ctr].CreatedAt)).toLocaleString() + '</td>' + '<td>' + e[ctr].User.Name + '</td>' + '<td>' + e[ctr].User.Identifier.ScreenName + '</td>' + '<td>' + e[ctr].Text + '</td></tr>');
                                            totalCount++;
                                        } else {
                                            break;
                                        }
                                    }
                                    console.log("total tweets retrieved: " + totalCount + ' on ' + (new Date()).toLocaleString());
                                }
                            }).fail(function (e) {
                                console.log(e.responseJSON.ExceptionMessage);
                            }).always(function () {
                                shouldRefresh = true;
                            });
                        }
                    }, 30000);
                } else {
                    $('.no-content').removeClass('no-display');
                }
                $('span.spinner').addClass('no-display');
                $('button').removeAttr('disabled');
            }).fail(function (e) {
                alert(e.responseJSON.ExceptionMessage);
                $('span.spinner').addClass('no-display');
                $('button').removeAttr('disabled');
            });
        }
    });

    $('#strQuery').change(function () {
        shouldRefresh = false;
    });

});