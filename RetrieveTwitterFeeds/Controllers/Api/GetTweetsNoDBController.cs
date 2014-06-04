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

                using (var twitterContext = new TwitterContext(_auth))
                {
                    return (from search in twitterContext.Search
                            where search.Type == SearchType.Search && search.Count == 1000
                                      && search.Query == query //&& search.SinceID == 474127608817651712 
                                  select search).SingleOrDefault().Statuses;
                    
                };

            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }

        //public List<Status> Get(string query, string sinceId)
        //{
        //    try
        //    {
        //    }
        //    catch (Exception e)
        //    {
        //        throw new Exception("An error occured. Please check your network connection. " + e.Message);
        //    }
        //}
    }
}
