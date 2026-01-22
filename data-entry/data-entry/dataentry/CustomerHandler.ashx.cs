using Intuit.Ipp.Core;
using Intuit.Ipp.Data;
using Intuit.Ipp.DataService;
using QuickBooks.Helpers;
using QuickBooks.Models;
using System;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

namespace QuickBooks
{
    /// <summary>
    /// Summary description for CustomerHandler
    /// </summary>
    public class CustomerHandler : IHttpHandler, IRequiresSessionState
    {
        public void ProcessRequest(HttpContext context)
        {
            AjaxResponse ajaxResponse = new AjaxResponse();

            if (context.Session["accessToken"] == null)
            {
                ajaxResponse.Status = "2";
            }
            else
            {
                string result = AddCustomer(context);

                if (!string.IsNullOrEmpty(result))
                {
                    if (result.Equals("Unauthorized-401"))
                    {
                        QuickBooksHelper quickBooksHelper = new QuickBooksHelper();
                        var tokenResponse = quickBooksHelper.RefreshToken(context.Session["qbmid"].ToString(), context.Session["refreshtoken"].ToString());

                        context.Session.Add("accessToken", tokenResponse.AccessToken);
                        context.Session.Add("refreshtoken", tokenResponse.RefreshToken);

                        AddCustomer(context);
                    }
                    else
                    {
                        ajaxResponse.Status = "0";
                        ajaxResponse.Message = result;
                    }
                }
                else
                {
                    ajaxResponse.Status = "1";
                    ajaxResponse.Message = "Data Customer added";
                }
            }

            var json = new JavaScriptSerializer().Serialize(ajaxResponse);
            context.Response.Write(json);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private string AddCustomer(HttpContext context)
        {
            string resultMsg = string.Empty;

            try
            {
                QuickBooksHelper quickBooksHelper = new QuickBooksHelper();
                ServiceContext serviceContext = quickBooksHelper.GetServiceContext(context.Session["qbmid"].ToString(), context.Session["realmId"].ToString(), context.Session["accessToken"].ToString());
                DataService service = new DataService(serviceContext);

                string customerData = context.Request.QueryString["customerData"].ToString();
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                Customer customer = serializer.Deserialize<Customer>(customerData);

                try
                {
                    Customer resultCustomer = service.Add(customer) as Customer;
                }
                catch (Exception ex)
                {
                    MessageHelper messageHelper = new MessageHelper();
                    resultMsg = messageHelper.GetQuickBooksError(ex);
                }                
            }
            catch (Exception ex)
            {
                resultMsg = MessageHelper.InternalServerError;
            }

            return resultMsg;
        }
    }
}