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
    public class GetOldTweetsController : ApiController
    {
        public List<Tweets> Get(string query)
        {
            try
            {
                using (var tweetsDb = new TweetsDBEntities())
                {
                    return (from table in tweetsDb.Tweets where table.Query.Equals(query) select table).OrderByDescending(m => m.StatusID).ToList();
                }
            }
            catch (Exception e)
            {
                throw new Exception("An error occured. Please check your network connection. " + e.Message);
            }
        }
    }
}
