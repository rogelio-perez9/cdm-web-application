using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuickBooks.Models
{
    public class QBSettingsModel
    {
        public string qbclientid { get; set; }
        public string qbclientsecret { get; set; }
        public string qbredirect { get; set; }
        public string qbappenv { get; set; }
        public string qbqbobase { get; set; }
    }
}