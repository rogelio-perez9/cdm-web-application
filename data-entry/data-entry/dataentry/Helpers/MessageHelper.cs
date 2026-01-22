using System;
using System.ComponentModel;

namespace QuickBooks.Helpers
{
    public class MessageHelper
    {
        public const string InternalServerError = "Internal server error";

        public string GetQuickBooksError(Exception ex)
        {
            string result = ex.Message.Split('.')[1].Split(':')[1].ToString();
            return result;
        }
    }
}