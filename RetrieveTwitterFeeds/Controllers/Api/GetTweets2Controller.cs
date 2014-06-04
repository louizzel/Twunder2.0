using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using LinqToTwitter;
using RetrieveTwitterFeeds.Models;

namespace RetrieveTwitterFeeds.Controllers.Api
{
    public class GetTweets2Controller : ApiController
    {
        private readonly ApplicationOnlyAuthorizer _auth = new ApplicationOnlyAuthorizer();

        public List<Status> Get(string query, string maxId)
        {
            _auth.Credentials = new InMemoryCredentials
            {
                ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
            };

            _auth.Authorize();

            using (var tweetsDb = new TweetsDBEntities())
            {
                using (var twitterContext = new TwitterContext(_auth))
                {
                    var current = (from search in twitterContext.Search
                                   where
                                       search.Type == SearchType.Search
                                       && search.Query == query
                                       && search.Count == 100
                                       && search.MaxID == ulong.Parse(maxId)
                                   select search).Single().Statuses;

                    return current;
                }
            }
        }
    }
}
