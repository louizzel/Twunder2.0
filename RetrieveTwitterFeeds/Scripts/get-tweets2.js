(function ($) {

    var tweetsViewModel = function () {
        var self = this;

        var chat = $.connection.tweetsHub;

        self.tweets = ko.observableArray();        

        self.continue = ko.observable(true);

        self.searchTerm = ko.observable();
        self.maxId = ko.observable(0);

        self.isConnected = ko.observable(window.navigator.onLine);

        self.getTweets = function () {
            console.log('1');
            $('#btnSubmit').attr('disabled', 'disabled');
            if (self.searchTerm() != undefined && self.searchTerm() != '') {
                $.connection.hub.start().done(function () {
                    chat.server.joinRoom(self.searchTerm());
                    chat.server.getTweet(self.searchTerm(), '0');
                }).fail(function () {
                    console.log('Unable to connect.');
                });

                self.getMoreTweets();
            }
            //
        };

        self.getMoreTweets = function () {
            setInterval(function () {
                $.connection.hub.start().done(function () {
                    chat.server.getMoreTweets(self.searchTerm(), self.maxId());
                    console.log("Retrieved more tweets.");
                }).fail(function () {
                    console.log('Unable to connect.');
                });
                $('#btnSubmit').removeAttr('disabled');
            }, 30000);
        };

        self.exportData = function () {
            if (self.tweets().length > 0) {
                var contentData = [];
                contentData.push('Date,Name,Username,Tweet');
                self.tweets().forEach(function (data, index) {
                    //contentData.push('"' + data.CreatedAt() + '","' + data.Name() + '","' + data.Username() + '","' + data.Content().replace('"', '""').replace('<strong>', '').replace('</strong>', '') + '"');
                    contentData.push('="' + data.CreatedAt() + '","' + data.Name() + '","' + data.Username() + '","' + data.Content().split('"').join('""').split('<strong>').join('').split('</strong>').join('') + '"');
                });

                var content = "data:text/csv;charset=utf-8," + contentData.join("\n");
                var temp = document.createElement('a');
                temp.setAttribute('href', encodeURI(content));
                temp.setAttribute('download', 'Tweets.csv');
                temp.click();                
            } else {
                alert('No data to export.');
            }
        };

        chat.client.retrieveTweet = function (tweet) {
            self.tweets.push(new tweetViewModel(tweet, self.searchTerm()));
            if (self.maxId() == 0) self.maxId(tweet.StatusID);
            if (self.maxId() > 0 && tweet.StatusID > self.maxId()) self.maxId(tweet.StatusID);
        };
    };

    var tweetViewModel = function (tweet, query) {
        this.CreatedAt = ko.observable(new Date(tweet.CreatedAt).toLocaleString());
        this.Name = ko.observable(tweet.User.Name);
        this.Username = ko.observable(tweet.User.Identifier.ScreenName);
        this.Content = ko.observable(tweet.Text.replace(new RegExp('(' + query + ')', 'gi'), '<strong>$1</strong>'));
    };

    $(function () {
        var viewModel = new tweetsViewModel();
        ko.applyBindings(viewModel);
    });

    //$(document).ready(function () {
    //    if (!window.navigator.onLine)
    //        alert('You are not connected to the internet.');
    //});
})(jQuery);