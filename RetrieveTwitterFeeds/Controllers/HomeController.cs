using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using LinqToTwitter;

namespace RetrieveTwitterFeeds.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return RedirectToAction("TweetsNoDB", "Home");
        }

        public ActionResult GetTweets()
        {
            return View();
        }

        public ActionResult TweetsNoDB()
        {
            return View();
        }
    }
}
