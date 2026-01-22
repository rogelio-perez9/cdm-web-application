using QuickBooks.Helpers;
using System;
using System.Web;

namespace QuickBooks
{
    public partial class QuickBooks : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                var code = Request.QueryString["code"];
                var realmId = Request.QueryString["realmId"];
                var module = Session["module"] ?? string.Empty;
                
                if (!string.IsNullOrEmpty(code) && !string.IsNullOrEmpty(realmId))
                {
                    GetAuthTokensAsync(code, realmId);
                    Response.Redirect(module + ".html");
                }
                else
                {
                    HttpContext.Current.ApplicationInstance.CompleteRequest();
                }
            }
        }

        private void GetAuthTokensAsync(string code, string realmId)
        {
            QuickBooksHelper quickBooksHelper = new QuickBooksHelper();
            var qbmid = Session["qbmid"] ?? string.Empty;
            var tokenResponse = quickBooksHelper.GetToken(qbmid.ToString(), code);

            Session["code"] = code;
            Session["realmId"] = realmId;

            Session["accessToken"] = tokenResponse.AccessToken;
            Session["refreshtoken"] = tokenResponse.RefreshToken;
        }
    }
}