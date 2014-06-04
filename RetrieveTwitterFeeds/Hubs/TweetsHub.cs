using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using LinqToTwitter;
using RetrieveTwitterFeeds.Models;

namespace RetrieveTwitterFeeds.Hubs
{
    public class TweetsHub : Hub
    {
        private readonly ApplicationOnlyAuthorizer _auth = new ApplicationOnlyAuthorizer();

        public Task JoinRoom(string query)
        {
            return Groups.Add(Context.ConnectionId, query);
        }

        public void GetTweet(string query, string maxId = "0")
        {
            try
            {
                _auth.Credentials = new InMemoryCredentials
                {
                    ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                    ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                };

                _auth.Authorize();

                var checker = true;

                using (var tweetsDb = new TweetsDBEntities())
                {
                    using (var twitterContext = new TwitterContext(_auth))
                    {
                        while (checker)
                        {
                            var current = (from search in twitterContext.Search
                                           where
                                               search.Type == SearchType.Search
                                               && search.Query == query
                                               && search.Count == 100
                                               && search.MaxID == ulong.Parse(maxId)
                                           select search).Single().Statuses;

                            if (current.Count > 0)
                            {
                                if (current.Count == 1)
                                    if (current[0].StatusID == maxId)
                                        checker = false;

                                if (!checker) break;

                                foreach (var each in current)
                                {
                                    Clients.Group(query).retrieveTweet(each);
                                    maxId = each.StatusID;
                                }
                            }
                            else
                            {
                                checker = false;
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }

        public void GetMoreTweets(string query, string sinceId)
        {
            try
            {
                _auth.Credentials = new InMemoryCredentials
                    {
                        ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                        ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                    };

                _auth.Authorize();

                var checker = true;
                var maxId = "0";

                using (var tweetsDb = new TweetsDBEntities())
                {
                    using (var twitterContext = new TwitterContext(_auth))
                    {
                        while (checker)
                        {
                            var current = (from search in twitterContext.Search
                                           where
                                               search.Type == SearchType.Search
                                               && search.Query == query
                                               && search.Count == 100
                                               && search.MaxID == ulong.Parse(maxId)
                                           select search).Single().Statuses;

                            if (current.Count > 0)
                            {
                                //if (current.Count == 1)
                                //    if (current[0].StatusID == maxId)
                                //        checker = false;

                                //if (!checker) break;

                                foreach (var each in current)
                                {
                                    if (ulong.Parse(each.StatusID) > ulong.Parse(sinceId))
                                    {
                                        Clients.Group(query).retrieveTweet(each);
                                        maxId = each.StatusID;
                                    }
                                    else
                                    {
                                        checker = false;
                                    }
                                }
                            }
                            else
                            {
                                checker = false;
                            }
                        }
                    }
                }
            }
            catch (Exception e)
            {
                throw new Exception(e.Message);
            }
        }
    }
}