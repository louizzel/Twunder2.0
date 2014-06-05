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
    public class GetTweetsNoDBController : ApiController
    {
        private readonly ApplicationOnlyAuthorizer _auth = new ApplicationOnlyAuthorizer();

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

                var result = new List<Status>();

                using (var twitterContext = new TwitterContext(_auth))
                {
                    var gatherMore = true;
                    ulong maxID = 0;
                    while (gatherMore)
                    {
                        var temp = (from search in twitterContext.Search
                                    where search.Type == SearchType.Search && search.Count == 1000
                                              && search.Query == query && search.MaxID == maxID
                                    select search).SingleOrDefault().Statuses;
                        result.AddRange(temp);
                        if (temp.Count <= 1)
                            gatherMore = false;                                                        
                        else
                            maxID = ulong.Parse(temp[temp.Count - 1].StatusID);
                    }
                };
                return result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderByDescending(s => s.StatusID).ToList();
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        public List<Status> Get(string query, string sinceID)
        {
            try
            {
                _auth.Credentials = new InMemoryCredentials
                {
                    ConsumerKey = System.Configuration.ConfigurationManager.AppSettings["ConsumerKey"],
                    ConsumerSecret = System.Configuration.ConfigurationManager.AppSettings["ConsumerSecret"]
                };

                _auth.Authorize();

                var result = new List<Status>();

                using (var twitterContext = new TwitterContext(_auth))
                {
                    var gatherMore = true;                    
                    while (gatherMore)
                    {
                        var temp = (from search in twitterContext.Search
                                    where search.Type == SearchType.Search && search.Count == 1000
                                              && search.Query == query && search.SinceID == ulong.Parse(sinceID)
                                    select search).SingleOrDefault().Statuses;
                        result.AddRange(temp);
                        if (temp.Count <= 1)
                            gatherMore = false;
                        else
                            sinceID = temp[0].StatusID;
                    }
                }

                return result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderBy(s => s.StatusID).ToList();
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }
    }
}
