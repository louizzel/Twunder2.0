using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using LinqToTwitter;
using RetrieveTwitterFeeds.Models;
using System.IO;
using System.Text;

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
                                              //Tweets older than date
                                              && search.Until == DateTime.Parse("06-08-2014")
                                    select search).SingleOrDefault().Statuses;
                        result.AddRange(temp);
                        if (temp.Count <= 1)
                            gatherMore = false;
                        else
                        {
                            maxID = ulong.Parse(temp[temp.Count - 1].StatusID);
                            var date = new DateTime(2014, 06, 05, 15, 00, 00);
                            if (temp[temp.Count - 1].CreatedAt <= date)
                                gatherMore = false;
                        }
                    }
                };
                WriteFile(result.GroupBy(m => m.StatusID).Select(n => n.First()).OrderByDescending(s => s.StatusID).ToList(), query);
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
                                              && search.Until == DateTime.Parse("06-07-2014") && search.ResultType == ResultType.Recent
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

        public void WriteFile(List<Status> data, string query)
        {
            string fileName = @"C:\wamp\" + query + ".csv";

            try
            {
                // Check if file already exists. If yes, delete it. 
                var ctr = 1;
                while (File.Exists(fileName))
                {
                    fileName = @"C:\wamp\" + query + " - " + ctr + ".csv";
                    ctr++;
                }

                // Create a new file 
                using (FileStream fs = File.Create(fileName))
                {
                    byte[] header = new UTF8Encoding(true).GetBytes("Date,User Id,Tweet,Link" + "\n");
                    fs.Write(header, 0, header.Length);

                    foreach (var temp in data)
                    {
                        byte[] line = new UTF8Encoding(true).GetBytes(temp.CreatedAt.AddHours(8) + "," + temp.User.Identifier.ScreenName + "," + temp.Text.Replace("\n", " ").Replace("\r\n"," ").Replace("\r", " ") + ",https://twitter.com/" + temp.User.Identifier.ScreenName + "/status/" + temp.StatusID + "\n");
                        fs.Write(line, 0, line.Length);
                    }
                }
            }
            catch (Exception Ex)
            {
                throw new Exception("An error occured. Please check your network connection. " + Ex.Message);
            }  
        }
    }
}
