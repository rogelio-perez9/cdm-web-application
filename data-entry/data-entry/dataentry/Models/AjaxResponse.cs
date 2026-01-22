using System.Web.Script.Serialization;

namespace QuickBooks.Models
{
    public class AjaxResponse
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public string Data { get; set; }
    }
}

