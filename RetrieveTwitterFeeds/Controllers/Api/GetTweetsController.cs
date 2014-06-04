using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using LinqToTwitter;
using RetrieveTwitterFeeds.Models;

namespace RetrieveTwitterFeeds.Controllers.Api
{
    public class GetTweetsController : ApiController
    {
        private readonly  ApplicationOnlyAuthorizer _auth = new ApplicationOnlyAuthorizer();

        public List<Status> Get(string query)
        {
            try
            {
                _auth.Credentials = new InMemoryCredentials
                {
                    ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                    ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                };

                _auth.Authorize();

                using (var tweetsDb = new TweetsDBEntities())
                {
                    var maxId = "0";
                    var checker = true;
                    var returnResult = new List<Status>();

                    var resultForSinceIdInDB = (from table in tweetsDb.Tweets where table.Query.Equals(query) select table).OrderByDescending(m => m.StatusID).FirstOrDefault();
                    var sinceId = (resultForSinceIdInDB == null) ? "0" : resultForSinceIdInDB.StatusID;
                    
                    var resultForMaxIdInDB = (from table in tweetsDb.Tweets where table.Query.Equals(query) select table).OrderBy(m => m.StatusID).FirstOrDefault();
                    var maxIdInDB = (resultForMaxIdInDB == null) ? "0" : resultForMaxIdInDB.StatusID;

                    var newSearch = (resultForSinceIdInDB == null) ? true : false;

                    using (var twitterContext = new TwitterContext(_auth))
                    {
                        while(checker)
                        {
                            if (newSearch)
                            {
                                var current = (from search in twitterContext.Search
                                               where
                                                   search.Type == SearchType.Search
                                                   && search.Query == query
                                                   && search.Count == 100
                                                   && search.MaxID == ulong.Parse(maxId)
                                               select search).Single().Statuses;

                                if (current != null)
                                {
                                    if (current.Count > 0)
                                    {
                                        foreach (var each in current)
                                        {
                                            if (ulong.Parse(each.StatusID) < ulong.Parse(sinceId))
                                            {
                                                checker = false;
                                                break;
                                            }
                                            if ((from table in tweetsDb.Tweets where table.Query.Equals(query) && table.StatusID.Equals(each.StatusID) select table).SingleOrDefault() == null)
                                            {
                                                tweetsDb.Tweets.Add(new Tweets
                                                {
                                                    Content = each.Text,
                                                    CreatedAt = each.CreatedAt,
                                                    Language = each.Lang,
                                                    Name = each.User.Name,
                                                    Query = query,
                                                    StatusID = each.StatusID,
                                                    TweetLink = "https://twitter.com/" + each.User.Identifier.ScreenName + "/statuses/" + each.StatusID,
                                                    UserID = each.User.Identifier.ID,
                                                    Username = each.User.Identifier.ScreenName,
                                                    DateInsertedInDB = DateTime.Now
                                                });
                                                tweetsDb.SaveChanges();
                                            }
                                        }
                                        maxId = (ulong.Parse(current[current.Count - 1].StatusID) - 1).ToString(CultureInfo.InvariantCulture);
                                    }
                                    else
                                    {
                                        checker = false;
                                    }
                                    returnResult.AddRange(current);
                                }
                            }
                            else //if this is not a new search
                            {
                                var current = (from search in twitterContext.Search
                                               where
                                                   search.Type == SearchType.Search
                                                   && search.Query == query
                                                   && search.Count == 100
                                                   && search.MaxID == ulong.Parse(maxId)
                                               select search).Single().Statuses;
                                if (current != null)
                                {
                                    var currentResult = new List<Status>();

                                    if (current.Count > 0)
                                    {
                                        foreach (var each in current)
                                        {
                                            if (ulong.Parse(each.StatusID) <= ulong.Parse(sinceId))
                                            {
                                                checker = false;
                                                break;
                                            }
                                            if ((from table in tweetsDb.Tweets where table.Query.Equals(query) && table.StatusID.Equals(each.StatusID) select table).SingleOrDefault() == null)
                                            {
                                                tweetsDb.Tweets.Add(new Tweets
                                                {
                                                    Content = each.Text,
                                                    CreatedAt = each.CreatedAt,
                                                    Language = each.Lang,
                                                    Name = each.User.Name,
                                                    Query = query,
                                                    StatusID = each.StatusID,
                                                    TweetLink = "https://twitter.com/" + each.User.Identifier.ScreenName + "/statuses/" + each.StatusID,
                                                    UserID = each.User.Identifier.ID,
                                                    Username = each.User.Identifier.ScreenName,
                                                    DateInsertedInDB = DateTime.Now
                                                });
                                                tweetsDb.SaveChanges();

                                                currentResult.Add(each);
                                            }
                                        }
                                    }
                                    returnResult.AddRange(currentResult);                                    
                                }
                            }
                        }
                        return returnResult;
                    };
                };
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        public List<Status> Get(string query, string sinceId)
        {
            try
            {
                if (_auth.BearerToken == null)
                {
                    _auth.Credentials = new InMemoryCredentials
                    {
                        ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                        ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                    };

                    if (!_auth.IsAuthorized)
                        _auth.Authorize();
                }

                var checker = true;
                var maxId = "0";
                var additionalTweets = new List<Status>();

                using (var tweetsDb = new TweetsDBEntities())
                {
                    using (var twitterContext = new TwitterContext(_auth))
                    {
                        while (checker)
                        {
                            /*** This is just a workaround because the sinceid in the query is not working. */

                            var current = (from search in twitterContext.Search
                                           where
                                               search.Type == SearchType.Search
                                               && search.Query == query
                                               && search.Count == 100
                                               && search.MaxID == ulong.Parse(maxId)
                                           select search).Single().Statuses;

                            if (current != null)
                            {
                                if (current.Count > 0)
                                {
                                    foreach (var each in current)
                                    {
                                        if (ulong.Parse(each.StatusID) <= ulong.Parse(sinceId))
                                        {
                                            checker = false;
                                            break;
                                        }
                                        if ((from table in tweetsDb.Tweets where table.Query.Equals(query) && table.StatusID.Equals(each.StatusID) select table).SingleOrDefault() == null)
                                        {
                                            additionalTweets.Add(each);
                                            tweetsDb.Tweets.Add(new Tweets
                                            {
                                                Content = each.Text,
                                                CreatedAt = each.CreatedAt,
                                                Language = each.Lang,
                                                Name = each.User.Name,
                                                Query = query,
                                                StatusID = each.StatusID,
                                                TweetLink = "https://twitter.com/" + each.User.Identifier.ScreenName + "/statuses/" + each.StatusID,
                                                UserID = each.User.Identifier.ID,
                                                Username = each.User.Identifier.ScreenName,
                                                DateInsertedInDB = DateTime.Now
                                            });
                                            tweetsDb.SaveChanges();
                                        }
                                    }
                                    maxId = (ulong.Parse(current[current.Count - 1].StatusID) - 1).ToString(CultureInfo.InvariantCulture);
                                }
                                else
                                {
                                    checker = false;
                                }
                            }
                        }
                        return additionalTweets;
                    };
                };
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }
    }
}
