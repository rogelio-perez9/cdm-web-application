using QuickBooks.Helpers;
using System;
using System.Web;
using System.Web.SessionState;

namespace QuickBooks
{
    /// <summary>
    /// Summary description for QuickBooksHandler
    /// </summary>
    public class QuickBooksHandler : IHttpHandler, IRequiresSessionState
    {
        public void ProcessRequest(HttpContext context)
        {
            QuickBooksHelper quickBooksHelper = new QuickBooksHelper();
            string qbmid = context.Request.QueryString["qbmid"].ToString();
            string authorizeUrl = quickBooksHelper.InitQuickBooks(qbmid);
            context.Session.Add("qbmid", qbmid);
            string module = context.Request.QueryString["module"].ToString();
            context.Session.Add("module", module);

            context.Response.ContentType = "text/plain";
            context.Response.Write(authorizeUrl);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}