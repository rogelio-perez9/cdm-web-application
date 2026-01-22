using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;


namespace dataentry.Handlers
{
    /// <summary>
    /// Summary description for ics2
    /// </summary>
    public class ics2 : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string json = "";
            string task = context.Request.QueryString["task"].ToString();

            using (HttpClient client = new HttpClient())
            {
                // The third-party API URL
                string apiUrl = "https://ihub-tdr.customscloud.co";

                // Set up headers (example with Authorization if needed)
                client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_API_KEY");

                var data = new
                {
                    Name = "John Doe",
                    Email = "johndoe@example.com"
                };

                // Serialize the data to JSON
                string jsonData = Newtonsoft.Json.JsonConvert.SerializeObject(data);

                // Create the StringContent for the request body
                HttpContent content = new StringContent(jsonData, Encoding.UTF8, "application/json");

                // Call the third-party API
                HttpResponseMessage response = client.PostAsync(apiUrl + "/api/cds/v1/draft", content).Result; // Using Result here for simplicity, can also use async

                if (response.IsSuccessStatusCode)
                {
                    // Process the response (assuming JSON data)
                    string responseData = response.Content.ReadAsStringAsync().Result;

                    // Set the response type
                    context.Response.ContentType = "application/json";

                    // Write the API response to the current response stream
                    context.Response.Write(responseData);
                }
                else
                {
                    // Handle errors
                    context.Response.StatusCode = (int)response.StatusCode;
                    context.Response.Write("Error calling the third-party API.");
                }
            }

            json = new JavaScriptSerializer().Serialize(
                new
                {
                    success = true,
                    message = "started!"
                }
            );

            context.Response.StatusCode = (int)HttpStatusCode.OK;
            context.Response.ContentType = "text/json";
            context.Response.Write(json);
            context.Response.End();
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