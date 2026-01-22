using Intuit.Ipp.Core;
using Intuit.Ipp.OAuth2PlatformClient;
using Intuit.Ipp.Security;
using QuickBooks.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web.Script.Serialization;

namespace QuickBooks.Helpers
{
    public class QuickBooksHelper
    {
        /*private static string clientid = ConfigurationManager.AppSettings["clientid"];
        private static string clientsecret = ConfigurationManager.AppSettings["clientsecret"];
        private static string redirectUrl = ConfigurationManager.AppSettings["redirectUrl"];
        private static string environment = ConfigurationManager.AppSettings["appEnvironment"];
        private static string qboBaseUrl = ConfigurationManager.AppSettings["qboBaseUrl"];
        */
        /*private static string qbclientid = "ABphL7wqHwENVDV3RaWm5vbgaYLGvWZuqQ5JNp0dUv14WBcsry";//rdr["qbclientid"].ToString();
        private static string qbclientsecret = "BbauP4gPB9k7cMES35Ms9vyyxcJNNLCWyRYiq2Nl";//rdr["qbclientsecret"].ToString();
        private static string qbredirect = "https://localhost:44351/QuickBooks.aspx";//rdr["qbredirect"].ToString();
        private static string qbappenv = "sandbox";// rdr["qbappenv"].ToString();
        private static string qbqbobase = "https://sandbox-quickbooks.api.intuit.com/";// rdr["qbqbobase"].ToString();
        */
        private QBSettingsModel GetQBSettings(string mid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM webprofile WHERE webprofile.custid='" + mid + "'", sqlConnection);
            QBSettingsModel qbsettings = new QBSettingsModel();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    /*qbsettings.qbclientid = rdr["qbclientid"].ToString();
                    qbsettings.qbclientsecret = rdr["qbclientsecret"].ToString();
                    qbsettings.qbredirect = rdr["qbredirect"].ToString();
                    qbsettings.qbappenv = rdr["qbappenv"].ToString();
                    qbsettings.qbqbobase = rdr["qbqbobase"].ToString();
                    */
                    qbsettings.qbclientid = "ABphL7wqHwENVDV3RaWm5vbgaYLGvWZuqQ5JNp0dUv14WBcsry";
                    qbsettings.qbclientsecret = "BbauP4gPB9k7cMES35Ms9vyyxcJNNLCWyRYiq2Nl";
                    qbsettings.qbredirect = "http://localhost:50386/QuickBooks.aspx";
                    qbsettings.qbappenv = "sandbox";
                    qbsettings.qbqbobase = "https://sandbox-quickbooks.api.intuit.com/";
                }
                return qbsettings;
            }
            catch (Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }
        public string InitQuickBooks(string mid)
        {
            QBSettingsModel qbsettings = GetQBSettings(mid);
            OAuth2Client auth2Client = new OAuth2Client(qbsettings.qbclientid, qbsettings.qbclientsecret, qbsettings.qbredirect, qbsettings.qbappenv);

            List<OidcScopes> scopes = new List<OidcScopes>();
            scopes.Add(OidcScopes.Accounting);
            string authorizeUrl = auth2Client.GetAuthorizationURL(scopes);

            return authorizeUrl;
        }

        public TokenResponse GetToken(string mid, string code)
        {
            QBSettingsModel qbsettings = GetQBSettings(mid);
            OAuth2Client auth2Client = new OAuth2Client(qbsettings.qbclientid, qbsettings.qbclientsecret, qbsettings.qbredirect, qbsettings.qbappenv);
            var tokenResponse = auth2Client.GetBearerTokenAsync(code).Result;

            return tokenResponse;
        }

        public TokenResponse RefreshToken(string mid, string refreshtoken)
        {
            QBSettingsModel qbsettings = GetQBSettings(mid);
            OAuth2Client auth2Client = new OAuth2Client(qbsettings.qbclientid, qbsettings.qbclientsecret, qbsettings.qbredirect, qbsettings.qbappenv);
            var tokenResp = auth2Client.RefreshTokenAsync(refreshtoken).Result;

            return tokenResp;
        }

        public ServiceContext GetServiceContext(string mid, string realmId, string access_token)
        {
            QBSettingsModel qbsettings = GetQBSettings(mid);
            OAuth2RequestValidator oauthValidator = new OAuth2RequestValidator(access_token);

            ServiceContext serviceContext = new ServiceContext(realmId, IntuitServicesType.QBO, oauthValidator);
            serviceContext.IppConfiguration.MinorVersion.Qbo = "51";
            serviceContext.IppConfiguration.BaseUrl.Qbo = qbsettings.qbqbobase;

            return serviceContext;
        }
    }
}