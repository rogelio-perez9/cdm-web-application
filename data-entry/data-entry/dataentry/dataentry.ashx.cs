using BitMiracle.LibTiff.Classic;
using Intuit.Ipp.Data;
using Intuit.Ipp.WebhooksService;
using IronXL;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;
using static System.Windows.Forms.VisualStyles.VisualStyleElement.Tab;


namespace dataentry
{

    public class dataentry : IHttpHandler
    {
        /// <summary>
        /// You will need to configure this handler in the Web.config file of your 
        /// web and register it with IIS before being able to use it. For more information
        /// see the following link: https://go.microsoft.com/?linkid=8101007
        /// </summary>
        #region IHttpHandler Members

        int totalRows = 0;
        int nextInvNo = 0;
        string tempId = "";
        string tempCurr = "";
        string tempRtype = null;

        private static readonly Dictionary<String, String> MimeTypeDict = new Dictionary<String, String>()
        {
            { "pdf", "application/pdf" },
            { "xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
            { "xls", "application/vnd.ms-excel" },
            { "docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            { "msg", "application/vnd.ms-outlook" },
            { "png", "image/png" },
            { "jpg", "image/jpeg" },
            { "jpeg", "image/jpeg" },
            { "gif", "image/gif" },
            { "doc", "application/msword" },
            { "mp4", "video/mp4" },
            { "mov", "video/quicktime" },
        };

        public bool IsReusable
        {
            // Return false in case your Managed Handler cannot be reused for another request.
            // Usually this would be false in case you have some state information preserved per request.
            get
            {
                return true;
            }
        }

        public void ProcessRequest(HttpContext context)
        {
            //write your handler implementation here.
            string json = "";

            try
            {
                string task = context.Request.QueryString["task"].ToString();

                if (task == "getVessels")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    bool isComplianceId = bool.TryParse(context.Request.QueryString["complianceid"], out var tmp) && tmp;

                    string database =
                        isComplianceId ? context.Request.QueryString["complianceid"].ToString() : "compliance";
                    json = GetVessels(query, database);
                }
                else if (task == "getArcodes")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetArcodes(sqid, query);
                }
                else if (task == "getArcodesWithMode")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    string mode = context.Request.QueryString["mode"].ToString();
                    json = GetArcodesWithMode(sqid, query, mode);
                }
                else if (task == "getApcodes")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetApcodes(sqid, query);
                }
                else if (task == "getUncodes")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    string key = context.Request.QueryString["searchkey"].ToString();
                    json = GetUncodes(query, key);
                }
                else if (task == "getUncodes2")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetUncodes2(query);
                }
                else if (task == "getUncodesAir")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetUncodesAir(query);
                }
                else if (task == "getUncodesPort")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetUncodesPort(query);
                }
                else if (task == "getVesselCode")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetVesselCode(context.Request.QueryString["sqid"], context.Request.QueryString["stationid"], query);
                }
                else if (task == "getAcct")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetAcct(sqid, query);
                }
                else if (task == "getPort")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetPort(sqid, query);
                }
                else if (task == "getSeds")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    string key = context.Request.QueryString["searchkey"].ToString();
                    json = GetSeds(query, key);
                }
                else if (task == "getSeds2")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetSeds2(query);
                }
                else if (task == "getSchd2")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetSchd2(query);
                }
                else if (task == "getSchk2")
                {
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetSchk2(query);
                }
                else if (task == "getContacts")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    string key = context.Request.QueryString["searchkey"].ToString();
                    json = GetContacts(sqid, query, key);
                }
                else if (task == "getContacts2")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContacts2(sqid, query);
                }
                else if (task == "getContacts3")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContacts3(sqid, query);
                }

                else if (task == "getContacts4")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContacts4(sqid, query);
                }
                else if (task == "getContactsScac")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsScac(sqid, query);
                }
                else if (task == "getContactsAirCarrier")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsAirCarrier(sqid, query);
                }
                else if (task == "getContactsPrincipal")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsPrincipal(sqid, query);
                }
                else if (task == "getContactsPrincipal2")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsPrincipal2(sqid, query);
                }
                else if (task == "getContactsVendor")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsVendor(sqid, query);
                }
                else if (task == "getContactsConsignee")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsConsignee(sqid, query);
                }
                else if (task == "getContactsWarehouse")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsWarehouse(sqid, query);
                }
                else if (task == "getContactsTrucker")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetContactsTrucker(sqid, query);
                }
                else if (task == "getStation2")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    string soffid2 = context.Request.QueryString["soffid2"]?.ToString();
                    json = GetStation2(sqid, query, soffid2);
                }
                else if (task == "getDestination2")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetDestination2(sqid, query);
                }
                else if (task == "getlotno")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = getlotno(sqid, query);
                }
                else if (task == "getItem2")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetItem2(sqid, query);
                }
                else if (task == "getOGctnr")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetOGctnr(sqid, query);
                }
                else if (task == "getIGctnr")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetIGctnr(sqid, query);
                }
                else if (task == "getOGchas")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetOGchas(sqid, query);
                }
                else if (task == "getIGchas")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetIGchas(sqid, query);
                }
                else if (task == "getAssignctnr")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    string station = context.Request.QueryString["stationid"].ToString();
                    string cfmtype = context.Request.QueryString["bkgcfmtype"].ToString();
                    json = GetAssignctnr(sqid, query, station, cfmtype);
                }
                else if (task == "getQuoteNos")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetQuoteNos(sqid, query);
                }
                else if (task == "getCdmBookNos")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetCdmBookNos(sqid, query);
                }
                else if (task == "getPickNos")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetPickNos(sqid, query);
                }
                else if (task == "getWrNos")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetWrNos(sqid, query);
                }
                else if (task == "getCompanyTypes")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = GetCompanyTypes(sqid);
                }
                else if (task == "getCodeTypes")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string type = context.Request.QueryString["type"].ToString();
                    json = GetCodeTypes(sqid, type);
                }
                else if (task == "getAesCodeTypes")
                {
                    string type = context.Request.QueryString["type"].ToString();
                    json = GetAesCodeTypes(type);
                }
                else if (task == "getStates")
                {
                    string iso = context.Request.QueryString["iso"].ToString();
                    json = GetStates(iso);
                }
                else if (task == "getCountries")
                {
                    json = GetCountries();
                }
                else if (task == "getClauses")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = GetClauses(sqid);
                }
                else if (task == "getClause")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string code = context.Request.QueryString["code"].ToString();
                    json = GetClause(sqid, code);
                }
                else if (task == "getOceanClauses")
                {
                    json = GetOceanClauses();
                }
                else if (task == "getOceanClause")
                {
                    string code = context.Request.QueryString["code"].ToString();
                    json = GetOceanClause(code);
                }
                else if (task == "getGuide")
                {
                    string module = context.Request.QueryString["module"].ToString();
                    string language = context.Request.QueryString["language"].ToString();
                    string guide = GetGuide(module, language);
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                    context.Response.Write(guide);
                    context.Response.End();
                    return;
                }
                else if (task == "getCodes")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string codetype = context.Request.QueryString["codetype"].ToString();
                    json = GetCodes(sqid, codetype);
                }
                else if (task == "getSalesRep")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = GetSalesRep(sqid);
                }
                else if (task == "getTariffNo")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string billid = context.Request.QueryString["billid"].ToString();
                    json = GetTariffNo(sqid, billid);
                }
                else if (task == "getTariffNos")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string billid = context.Request.QueryString["billid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    json = GetTariffNos(sqid, billid, query);
                }
                else if (task == "getCtnrlist")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    json = GetCtnrlist(sqid, uuid);
                }
                else if (task == "getLabels")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = GetLabels(sqid);
                }
                else if (task == "getLabels")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = GetLabels(sqid);
                }
                else if (task == "getLabel")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string id = context.Request.QueryString["id"].ToString();
                    json = GetLabel(sqid, id);
                }
                else if (task == "addContact")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = AddNewContact(sqid, context);
                }
                else if (task == "getContainers")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    json = GetContainers(sqid, uuid);
                }
                else if (task == "getContainerRows")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    json = GetContainerRows(sqid, uuid);
                }
                else if (task == "updateContainerRows")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    List<ContainerType> containers = JsonConvert.DeserializeObject<List<ContainerType>>(jsonData);
                    bool isUpdated = true;
                    if (containers != null)
                    {
                        foreach (ContainerType container in containers)
                        {
                            isUpdated = UpdateContainer(sqid, container);
                            if (!isUpdated)
                            {
                                json = new JavaScriptSerializer().Serialize(
                                 new
                                 {
                                     error = true
                                 });
                                break;
                            }
                        }
                    }
                    if (isUpdated)
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = false
                            });
                    }
                }
                else if (task == "updateBulkContainers")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = UpdateBulkContainers(sqid, context);
                }
                else if (task == "getDoHelps")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string prinid = context.Request.QueryString["prinid"].ToString();
                    string sloc = context.Request.QueryString["sloc"].ToString();
                    string sdelv = context.Request.QueryString["sdelv"].ToString();
                    string struck = context.Request.QueryString["struck"].ToString();
                    json = GetDoHelps(sqid, prinid, sloc, sdelv, struck);
                }
                else if (task == "getDoHelpDetails")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string doid = context.Request.QueryString["doid"].ToString();
                    json = GetDoHelpDetails(sqid, doid);
                }
                else if (task == "deleteDoHelp")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string doid = context.Request.QueryString["doid"].ToString();
                    Boolean result = DeleteDoHelp(sqid, doid);
                    json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = result ? false : true
                         });
                }
                else if (task == "deleteDeliveryOrder")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string doid = context.Request.QueryString["doid"].ToString();
                    string rid = context.Request.QueryString["rid"].ToString();
                    string userid = context.Request.QueryString["userid"].ToString();
                    string dono = context.Request.QueryString["dono"].ToString();
                    Boolean result = DeleteDeliveryOrder(sqid, rid, doid, userid, dono);
                    json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = result ? false : true
                         });
                }
                else if (task == "getRevenueDetails")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    string chargemode = context.Request.QueryString["chargemode"].ToString();
                    json = GetRevenueDetails(sqid, uuid, chargemode);
                }
                else if (task == "getCostDetails")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    string chargemode = context.Request.QueryString["chargemode"].ToString();
                    json = GetCostDetails(sqid, uuid, chargemode);
                }
                else if (task == "addRevenue")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = AddNewRevenue(sqid, context);
                }
                else if (task == "addBulkRevenues")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    List<RevenueType> revenues = JsonConvert.DeserializeObject<List<RevenueType>>(jsonData);
                    List<string> invnos = new List<string>();
                    foreach (RevenueType revenue in revenues)
                    {
                        if (!string.IsNullOrEmpty(revenue.invno) && !invnos.Contains(revenue.invno))
                            invnos.Add(revenue.invno);
                    }
                    string existingInvnos = (invnos.Count() > 0) ? String.Join(", ", GetDepulicatedInvno(sqid, invnos.ToArray())) : "";
                    if (!string.IsNullOrEmpty(existingInvnos))
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = true,
                                message = "Existing Invoice No.: " + existingInvnos
                            });
                    }
                    else
                    {
                        string resultMessage = "ok";
                        if (revenues != null)
                        {
                            foreach (RevenueType revenue in revenues)
                            {
                                resultMessage = AddNewRevenue2(sqid, revenue);
                                if (resultMessage != "ok")
                                {
                                    json = new JavaScriptSerializer().Serialize(
                                     new
                                     {
                                         error = true,
                                         message = resultMessage
                                     });
                                    break;
                                }
                            }
                        }
                        if (resultMessage == "ok")
                        {
                            json = new JavaScriptSerializer().Serialize(
                                new
                                {
                                    error = false
                                });
                        }
                        nextInvNo = 0;
                        tempId = "";
                        tempCurr = "";
                    }
                }
                else if (task == "updateBulkRevenues")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    List<RevenueType> revenues = JsonConvert.DeserializeObject<List<RevenueType>>(jsonData);
                    string resultMessage = "ok";

                    if (revenues != null)
                    {
                        foreach (RevenueType revenue in revenues)
                        {
                            resultMessage = UpdateRevenue2(sqid, revenue);

                            if (resultMessage != "ok")
                            {
                                json = new JavaScriptSerializer().Serialize(
                                 new
                                 {
                                     error = true,
                                     message = resultMessage
                                 });
                                break;
                            }
                        }
                    }

                    if (resultMessage == "ok")
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = false
                            });
                    }

                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "addBulkCosts")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    List<RevenueType> revenues = JsonConvert.DeserializeObject<List<RevenueType>>(jsonData);
                    string resultMessage = "ok";
                    if (revenues != null)
                    {
                        foreach (RevenueType revenue in revenues)
                        {
                            resultMessage = AddNewCost2(sqid, revenue);
                            if (resultMessage != "ok")
                            {
                                json = new JavaScriptSerializer().Serialize(
                                 new
                                 {
                                     error = true,
                                     message = resultMessage
                                 });
                                break;
                            }
                        }
                    }
                    if (resultMessage == "ok")
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = false
                            });
                    }
                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "updateBulkCosts")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    List<RevenueType> revenues = JsonConvert.DeserializeObject<List<RevenueType>>(jsonData);
                    string resultMessage = "ok";
                    if (revenues != null)
                    {
                        foreach (RevenueType revenue in revenues)
                        {
                            resultMessage = UpdateCost2(sqid, revenue);
                            if (resultMessage != "ok")
                            {
                                json = new JavaScriptSerializer().Serialize(
                                 new
                                 {
                                     error = true,
                                     message = resultMessage
                                 });
                                break;
                            }
                        }
                    }
                    if (resultMessage == "ok")
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = false
                            });
                    }
                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "updateRevenue")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = UpdateRevenue(sqid, context);
                }
                else if (task == "addCost")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = AddNewCost(sqid, context);
                }
                else if (task == "updateCost")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = UpdateCost(sqid, context);
                }
                else if (task == "delRevenue")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.Params["uuid"].ToString();
                    string detids = context.Request.Params["detids"].ToString();
                    var arcodes = context.Request.Params["arcodes"]?.ToString();

                    Boolean result = DeleteRevenue(sqid, uuid, detids, arcodes);
                    if (result)
                    {
                        json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = false
                         });
                    }
                    else
                    {
                        json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = true
                         });
                    }
                }
                else if (task == "getCurrencies")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string basecurr = context.Request.QueryString["basecurr"].ToString();
                    json = GetCurrencies(sqid, basecurr);
                }
                else if (task == "generateAndDownloadXlsx")
                {

                    string filePath = GenerateXlsx(context);
                    if (File.Exists(filePath))
                    {
                        string fileName = Path.GetFileName(filePath);
                        context.Response.AddHeader("Content-Type", MimeTypeDict["xlsx"]);
                        context.Response.Headers.Add("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
                        context.Response.WriteFile(filePath);
                        context.Response.Flush();
                        context.Response.End();
                    }
                }
                else if (task == "uploadfile" && context.Request.Files.Count > 0)
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uploaduserid = context.Request.Form["uploaduserid"].ToString();
                    int customerview = Convert.ToInt32(context.Request.Form["customerview"]);
                    string documenttype = context.Request.Form["documenttype"].ToString();

                    HttpPostedFile postedFile = context.Request.Files[0];
                    string fileName = Path.GetFileName(postedFile.FileName);
                    string[] names = fileName.Split('.');
                    string fileExtension = names[names.Length - 1].ToLower();
                    int fileLen = postedFile.ContentLength;
                    byte[] content = new byte[fileLen];
                    Stream fileStream = postedFile.InputStream;
                    fileStream.Read(content, 0, fileLen);
                    string strDocumentId = context.Request.Form["documentId"].ToString();
                    if (AddFile(sqid, strDocumentId, fileName, fileExtension, content, fileLen.ToString(), uploaduserid, customerview, documenttype) > 0)
                    {
                        json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            name = fileName,
                            documentId = strDocumentId
                        });
                    }
                    else
                    {
                        json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = fileName
                        });
                    }
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                    context.Response.ContentType = "text/json";
                    context.Response.Write(json);
                    context.Response.End();
                }
                else if (task == "downfile" && !string.IsNullOrEmpty(context.Request["Id"]))
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string strID = context.Request["Id"];
                    SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
                    sqlConnection.Open();
                    SqlCommand sqlCommand = new SqlCommand("SELECT * FROM web_files WHERE Id='" + int.Parse(strID) + "'", sqlConnection);
                    SqlDataReader reader = sqlCommand.ExecuteReader();

                    if (reader.Read())
                    {
                        string fileName = reader["file_name"].ToString();
                        string fileExt = reader["file_ext"].ToString().Trim();
                        byte[] data = (byte[])reader["file_content"];
                        context.Response.AddHeader("Content-Type",
                                           MimeTypeDict[fileExt]);
                        context.Response.AddHeader("Content-Disposition",
                                               MimeTypeDict[fileExt] + "; filename=" + fileName + ";");
                        context.Response.BinaryWrite(data);
                    }
                    context.Response.Flush();
                    context.Response.End();
                }
                else if (task == "deletefile" && !string.IsNullOrEmpty(context.Request["aid"]))
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    if (DeleteAttachment(sqid, context.Request["aid"].ToString()))
                    {
                        json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = false
                         });
                    }
                    else
                    {
                        json = new JavaScriptSerializer().Serialize(
                         new
                         {
                             error = true
                         });
                    }
                    context.Response.StatusCode = (int)HttpStatusCode.OK;
                    context.Response.ContentType = "text/json";
                    context.Response.Write(json);
                    context.Response.End();
                }
                else if (task == "getfiles" && !string.IsNullOrEmpty(context.Request["documentId"]))
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    // string uploaduserid = context.Request.QueryString["uploaduserid"].ToString();
                    int customerview = Convert.ToInt32(context.Request.QueryString["customerview"]);

                    WebFile[] dataList = GetListData(sqid, context.Request.QueryString["documentId"].ToString(), customerview);
                    string[] extensions;
                    extensions = new string[4] { "png", "jpeg", "jpg", "gif" };
                    string strDataContext = "<ArrayData>";
                    foreach (WebFile data in dataList)
                    {
                        strDataContext += "<Data>";
                        strDataContext += "<ID>" + data.id + "</ID>";
                        strDataContext += "<Name>" + HttpUtility.HtmlEncode(data.name) + "</Name>";
                        strDataContext += "<Ext>" + data.ext + "</Ext>";
                        strDataContext += "<quote>" + data.quote + "</quote>";
                        if (Array.IndexOf(extensions, data.ext) > -1)
                            strDataContext += "<content>" + data.content + "</content>";
                        else
                            strDataContext += "<content></content>";
                        strDataContext += "<documenttype>" + data.documenttype + "</documenttype>";
                        strDataContext += "<uploaddate>" + data.uploaddate + "</uploaddate>";
                        strDataContext += "</Data>";
                    }
                    strDataContext += "</ArrayData>";
                    context.Response.Write(strDataContext);
                    context.Response.End();
                }
                else if (task == "showmsgfile" && !string.IsNullOrEmpty(context.Request.QueryString["aid"]))
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string id = context.Request.QueryString["aid"];

                    SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
                    sqlConnection.Open();
                    SqlCommand sqlCommand = new SqlCommand("SELECT * FROM web_files where id='" + id + "'", sqlConnection);

                    WebFile temp = new WebFile();
                    SqlDataReader rdr = sqlCommand.ExecuteReader();

                    if (rdr.Read())
                    {
                        temp.id = rdr["Id"].ToString();
                        temp.name = rdr["file_name"].ToString();
                        temp.quote = rdr["documentno"].ToString();
                        temp.ext = rdr["file_ext"].ToString().Trim();
                        temp.content = Convert.ToBase64String((byte[])rdr["file_content"]);
                        temp.byteContent = (byte[])rdr["file_content"];
                    }

                    context.Response.Clear();
                    context.Response.ClearContent();
                    context.Response.ClearHeaders();

                    context.Response.AddHeader("content-disposition", "attachment; filename=" + temp.name);
                    context.Response.ContentType = "application/vnd.ms-outlook";
                    context.Response.OutputStream.Write(temp.byteContent, 0, temp.byteContent.Length);

                    context.Response.Flush();
                    context.Response.Close();
                }
                else if (task == "uploadSection321")
                {
                    /* string sqid = context.Request.QueryString["sqid"].ToString();
					string query = context.Request.QueryString["q"].ToString();
					json = GetApcodes(sqid, query); */
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string custid = context.Request.QueryString["custid"].ToString();
                    if (context.Request.Files.Count > 0)
                    {
                        try
                        {
                            //Fetch the Uploaded File.
                            HttpPostedFile postedFile = context.Request.Files[0];

                            //Set the File Name.

                            string xlsupload = context.Request.Form["xlsupload"];
                            string folderName = String.IsNullOrEmpty(xlsupload) ? "upload" : xlsupload;
                            string fileName = Path.GetFileName(postedFile.FileName);
                            //Save the File in Folder.
                            string folderPath = context.Server.MapPath(folderName);
                            if (!Directory.Exists(folderPath))
                            {
                                Directory.CreateDirectory(folderPath);
                            }
                            string strUploadAt = folderPath + "\\" + fileName;
                            postedFile.SaveAs(strUploadAt);
                            // bool resultStatus = ImportSection321(sqid, custid, strUploadAt);
                            json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                success = true,
                                total = totalRows
                            });
                        }
                        catch (Exception err)
                        {
                            throw new ApplicationException(err.Message);
                        }
                    }
                    else
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                success = false,
                                message = "xls not uploaded!"
                            }
                        );
                    }
                }
                else if (task == "getRevenueDetailsEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    string chargemode = context.Request.QueryString["chargemode"].ToString();
                    json = GetRevenueDetailsEx(sqid, uuid, chargemode);
                }
                else if (task == "getCostDetailsEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string uuid = context.Request.QueryString["uuid"].ToString();
                    string chargemode = context.Request.QueryString["chargemode"].ToString();
                    json = GetCostDetailsEx(sqid, uuid, chargemode);
                }
                else if (task == "updateContainerRowsEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    var containers = JsonConvert.DeserializeObject<List<ContainerTypeEx>>(jsonData);
                    bool isUpdated = true;

                    if (containers != null)
                    {
                        foreach (var container in containers)
                        {
                            isUpdated = UpdateContainerEx(sqid, container);

                            if (!isUpdated)
                            {
                                break;
                            }
                        }
                    }

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !isUpdated
                        });
                }
                else if (task == "updateBulkContainersEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    json = UpdateBulkContainersEx(sqid, context);
                }
                else if (task == "addBulkRevenuesEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    var revenues = JsonConvert.DeserializeObject<List<Revenue>>(jsonData);
                    var invnos = revenues.Where(a => !string.IsNullOrEmpty(a.invno)).Select(a => a.invno).Distinct().ToList();

                    //foreach (var revenue in revenues)
                    //{
                    //	if (!string.IsNullOrEmpty( revenue.invno ) && !invnos.Contains( revenue.invno ))
                    //		invnos.Add( revenue.invno );
                    //}

                    string existingInvnos = (invnos.Count() > 0) ? String.Join(", ", GetDepulicatedInvno(sqid, invnos.ToArray())) : "";

                    if (!string.IsNullOrEmpty(existingInvnos))
                    {
                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = true,
                                message = "Existing Invoice No.: " + existingInvnos
                            });
                    }
                    else
                    {
                        string resultMessage = "ok";

                        if (revenues != null)
                        {
                            foreach (var revenue in revenues)
                            {
                                resultMessage = AddNewRevenueEx(sqid, revenue);

                                if (resultMessage != "ok")
                                {
                                    break;
                                }
                            }
                        }

                        json = new JavaScriptSerializer().Serialize(
                            new
                            {
                                error = resultMessage != "ok",
                                message = resultMessage
                            });

                        nextInvNo = 0;
                        tempId = "";
                        tempCurr = "";
                    }
                }
                else if (task == "updateBulkRevenuesEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    var revenues = JsonConvert.DeserializeObject<List<Revenue>>(jsonData);
                    string resultMessage = "ok";
                    string invno = null;

                    if (revenues != null)
                    {
                        foreach (var revenue in revenues)
                        {
                            if (revenue.detid != 0)
                            {
                                resultMessage = UpdateRevenueEx(sqid, revenue);
                                invno = revenue.invno;
                            }
                            else
                            {
                                if (revenue.release == 1)
                                {
                                    revenue.invno = invno;
                                }

                                resultMessage = AddNewRevenueEx(sqid, revenue);
                            }

                            if (resultMessage != "ok")
                            {
                                break;
                            }
                        }
                    }

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = resultMessage != "ok",
                            message = resultMessage
                        });

                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "getCurrenciesEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string basecurr = context.Request.QueryString["basecurr"].ToString();
                    string currdate = context.Request.QueryString["currdate"].ToString();
                    json = GetCurrenciesEx(sqid, basecurr, currdate);
                }
                else if (task == "addBulkCostsEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    var revenues = JsonConvert.DeserializeObject<List<Revenue>>(jsonData);
                    string resultMessage = "ok";
                    if (revenues != null)
                    {
                        foreach (var revenue in revenues)
                        {
                            resultMessage = AddNewCostEx(sqid, revenue);
                            if (resultMessage != "ok")
                            {
                                break;
                            }
                        }
                    }

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = resultMessage != "ok",
                            message = resultMessage
                        });

                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "updateBulkCostsEx")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string jsonData;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        jsonData = reader.ReadToEnd();
                    }

                    var revenues = JsonConvert.DeserializeObject<List<Revenue>>(jsonData);
                    string resultMessage = "ok";
                    string voucherno = null;

                    if (revenues != null)
                    {
                        foreach (var revenue in revenues)
                        {
                            if (revenue.detid != 0)
                            {
                                resultMessage = UpdateCostEx(sqid, revenue);
                                voucherno = revenue.voucherno;
                            }
                            else
                            {
                                if (revenue.release == 1)
                                {
                                    revenue.voucherno = voucherno;
                                }

                                resultMessage = AddNewCostEx(sqid, revenue);
                            }

                            if (resultMessage != "ok")
                            {
                                break;
                            }
                        }
                    }

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = resultMessage != "ok",
                            message = resultMessage
                        });

                    nextInvNo = 0;
                    tempId = "";
                    tempCurr = "";
                }
                else if (task == "saveShipmentNotes")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    var o = JsonConvert.DeserializeObject<ShipmentNotes>(body);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !SaveShipmentNotes(sqid, uuid, o.notetype, o.shipmentno, o.freightrelease, o.adduser)
                        });
                }
                else if (task == "loadShipmentNotes")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var shipmentNo = context.Request.QueryString["shipmentno"];
                    var r = LoadShipmentNotes(sqid, uuid, shipmentNo);
                    //json = new JavaScriptSerializer().Serialize( r );
                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "updateShipmentNotes")
                {
                    var sqid = context.Request.QueryString["sqid"];

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    var o = JsonConvert.DeserializeObject<ShipmentNotes>(body);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !UpdateShipmentNotes(sqid, o.noteid, o.freightrelease, o.lastuser)
                        });
                }
                else if (task == "lockShipmentNotes")
                {
                    var sqid = context.Request.QueryString["sqid"];

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    var o = JsonConvert.DeserializeObject<ShipmentNotes>(body);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !LockShipmentNotes(sqid, o.noteid, o.freightrelease, o.lastuser, o.isLocked)
                        });
                }
                else if (task == "voidShipmentNotes")
                {
                    var sqid = context.Request.QueryString["sqid"];

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    var o = JsonConvert.DeserializeObject<ShipmentNotes>(body);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !VoidShipmentNotes(sqid, o.noteid, o.freightrelease, o.lastuser, o.isVoided)
                        });
                }
                else if (task == "loadContactsProfile")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var r = LoadContactsProfile(sqid
                        , context.Request.QueryString["stationid"]
                        , int.Parse(context.Request.QueryString["serialno"]));

                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "getContactsBySerialNo")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var r = GetContacts(sqid, int.Parse(context.Request.QueryString["serialno"]));
                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "saveContactsProfile")
                {
                    var sqid = context.Request.QueryString["sqid"];

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    var o = JsonConvert.DeserializeObject<ContactsProfile>(body);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !SaveContactsProfile(sqid
                                , o.stationid
                                , o.custid
                                , o.custname
                                , o.localname
                                , o.localadd1
                                , o.localadd2
                                , o.localadd3
                                , o.localcity
                                , o.localst
                                , o.localzip
                                , o.localiso
                                , o.localtaxcode
                                , o.locallimit
                                , o.arbank
                                , o.aracctcode
                                , o.apacctcode
                                , o.arterms
                                , o.apterms
                                , o.apbank
                                , o.fsales
                                , o.user
                                , o.serialno)
                        });
                }
                else if (task == "offsetRevenue")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var invoiceNo = Uri.UnescapeDataString(context.Request.QueryString["invno"]);
                    var userId = Uri.UnescapeDataString(context.Request.QueryString["userid"]);
                    var rType = Uri.UnescapeDataString(context.Request.QueryString["rtype"]);
                    var prefixInv = Uri.UnescapeDataString(context.Request.QueryString["prefix-inv"]);
                    var prefixCr = Uri.UnescapeDataString(context.Request.QueryString["prefix-cr"]);
                    var prefixDb = Uri.UnescapeDataString(context.Request.QueryString["prefix-db"]);
                    var shouldAssignNewNumber = bool.Parse(context.Request.QueryString["new-doc-number"]);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !OffsetRevenue(sqid, uuid, ref invoiceNo, userId, shouldAssignNewNumber, rType, prefixInv, prefixCr, prefixDb),
                            offsetNo = invoiceNo
                        });
                }
                else if (task == "copyOffsetRevenue")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var invoiceNo = Uri.UnescapeDataString(context.Request.QueryString["invno"]);
                    var userId = Uri.UnescapeDataString(context.Request.QueryString["userid"]);
                    var rType = Uri.UnescapeDataString(context.Request.QueryString["rtype"]);
                    var offsetNo = Uri.UnescapeDataString(context.Request.QueryString["offset-no"]);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !CopyOffsetRevenue(sqid, uuid, invoiceNo, userId, rType, offsetNo)
                        });
                }
                else if (task == "offsetCost")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var voucherNo = Uri.UnescapeDataString(context.Request.QueryString["voucherno"]);
                    var userId = Uri.UnescapeDataString(context.Request.QueryString["userid"]);
                    var rType = Uri.UnescapeDataString(context.Request.QueryString["rtype"]);
                    var prefix = Uri.UnescapeDataString(context.Request.QueryString["prefix"]);
                    var shouldAssignNewNumber = bool.Parse(context.Request.QueryString["new-doc-number"]);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !OffsetCost(sqid, uuid, ref voucherNo, userId, shouldAssignNewNumber, prefix),
                            offsetNo = voucherNo
                        });
                }
                else if (task == "copyOffsetCost")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var voucherNo = Uri.UnescapeDataString(context.Request.QueryString["voucherno"]);
                    var userId = Uri.UnescapeDataString(context.Request.QueryString["userid"]);
                    var rType = Uri.UnescapeDataString(context.Request.QueryString["rtype"]);
                    var offsetNo = Uri.UnescapeDataString(context.Request.QueryString["offset-no"]);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !CopyOffsetCost(sqid, uuid, voucherNo, userId, rType, offsetNo)
                        });
                }
                else if (task == "getContractData")
                {
                    var code = Uri.UnescapeDataString(context.Request.QueryString["code"]);
                    var scac = Uri.UnescapeDataString(context.Request.QueryString["scac"]);
                    var r = GetContractData(code, scac);
                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "getStationBank")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var bankId = int.Parse(Uri.UnescapeDataString(context.Request.QueryString["bankid"]));
                    var r = GetStationBank(sqid, bankId);
                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "saveStationBank")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var userId = Uri.UnescapeDataString(context.Request.QueryString["userid"]);

                    string body;

                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        body = reader.ReadToEnd();
                    }

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !SaveStationBank(sqid, userId, JsonConvert.DeserializeObject<StationBank>(body))
                        });
                }
                else if (task == "getStationBanks")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var serial = int.Parse(Uri.UnescapeDataString(context.Request.QueryString["serial"]));
                    var r = GetStationBanks(sqid, serial);
                    json = JsonConvert.SerializeObject(r);
                }
                else if (task == "deleteStationBank")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var bankId = int.Parse(Uri.UnescapeDataString(context.Request.QueryString["bankid"]));
                    var result = DeleteStationBank(sqid, bankId);

                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            error = !result.Item1,
                            code = result.Item2
                        });
                }
                else if (task == "getBanksByStationId")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var stationId = context.Request.QueryString["stationid"];
                    var response = GetBanksByStationId(sqid, stationId);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "getBillingEmailToPrtinv")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var invno = context.Request.QueryString["invno"];
                    var stationid = context.Request.QueryString["stationid"];
                    var response = GetBillingEmailToPrtinv(sqid, invno, stationid);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "getNotesByRecid")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var recid = context.Request.QueryString["recid"];
                    var response = GetNotesByRecid(sqid, recid);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "saveNotesByRecid")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    string requestBody;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        requestBody = reader.ReadToEnd();
                    }

                    var body = JsonConvert.DeserializeObject<CsNotesDB>(requestBody);
                    var response = SaveNotesByRecid(body, sqid);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "deleteNotesByRecid")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var uuid = context.Request.QueryString["uuid"];
                    var isDelete = context.Request.QueryString["isDelete"];
                    var noteId = context.Request.QueryString["noteId"];
                    var entry = context.Request.QueryString["entry"];
                    var user = context.Request.QueryString["user"];
                    var response = DeleteNotesByRecid(sqid, uuid, isDelete, noteId, entry, user);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "closeFileByRecid")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    string requestBody;
                    using (var reader = new StreamReader(context.Request.InputStream))
                    {
                        requestBody = reader.ReadToEnd();
                    }

                    var body = JsonConvert.DeserializeObject<ShipmentDB>(requestBody);
                    var response = CloseFileByRecid(body, sqid);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "checkStationValueByStationId")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var station1 = context.Request.QueryString["station1"];
                    var station2 = context.Request.QueryString["station2"];
                    var response = CheckStationValueByStationId(sqid, station1, station2);
                    json = new JavaScriptSerializer().Serialize(
                        new
                        {
                            station1 = response.Item1,
                            station2 = response.Item2
                        });
                }
                else if (task == "getShipmentDataForSubject")
                {
                    var sqid = context.Request.QueryString["sqid"];
                    var hblValues = context.Request.QueryString["hblValues"];
                    IEnumerable<string> hblParam = string.IsNullOrWhiteSpace(hblValues)
                    ? Enumerable.Empty<string>()
                    : hblValues
                        .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(v => v.Trim());
                    var response = GetShipmentDataForSubject(sqid, hblParam);
                    json = JsonConvert.SerializeObject(response);
                }
                else if (task == "getPurchaseOrderNo")
                {
                    string sqid = context.Request.QueryString["sqid"].ToString();
                    string query = context.Request.QueryString["q"].ToString();
                    string custid = context.Request.QueryString["custid"].ToString();
                    json = GetPurchaseOrderNo(sqid, query, custid);
                }
            }
            catch (ValidationException x)
            {
                json = new JavaScriptSerializer().Serialize(
                    new
                    {
                        error = true,
                        isValidationError = true,
                        message = x.Message
                    });
            }

            context.Response.StatusCode = (int)HttpStatusCode.OK;
            context.Response.ContentType = "text/json";
            context.Response.Write(json);
            context.Response.End();
        }


        string InsertQuery(string tableName, List<Tuple<string, object>> columns)
        {
            var columnNames = string.Join(", ", columns.Select(c => c.Item1));
            var parameterNames = string.Join(", ", columns.Select(c => "@" + c.Item1));
            return $"INSERT INTO {tableName} ({columnNames}) VALUES ({parameterNames})";
        }


        string UpdateQuery(string tableName, List<Tuple<string, object>> columns, string searchCondition)
        {
            var setClause = string.Join(", ", columns.Select(c => $"{c.Item1} = @{c.Item1}"));
            return $"UPDATE {tableName} SET {setClause} WHERE {searchCondition}";
        }


        void SetParameters(SqlCommand command, List<Tuple<string, object>> columns)
        {
            foreach (var column in columns.Where(a => a.Item2 != null))
            {
                command.Parameters.AddWithValue("@" + column.Item1, column.Item2);
            }
        }


        void AddColumnOrParameter<T, TProperty>(T t, List<Tuple<string, object>> list, Expression<Func<T, TProperty>> e)
        {
            list.Add(new Tuple<string, object>(((MemberExpression)e.Body).Member.Name, e.Compile()(t)));
        }


        bool SaveStationBank(string sqid, string userId, StationBank bank)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                AddColumnOrParameter(bank, columns, a => a.primarybank);
                AddColumnOrParameter(bank, columns, a => a.code);
                AddColumnOrParameter(bank, columns, a => a.expand);
                AddColumnOrParameter(bank, columns, a => a.aba);
                AddColumnOrParameter(bank, columns, a => a.swift);
                AddColumnOrParameter(bank, columns, a => a.addr1);
                AddColumnOrParameter(bank, columns, a => a.glacct);
                AddColumnOrParameter(bank, columns, a => a.bankdesc);

                bank.adduser = userId;
                bank.lastuser = userId;
                bank.adddate = null;
                bank.lastdate = null;

                string query;

                if (bank.bankid == 0)
                {
                    AddColumnOrParameter(bank, columns, a => a.serial);
                    AddColumnOrParameter(bank, columns, a => a.compid);
                    AddColumnOrParameter(bank, columns, a => a.compname);
                    AddColumnOrParameter(bank, columns, a => a.adduser);
                    AddColumnOrParameter(bank, columns, a => a.adddate);

                    query = InsertQuery("stationbank", columns).Replace("@adddate", "getdate()");
                }
                else
                {
                    AddColumnOrParameter(bank, columns, a => a.lastuser);
                    AddColumnOrParameter(bank, columns, a => a.lastdate);

                    query = UpdateQuery("stationbank", columns, "bankid=@bankid").Replace("@lastdate", "getdate()");
                    AddColumnOrParameter(bank, columns, a => a.bankid);
                }

                using (var command = new SqlCommand(query, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        StationBank GetStationBank(string sqid, int bankId)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("bankId", bankId));

                using (var command = new SqlCommand("SELECT * FROM [stationbank] WHERE bankid=@bankId", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var o = new StationBank();
                            o.Set(reader);

                            return o;
                        }
                    }
                }
            }

            return null;
        }


        List<StationBank> GetStationBanks(string sqid, int serial)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("serial", serial));

                using (var command = new SqlCommand("SELECT * FROM [stationbank] WHERE serial=@serial", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var result = new List<StationBank>();

                        while (reader.Read())
                        {
                            var o = new StationBank();
                            result.Add(o.Set(reader));
                        }

                        return result;
                    }
                }
            }
        }

        List<StationBankByStationId> GetBanksByStationId(string sqid, string stationdId)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("stationdId", stationdId));

                using (var command = new SqlCommand("SELECT bankid,code,expand FROM [stationbank] WHERE compid=@stationdId", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var result = new List<StationBankByStationId>();

                        while (reader.Read())
                        {
                            var sB = new StationBankByStationId();
                            result.Add(sB.Set(reader));
                        }

                        return result;
                    }
                }
            }
        }


        Tuple<bool, string> DeleteStationBank(string sqid, int bankId)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                connection.Open();

                string code = string.Empty;

                // First, get the [code] before deleting
                using (var selectCommand = new SqlCommand("SELECT [code] FROM [stationbank] WHERE bankid=@bankId", connection))
                {
                    selectCommand.Parameters.AddWithValue("@bankId", bankId);
                    var result = selectCommand.ExecuteScalar();
                    code = result?.ToString();
                }

                int rowsAffected = 0;
                try
                {
                    // Only catch SQL errors from the DELETE
                    using (var deleteCommand = new SqlCommand("DELETE FROM [stationbank] WHERE bankid=@bankId", connection))
                    {
                        deleteCommand.Parameters.AddWithValue("@bankId", bankId);
                        rowsAffected = deleteCommand.ExecuteNonQuery();
                    }
                }
                catch (SqlException sqlEx)
                {
                    throw new ApplicationException($"SQL Error deleting bankId {bankId}: {sqlEx.Message}", sqlEx);
                }

                return Tuple.Create(rowsAffected > 0, code);
            }
        }


        List<ContractData> GetContractData(string code, string scac)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("code", code));
                columns.Add(new Tuple<string, object>("scac", scac));

                using (var command = new SqlCommand("SELECT expand, contractnotes FROM [contract_data] WHERE code=@code and scac=@scac", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var result = new List<ContractData>();

                        while (reader.Read())
                        {
                            var o = new ContractData
                            {
                                expand = reader["expand"].ToString(),
                                contractnotes = reader["contractnotes"].ToString(),
                            };

                            result.Add(o);
                        }

                        return result;
                    }
                }
            }
        }


        bool SaveShipmentNotes(string sqid, string uuid, string noteType, string shipmentNo, string freightRelease, string user)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("notetype", noteType));
                columns.Add(new Tuple<string, object>("shipmentno", shipmentNo));
                columns.Add(new Tuple<string, object>("freightrelease", freightRelease));
                columns.Add(new Tuple<string, object>("adduser", user));
                columns.Add(new Tuple<string, object>("locked", 1));
                columns.Add(new Tuple<string, object>("lockuser", user));
                columns.Add(new Tuple<string, object>("lockdate", null));

                var query = InsertQuery("shipmentnotes", columns).Replace("@lockdate", "getdate()");

                using (var command = new SqlCommand(query, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        List<Contact> GetContacts(string sqid, int serialNo)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("serialNo", serialNo));

                using (var command = new SqlCommand("SELECT uuid,custid,custname FROM contacts WHERE serialno=@serialNo", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var result = new List<Contact>();

                        while (reader.Read())
                        {
                            var o = new Contact
                            {
                                custid = reader["custid"].ToString(),
                                custname = reader["custname"].ToString(),
                            };

                            result.Add(o);
                        }

                        return result;
                    }
                }
            }
        }


        bool SaveContactsProfile(string sqid
                , string stationId
                , string custId
                , string custName
                , string localName
                , string localAdd1
                , string localAdd2
                , string localAdd3
                , string localCity
                , string localSt
                , string localZip
                , string localIso
                , string localTaxcode
                , string localLimit
                , string arBank
                , string arAcctCode
                , string apAcctCode
                , string arTerms
                , string apTerms
                , string apBank
                , string fSales
                , string user
                , int serialNo)
        {
            if (string.IsNullOrEmpty(arAcctCode))
            {
                throw new ValidationException("A/R Account Code cannot be blank");
            }

            var profile = LoadContactsProfile(sqid, stationId, serialNo).FirstOrDefault();

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("custid", custId));
                columns.Add(new Tuple<string, object>("custname", custName));
                columns.Add(new Tuple<string, object>("localname", localName));
                columns.Add(new Tuple<string, object>("localadd1", localAdd1));
                columns.Add(new Tuple<string, object>("localadd2", localAdd2));
                columns.Add(new Tuple<string, object>("localadd3", localAdd3));
                columns.Add(new Tuple<string, object>("localcity", localCity));
                columns.Add(new Tuple<string, object>("localst", localSt));
                columns.Add(new Tuple<string, object>("localzip", localZip));
                columns.Add(new Tuple<string, object>("localiso", localIso));
                columns.Add(new Tuple<string, object>("localtaxcode", localTaxcode));
                columns.Add(new Tuple<string, object>("locallimit", localLimit));
                columns.Add(new Tuple<string, object>("arbank", arBank));
                columns.Add(new Tuple<string, object>("aracctcode", arAcctCode));
                columns.Add(new Tuple<string, object>("apacctcode", apAcctCode));
                columns.Add(new Tuple<string, object>("arterms", arTerms));
                columns.Add(new Tuple<string, object>("apterms", apTerms));
                columns.Add(new Tuple<string, object>("apbank", apBank));
                columns.Add(new Tuple<string, object>("fsales", fSales));
                columns.Add(new Tuple<string, object>("lastdate", null));
                columns.Add(new Tuple<string, object>("lastuser", user));

                string query = null;

                if (profile != null)
                {
                    query = UpdateQuery("contactsprofile", columns, "stationid=@stationId and serialno=@serialno");
                }

                columns.Add(new Tuple<string, object>("stationid", stationId));
                columns.Add(new Tuple<string, object>("serialno", serialNo));

                if (profile == null)
                {
                    columns.Add(new Tuple<string, object>("adduser", user));
                    query = InsertQuery("contactsprofile", columns);
                }

                query = query.Replace("@lastdate", "getdate()");

                using (var command = new SqlCommand(query, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        List<ContactsProfile> LoadContactsProfile(string sqid, string stationId, int serialNo)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("stationId", stationId));
                columns.Add(new Tuple<string, object>("serialNo", serialNo));

                using (var command = new SqlCommand(
                    "SELECT localname,localadd1,localadd2,localadd3,localcity,localst,localzip,localiso,localtaxcode,locallimit,aracctcode,apacctcode,arterms,apterms,arbank,apbank,fsales,adddate,lastdate,adduser,lastuser"
                        + " FROM contactsprofile WHERE stationid=@stationId AND serialno=@serialNo"
                        , connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var result = new List<ContactsProfile>();

                        while (reader.Read())
                        {
                            var o = new ContactsProfile
                            {
                                localname = reader["localname"].ToString(),
                                localadd1 = reader["localadd1"].ToString(),
                                localadd2 = reader["localadd2"].ToString(),
                                localadd3 = reader["localadd3"].ToString(),
                                localcity = reader["localcity"].ToString(),
                                localst = reader["localst"].ToString(),
                                localzip = reader["localzip"].ToString(),
                                localiso = reader["localiso"].ToString(),
                                localtaxcode = reader["localtaxcode"].ToString(),
                                locallimit = reader["locallimit"].ToString(),
                                aracctcode = reader["aracctcode"].ToString(),
                                apacctcode = reader["apacctcode"].ToString(),
                                arterms = reader["arterms"].ToString(),
                                apterms = reader["apterms"].ToString(),
                                arbank = reader["arbank"].ToString(),
                                apbank = reader["apbank"].ToString(),
                                fsales = reader["fsales"].ToString(),
                                adduser = reader["adduser"].ToString(),
                                lastuser = reader["lastuser"].ToString(),
                                adddate = (DateTime)reader["adddate"],
                                lastdate = (DateTime)reader["lastdate"],
                            };

                            result.Add(o);
                        }

                        return result;
                    }
                }
            }
        }


        List<ShipmentNotes> LoadShipmentNotes(string sqid, string uuid, string shipmentNo)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("shipmentno", shipmentNo));

                using (var command = new SqlCommand("SELECT * FROM shipmentnotes WHERE uuid=@uuid AND shipmentno=@shipmentno ORDER BY adddate DESC", connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    using (var reader = command.ExecuteReader())
                    {
                        var notes = new List<ShipmentNotes>();

                        while (reader.Read())
                        {
                            var note = new ShipmentNotes
                            {
                                noteid = (int)reader["noteid"],
                                notetype = reader["notetype"].ToString(),
                                shipmentno = reader["shipmentno"].ToString(),
                                freightrelease = reader["freightrelease"].ToString(),
                                adduser = reader["adduser"].ToString(),
                                //adddate = ((DateTime)reader["adddate"]).ToEpochTime(),
                                adddate = (DateTime)reader["adddate"],
                                lastuser = reader["lastuser"].ToString(),
                                isLocked = (int)reader["locked"] != 0,
                                lockuser = reader["lockuser"].ToString(),
                                //lockdate = ((DateTime)reader["lockdate"]).ToEpochTime(),
                                lockdate = (DateTime)reader["lockdate"],
                                isVoided = (int)reader["voided"] != 0,
                                voiduser = reader["voiduser"].ToString(),
                                //voiddate = ((DateTime)reader["voiddate"]).ToEpochTime(),
                                voiddate = (DateTime)reader["voiddate"],
                                lastdate = (DateTime)reader["lastdate"],
                            };

                            notes.Add(note);
                        }

                        return notes;
                    }
                }
            }
        }


        bool UpdateShipmentNotes(string sqid, int id, string freightRelease, string user)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("freightrelease", freightRelease));
                columns.Add(new Tuple<string, object>("lastuser", user));
                columns.Add(new Tuple<string, object>("lastdate", null));

                var updateQuery = UpdateQuery("shipmentnotes", columns, "noteid=@noteid").Replace("@lastdate", "getdate()");
                columns.Add(new Tuple<string, object>("noteid", id));

                using (var command = new SqlCommand(updateQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool LockShipmentNotes(string sqid, int id, string freightRelease, string user, bool isLocked)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("freightrelease", freightRelease));
                columns.Add(new Tuple<string, object>("lastuser", user));
                columns.Add(new Tuple<string, object>("lastdate", null));
                columns.Add(new Tuple<string, object>("locked", isLocked ? 1 : 0));

                if (isLocked)
                {
                    columns.Add(new Tuple<string, object>("lockuser", user));
                    columns.Add(new Tuple<string, object>("lockdate", null));
                }

                var updateQuery = UpdateQuery("shipmentnotes", columns, "noteid=@noteid")
                    .Replace("@lastdate", "getdate()")
                    .Replace("@lockdate", "getdate()");

                columns.Add(new Tuple<string, object>("noteid", id));

                using (var command = new SqlCommand(updateQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool VoidShipmentNotes(string sqid, int id, string freightRelease, string user, bool isVoided)
        {
            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("freightrelease", freightRelease));
                columns.Add(new Tuple<string, object>("lastuser", user));
                columns.Add(new Tuple<string, object>("lastdate", null));
                columns.Add(new Tuple<string, object>("voided", isVoided ? 1 : 0));

                if (isVoided)
                {
                    columns.Add(new Tuple<string, object>("voiduser", user));
                    columns.Add(new Tuple<string, object>("voiddate", null));
                }

                var updateQuery = UpdateQuery("shipmentnotes", columns, "noteid=@noteid")
                    .Replace("@lastdate", "getdate()")
                    .Replace("@voiddate", "getdate()");

                columns.Add(new Tuple<string, object>("noteid", id));

                using (var command = new SqlCommand(updateQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool OffsetRevenue(string sqid, string uuid, ref string invoiceNo, string userId, bool shouldAssignNewNumber, string rType, string prefixInv, string prefixCr, string prefixDb)
        {
            if (string.IsNullOrWhiteSpace(invoiceNo))
            {
                return false;
            }

            var prefix = rType == "CR" ? prefixDb : prefixCr;

            string newInvNo = invoiceNo;

            if (shouldAssignNewNumber)
            {
                var newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "invno", prefix);
                newInvNo = prefix + (newInvno != -1 ? newInvno.ToString("D4") : "0001");
            }

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var insertQuery = $@"INSERT INTO [dbo].[revenue]
						([uuid]
						,[shipmentno]
						,[arcode]
						,[ardesc]
						,[note1]
						,[uom]
						,[qty]
						,[rate]
						,[per]
						,[amt]
						,[currency]
						,[amtpp]
						,[invdate]
						,[arpost]
						,[arpostdate]
						,[arpostuser]
						,[adddate]
						,[dettype]
						,[txtype]
						,[rtype]
						,[custid]
						,[custname]
						,[glacct]
						,[adddesc]
						,[ctnrno]
						,[exrate]
						,[release]
						,[terms]
						,[custref]
						,[ourref]
						,[jeno]
						,[adduser]
						,[basicamt]
						,[arcurr]
						,[arcurrexr]
						,[isvat]
						,[vatid]
						,[vatamt]
						,[vatbasic]
						,[documentno]
						,[stationid]
						,[mbl]
						,[hbl]
						,[manifest]
						,[basecurrency]
						,invno
						,offset
						,offsetdate
						,offsetuser
						,offref
						,arrel
						)
					select
						uuid
						,shipmentno
						,arcode
						,ardesc
						,note1
						,uom
						,qty
						,rate
						,per
						,amt
						,currency
						,amtpp
						,GETDATE()
						,arpost
						,GETDATE()
						,@userId
						,GETDATE()
						,dettype
						,txtype
						,case when rtype in ('IN', 'DB') then 'CR' when rtype = 'CR' then 'DB' end
						,custid
						,custname
						,glacct
						,adddesc
						,ctnrno
						,exrate
						,1
						,terms
						,custref
						,ourref
						,jeno
						,@userId
						,basicamt
						,arcurr
						,arcurrexr
						,isvat
						,vatid
						,vatamt
						,vatbasic
						,documentno
						,stationid
						,mbl
						,hbl
						,manifest
						,basecurrency
						,@newInvNo
						,1					
						,GETDATE()
						,@userId
						,invno
						,arrel
					from [revenue]
						where uuid = @uuid and invno = @invNo and rtype in ('IN', 'DB', 'CR') and offset = 0;
					
					update [revenue] set offset = 1, offsetdate = GETDATE(), offref = @newInvNo
						where uuid = @uuid and invno = @invNo and rtype in ('IN', 'DB', 'CR') and offset = 0;

					INSERT INTO [dbo].[arhist]
						   (
						   [stationid]
						   ,[custid]
						   ,[custname]
						   ,[txtype]
						   ,[shipmentno]
						   ,[custref]
						   ,[manifest]
						   ,[hbl]
						   ,[mbl]
						   ,[terms]
						   ,[arcode]
						   ,[amount]
						   ,[currency]
						   ,[jeno]
						   ,[adduser]
						   ,[adddate]
						   ,[glacct]
						   ,[ctnrno])
					select
							stationid
							,custid
							,custname
							,case when rtype in ('IN', 'DB') then 'CR' when rtype = 'CR' then 'DB' end
							,shipmentno
							,custref
							,manifest
							,hbl
							,mbl
							,terms
							,arcode
							,amt
							,currency
							,jeno
							,@userId
							,GETDATE()
							,glacct
							,ctnrno
						from revenue
						where uuid = @uuid and invno = @invNo and rtype in ('IN', 'DB', 'CR')
				";

                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("userId", userId));
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("invNo", invoiceNo));
                columns.Add(new Tuple<string, object>("newInvNo", newInvNo));

                if (shouldAssignNewNumber)
                {
                    invoiceNo = newInvNo;
                }

                using (var command = new SqlCommand(insertQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool CopyOffsetRevenue(string sqid, string uuid, string invoiceNo, string userId, string rType, string offsetNo)
        {
            if (string.IsNullOrWhiteSpace(invoiceNo))
            {
                return false;
            }

            var rTypeDst = rType == "CR" ? "DB" : "CR";
            rType = rType == "CR" ? "'CR'" : "'IN', 'DB'";

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var insertQuery = @"INSERT INTO [dbo].[revenue]
						([uuid]
						,[shipmentno]
						,[arcode]
						,[ardesc]
						,[note1]
						,[uom]
						,[qty]
						,[rate]
						,[per]
						,[amt]
						,[currency]
						,[amtpp]
						,[adddate]
						,[dettype]
						,[txtype]
						,[rtype]
						,[custid]
						,[custname]
						,[glacct]
						,[adddesc]
						,[ctnrno]
						,[exrate]
						,[terms]
						,[custref]
						,[ourref]
						,[jeno]
						,[adduser]
						,[basicamt]
						,[arcurr]
						,[arcurrexr]
						,[isvat]
						,[vatid]
						,[vatamt]
						,[vatbasic]
						,[documentno]
						,[stationid]
						,[mbl]
						,[hbl]
						,[manifest]
						,[basecurrency]
						,offset
						,offsetdate
						)
					select
						uuid
						,shipmentno
						,arcode
						,ardesc
						,note1
						,uom
						,qty
						,rate
						,per
						,amt
						,currency
						,amtpp
						,GETDATE()
						,dettype
						,txtype
						,rtype
						,custid
						,custname
						,glacct
						,adddesc
						,ctnrno
						,exrate
						,terms
						,custref
						,ourref
						,jeno
						,@userId
						,basicamt
						,arcurr
						,arcurrexr
						,isvat
						,vatid
						,vatamt
						,vatbasic
						,documentno
						,stationid
						,mbl
						,hbl
						,manifest
						,basecurrency
						,0
						,GETDATE()
					from [revenue]
						where uuid = @uuid and invno = @invNo and rtype IN (" + rType + @");

					update [revenue] set offref = @offsetNo
						where uuid = @uuid and invno = @invNo and rtype IN (" + rType + @");

					update [revenue] set offref = @invNo
						where uuid = @uuid and invno = @offsetNo and rtype = @rTypeDst
				";

                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("userId", userId));
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("invNo", invoiceNo));
                columns.Add(new Tuple<string, object>("offsetNo", offsetNo));
                columns.Add(new Tuple<string, object>("rTypeDst", rTypeDst));

                using (var command = new SqlCommand(insertQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool OffsetCost(string sqid, string uuid, ref string voucherNo, string userId, bool shouldAssignNewNumber, string prefix)
        {
            if (string.IsNullOrWhiteSpace(voucherNo))
            {
                return false;
            }

            string newNo = voucherNo;

            if (shouldAssignNewNumber)
            {
                int newNoI = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "voucherno", prefix);
                newNo = prefix + (newNoI != -1 ? newNoI.ToString("D4") : "0001");
            }

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var insertQuery = $@"INSERT INTO [dbo].[revenue]
						([uuid]
						,[shipmentno]
						,[arcode]
						,[ardesc]
						,[invdate]
						,vendid
						,vendname
						,vendref
						,venddate
						,uomc
						,qtyc
						,ratec
						,perc
						,cost
						,currencyc
						,costpp
						,note2
						,appost
						,accrdate
						,appostdate
						,appostuser
						,[adddate]
						,[dettype]
						,[txtype]
						,[rtype]
						,[glacct]
						,[adddesc]
						,[ctnrno]
						,[exratec]
						,[release]
						,[terms]
						,[custref]
						,[ourref]
						,[jeno]
						,[adduser]
						,taxinvno
						,taxinvdate
						,[basicamt]
						,voucherno
						,[apcurr]
						,[apcurrexr]
						,[documentno]
						,[stationid]
						,[mbl]
						,[hbl]
						,[manifest]
						,[basecurrency]
						,offset
						,offsetdate
						,offref
						,aprel
					)
					select
						uuid
						,shipmentno
						,arcode
						,ardesc
						,GETDATE()
						,vendid
						,vendname
						,vendref
						,venddate
						,uomc
						,qtyc
						,ratec
						,perc
						,cost
						,currencyc
						,costpp
						,note2
						,appost
						,accrdate
						,appostdate
						,appostuser
						,GETDATE()
						,dettype
						,txtype
						,case when rtype in ('PO', 'DB') then 'CR' when rtype = 'CR' then 'DB' end
						,glacct
						,adddesc
						,ctnrno
						,exratec
						,1
						,terms
						,custref
						,ourref
						,jeno
						,@userId
						,taxinvno
						,taxinvdate
						,[basicamt]
						,@newNo
						,[apcurr]
						,[apcurrexr]
						,documentno
						,stationid
						,mbl
						,hbl
						,manifest
						,basecurrency
						,1					
						,GETDATE()
						,voucherno
						,aprel
					from [revenue]
						where uuid = @uuid and voucherno = @voucherNo and rtype in ('PO', 'DB', 'CR') and offset = 0;
					
					update [revenue] set offset = 1, offsetdate = GETDATE(), offref = @newNo
						where uuid = @uuid and voucherno = @voucherNo and rtype in ('PO', 'DB', 'CR') and offset = 0;

					INSERT INTO [dbo].[aphist]
						   (
						   [stationid]
						   ,[vendid]
						   ,[vendname]
						   ,[txtype]
						   ,[shipmentno]
						   ,[vendref]
						   ,[manifest]
						   ,[hbl]
						   ,[mbl]
						   ,[terms]
						   ,[apcode]
						   ,[amount]
						   ,[currency]
						   ,[jeno]
						   ,[adduser]
						   ,[adddate]
						   ,[glacct]
						   ,[ctnrno])
					select
							stationid
							,vendid
							,vendname
							,case when rtype in ('PO', 'DB') then 'CR' when rtype = 'CR' then 'DB' end
							,shipmentno
							,vendref
							,manifest
							,hbl
							,mbl
							,terms
							,apcode
							,amt
							,currency
							,jeno
							,@userId
							,GETDATE()
							,glacct
							,ctnrno
						from revenue
						where uuid = @uuid and voucherno = @voucherNo and rtype in ('PO', 'DB', 'CR')
				";

                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("userId", userId));
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("voucherNo", voucherNo));
                columns.Add(new Tuple<string, object>("newNo", newNo));

                if (shouldAssignNewNumber)
                {
                    voucherNo = newNo;
                }

                using (var command = new SqlCommand(insertQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        bool CopyOffsetCost(string sqid, string uuid, string voucherNo, string userId, string rType, string offsetNo)
        {
            if (string.IsNullOrWhiteSpace(voucherNo))
            {
                return false;
            }

            var rTypeDst = rType == "CR" ? "DB" : "CR";
            rType = rType == "CR" ? "'CR'" : "'PO', 'DB'";

            using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                var insertQuery = $@"INSERT INTO [dbo].[revenue]
						([uuid]
						,[shipmentno]
						,[arcode]
						,[ardesc]
						,vendid
						,vendname
						,vendref
						,venddate
						,uomc
						,qtyc
						,ratec
						,perc
						,cost
						,currencyc
						,costpp
						,note2
						,accrdate
						,[adddate]
						,[dettype]
						,[txtype]
						,[rtype]
						,[glacct]
						,[adddesc]
						,[ctnrno]
						,[exratec]
						,[terms]
						,[custref]
						,[ourref]
						,[jeno]
						,[adduser]
						,taxinvno
						,taxinvdate
						,[basicamt]
						,[apcurr]
						,[apcurrexr]
						,[documentno]
						,[stationid]
						,[mbl]
						,[hbl]
						,[manifest]
						,[basecurrency]
						,offset
						,offsetdate
						)
					select
						uuid
						,shipmentno
						,arcode
						,ardesc
						,vendid
						,vendname
						,vendref
						,venddate
						,uomc
						,qtyc
						,ratec
						,perc
						,cost
						,currencyc
						,costpp
						,note2
						,accrdate
						,GETDATE()
						,dettype
						,txtype
						,rtype
						,glacct
						,adddesc
						,ctnrno
						,exratec
						,terms
						,custref
						,ourref
						,jeno
						,@userId
						,taxinvno
						,taxinvdate
						,[basicamt]
						,[apcurr]
						,[apcurrexr]
						,documentno
						,stationid
						,mbl
						,hbl
						,manifest
						,basecurrency
						,0
						,GETDATE()
					from [revenue]
						where uuid = @uuid and voucherno = @voucherNo and rtype IN (" + rType + @");

					update [revenue] set offref = @offsetNo
						where uuid = @uuid and voucherno = @voucherNo and rtype IN (" + rType + @");

					update [revenue] set offref = @voucherNo
						where uuid = @uuid and voucherno = @offsetNo and rtype = @rTypeDst
				";

                var columns = new List<Tuple<string, object>>();
                columns.Add(new Tuple<string, object>("userId", userId));
                columns.Add(new Tuple<string, object>("uuid", uuid));
                columns.Add(new Tuple<string, object>("voucherNo", voucherNo));
                columns.Add(new Tuple<string, object>("offsetNo", offsetNo));
                columns.Add(new Tuple<string, object>("rTypeDst", rTypeDst));

                using (var command = new SqlCommand(insertQuery, connection))
                {
                    SetParameters(command, columns);

                    connection.Open();

                    return (command.ExecuteNonQuery() > 0);
                }
            }
        }


        private string GetVessels(string query, string compliance)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[compliance].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM vessel where vessel like '%" + query + "%'", sqlConnection);
            List<Vessel> datas = new List<Vessel>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Vessel temp = new Vessel();
                    temp.vessel = rdr["vessel"].ToString();
                    temp.imo = rdr["imo"].ToString();
                    temp.flag = rdr["flag"].ToString();

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetArcodes(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM arcode where code like '%" + query + "%' OR expand like '%" + query + "%'", sqlConnection);
            List<ArCode> datas = new List<ArCode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ArCode temp = new ArCode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.arcr = rdr["arcr"].ToString();
                    temp.apdb = rdr["apdb"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetArcodesWithMode(string sqid, string query, string mode)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM arcode where mode='" + mode + "' AND (code like '%" + query + "%' OR expand like '%" + query + "%')", sqlConnection);
            List<ArCode> datas = new List<ArCode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ArCode temp = new ArCode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.arcr = rdr["arcr"].ToString();
                    temp.apdb = rdr["apdb"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetApcodes(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM apcode where expand like '%" + query + "%'", sqlConnection);
            List<ApCode> datas = new List<ApCode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ApCode temp = new ApCode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetUncodes(string query, string key)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM uncode where " + key + " like '%" + query + "%'", sqlConnection);
            List<Uncode> datas = new List<Uncode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Uncode temp = new Uncode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetUncodes2(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM uncode WHERE ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Uncode> datas = new List<Uncode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Uncode temp = new Uncode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetUncodesAir(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM uncode WHERE (porttype='A' OR porttype='') AND ";
            sqlQuery += "(code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Uncode> datas = new List<Uncode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Uncode temp = new Uncode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetUncodesPort(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM uncode WHERE porttype='P' AND ";
            sqlQuery += "(code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Uncode> datas = new List<Uncode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Uncode temp = new Uncode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetVesselCode(string sqid, string stationId, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 "
                + " scac1,stationid,sailid,vslcode,vtype,vessel1,voyage1,imo1,flag1,polcode,polname,vessel2,voyage2,imo2,flag2,poulcode,poulname,vweek,vyear,format(cast(etd as date), 'MM/dd/yyyy') as etd,format(cast(eta as date), 'MM/dd/yyyy') as eta,format(cast(transeta as date), 'MM/dd/yyyy') as transeta,format(cast(transdate as date), 'MM/dd/yyyy') as transdate,transcode,transname "
                + ",format(cast(obdate as date), 'MM/dd/yyyy') as obdate,format(cast(atd as date), 'MM/dd/yyyy') as atd,format(cast(ata as date), 'MM/dd/yyyy') as ata"
                + " FROM vschedule WHERE stationid=@stationid AND";

            sqlQuery += " (vslcode" + " like '%" + query + "%'";
            sqlQuery += " OR vessel1" + " like '%" + query + "%'";
            sqlQuery += " OR vessel2" + " like '%" + query + "%')";
            sqlQuery += " ORDER BY etd DESC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            sqlCommand.Parameters.AddWithValue("@stationid", stationId);

            List<VslCode> datas = new List<VslCode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    VslCode temp = new VslCode();
                    temp.sailid = rdr["sailid"].ToString();
                    temp.stationid = rdr["stationid"].ToString();
                    temp.vslcode = rdr["vslcode"].ToString();
                    temp.vtype = rdr["vtype"].ToString();
                    temp.vweek = rdr["vweek"].ToString();
                    temp.vyear = rdr["vyear"].ToString();
                    temp.scac1 = rdr["scac1"].ToString();
                    temp.vessel1 = rdr["vessel1"].ToString();
                    temp.voyage1 = rdr["voyage1"].ToString();
                    temp.imo1 = rdr["imo1"].ToString();
                    temp.flag1 = rdr["flag1"].ToString();
                    temp.polcode = rdr["polcode"].ToString();
                    temp.polname = rdr["polname"].ToString();
                    temp.vessel2 = rdr["vessel2"].ToString();
                    temp.voyage2 = rdr["voyage2"].ToString();
                    temp.imo2 = rdr["imo2"].ToString();
                    temp.flag2 = rdr["flag2"].ToString();
                    temp.transcode = rdr["transcode"].ToString();
                    temp.transname = rdr["transname"].ToString();
                    temp.poulcode = rdr["poulcode"].ToString();
                    temp.poulname = rdr["poulname"].ToString();
                    temp.obdate = rdr["obdate"].ToString();
                    temp.atd = rdr["atd"].ToString();
                    temp.ata = rdr["ata"].ToString();

                    if (temp.obdate == "01/01/1900") { temp.obdate = ""; }
                    if (temp.atd == "01/01/1900") { temp.atd = ""; }
                    if (temp.ata == "01/01/1900") { temp.ata = ""; }


                    if (temp.vtype == "1")
                    {
                        temp.etd = rdr["etd"].ToString();
                        temp.eta = rdr["eta"].ToString();
                        temp.etd3 = rdr["etd"].ToString();
                        temp.eta3 = rdr["eta"].ToString();
                    }
                    if (temp.vtype == "2")
                    {
                        temp.etd = rdr["etd"].ToString();
                        temp.eta = rdr["transeta"].ToString();
                        temp.etd3 = rdr["transdate"].ToString();
                        temp.eta3 = rdr["eta"].ToString();
                    }

                    temp.str = temp.vslcode + " - " + temp.scac1 + " - " + temp.vessel1 + " (" + temp.imo1 + ") v. " + temp.voyage1 + " POL: " + temp.polname + " (" + temp.etd + ")";
                    if (temp.vessel2 != "")
                    {
                        temp.str += " - " + temp.vessel2 + " v. " + temp.voyage2;
                    }

                    temp.str += " POD: " + temp.poulname + " (" + temp.eta + ")";

                    datas.Add(temp);
                }

                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetAcct(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM glacct WHERE ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Glacct> datas = new List<Glacct>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Glacct temp = new Glacct();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetPort(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM ports WHERE ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Uncode> datas = new List<Uncode>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Uncode temp = new Uncode();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetSeds(string query, string key)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT * FROM sed where " + key + " like '%" + query + "%'", sqlConnection);
            List<Sed> datas = new List<Sed>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Sed temp = new Sed();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.uom1 = rdr["uom1"].ToString();
                    temp.uom2 = rdr["uom2"].ToString();

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetSeds2(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM sed Where ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Sed> datas = new List<Sed>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Sed temp = new Sed();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.uom1 = rdr["uom1"].ToString();
                    temp.uom2 = rdr["uom2"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetSchd2(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM schd Where ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Schd> datas = new List<Schd>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Schd temp = new Schd();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.str = temp.code + " - " + temp.expand;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetSchk2(string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM schk Where ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Schk> datas = new List<Schk>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Schk temp = new Schk();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.country = rdr["country"].ToString();
                    temp.str = temp.code + " - " + temp.expand + ", " + temp.country;

                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContacts(string sqid, string query, string key)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("SELECT TOP 100 * FROM contacts where " + key + " like '" + query + "%'", sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContacts2(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.firms = rdr["firms"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContacts3(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM contacts Where (";
            sqlQuery += " (erp01 like 'V-%' OR erp02 like 'V-%') AND ";
            sqlQuery += " (custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'))";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContacts4(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM contacts Where (";
            sqlQuery += " (erp01 like 'C-%' OR erp02 like 'C-%') AND ";
            sqlQuery += " (custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'))";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsPrincipal(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM contacts Where (";
            sqlQuery += " (customertype like '%PRINCIPAL%') AND ";
            sqlQuery += " (custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'))";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.csr = rdr["csr"].ToString();
                    temp.destop = rdr["destop"].ToString();
                    temp.rep1 = rdr["rep1"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    temp.billid = rdr["billto"].ToString();
                    temp.billname = rdr["billname"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsPrincipal2(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM contacts Where (";
            sqlQuery += " (customertype like '%PRINCIPAL%') AND ";
            sqlQuery += " (custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'))";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.csr = rdr["destcs2"].ToString();
                    temp.destop = rdr["destop2"].ToString();
                    temp.rep1 = rdr["rep1"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.csr + " - " + temp.destop;
                    temp.billid = rdr["billto"].ToString();
                    temp.billname = rdr["billname"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsConsignee(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.usisf = rdr["isfreq"].ToString();
                    temp.billid = rdr["billto"].ToString();
                    temp.billname = rdr["billname"].ToString();
                    if (string.IsNullOrEmpty(temp.billid))
                    {
                        temp.billid = temp.custid;
                    }
                    if (string.IsNullOrEmpty(temp.billname))
                    {
                        temp.billname = temp.custname;
                    }
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsWarehouse(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "customertype LIKE '%WAREHOUSE;%' AND ";
            sqlQuery += "(custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.usisf = rdr["isfreq"].ToString();
                    temp.billid = rdr["billto"].ToString();
                    temp.billname = rdr["billname"].ToString();
                    if (string.IsNullOrEmpty(temp.billid))
                    {
                        temp.billid = temp.custid;
                    }
                    if (string.IsNullOrEmpty(temp.billname))
                    {
                        temp.billname = temp.custname;
                    }
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsTrucker(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "customertype LIKE '%TRUCKER;%' AND ";
            sqlQuery += "(custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.usisf = rdr["isfreq"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsVendor(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "(custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsScac(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "customertype LIKE '%OCEAN CARRIER%' AND ";
            sqlQuery += "(custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR contact4" + " like '%" + query + "%'";
            sqlQuery += " OR acctno" + " like '%" + query + "%'";
            sqlQuery += " OR firms" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.erp01 = rdr["erp01"].ToString();
                    temp.erp02 = rdr["erp02"].ToString();
                    temp.firms = rdr["firms"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContactsAirCarrier(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM contacts Where ";
            sqlQuery += "(customertype='AIR CARRIER;' OR customertype='AIR CARRIER') AND ";
            sqlQuery += "(custid" + " like '%" + query + "%'";
            sqlQuery += " OR custname" + " like '%" + query + "%'";
            sqlQuery += " OR addr1" + " like '%" + query + "%'";
            sqlQuery += " OR addr2" + " like '%" + query + "%'";
            sqlQuery += " OR city" + " like '%" + query + "%'";
            sqlQuery += " OR contact1" + " like '%" + query + "%'";
            sqlQuery += " OR contact2" + " like '%" + query + "%'";
            sqlQuery += " OR contact3" + " like '%" + query + "%'";
            sqlQuery += " OR prefix" + " like '%" + query + "%'";
            sqlQuery += " OR iata" + " like '%" + query + "%'";
            sqlQuery += " OR icao" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Contact> datas = new List<Contact>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Contact temp = new Contact();
                    temp.custname = rdr["custname"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.addr1 = rdr["addr1"].ToString();
                    temp.addr2 = rdr["addr2"].ToString();
                    temp.addr3 = rdr["addr3"].ToString();
                    temp.city = rdr["city"].ToString();
                    temp.state = rdr["state"].ToString();
                    temp.zip = rdr["zip"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    temp.contact1 = rdr["contact1"].ToString();
                    temp.phone1 = rdr["phone1"].ToString();
                    temp.email1 = rdr["email1"].ToString();
                    temp.ein = rdr["ein"].ToString();
                    temp.prefix = rdr["prefix"].ToString();
                    temp.iata = rdr["iata"].ToString();
                    temp.str = temp.custid + " - " + temp.custname + " - " + temp.addr1 + " - " + temp.city + " - " + temp.state + " - " + temp.iso + " - " + temp.erp01 + " - " + temp.erp02;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetStation2(string sqid, string query, string soffid2 = "")
        {
            bool includeKLN = false;
            if (!string.IsNullOrWhiteSpace(soffid2))
            {
                var noValidStations = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "TALAX", "TANYC", "TASFO", "TLIUS", "TOBRK",
                    "TOLAX", "TONYC", "TOORD", "TOSFO",
                    "TTLAX", "TTUSOPLOG9Z001"
                };
                includeKLN = noValidStations.Contains(soffid2);
            }
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM stationprofile Where";
            sqlQuery += "( compid" + " like '%" + query + "%'";
            sqlQuery += " OR compname" + " like '%" + query + "%'";
            sqlQuery += " OR compcity" + " like '%" + query + "%' )";
            if (includeKLN)
            {
                sqlQuery += " AND kln = 0";
            }
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Station2> datas = new List<Station2>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Station2 temp = new Station2();
                    temp.compname = rdr["compname"].ToString();
                    temp.compid = rdr["compid"].ToString();
                    temp.compcity = rdr["compcity"].ToString();
                    temp.kln = rdr["kln"].ToString();
                    temp.str = temp.compid + " - " + temp.compname + " - " + temp.compcity;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetDestination2(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM expdest Where ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            sqlQuery += " OR shipname" + " like '%" + query + "%'";
            sqlQuery += " OR consname" + " like '%" + query + "%'";
            sqlQuery += " OR polname" + " like '%" + query + "%'";
            sqlQuery += " OR apolname" + " like '%" + query + "%'";
            sqlQuery += " OR poulname" + " like '%" + query + "%'";
            sqlQuery += " OR apoulname" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Destination2> datas = new List<Destination2>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Destination2 temp = new Destination2();
                    temp.expand = rdr["expand"].ToString();
                    temp.code = rdr["code"].ToString();
                    temp.shipname = rdr["shipname"].ToString();
                    temp.consname = rdr["consname"].ToString();
                    temp.polname = rdr["polname"].ToString();
                    temp.poulname = rdr["poulname"].ToString();
                    temp.apolname = rdr["apolname"].ToString();
                    temp.apoulname = rdr["apoulname"].ToString();
                    temp.str = temp.code + " - " + temp.expand + " - " + temp.shipname + " - " + temp.consname + " - " + temp.polname + " - " + temp.poulname + " - " + temp.apolname + " - " + temp.apoulname;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string getlotno(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM shipment Where ";
            sqlQuery += "manifest" + " like '%" + query + "%'";
            sqlQuery += " OR mbl" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<LotNo> datas = new List<LotNo>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    LotNo temp = new LotNo();
                    temp.manifest = rdr["manifest"].ToString();
                    temp.mbl = rdr["mbl"].ToString();
                    temp.str = temp.manifest + " (" + temp.mbl + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetItem2(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT TOP 100 * FROM itemmaster Where ";
            sqlQuery += "code" + " like '%" + query + "%'";
            sqlQuery += " OR expand" + " like '%" + query + "%'";
            sqlQuery += " OR schbcode" + " like '%" + query + "%'";
            sqlQuery += " OR schbdesc" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<Item> datas = new List<Item>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Item temp = new Item();
                    temp.expand = rdr["expand"].ToString();
                    temp.code = rdr["code"].ToString();
                    temp.schbcode = rdr["schbcode"].ToString();
                    temp.schbdesc = rdr["schbdesc"].ToString();
                    temp.str = temp.code + " - " + temp.expand + " - " + temp.schbcode + " - " + temp.schbdesc;
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetOGctnr(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM ctnrlist Where ";
            sqlQuery += "ctnrno" + " like '%" + query + "%'";
            sqlQuery += "OR ctnrtype" + " like '%" + query + "%'";
            sqlQuery += "AND (ctnrtype like '%20%' OR ctnrtype like '%40%' OR ctnrtype like '%45%') ";
            sqlQuery += "ORDER BY ctnrtype ASC, ctnrno ASC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<OGctnr> datas = new List<OGctnr>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    OGctnr temp = new OGctnr();
                    temp.ctnrtype = rdr["ctnrtype"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.str = temp.ctnrno + " (" + temp.ctnrtype + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetIGctnr(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM ctnrlist WHERE ";
            sqlQuery += "(ctnrno like '%" + query + "%'";
            sqlQuery += " OR ctnrtype like '%" + query + "%')";
            sqlQuery += " AND (ctnrtype like '%20%' OR ctnrtype like '%40%' OR ctnrtype like '%45%')";
            sqlQuery += " AND lasttx='OG'";
            sqlQuery += "ORDER BY ctnrtype ASC, ctnrno ASC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<IGctnr> datas = new List<IGctnr>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    IGctnr temp = new IGctnr();
                    temp.ctnrtype = rdr["ctnrtype"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.str = temp.ctnrno + " (" + temp.ctnrtype + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetOGchas(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM ctnrlist Where ";
            sqlQuery += "ctnrno" + " like '%" + query + "%'";
            sqlQuery += "AND (ctnrtype='CHASSIS' OR ctnrtype='RASTRA') ";
            sqlQuery += "ORDER BY ctnrtype ASC, ctnrno ASC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<OGctnr> datas = new List<OGctnr>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    OGctnr temp = new OGctnr();
                    temp.ctnrtype = rdr["ctnrtype"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.str = temp.ctnrno + " (" + temp.ctnrtype + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetIGchas(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM ctnrlist Where ";
            sqlQuery += "ctnrno" + " like '%" + query + "%'";
            sqlQuery += "AND (ctnrtype='CHASSIS' OR ctnrtype='RASTRA') ";
            sqlQuery += "ORDER BY ctnrtype ASC, ctnrno ASC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<IGctnr> datas = new List<IGctnr>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    IGctnr temp = new IGctnr();
                    temp.ctnrtype = rdr["ctnrtype"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.str = temp.ctnrno + " (" + temp.ctnrtype + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetAssignctnr(string sqid, string query, string station, string cfmtype)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM ctnrlist Where ";
            sqlQuery += "ctnrno" + " like '%" + query + "%'";
            sqlQuery += "AND ctnrtype='" + cfmtype + "'";
            sqlQuery += "AND loccode='" + station + "'";
            sqlQuery += " ORDER BY ctnrtype ASC, ctnrno ASC";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<IGctnr> datas = new List<IGctnr>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    IGctnr temp = new IGctnr();
                    temp.ctnrtype = rdr["ctnrtype"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.str = temp.ctnrno + " (" + temp.ctnrtype + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetQuoteNos(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT quoteno, shipname, consname, polname, poulname, podname, format(cast(reqshipdate as date), 'MM/dd/yyyy') as reqshipdate  FROM quote WHERE ";
            sqlQuery += "quoteno" + " like '%" + query + "%'";
            sqlQuery += " OR shipname" + " like '%" + query + "%'";
            sqlQuery += " OR consname" + " like '%" + query + "%'";
            sqlQuery += " OR polname" + " like '%" + query + "%'";
            sqlQuery += " OR poulname" + " like '%" + query + "%'";
            sqlQuery += " OR podname" + " like '%" + query + "%'";
            sqlQuery += " OR billref" + " like '%" + query + "%'";
            sqlQuery += " OR pickref" + " like '%" + query + "%'";
            sqlQuery += " OR delvref" + " like '%" + query + "%'";
            sqlQuery += " OR shipref" + " like '%" + query + "%'";
            sqlQuery += " OR consref" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<SearchNo> datas = new List<SearchNo>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    SearchNo temp = new SearchNo();
                    temp.no = rdr["quoteno"].ToString();
                    temp.str = rdr["quoteno"].ToString() + " - " + rdr["reqshipdate"].ToString() + " - " + rdr["shipname"].ToString() + " - " + rdr["consname"].ToString() + " - " + rdr["polname"].ToString() + " - " + rdr["poulname"].ToString() + " - " + rdr["podname"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCdmBookNos(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT cdmbookno, carrref, shipname, consname, polname, poulname, podname, vessel, voyage, format(cast(etd as date), 'MM/dd/yy') as etd  FROM bkg WHERE ";
            sqlQuery += "cancelled=0 AND (";
            sqlQuery += "cdmbookno" + " like '%" + query + "%'";
            sqlQuery += " OR carrref" + " like '%" + query + "%'";
            sqlQuery += " OR shipname" + " like '%" + query + "%'";
            sqlQuery += " OR consname" + " like '%" + query + "%'";
            sqlQuery += " OR polname" + " like '%" + query + "%'";
            sqlQuery += " OR poulname" + " like '%" + query + "%'";
            sqlQuery += " OR podname" + " like '%" + query + "%'";
            sqlQuery += " OR vessel" + " like '%" + query + "%'";
            sqlQuery += " OR voyage" + " like '%" + query + "%'";
            sqlQuery += " OR pickref" + " like '%" + query + "%'";
            sqlQuery += " OR delvref" + " like '%" + query + "%'";
            sqlQuery += " OR shipref" + " like '%" + query + "%'";
            sqlQuery += " OR consref" + " like '%" + query + "%')";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<SearchNo> datas = new List<SearchNo>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    SearchNo temp = new SearchNo();
                    temp.no = rdr["cdmbookno"].ToString();
                    temp.str = rdr["cdmbookno"].ToString() + " - " + rdr["carrref"].ToString() + " - " + rdr["vessel"].ToString() + " - " + rdr["voyage"].ToString() + " - " + rdr["etd"].ToString()
                        + " - " + rdr["polname"].ToString() + " - " + rdr["poulname"].ToString() + " - " + rdr["shipname"].ToString() + " - " + rdr["consname"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetPickNos(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT pickno, shipname, shipref, consname, consref, format(cast(pickdate as date), 'MM/dd/yy') as pickdate  FROM pickup WHERE ";
            sqlQuery += " pickno" + " like '%" + query + "%'";
            sqlQuery += " OR shipname" + " like '%" + query + "%'";
            sqlQuery += " OR shipref" + " like '%" + query + "%'";
            sqlQuery += " OR consname" + " like '%" + query + "%'";
            sqlQuery += " OR consref" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<SearchNo> datas = new List<SearchNo>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    SearchNo temp = new SearchNo();
                    temp.no = rdr["pickno"].ToString();
                    temp.str = rdr["pickno"].ToString() + " - " + rdr["shipname"].ToString() + " - " + rdr["shipref"].ToString() + " - " + rdr["consname"].ToString() + " - " + rdr["consref"].ToString() + " - " + rdr["pickdate"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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
        private string GetWrNos(string sqid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT wrno, shipname, shipref, consname, consref, format(cast(wrdate as date), 'MM/dd/yy') as wrdate  FROM wr WHERE ";
            sqlQuery += " wrno" + " like '%" + query + "%'";
            sqlQuery += " OR shipname" + " like '%" + query + "%'";
            sqlQuery += " OR shipref" + " like '%" + query + "%'";
            sqlQuery += " OR consname" + " like '%" + query + "%'";
            sqlQuery += " OR consref" + " like '%" + query + "%'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<SearchNo> datas = new List<SearchNo>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    SearchNo temp = new SearchNo();
                    temp.no = rdr["wrno"].ToString();
                    temp.str = rdr["wrno"].ToString() + " - " + rdr["shipname"].ToString() + " - " + rdr["shipref"].ToString() + " - " + rdr["consname"].ToString() + " - " + rdr["consref"].ToString() + " - " + rdr["wrdate"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCompanyTypes(string sqid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT code, expand  FROM aescodes WHERE codetype='COMPANY TYPE' ORDER BY expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCodeTypes(string sqid, string type)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT code, expand  FROM codes WHERE codetype='" + type + "' ORDER BY expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetAesCodeTypes(string type)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT code, expand  FROM aescodes WHERE codetype='" + type + "' ORDER BY docorder, expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCountries()
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *  FROM schc ORDER BY expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetStates(string iso)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *  FROM states ORDER BY expand ASC";
            if (!String.IsNullOrEmpty(iso))
            {
                sqlQuery = "SELECT states.*  FROM states WHERE states.iso='" + iso + "' ORDER BY expand ASC";
            }
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.iso = rdr["iso"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetClauses(string sqid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT id, CASE WHEN LEN(clause) > 99 THEN CONCAT(SUBSTRING(clause, 1, 100), '...') ELSE clause END AS clause  FROM clauses WHERE clstype='COMMERCIAL-INVOICE' ORDER BY clause ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ClauseType> datas = new List<ClauseType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ClauseType temp = new ClauseType();
                    temp.id = rdr["id"].ToString();
                    temp.clause = rdr["clause"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetClause(string sqid, string code)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT id, clause  FROM clauses WHERE id='" + code + "' AND clstype='COMMERCIAL-INVOICE' ORDER BY clause ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ClauseType> datas = new List<ClauseType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ClauseType temp = new ClauseType();
                    temp.id = rdr["id"].ToString();
                    temp.clause = rdr["clause"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetOceanClauses()
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM oceanclause ORDER BY expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ClauseType> datas = new List<ClauseType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ClauseType temp = new ClauseType();
                    temp.id = rdr["code"].ToString();
                    temp.clause = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetOceanClause(string code)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *  FROM oceanclause WHERE code='" + code + "' ORDER BY expand ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ClauseType> datas = new List<ClauseType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ClauseType temp = new ClauseType();
                    temp.id = rdr["code"].ToString();
                    temp.clause = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetGuide(string module, string language)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings["compliance"].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT " + language + " FROM userguide WHERE module='" + module + "'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            string guide = "";
            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {

                    guide = rdr[language].ToString();
                }
                return guide;
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

        private string GetCodes(string sqid, string codetype)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *  FROM codes WHERE codetype='" + codetype + "' ORDER BY expand";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetSalesRep(string sqid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *  FROM codes WHERE codetype='SALES REP' ORDER BY code";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CodeType> datas = new List<CodeType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CodeType temp = new CodeType();
                    temp.code = rdr["code"].ToString();
                    temp.expand = rdr["expand"].ToString();
                    temp.edi02 = rdr["edi02"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetTariffNo(string sqid, string billid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string currentDate = DateTime.Now.ToString("yyyy-MM-dd");
            string sqlQuery = "SELECT *  FROM ratelist WHERE compid='" + billid + "' AND effdate<=CAST('" + currentDate + "' AS DATE) AND expdate>=CAST('" + currentDate + "' AS DATE)";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<RateListType> datas = new List<RateListType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    RateListType temp = new RateListType();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.ratepfx = rdr["ratepfx"].ToString();
                    temp.rateid = rdr["rateid"].ToString();
                    temp.tariffno = temp.ratepfx + temp.rateid.PadLeft(6, '0');
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetTariffNos(string sqid, string billid, string query)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string currentDate = DateTime.Now.ToString("yyyy-MM-dd");
            string sqlQuery = "SELECT *  FROM ratelist WHERE compid='" + billid + "' AND effdate<=CAST('" + currentDate + "' AS DATE) AND expdate>=CAST('" + currentDate + "' AS DATE)";
            sqlQuery += "AND(service" + " like '%" + query + "%'";
            sqlQuery += " OR rateno" + " like '%" + query + "%'";
            sqlQuery += " OR ctnrtype" + " like '%" + query + "%'";
            sqlQuery += " OR porcode" + " like '%" + query + "%'";
            sqlQuery += " OR porzip" + " like '%" + query + "%'";
            sqlQuery += " OR porname" + " like '%" + query + "%'";
            sqlQuery += " OR polcode" + " like '%" + query + "%'";
            sqlQuery += " OR polname" + " like '%" + query + "%'";
            sqlQuery += " OR poulcode" + " like '%" + query + "%'";
            sqlQuery += " OR poulname" + " like '%" + query + "%'";
            sqlQuery += " OR podcode" + " like '%" + query + "%'";
            sqlQuery += " OR podname" + " like '%" + query + "%'";
            sqlQuery += " OR podzip" + " like '%" + query + "%'";
            sqlQuery += " OR itemcode" + " like '%" + query + "%'";
            sqlQuery += " OR itemdesc" + " like '%" + query + "%'";
            sqlQuery += " OR schbcode" + " like '%" + query + "%'";
            sqlQuery += " OR schbdesc" + " like '%" + query + "%')";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<RateListType> datas = new List<RateListType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    RateListType temp = new RateListType();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.ratepfx = rdr["ratepfx"].ToString();
                    temp.rateid = rdr["rateid"].ToString();
                    temp.tariffno = temp.ratepfx + temp.rateid.PadLeft(6, '0');
                    temp.ratestr = temp.tariffno + "("
                        + temp.ratepfx + "-"
                        + temp.rateid + "-"
                        + rdr["service"].ToString() + "-"
                        + rdr["ctnrtype"].ToString() + "-"
                        + rdr["porcode"].ToString() + "-"
                        + rdr["porzip"].ToString() + "-"
                        + rdr["porname"].ToString() + "-"
                        + rdr["polcode"].ToString() + "-"
                        + rdr["polname"].ToString() + "-"
                        + rdr["poulcode"].ToString() + "-"
                        + rdr["poulname"].ToString() + "-"
                        + rdr["podcode"].ToString() + "-"
                        + rdr["podname"].ToString() + "-"
                        + rdr["podzip"].ToString() + "-"
                        + rdr["itemcode"].ToString() + "-"
                        + rdr["itemdesc"].ToString() + "-"
                        + rdr["schbcode"].ToString() + "-"
                        + rdr["schbdesc"].ToString() + "-"
                        + ")";
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCtnrlist(string sqid, string uuid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT ctnrno, ctnrsize FROM package WHERE uuid='" + uuid + "' ORDER BY ctnrsize ASC, ctnrno ASC";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CtnrlistType> datas = new List<CtnrlistType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CtnrlistType temp = new CtnrlistType();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.ctnrsize = rdr["ctnrsize"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetLabels(string sqid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM cdmlabel";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<LabelType> datas = new List<LabelType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    LabelType temp = new LabelType();
                    temp.id = rdr["labelid"].ToString();
                    temp.name = rdr["labelname"].ToString();
                    temp.printer = rdr["defaultprinter"].ToString();
                    temp.height = rdr["labelheight"].ToString();
                    temp.width = rdr["labelwidth"].ToString();
                    temp.uom = rdr["labeluom"].ToString();
                    temp.orientation = rdr["labelorientation"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetLabel(string sqid, string id)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM cdmlabel WHERE labelid='" + id + "'";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<LabelType> datas = new List<LabelType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    LabelType temp = new LabelType();
                    temp.id = rdr["labelid"].ToString();
                    temp.name = rdr["labelname"].ToString();
                    temp.printer = rdr["defaultprinter"].ToString();
                    temp.height = rdr["labelheight"].ToString();
                    temp.width = rdr["labelwidth"].ToString();
                    temp.uom = rdr["labeluom"].ToString();
                    temp.orientation = rdr["labelorientation"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContainers(string sqid, string uuid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT ctnrno FROM container WHERE uuid='" + uuid + "' ORDER BY ctnrno";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ContainerType> datas = new List<ContainerType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ContainerType temp = new ContainerType();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetContainerRows(string sqid, string uuid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *, format(cast(discdate as date), 'MM/dd/yyyy') as fdiscdate, format(cast(onrdate as date), 'MM/dd/yyyy') as fonrdate, format(cast(rampdate1 as date), 'MM/dd/yyyy') as frampdate1, format(cast(rampdate2 as date), 'MM/dd/yyyy') as frampdate2, format(cast(lfdcust as date), 'MM/dd/yyyy') as flfdcust, format(cast(gateoutdate as date), 'MM/dd/yyyy') as fgateoutdate, format(cast(pdlfd as date), 'MM/dd/yyyy') as fpdlfd, format(cast(etadoor1 as date), 'MM/dd/yyyy') as fetadoor1, format(cast(empretdate as date), 'MM/dd/yyyy') as fempretdate, format(cast(apptdate as date), 'MM/dd/yyyy') as fapptdate, format(cast(tapptdate as date), 'MM/dd/yyyy') as ftapptdate, format(cast(etadoor2 as date), 'MM/dd/yyyy') as fetadoor2, format(cast(socsent as date), 'MM/dd/yyyy') as socsent2, format(cast(socgrecv as date), 'MM/dd/yyyy') as socgrecv2  FROM container WHERE uuid='" + uuid + "' ORDER BY ctnrno";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<ContainerType> datas = new List<ContainerType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    ContainerType temp = new ContainerType();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.cusrel = rdr["cusrel"].ToString();
                    temp.exam = rdr["exam"].ToString();
                    temp.pickno = rdr["pickno"].ToString();
                    temp.discdate = rdr["fdiscdate"].ToString();
                    temp.tapptdate = rdr["ftapptdate"].ToString();
                    temp.tappttime = rdr["tappttime"].ToString();
                    temp.onrdate = rdr["fonrdate"].ToString();
                    temp.rampdate1 = rdr["frampdate1"].ToString();
                    temp.rampdate2 = rdr["frampdate2"].ToString();
                    temp.lfdcust = rdr["flfdcust"].ToString();
                    temp.gateoutdate = rdr["fgateoutdate"].ToString();
                    temp.pdlfd = rdr["fpdlfd"].ToString();
                    temp.etadoor1 = rdr["fetadoor1"].ToString();
                    temp.etadoor2 = rdr["fetadoor2"].ToString();
                    temp.apptdate = rdr["fapptdate"].ToString();
                    temp.appttime = rdr["appttime"].ToString();
                    temp.empretdate = rdr["fempretdate"].ToString();
                    temp.socsent = rdr["socsent2"].ToString();
                    temp.socgrecv = rdr["socgrecv2"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private bool UpdateContainer(string sqid, ContainerType container)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("UPDATE container SET cusrel=@1, exam=@2, pickno=@3, discdate=@4, tapptdate=@5, tappttime=@6, onrdate=@7, rampdate1=@8, rampdate2=@9, lfdcust=@10, gateoutdate=@11, pdlfd=@12, etadoor1=@13, apptdate=@14, appttime=@15, etadoor2=@16, empretdate=@17 WHERE uuid='" + container.uuid + "' AND ctnrno='" + container.ctnrno + "'", sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@1", container.cusrel);
                sqlCommand.Parameters.AddWithValue("@2", container.exam);
                sqlCommand.Parameters.AddWithValue("@3", container.pickno);
                sqlCommand.Parameters.AddWithValue("@4", container.discdate);
                sqlCommand.Parameters.AddWithValue("@5", container.tapptdate);
                sqlCommand.Parameters.AddWithValue("@6", container.tappttime);
                sqlCommand.Parameters.AddWithValue("@7", container.onrdate);
                sqlCommand.Parameters.AddWithValue("@8", container.rampdate1);
                sqlCommand.Parameters.AddWithValue("@9", container.rampdate2);
                sqlCommand.Parameters.AddWithValue("@10", container.lfdcust);
                sqlCommand.Parameters.AddWithValue("@11", container.gateoutdate);
                sqlCommand.Parameters.AddWithValue("@12", container.pdlfd);
                sqlCommand.Parameters.AddWithValue("@13", container.etadoor1);
                sqlCommand.Parameters.AddWithValue("@14", container.apptdate);
                sqlCommand.Parameters.AddWithValue("@15", container.appttime);
                sqlCommand.Parameters.AddWithValue("@16", container.etadoor2);
                sqlCommand.Parameters.AddWithValue("@17", container.empretdate);
                int nRow = sqlCommand.ExecuteNonQuery();
                return nRow > 0 ? true : false;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private bool UpdateContainerEx(string sqid, ContainerTypeEx container)
        {
            bool r = false;

            try
            {
                using (var sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
                {
                    sqlConnection.Open();

                    using (var sqlCommand = new SqlCommand("UPDATE container SET " +
                        "cusrel=@1, exam=@2, pickno=@3, discdate=@4, tapptdate=@5, tappttime=@6, onrdate=@7, rampdate1=@8, rampdate2=@9, lfdcust=@10, gateoutdate=@11, pdlfd=@12, etadoor1=@13, apptdate=@14, appttime=@15, etadoor2=@16, empretdate=@17, socsent=@18, socgrecv=@19 " +
                        "WHERE uuid='" + container.uuid + "' AND ctnrno='" + container.ctnrno + "'", sqlConnection))
                    {
                        sqlCommand.Parameters.AddRange(new SqlParameter[] {
                            new SqlParameter( "@1", container.cusrel )
                            , new SqlParameter( "@2", container.exam )
                            , new SqlParameter( "@3", container.pickno )
                            , new SqlParameter( "@4", container.discdate )
                            , new SqlParameter( "@5", container.tapptdate )
                            , new SqlParameter( "@6", container.tappttime )
                            , new SqlParameter( "@7", container.onrdate )
                            , new SqlParameter( "@8", container.rampdate1 )
                            , new SqlParameter( "@9", container.rampdate2 )
                            , new SqlParameter( "@10", container.lfdcust )
                            , new SqlParameter( "@11", container.gateoutdate )
                            , new SqlParameter( "@12", container.pdlfd )
                            , new SqlParameter( "@13", container.etadoor1 )
                            , new SqlParameter( "@14", container.apptdate )
                            , new SqlParameter( "@15", container.appttime )
                            , new SqlParameter( "@16", container.etadoor2 )
                            , new SqlParameter( "@17", container.empretdate )
                            , new SqlParameter( "@18", container.socsent )
                            , new SqlParameter( "@19", container.socgrecv )
                        });

                        r = sqlCommand.ExecuteNonQuery() > 0;
                    }

                    if (r)
                    {
                        UpdateShipmentAlert(sqlConnection, 3, container);
                        UpdateShipmentAlert(sqlConnection, 4, container);
                        UpdateShipmentAlert(sqlConnection, 6, container);
                        UpdateShipmentAlert(sqlConnection, 7, container);
                        UpdateShipmentAlert(sqlConnection, 8, container);
                        UpdateShipmentAlert(sqlConnection, 9, container);
                        UpdateShipmentAlert(sqlConnection, 10, container);
                        UpdateShipmentAlert(sqlConnection, 11, container);
                        UpdateShipmentAlert(sqlConnection, 12, container);
                        UpdateShipmentAlert(sqlConnection, 13, container);
                    }
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }

            return r;
        }

        private string UpdateBulkContainers(string sqid, HttpContext context)
        {
            string[] fields = new string[] { "cusrel", "exam", "discdate", "onrdate", "rampdate1", "rampdate2", "lfdcust", "gateoutdate", "pdlfd", "etadoor1", "apptdate", "etadoor2", "empretdate", "appttime" };
            List<string> updateFields = new List<string>();
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlString = "";

            for (int i = 0; i < fields.Length; i++)
            {
                if (!string.IsNullOrEmpty(context.Request.Form[fields[i]]))
                {
                    updateFields.Add(fields[i]);
                }
            }

            for (int i = 0; i < updateFields.Count; i++)
            {
                sqlString += updateFields[i] + "=@" + i + ",";
            }

            SqlCommand sqlCommand = new SqlCommand("Update container SET " + sqlString.Remove(sqlString.Length - 1) + "  WHERE uuid='" + context.Request.Form["uuid"].ToString() + "'", sqlConnection);

            try
            {
                for (int i = 0; i < updateFields.Count; i++)
                {
                    sqlCommand.Parameters.AddWithValue("@" + i, context.Request.Form[updateFields[i]].ToString());
                }
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        error = false
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        error = true
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private string UpdateBulkContainersEx(string sqid, HttpContext context)
        {
            string[] fields = new string[] { "cusrel", "exam", "discdate", "onrdate", "rampdate1", "rampdate2", "lfdcust", "gateoutdate", "pdlfd", "etadoor1", "apptdate", "etadoor2", "empretdate", "appttime" };
            List<string> updateFields = new List<string>();
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlString = "";

            for (int i = 0; i < fields.Length; i++)
            {
                if (!string.IsNullOrEmpty(context.Request.Form[fields[i]]))
                {
                    updateFields.Add(fields[i]);
                }
            }

            var container = new ContainerTypeEx();
            container.uuid = context.Request.Form[nameof(container.uuid)];
            container.ctype = context.Request.Form[nameof(container.ctype)];
            container.cusrel = int.Parse(context.Request.Form[nameof(container.cusrel)] ?? "0");
            container.exam = int.Parse(context.Request.Form[nameof(container.exam)] ?? "0");
            container.discdate = context.Request.Form[nameof(container.discdate)];
            container.onrdate = context.Request.Form[nameof(container.onrdate)];
            container.rampdate1 = context.Request.Form[nameof(container.rampdate1)];
            container.rampdate2 = context.Request.Form[nameof(container.rampdate2)];
            container.lfdcust = context.Request.Form[nameof(container.lfdcust)];
            container.gateoutdate = context.Request.Form[nameof(container.gateoutdate)];
            container.pdlfd = context.Request.Form[nameof(container.pdlfd)];
            container.etadoor1 = context.Request.Form[nameof(container.etadoor1)];
            container.apptdate = context.Request.Form[nameof(container.apptdate)];
            container.etadoor2 = context.Request.Form[nameof(container.etadoor2)];
            container.empretdate = context.Request.Form[nameof(container.empretdate)];
            container.appttime = context.Request.Form[nameof(container.appttime)];

            for (int i = 0; i < updateFields.Count; i++)
            {
                sqlString += updateFields[i] + "=@" + i + ",";
            }

            SqlCommand sqlCommand = new SqlCommand("Update container SET " + sqlString.Remove(sqlString.Length - 1) + "  WHERE uuid='" + context.Request.Form["uuid"].ToString() + "'", sqlConnection);

            try
            {
                for (int i = 0; i < updateFields.Count; i++)
                {
                    sqlCommand.Parameters.AddWithValue("@" + i, context.Request.Form[updateFields[i]].ToString());
                }

                int nRow = sqlCommand.ExecuteNonQuery();

                if (nRow > 0)
                {
                    UpdateShipmentAlert(sqlConnection, 4, container);
                    UpdateShipmentAlert(sqlConnection, 6, container);
                    UpdateShipmentAlert(sqlConnection, 7, container);
                    UpdateShipmentAlert(sqlConnection, 8, container);
                    UpdateShipmentAlert(sqlConnection, 10, container);
                    UpdateShipmentAlert(sqlConnection, 11, container);
                    UpdateShipmentAlert(sqlConnection, 12, container);
                    UpdateShipmentAlert(sqlConnection, 13, container);
                }

                return new JavaScriptSerializer().Serialize(new
                {
                    error = !(nRow > 0)
                });
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string GetCurrencies(string sqid, string basecurr)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string currentDate = DateTime.Now.ToString("yyyy-MM-dd");
            string sqlQuery = "SELECT code, exrate FROM currency WHERE basecurrency='" + basecurr + "' AND ((effdate<=CAST('" + currentDate + "' AS DATE) AND expdate < '2020-01-01') OR ( effdate<=CAST('" + currentDate + "' AS DATE) AND expdate>=CAST('" + currentDate + "' AS DATE)))";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CurrencyType> datas = new List<CurrencyType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    CurrencyType temp = new CurrencyType();
                    temp.code = rdr["code"].ToString();
                    temp.exrate = rdr["exrate"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetCurrenciesEx(string sqid, string basecurr, string currentDate)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT basecurrency, exrate FROM currency WHERE code ='" + basecurr + "' AND ((effdate<='" + currentDate + "' AND expdate < '2020-01-01') "
                + "OR ( effdate<='" + currentDate + "' AND expdate>='" + currentDate + "'))";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<CurrencyType> datas = new List<CurrencyType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();

                while (rdr.Read())
                {
                    CurrencyType temp = new CurrencyType();
                    temp.code = rdr["basecurrency"].ToString();
                    temp.exrate = rdr["exrate"].ToString();
                    datas.Add(temp);
                }

                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetDoHelps(string sqid, string prinid, string sloc, string sdelv, string struck)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM doprofile WHERE prinid='" + prinid + "' ";
            string orderBy = "locname, delvadd1, delvcity";
            if (!string.IsNullOrEmpty(sloc))
            {
                sqlQuery += " AND locname LIKE '%" + sloc + "%' ";
            }
            if (!string.IsNullOrEmpty(sdelv))
            {
                sqlQuery += " AND (delvadd1 LIKE '%" + sdelv + "%' OR delvcity LIKE '%" + sdelv + "%')";
            }
            if (!string.IsNullOrEmpty(struck))
            {
                sqlQuery += " AND precarrname LIKE '%" + struck + "%' ";
            }
            if (!string.IsNullOrEmpty(sloc) && string.IsNullOrEmpty(sdelv) && string.IsNullOrEmpty(struck))
            {
                orderBy = "locname";
            }
            if (string.IsNullOrEmpty(sloc) && !string.IsNullOrEmpty(sdelv) && string.IsNullOrEmpty(struck))
            {
                orderBy = "delvadd1";
            }
            if (string.IsNullOrEmpty(sloc) && string.IsNullOrEmpty(sdelv) && !string.IsNullOrEmpty(struck))
            {
                orderBy = "precarrname";
            }
            sqlQuery += " ORDER BY " + orderBy;
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<DoHelpType> datas = new List<DoHelpType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    DoHelpType temp = new DoHelpType();
                    temp.doid = rdr["doid"].ToString();
                    temp.locname = rdr["locname"].ToString();
                    temp.delvadd1 = rdr["delvadd1"].ToString();
                    temp.delvcity = rdr["delvcity"].ToString();
                    temp.delvst = rdr["delvst"].ToString();
                    temp.precarrname = rdr["precarrname"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetDoHelpDetails(string sqid, string doid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT * FROM doprofile WHERE doid='" + doid + "'";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            DoHelpType temp = new DoHelpType();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    temp.doid = rdr["doid"].ToString();
                    temp.dolocid = rdr["locid"].ToString();
                    temp.dolocname = rdr["locname"].ToString();
                    temp.delvid = rdr["delvid"].ToString();
                    temp.delvname = rdr["delvname"].ToString();
                    temp.delvadd1 = rdr["delvadd1"].ToString();
                    temp.delvadd2 = rdr["delvadd2"].ToString();
                    temp.delvadd3 = rdr["delvadd3"].ToString();
                    temp.delvcity = rdr["delvcity"].ToString();
                    temp.delvzip = rdr["delvzip"].ToString();
                    temp.delviso = rdr["delviso"].ToString();
                    temp.delvcont = rdr["delvcont"].ToString();
                    temp.delvph = rdr["delvph"].ToString();
                    temp.delvemail = rdr["delvemail"].ToString();
                    temp.precarrid = rdr["precarrid"].ToString();
                    temp.precarrname = rdr["precarrname"].ToString();
                    temp.precarrcont = rdr["precarrcont"].ToString();
                    temp.precarrph = rdr["precarrph"].ToString();
                    temp.precarrph2 = rdr["precarrph2"].ToString();
                    temp.precarremail = rdr["precarremail"].ToString();
                    temp.docomment = rdr["docomment"].ToString();
                }
                return (new JavaScriptSerializer().Serialize(temp));
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

        private Boolean DeleteDoHelp(string sqid, string doid)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("DELETE FROM doprofile WHERE doid='" + doid + "'", sqlConnection);
            try
            {
                sqlCommand.ExecuteNonQuery();
                return true;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private Boolean DeleteDeliveryOrder(string sqid, string rid, string doid, string userid, string dono)
        {
            DateTime currentDate = DateTime.Now;
            string formattedDate = currentDate.ToString("yyyy-MM-dd");
            string formattedTime = currentDate.ToString("HH:mm:ss");
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("UPDATE shipment2 SET voided=1,voiduser='" + userid + "',voiddate='" + formattedDate + "',voidtime='" + formattedTime + "' WHERE uuid = '" + rid + "' AND doid='" + doid + "' AND dono='" + dono + "'", sqlConnection);
            try
            {
                sqlCommand.ExecuteNonQuery();
                return true;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private string GetRevenueDetails(string sqid, string uuid, string chargemode)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *, format(invdate, 'MM/dd/yyyy') as finvdate, format(duedate, 'MM/dd/yyyy') as fduedate, format(pydate, 'MM/dd/yyyy') as fpydate, format(lastdate, 'MM/dd/yyyy @ hh:mm') as flastdate, format(adddate, 'MM/dd/yyyy @ hh:mm') as fadddate FROM revenue WHERE uuid='" + uuid + "' AND dettype='AR'";
            if (chargemode == "A")
            {
                sqlQuery += " AND (txtype='L' OR txtype='F')";
            }
            else
            {
                sqlQuery += " AND txtype='" + chargemode + "'";
            }
            sqlQuery += " ORDER BY detid";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<RevenueType> datas = new List<RevenueType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    RevenueType temp = new RevenueType();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.txtype = rdr["txtype"].ToString();
                    temp.rtype = rdr["rtype"].ToString();
                    temp.ppd = rdr["amtpp"].ToString();
                    temp.billid = rdr["custid"].ToString();
                    temp.billname = rdr["custname"].ToString();
                    temp.arglcode = rdr["glacct"].ToString();
                    temp.arcode = rdr["arcode"].ToString();
                    temp.ardesc = rdr["ardesc"].ToString();
                    temp.arnote = rdr["adddesc"].ToString();
                    temp.uom = rdr["uom"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.qty = rdr["qty"].ToString();
                    temp.curr = rdr["currency"].ToString();
                    temp.rate = rdr["rate"].ToString();
                    temp.exrate = rdr["exrate"].ToString();
                    temp.amt = rdr["amt"].ToString();
                    temp.genmethod = rdr["genmethod"].ToString();
                    temp.invno = rdr["invno"].ToString();
                    temp.arrls = rdr["release"].ToString();
                    temp.invdate = rdr["finvdate"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.duedate = rdr["fduedate"].ToString();
                    temp.amtrecv = rdr["amtpaid"].ToString();
                    temp.pydate = rdr["fpydate"].ToString();
                    temp.custref = rdr["custref"].ToString();
                    temp.custnote = rdr["note1"].ToString();
                    temp.lastuser = rdr["lastuser"].ToString();
                    temp.lastdate = rdr["flastdate"].ToString();
                    temp.adduser = rdr["adduser"].ToString();
                    temp.adddate = rdr["fadddate"].ToString();
                    temp.jeno = rdr["rtype"].ToString() + rdr["detid"].ToString();
                    temp.arpost = rdr["arpost"].ToString();
                    temp.detid = rdr["detid"].ToString();
                    temp.provisional = rdr["provisional"].ToString();
                    temp.taxinvno = rdr["taxinvno"].ToString();
                    temp.taxinvdate = rdr["taxinvdate"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetRevenueDetailsEx(string sqid, string uuid, string chargemode)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *"
                + ", format(invdate, 'MM/dd/yyyy') as finvdate"
                + ", format(duedate, 'MM/dd/yyyy') as fduedate"
                + ", format(pydate, 'MM/dd/yyyy') as fpydate"
                + ", format(lastdate, 'MM/dd/yyyy @ hh:mm') as flastdate"
                + ", format(adddate, 'MM/dd/yyyy @ hh:mm') as fadddate"
                + " FROM revenue WHERE uuid='" + uuid + "' AND dettype='AR'";

            if (chargemode == "A")
            {
                sqlQuery += " AND (txtype='L' OR txtype='F')";
            }
            else
            {
                sqlQuery += " AND txtype='" + chargemode + "'";
            }

            sqlQuery += " ORDER BY uuid, invno, detid";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            var datas = new List<Revenue>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    Revenue temp = new Revenue();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.txtype = rdr["txtype"].ToString();
                    temp.rtype = rdr["rtype"].ToString();
                    temp.amtpp = rdr["amtpp"].ToString();
                    temp.custid = rdr["custid"].ToString();
                    temp.custname = rdr["custname"].ToString();
                    temp.glacct = rdr["glacct"].ToString();
                    temp.arcode = rdr["arcode"].ToString();
                    temp.ardesc = rdr["ardesc"].ToString();
                    temp.adddesc = rdr["adddesc"].ToString();
                    temp.uom = rdr["uom"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.qty = (decimal)rdr["qty"];
                    temp.currency = rdr["currency"].ToString();
                    temp.rate = (decimal)rdr["rate"];
                    temp.exrate = (decimal?)rdr["exrate"];
                    temp.amt = (decimal)rdr["amt"];
                    temp.genmethod = rdr["genmethod"].ToString();
                    temp.invno = rdr["invno"].ToString();
                    temp.release = (int)rdr["release"];
                    temp.invdate = rdr["finvdate"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.duedate = rdr["fduedate"].ToString();
                    temp.amtpaid = (decimal)rdr["amtpaid"];
                    temp.pydate = rdr["fpydate"].ToString();
                    temp.custref = rdr["custref"].ToString();
                    temp.note1 = rdr["note1"].ToString();
                    temp.lastuser = rdr["lastuser"].ToString();
                    temp.lastdate = rdr["flastdate"].ToString();
                    temp.adduser = rdr["adduser"].ToString();
                    temp.adddate = rdr["fadddate"].ToString();
                    //temp.jeno = rdr["rtype"].ToString() + rdr["detid"].ToString();
                    temp.arpost = (int)rdr["arpost"];
                    temp.detid = (int)rdr["detid"];
                    temp.provisional = (int)rdr["provisional"];
                    temp.taxinvno = rdr["taxinvno"].ToString();
                    temp.taxinvdate = rdr["taxinvdate"].ToString();
                    temp.arrel = (int)rdr["arrel"];
                    temp.ourref = rdr["ourref"].ToString();
                    temp.stationid = rdr["stationid"].ToString();
                    temp.mbl = rdr["mbl"].ToString();
                    temp.hbl = rdr["hbl"].ToString();
                    temp.manifest = rdr["manifest"].ToString();
                    temp.basecurrency = rdr["basecurrency"].ToString();
                    temp.isOffset = (int)rdr["offset"] != 0;
                    temp.basicamt = (decimal)rdr["basicamt"];

                    datas.Add(temp);
                }

                return (new JavaScriptSerializer().Serialize(datas));
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


        private string GetCostDetails(string sqid, string uuid, string chargemode)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *, format(venddate, 'MM/dd/yyyy') as fvenddate, format(duedate, 'MM/dd/yyyy') as fduedate, format(pydate, 'MM/dd/yyyy') as fpydate, format(lastdate, 'MM/dd/yyyy @ hh:mm') as flastdate, format(adddate, 'MM/dd/yyyy @ hh:mm') as fadddate, format(verifytime, 'MM/dd/yyyy @ hh:mm') as fverifytime FROM revenue WHERE uuid='" + uuid + "' AND dettype='AP'";
            if (chargemode == "A")
            {
                sqlQuery += " AND (txtype='L' OR txtype='F')";
            }
            else
            {
                sqlQuery += " AND txtype='" + chargemode + "'";
            }
            sqlQuery += " ORDER BY detid";
            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            List<RevenueType> datas = new List<RevenueType>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    RevenueType temp = new RevenueType();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.txtype = rdr["txtype"].ToString();
                    temp.rtype = rdr["rtype"].ToString();
                    temp.ppd = rdr["costpp"].ToString();
                    temp.vendid = rdr["vendid"].ToString();
                    temp.vendname = rdr["vendname"].ToString();
                    temp.apglcode = rdr["glacct"].ToString();
                    temp.apcode = rdr["arcode"].ToString();
                    temp.apdesc = rdr["ardesc"].ToString();
                    temp.apnote = rdr["adddesc"].ToString();
                    temp.note2 = rdr["note2"].ToString();
                    temp.uom = rdr["uomc"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.qty = rdr["qtyc"].ToString();
                    temp.curr = rdr["currencyc"].ToString();
                    temp.rate = rdr["ratec"].ToString();
                    temp.exrate = rdr["exratec"].ToString();
                    temp.amt = rdr["cost"].ToString();
                    temp.vref = rdr["vendref"].ToString();
                    temp.aprls = rdr["release"].ToString();
                    temp.venddate = rdr["fvenddate"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.duedate = rdr["fduedate"].ToString();
                    temp.amtpaid = rdr["amtpaid"].ToString();
                    temp.pydate = rdr["fpydate"].ToString();
                    temp.ourref = rdr["ourref"].ToString();
                    temp.lastuser = rdr["lastuser"].ToString();
                    temp.lastdate = rdr["flastdate"].ToString();
                    temp.adduser = rdr["adduser"].ToString();
                    temp.adddate = rdr["fadddate"].ToString();
                    temp.verifyby = rdr["verifyby"].ToString();
                    temp.verifytime = rdr["fverifytime"].ToString();
                    temp.jeno = rdr["rtype"].ToString() + rdr["detid"].ToString();
                    temp.appost = rdr["appost"].ToString();
                    temp.detid = rdr["detid"].ToString();
                    temp.provisional = rdr["provisional"].ToString();
                    temp.voucherno = rdr["voucherno"].ToString();
                    datas.Add(temp);
                }
                return (new JavaScriptSerializer().Serialize(datas));
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

        private string GetCostDetailsEx(string sqid, string uuid, string chargemode)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string sqlQuery = "SELECT *"
                + ", format(venddate, 'MM/dd/yyyy') as fvenddate"
                + ", format(duedate, 'MM/dd/yyyy') as fduedate"
                + ", format(pydate, 'MM/dd/yyyy') as fpydate"
                + ", format(lastdate, 'MM/dd/yyyy @ hh:mm') as flastdate"
                + ", format(adddate, 'MM/dd/yyyy @ hh:mm') as fadddate"
                + ", format(verifytime, 'MM/dd/yyyy @ hh:mm') as fverifytime"
                + " FROM revenue WHERE uuid='" + uuid + "' AND dettype='AP'";

            if (chargemode == "A")
            {
                sqlQuery += " AND (txtype='L' OR txtype='F')";
            }
            else
            {
                sqlQuery += " AND txtype='" + chargemode + "'";
            }

            sqlQuery += " ORDER BY uuid, voucherno, detid";

            SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection);
            var datas = new List<Revenue>();

            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();

                while (rdr.Read())
                {
                    Revenue temp = new Revenue();
                    temp.uuid = rdr["uuid"].ToString();
                    temp.txtype = rdr["txtype"].ToString();
                    temp.rtype = rdr["rtype"].ToString();
                    temp.costpp = rdr["costpp"].ToString();
                    temp.vendid = rdr["vendid"].ToString();
                    temp.vendname = rdr["vendname"].ToString();
                    temp.glacct = rdr["glacct"].ToString();
                    temp.arcode = rdr["arcode"].ToString();
                    temp.ardesc = rdr["ardesc"].ToString();
                    temp.adddesc = rdr["adddesc"].ToString();
                    temp.note2 = rdr["note2"].ToString();
                    temp.uomc = rdr["uomc"].ToString();
                    temp.ctnrno = rdr["ctnrno"].ToString();
                    temp.qtyc = (decimal)rdr["qtyc"];
                    temp.currencyc = rdr["currencyc"].ToString();
                    temp.ratec = (decimal)rdr["ratec"];
                    temp.exratec = (decimal?)rdr["exratec"];
                    temp.cost = (decimal)rdr["cost"];
                    temp.vendref = rdr["vendref"].ToString();
                    temp.release = (int)rdr["release"];
                    temp.venddate = rdr["fvenddate"].ToString();
                    temp.terms = rdr["terms"].ToString();
                    temp.duedate = rdr["fduedate"].ToString();
                    temp.amtpaid = (decimal)rdr["amtpaid"];
                    temp.pydate = rdr["fpydate"].ToString();
                    temp.ourref = rdr["ourref"].ToString();
                    temp.lastuser = rdr["lastuser"].ToString();
                    temp.lastdate = rdr["flastdate"].ToString();
                    temp.adduser = rdr["adduser"].ToString();
                    temp.adddate = rdr["fadddate"].ToString();
                    temp.verifyby = rdr["verifyby"].ToString();
                    temp.verifytime = rdr["fverifytime"].ToString();
                    //temp.jeno = rdr["rtype"].ToString() + rdr["detid"].ToString();
                    temp.appost = (int)rdr["appost"];
                    temp.detid = (int)rdr["detid"];
                    temp.provisional = (int)rdr["provisional"];
                    temp.voucherno = rdr["voucherno"].ToString();
                    temp.stationid = rdr["stationid"].ToString();
                    temp.mbl = rdr["mbl"].ToString();
                    temp.hbl = rdr["hbl"].ToString();
                    temp.manifest = rdr["manifest"].ToString();
                    temp.perc = (int)rdr["perc"];
                    temp.dettype = rdr["dettype"].ToString();
                    temp.basecurrency = rdr["basecurrency"].ToString();
                    temp.isOffset = (int)rdr["offset"] != 0;
                    temp.aprel = (int)rdr["aprel"];

                    datas.Add(temp);
                }

                return (new JavaScriptSerializer().Serialize(datas));
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

        private string AddNewRevenue(string sqid, HttpContext context)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO revenue (uuid,dettype,txtype,rtype,shipmentno, amtpp,custid,custname,glacct,arcode,ardesc,adddesc,uom,ctnrno,qty, currency,rate,exrate,amt,genmethod,release,reluser,terms,custref,note1,adduser) " +
                                                    "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25)", sqlConnection);

            try
            {
                string[] currExrate = context.Request.Form["revenue_edit_curr"].ToString().Split('_');
                sqlCommand.Parameters.AddWithValue("@0", context.Request.Form["uuid"].ToString());
                sqlCommand.Parameters.AddWithValue("@1", "AR");
                sqlCommand.Parameters.AddWithValue("@2", context.Request.Form["txtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@3", context.Request.Form["revenue_edit_rtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@4", context.Request.Form["shipmentno"].ToString());
                sqlCommand.Parameters.AddWithValue("@5", context.Request.Form["revenue_edit_ppd"].ToString());
                sqlCommand.Parameters.AddWithValue("@6", context.Request.Form["revenue_edit_billid"].ToString());
                sqlCommand.Parameters.AddWithValue("@7", context.Request.Form["revenue_edit_billname"].ToString());
                sqlCommand.Parameters.AddWithValue("@8", context.Request.Form["revenue_edit_arglcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@9", context.Request.Form["revenue_edit_arcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@10", context.Request.Form["revenue_edit_ardesc"].ToString());
                sqlCommand.Parameters.AddWithValue("@11", context.Request.Form["revenue_edit_arnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@12", context.Request.Form["revenue_edit_uom"].ToString());
                sqlCommand.Parameters.AddWithValue("@13", context.Request.Form["revenue_edit_ctnrno"].ToString());
                sqlCommand.Parameters.AddWithValue("@14", context.Request.Form["revenue_edit_qty"].ToString());
                sqlCommand.Parameters.AddWithValue("@15", currExrate[0]);
                sqlCommand.Parameters.AddWithValue("@16", context.Request.Form["revenue_edit_rate"].ToString());
                sqlCommand.Parameters.AddWithValue("@17", currExrate[1]);
                sqlCommand.Parameters.AddWithValue("@18", context.Request.Form["revenue_edit_amt"].ToString());
                sqlCommand.Parameters.AddWithValue("@19", ""); //genmethod
                sqlCommand.Parameters.AddWithValue("@20", context.Request.Form["release"].ToString());
                sqlCommand.Parameters.AddWithValue("@21", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@22", context.Request.Form["revenue_edit_terms"].ToString());
                sqlCommand.Parameters.AddWithValue("@23", context.Request.Form["revenue_edit_custref"].ToString());
                sqlCommand.Parameters.AddWithValue("@24", context.Request.Form["revenue_edit_custnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@25", context.Request.Form["userid"].ToString());
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = true
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = false
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private string UpdateRevenue(string sqid, HttpContext context)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("Update revenue SET rtype=@3, amtpp=@5,custid=@6,custname=@7,glacct=@8,arcode=@9,ardesc=@10,adddesc=@11,uom=@12,ctnrno=@13,qty=@14, currency=@15,rate=@16,exrate=@17,amt=@18,genmethod=@19,release=@20,reluser=@21,terms=@22,custref=@23,note1=@24,adduser=@25,jeno=@26 WHERE uuid='" + context.Request.Form["uuid"].ToString() + "' AND detid='" + context.Request.Form["revenue_edit_detid"].ToString() + "'", sqlConnection);

            try
            {
                string[] currExrate = context.Request.Form["revenue_edit_curr"].ToString().Split('_');
                sqlCommand.Parameters.AddWithValue("@3", context.Request.Form["revenue_edit_rtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@4", context.Request.Form["shipmentno"].ToString());
                sqlCommand.Parameters.AddWithValue("@5", context.Request.Form["revenue_edit_ppd"].ToString());
                sqlCommand.Parameters.AddWithValue("@6", context.Request.Form["revenue_edit_billid"].ToString());
                sqlCommand.Parameters.AddWithValue("@7", context.Request.Form["revenue_edit_billname"].ToString());
                sqlCommand.Parameters.AddWithValue("@8", context.Request.Form["revenue_edit_arglcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@9", context.Request.Form["revenue_edit_arcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@10", context.Request.Form["revenue_edit_ardesc"].ToString());
                sqlCommand.Parameters.AddWithValue("@11", context.Request.Form["revenue_edit_arnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@12", context.Request.Form["revenue_edit_uom"].ToString());
                sqlCommand.Parameters.AddWithValue("@13", context.Request.Form["revenue_edit_ctnrno"].ToString());
                sqlCommand.Parameters.AddWithValue("@14", context.Request.Form["revenue_edit_qty"].ToString());
                sqlCommand.Parameters.AddWithValue("@15", currExrate[0]);
                sqlCommand.Parameters.AddWithValue("@16", context.Request.Form["revenue_edit_rate"].ToString());
                sqlCommand.Parameters.AddWithValue("@17", currExrate[1]);
                sqlCommand.Parameters.AddWithValue("@18", context.Request.Form["revenue_edit_amt"].ToString());
                sqlCommand.Parameters.AddWithValue("@19", ""); //genmethod
                sqlCommand.Parameters.AddWithValue("@20", context.Request.Form["release"].ToString());
                sqlCommand.Parameters.AddWithValue("@21", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@22", context.Request.Form["revenue_edit_terms"].ToString());
                sqlCommand.Parameters.AddWithValue("@23", context.Request.Form["revenue_edit_custref"].ToString());
                sqlCommand.Parameters.AddWithValue("@24", context.Request.Form["revenue_edit_custnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@25", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@26", context.Request.Form["revenue_edit_rtype"].ToString() + context.Request.Form["revenue_edit_detid"].ToString());
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = true
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = false
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private string AddNewCost(string sqid, HttpContext context)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO revenue (uuid,dettype,txtype,rtype,shipmentno,costpp,vendid,vendname,glacct,arcode,ardesc,adddesc,uomc,ctnrno,qtyc,currencyc,ratec,exratec,cost,vendref,release,reluser,terms,ourref,adduser) " +
                                                    "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24)", sqlConnection);

            try
            {
                string[] currExrate = context.Request.Form["cost_edit_curr"].ToString().Split('_');
                sqlCommand.Parameters.AddWithValue("@0", context.Request.Form["uuid"].ToString());
                sqlCommand.Parameters.AddWithValue("@1", "AP");
                sqlCommand.Parameters.AddWithValue("@2", context.Request.Form["txtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@3", context.Request.Form["cost_edit_rtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@4", context.Request.Form["shipmentno"].ToString());
                sqlCommand.Parameters.AddWithValue("@5", context.Request.Form["cost_edit_ppd"].ToString());
                sqlCommand.Parameters.AddWithValue("@6", context.Request.Form["cost_edit_vendid"].ToString());
                sqlCommand.Parameters.AddWithValue("@7", context.Request.Form["cost_edit_vendname"].ToString());
                sqlCommand.Parameters.AddWithValue("@8", context.Request.Form["cost_edit_apglcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@9", context.Request.Form["cost_edit_apcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@10", context.Request.Form["cost_edit_apdesc"].ToString());
                sqlCommand.Parameters.AddWithValue("@11", context.Request.Form["cost_edit_apnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@12", context.Request.Form["cost_edit_uom"].ToString());
                sqlCommand.Parameters.AddWithValue("@13", context.Request.Form["cost_edit_ctnrno"].ToString());
                sqlCommand.Parameters.AddWithValue("@14", context.Request.Form["cost_edit_qty"].ToString());
                sqlCommand.Parameters.AddWithValue("@15", currExrate[0]);
                sqlCommand.Parameters.AddWithValue("@16", context.Request.Form["cost_edit_rate"].ToString());
                sqlCommand.Parameters.AddWithValue("@17", currExrate[1]);
                sqlCommand.Parameters.AddWithValue("@18", context.Request.Form["cost_edit_amt"].ToString());
                sqlCommand.Parameters.AddWithValue("@19", context.Request.Form["cost_edit_vref"].ToString());
                sqlCommand.Parameters.AddWithValue("@20", context.Request.Form["release"].ToString());
                sqlCommand.Parameters.AddWithValue("@21", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@22", context.Request.Form["cost_edit_terms"].ToString());
                sqlCommand.Parameters.AddWithValue("@23", context.Request.Form["cost_edit_ourref"].ToString());
                sqlCommand.Parameters.AddWithValue("@24", context.Request.Form["userid"].ToString());
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = true
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = false
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private string UpdateCost(string sqid, HttpContext context)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("Update revenue SET rtype=@3, amtpp=@5,vendid=@6,vendname=@7,glacct=@8,arcode=@9,ardesc=@10,adddesc=@11,uomc=@12,ctnrno=@13,qtyc=@14, currencyc=@15,ratec=@16,exratec=@17,cost=@18,vendref=@19,release=@20,reluser=@21,terms=@22,ourref=@23,adduser=@24,jeno=@25 WHERE uuid='" + context.Request.Form["uuid"].ToString() + "' AND detid='" + context.Request.Form["cost_edit_detid"].ToString() + "'", sqlConnection);

            try
            {
                string[] currExrate = context.Request.Form["cost_edit_curr"].ToString().Split('_');
                sqlCommand.Parameters.AddWithValue("@2", context.Request.Form["txtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@3", context.Request.Form["cost_edit_rtype"].ToString());
                sqlCommand.Parameters.AddWithValue("@5", context.Request.Form["cost_edit_ppd"].ToString());
                sqlCommand.Parameters.AddWithValue("@6", context.Request.Form["cost_edit_vendid"].ToString());
                sqlCommand.Parameters.AddWithValue("@7", context.Request.Form["cost_edit_vendname"].ToString());
                sqlCommand.Parameters.AddWithValue("@8", context.Request.Form["cost_edit_apglcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@9", context.Request.Form["cost_edit_apcode"].ToString());
                sqlCommand.Parameters.AddWithValue("@10", context.Request.Form["cost_edit_apdesc"].ToString());
                sqlCommand.Parameters.AddWithValue("@11", context.Request.Form["cost_edit_apnote"].ToString());
                sqlCommand.Parameters.AddWithValue("@12", context.Request.Form["cost_edit_uom"].ToString());
                sqlCommand.Parameters.AddWithValue("@13", context.Request.Form["cost_edit_ctnrno"].ToString());
                sqlCommand.Parameters.AddWithValue("@14", context.Request.Form["cost_edit_qty"].ToString());
                sqlCommand.Parameters.AddWithValue("@15", currExrate[0]);
                sqlCommand.Parameters.AddWithValue("@16", context.Request.Form["cost_edit_rate"].ToString());
                sqlCommand.Parameters.AddWithValue("@17", currExrate[1]);
                sqlCommand.Parameters.AddWithValue("@18", context.Request.Form["cost_edit_amt"].ToString());
                sqlCommand.Parameters.AddWithValue("@19", context.Request.Form["cost_edit_vref"].ToString());
                sqlCommand.Parameters.AddWithValue("@20", context.Request.Form["release"].ToString());
                sqlCommand.Parameters.AddWithValue("@21", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@22", context.Request.Form["cost_edit_terms"].ToString());
                sqlCommand.Parameters.AddWithValue("@23", context.Request.Form["cost_edit_ourref"].ToString());
                sqlCommand.Parameters.AddWithValue("@24", context.Request.Form["userid"].ToString());
                sqlCommand.Parameters.AddWithValue("@25", context.Request.Form["cost_edit_rtype"].ToString() + context.Request.Form["cost_edit_detid"].ToString());
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = true
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = false
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private bool DeleteRevenue(string sqid, string uuid, string detids, string arcodes)
        {
            // Normalize and split detids by comma
            string ids = string.Join("','", detids.Split('_'));

            using (SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                sqlConnection.Open();
                SqlTransaction transaction = sqlConnection.BeginTransaction();

                try
                {
                    // DELETE statement
                    SqlCommand deleteCommand = new SqlCommand(
                        $"DELETE FROM revenue WHERE uuid = @uuid AND detid IN ('{ids}')", sqlConnection, transaction);
                    deleteCommand.Parameters.AddWithValue("@uuid", uuid);
                    deleteCommand.ExecuteNonQuery();

                    // Conditional UPDATE if arcodes contains "CUASI" or "DSCSI"
                    if ((arcodes ?? "").Split(',').Contains("CUASI"))
                    {
                        SqlCommand updateCommand = new SqlCommand(
                            "UPDATE shipmentcr SET entrydelete = 1 WHERE uuid = @uuid", sqlConnection, transaction);
                        updateCommand.Parameters.AddWithValue("@uuid", uuid);
                        updateCommand.ExecuteNonQuery();
                    }
                    if ((arcodes ?? "").Split(',').Contains("DSCSI"))
                    {
                        SqlCommand updateCommand = new SqlCommand(
                            "UPDATE shipmentcr SET dscdelete = 1 WHERE uuid = @uuid", sqlConnection, transaction);
                        updateCommand.Parameters.AddWithValue("@uuid", uuid);
                        updateCommand.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return true;
                }
                catch (Exception ex)
                {
                    try
                    {
                        transaction.Rollback();
                    }
                    catch (Exception rollbackEx)
                    {
                        throw new ApplicationException(rollbackEx.Message);
                    }

                    throw new ApplicationException(ex.Message);
                }
            }
        }

        private string GetBillingEmailToPrtinv(string sqid, string invno, string stationid)
        {
            string billingEmail = string.Empty;

            using (SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                sqlConnection.Open();

                try
                {
                    var sqlQuery = @"SELECT TOP 1 
                                                  c.[billingemail]
                                             FROM [revenue] r
                                             JOIN [contactsprofile] c
                                               ON c.[custid] = r.[custid]
                                            WHERE r.[invno] = @invno
                                              AND c.[billingemail] <> ''";

                    /* AND c.[stationid] = @stationid */

                    using (SqlCommand sqlCommand = new SqlCommand(sqlQuery, sqlConnection))
                    {
                        sqlCommand.Parameters.AddWithValue("@invno", invno);
                        sqlCommand.Parameters.AddWithValue("@stationid", stationid);

                        object result = sqlCommand.ExecuteScalar();
                        if (result != null && result != DBNull.Value)
                        {
                            billingEmail = result.ToString();
                        }
                    }
                }
                catch (SqlException)
                {
                    throw;
                }
                finally
                {
                    sqlConnection.Close();
                }
            }

            return billingEmail;
        }
        static List<string> GetDepulicatedInvno(string sqid, string[] invnos)
        {
            using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
            {
                connection.Open();

                string query = "SELECT invno FROM revenue WHERE invno IN (@invnos)";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    var parameters = string.Join(",", invnos.Select((invno, index) => $"@invno{index}"));
                    command.CommandText = command.CommandText.Replace("@invnos", parameters);

                    for (int i = 0; i < invnos.Length; i++)
                    {
                        command.Parameters.AddWithValue($"@invno{i}", invnos[i]);
                    }

                    List<string> existingInvnos = new List<string>();
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            existingInvnos.Add(reader.GetString(0));
                        }
                    }

                    return existingInvnos;
                }
            }
        }


        static int GetNextInvno(string connectionString, string col, string prefix)
        {
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                connection.Open();
                string query = "SELECT MAX(CAST(SUBSTRING(" + col + ", " + (prefix.Length + 1) + ", 4) AS INT)) + 1 FROM revenue WHERE " + col + " LIKE '" + prefix + "%' AND " + col + " IS NOT NULL AND " + col + " <> '' AND CAST(SUBSTRING(" + col + ", 5, 4) AS INT) < 9999";
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    object result = command.ExecuteScalar();
                    if (result != DBNull.Value)
                    {
                        int nextInvno = Convert.ToInt32(result);
                        return nextInvno < 10000 ? nextInvno : -1; // Ensure it's a 4-digit number
                    }
                }
            }

            return -1; // No valid invno found
        }

        private List<CsNotesDB> GetNotesByRecid(string sqId, string recId)
        {
            List<CsNotesDB> csNotesList = new List<CsNotesDB>();
            try
            {
                using (SqlConnection connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqId].ConnectionString))
                {
                    connection.Open();

                    string query = @"SELECT
                                             [csnotes],
                                             [adduser],
                                             CONVERT(varchar(19), [adddate], 120)  AS [adddate],
                                             [lastuser],
                                             CONVERT(varchar(19), [lastdate], 120) AS [lastdate],
                                             CONVERT(varchar(50), [noteid])        AS [noteid]
                                        FROM [csnotes]
                                        WHERE [uuid] = @uuid
                                        ORDER BY [lastdate] DESC;
";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue($"@uuid", recId);

                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                csNotesList.Add(new CsNotesDB()
                                {
                                    CsNotes = reader.GetString(0),
                                    AddUser = reader.GetString(1),
                                    AddDate = reader.GetString(2),
                                    LastUser = reader.GetString(3),
                                    LastDate = reader.GetString(4),
                                    NoteId = reader.GetString(5),
                                });
                            }
                        }

                        return csNotesList;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        private bool DeleteNotesByRecid(string sqid, string uuid, string isDelete, string noteId, string entry, string user)
        {
            bool result = false;

            if (!bool.TryParse(isDelete, out var shouldDelete) || !shouldDelete)
                return false;

            if (!int.TryParse(noteId, out var noteIdInt))
                return false;

            string deleteSql = @"
        DELETE FROM [csnotes]
        WHERE [noteid] = @noteid
          AND [uuid] = @uuid;
    ";

            
            string executedSqlForLog =
                "DELETE FROM [csnotes] WHERE [noteid] = " + noteIdInt + " AND [uuid] = '" + uuid.Replace("'", "''") + "';";

            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString))
                {
                    conn.Open();

                    using (var cmd = new SqlCommand(deleteSql, conn))
                    {
                        cmd.Parameters.Add("@noteid", SqlDbType.Int).Value = noteIdInt;
                        cmd.Parameters.AddWithValue("@uuid", uuid);

                        int rows = cmd.ExecuteNonQuery();
                        result = rows > 0;
                    }
                    if (result)
                    {
                        using (var logCmd = new SqlCommand(@"
                    INSERT INTO [cdmlog]
                    (
                        [txuser],
                        [txdate],
                        [txtime],
                        [txip],
                        [module],
                        [entry],
                        [log],
                        [sqlcmd],
                        [txusername]
                    )
                    VALUES
                    (
                        @txuser,
                        CAST(GETDATE() AS date),
                        CAST(GETDATE() AS time),
                        '',
                        'csnotes',
                        @entry,
                        'DeleteNotesByRecid',
                        @sqlcmd,
                        @txuser
                    );
                ", conn))
                        {
                            logCmd.Parameters.AddWithValue("@txuser", user);
                            logCmd.Parameters.AddWithValue("@entry", entry ?? string.Empty);
                            logCmd.Parameters.AddWithValue("@sqlcmd", executedSqlForLog);

                            logCmd.ExecuteNonQuery();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _ = new Exception(ex.Message, ex);
                return false;
            }

            return result;
        }



        private bool SaveNotesByRecid(CsNotesDB note, string sqId)
        {
            bool result = false;

            const string insertSql = @"
        INSERT INTO [csnotes] (uuid, shipmentno, csnotes, adduser, adddate)
        VALUES (@uuid, @shipmentno, @csnotes, @adduser, GETDATE());
    ";

            const string updateSql = @"
        UPDATE [csnotes]
        SET [csnotes]  = @csnotes,
            [lastuser] = @lastuser,
            [lastdate] = GETDATE()
        WHERE [noteid] = @noteid
          AND [uuid] = @uuid;
    ";

            
            string executedSqlForLog;

            if (note.IsUpdate)
            {
                executedSqlForLog =
                    "UPDATE [csnotes] SET [csnotes] = '" + (note.CsNotes ?? string.Empty).Replace("'", "''") + "', " +
                    "[lastuser] = '" + (note.AddUser ?? string.Empty).Replace("'", "''") + "', " +
                    "[lastdate] = GETDATE() " +
                    "WHERE [noteid] = " + note.NoteId + " AND [uuid] = '" + note.Uuid.Replace("'", "''") + "';";
            }
            else
            {
                executedSqlForLog =
                    "INSERT INTO [csnotes] (uuid, shipmentno, csnotes, adduser, adddate) VALUES ('" +
                    note.Uuid.Replace("'", "''") + "', '" +
                    (note.Shipmentno ?? string.Empty).Replace("'", "''") + "', '" +
                    (note.CsNotes ?? string.Empty).Replace("'", "''") + "', '" +
                    (note.AddUser ?? string.Empty).Replace("'", "''") + "', GETDATE());";
            }

            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings[sqId].ConnectionString))
                {
                    conn.Open();

                    using (var cmd = new SqlCommand(note.IsUpdate ? updateSql : insertSql, conn))
                    {
                        // Shared
                        cmd.Parameters.AddWithValue("@uuid", note.Uuid);
                        cmd.Parameters.Add("@csnotes", SqlDbType.NVarChar, -1).Value = note.CsNotes ?? string.Empty;

                        if (note.IsUpdate)
                        {
                            cmd.Parameters.AddWithValue("@lastuser", note.AddUser);
                            cmd.Parameters.AddWithValue("@noteid", note.NoteId);
                        }
                        else
                        {
                            cmd.Parameters.AddWithValue("@shipmentno", note.Shipmentno);
                            cmd.Parameters.AddWithValue("@adduser", note.AddUser);
                        }

                        int rows = cmd.ExecuteNonQuery();
                        result = rows > 0;
                    }

                    if (result)
                    {
                        using (var logCmd = new SqlCommand(@"
                    INSERT INTO [cdmlog]
                    (
                        [txuser],
                        [txdate],
                        [txtime],
                        [txip],
                        [module],
                        [entry],
                        [log],
                        [sqlcmd],
                        [txusername]
                    )
                    VALUES
                    (
                        @txuser,
                        CAST(GETDATE() AS date),
                        CAST(GETDATE() AS time),
                        '',
                        'csnotes',
                        @entry,
                        'SaveNotesByRecid',
                        @sqlcmd,
                        @txuser
                    );
                ", conn))
                        {
                            logCmd.Parameters.AddWithValue("@txuser", note.AddUser);
                            logCmd.Parameters.AddWithValue("@entry", note.Shipmentno ?? string.Empty);
                            logCmd.Parameters.AddWithValue("@sqlcmd", executedSqlForLog);

                            logCmd.ExecuteNonQuery();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _ = new Exception(ex.Message, ex);
                return false;
            }

            return result;
        }


        private bool CloseFileByRecid(ShipmentDB shipment, string sqId)
        {
            bool result = false;
            try
            {
                using (var conn = new SqlConnection(ConfigurationManager.ConnectionStrings[sqId].ConnectionString))
                {
                    using (var cmd = new SqlCommand(@"
                                     UPDATE [shipment]
                                        SET [alert25] = 1,
                                            [upduser] = @upduser,
                                            [upddate] = CONVERT(date, GETDATE()),
                                            [updtime] = CONVERT(time, GETDATE())
                                        WHERE [uuid] = @uuid;", conn))
                    {
                        cmd.Parameters.AddWithValue("@upduser", shipment.Upduser);
                        cmd.Parameters.AddWithValue("@uuid", shipment.Uuid);

                        conn.Open();
                        int rows = cmd.ExecuteNonQuery();
                        result = rows > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
            return result;
        }

        private Tuple<(string compname, int kln1), (string compname, int kln2)> CheckStationValueByStationId(string sqId, string station1, string station2)
        {
            int kln1 = 0, kln2 = 0;
            string compname1 = string.Empty, compname2 = string.Empty;
            try
            {

                using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqId].ConnectionString))
                {
                    connection.Open();

                    // First query
                    using (var cmd1 = new SqlCommand("SELECT kln, compname FROM stationprofile WHERE stationid=@stationid", connection))
                    {
                        cmd1.Parameters.AddWithValue("@stationid", station1);
                        using (var reader = cmd1.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                kln1 = (int)reader["kln"];
                                compname1 = reader["compname"].ToString();
                            }
                        }
                    }

                    // Second query
                    using (var cmd2 = new SqlCommand("SELECT kln, compname FROM stationprofile WHERE stationid=@stationid", connection))
                    {
                        cmd2.Parameters.AddWithValue("@stationid", station2);
                        using (var reader = cmd2.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                kln2 = (int)reader["kln"];
                                compname2 = reader["compname"].ToString();
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
            return Tuple.Create((compname1, kln1), (compname2, kln2));
        }

        public async Task<ShipmentQueryResult> GetShipmentDataForSubject(string sqId, IEnumerable<string> hblValues)
        {
            var result = new ShipmentQueryResult();

            var hlbParameter = string.Join(",",
                hblValues
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Select(s => s.Trim()));

            if (string.IsNullOrWhiteSpace(hlbParameter))
                return result;

            const string sql1 = @"
                                SELECT DISTINCT 
                                    s.uuid,
                                    s.hbl,
                                    s.mbl,
                                    CONVERT(VARCHAR(10), s.eta3, 101) AS eta3,
                                    s.consname,
                                    s.shipname,
                                    s.polname,
                                    s.polcode,
                                    s.poulname,  
                                    s.poulcode
                                FROM shipment AS s
                                WHERE s.hbl IN (
            SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@hlbParameter, ',')
        );";

            const string sql2 = @"
                                SELECT DISTINCT p.pono
                                FROM shipment AS s
                                INNER JOIN container AS c ON s.uuid = c.uuid
                                INNER JOIN podetail  AS p ON c.detid = p.detid
                                WHERE s.hbl IN (
                                    SELECT LTRIM(RTRIM(value)) FROM STRING_SPLIT(@hlbParameter, ',')
                                )
                                AND p.pono IS NOT NULL;";

            const string sql3 = @"
                SELECT
                    SUM(COALESCE(c.qty, 0)) AS total_qty,
                    CASE
                        WHEN COUNT(DISTINCT c.uom) = 1 THEN MAX(c.uom)
                        ELSE 'PKG'
                    END AS uom,
                    c.ctnrno
                FROM shipment AS s
                INNER JOIN container AS c ON s.uuid = c.uuid
                WHERE s.hbl IN (
                    SELECT LTRIM(RTRIM([value]))
                    FROM STRING_SPLIT(@hlbParameter, ',')
                )
                GROUP BY
                    c.ctnrno;";

            try
            {
                var connString = ConfigurationManager.ConnectionStrings[sqId].ConnectionString;

                using (var conn = new SqlConnection(connString))
                {
                    await conn.OpenAsync().ConfigureAwait(false);

                    // --- Command 1: Shipments (distinct rows)
                    using (var cmd1 = new SqlCommand(sql1, conn))
                    {
                        cmd1.Parameters.Add("@hlbParameter", SqlDbType.NVarChar).Value = hlbParameter;

                        // ✅ FIX: Do NOT use SequentialAccess here (you read many columns out-of-order by name/ordinal)
                        using (var rdr = await cmd1.ExecuteReaderAsync().ConfigureAwait(false))
                        {
                            // Cache ordinals once (faster + safer than rdr["col"])
                            int oHbl = rdr.GetOrdinal("hbl");
                            int oMbl = rdr.GetOrdinal("mbl");
                            int oEta3 = rdr.GetOrdinal("eta3");
                            int oCons = rdr.GetOrdinal("consname");
                            int oShip = rdr.GetOrdinal("shipname");
                            int oPolName = rdr.GetOrdinal("polname");
                            int oPolCode = rdr.GetOrdinal("polcode");
                            int oPoulName = rdr.GetOrdinal("poulname");
                            int oPoulCode = rdr.GetOrdinal("poulcode");

                            while (await rdr.ReadAsync().ConfigureAwait(false))
                            {
                                var row = new ShipmentRow
                                {
                                    Hbl = rdr.IsDBNull(oHbl) ? null : rdr.GetString(oHbl),
                                    Mbl = rdr.IsDBNull(oMbl) ? null : rdr.GetString(oMbl),
                                    Eta3 = rdr.IsDBNull(oEta3) ? null : rdr.GetString(oEta3),
                                    ConsName = rdr.IsDBNull(oCons) ? null : rdr.GetString(oCons),
                                    ShipName = rdr.IsDBNull(oShip) ? null : rdr.GetString(oShip),
                                    PolName = rdr.IsDBNull(oPolName) ? null : rdr.GetString(oPolName),
                                    PolCode = rdr.IsDBNull(oPolCode) ? null : rdr.GetString(oPolCode),
                                    PoulName = rdr.IsDBNull(oPoulName) ? null : rdr.GetString(oPoulName),
                                    PoulCode = rdr.IsDBNull(oPoulCode) ? null : rdr.GetString(oPoulCode)
                                };

                                result.Shipments.Add(row);
                            }
                        }
                    }

                    // --- Command 2: Unique POs (p.pono)
                    using (var cmd2 = new SqlCommand(sql2, conn))
                    {
                        cmd2.Parameters.Add("@hlbParameter", SqlDbType.NVarChar).Value = hlbParameter;

                        using (var rdr = await cmd2.ExecuteReaderAsync().ConfigureAwait(false))
                        {
                            while (await rdr.ReadAsync().ConfigureAwait(false))
                            {
                                // keeps your original behavior (may add nulls, but query filters NOT NULL already)
                                result.Ponos.Add(rdr.IsDBNull(0) ? null : rdr.GetString(0));
                            }
                        }
                    }

                    // --- Command 3: Totals (sum qty and resolved UOM) + Unique Containers
                    using (var cmd3 = new SqlCommand(sql3, conn))
                    {
                        cmd3.Parameters.Add("@hlbParameter", SqlDbType.NVarChar).Value = hlbParameter;

                        using (var rdr = await cmd3.ExecuteReaderAsync().ConfigureAwait(false))
                        {
                            // ✅ CHANGED: sql3 returns 1 row per container (GROUP BY c.ctnrno),
                            // so we must read ALL rows to collect unique containers and total qty.
                            decimal totalQty = 0m;
                            string uom = null;

                            var containers = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                            int oTotalQty = rdr.GetOrdinal("total_qty");
                            int oUom = rdr.GetOrdinal("uom");
                            int oCtnr = rdr.GetOrdinal("ctnrno");

                            while (await rdr.ReadAsync().ConfigureAwait(false))
                            {
                                // Sum per-container totals to get the final total
                                if (!rdr.IsDBNull(oTotalQty))
                                {
                                    totalQty += Convert.ToDecimal(rdr.GetValue(oTotalQty));
                                }

                                // UOM is the same across rows (because CASE is computed over the full set)
                                if (uom == null && !rdr.IsDBNull(oUom))
                                {
                                    uom = rdr.GetString(oUom);
                                }

                                // Collect unique containers (ignore blanks/nulls)
                                if (!rdr.IsDBNull(oCtnr))
                                {
                                    var c = rdr.GetString(oCtnr)?.Trim();
                                    if (!string.IsNullOrWhiteSpace(c))
                                    {
                                        containers.Add(c);
                                    }
                                }
                            }

                            result.Totals.TotalQty = totalQty;
                            result.Totals.Uom = uom;
                            result.Totals.Ctnrno = containers.Count > 0
                                ? string.Join(", ", containers)
                                : null;
                        }
                    }

                }

                return result;
            }
            catch (SqlException sqlEx)
            {
                throw new ApplicationException("SQL error while fetching shipment data.", sqlEx);
            }
            catch (Exception ex)
            {
                throw new ApplicationException("Unexpected error while fetching shipment data.", ex);
            }
        }


        private string AddNewRevenue2(string sqid, RevenueType revenue)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO revenue ("
                + "uuid"
                + ",dettype"
                + ",txtype"
                + ",rtype"
                + ",custid"
                + ",custname"
                + ",terms"
                + ",amtpp"
                + ",arcode"
                + ",ardesc"
                + ",adddesc"
                + ",custref"
                + ",ctnrno"
                + ",uom"
                + ",qty"
                + ",rate"
                + ",amt"
                + ",currency"
                + ",exrate"
                + ",basicamt"
                + ",provisional"
                + ",taxinvno"
                + ",taxinvdate"
                + ",adduser"
                + ",release"
                + ",invno"
                + ",glacct"
                + ",shipmentno"
                + ",note1"
                + ",ourref"
                + ",stationid"
                + ",mbl"
                + ",hbl"
                + ",manifest"
                + ") "
                + "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25, @26, @27, @28, @29, @30, @31, @32, @33)"
                , sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@0", revenue.uuid);
                sqlCommand.Parameters.AddWithValue("@1", "AR");
                sqlCommand.Parameters.AddWithValue("@2", revenue.txtype);
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.billid);
                sqlCommand.Parameters.AddWithValue("@5", revenue.billname);
                sqlCommand.Parameters.AddWithValue("@6", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@7", revenue.amtpp);
                sqlCommand.Parameters.AddWithValue("@8", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@9", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@10", revenue.adddesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.custref);
                sqlCommand.Parameters.AddWithValue("@12", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@13", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@14", string.IsNullOrEmpty(revenue.qty) ? "0" : revenue.qty);
                sqlCommand.Parameters.AddWithValue("@15", string.IsNullOrEmpty(revenue.rate) ? "0" : revenue.rate);
                sqlCommand.Parameters.AddWithValue("@16", string.IsNullOrEmpty(revenue.amt) ? "0" : revenue.amt);
                sqlCommand.Parameters.AddWithValue("@17", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@18", string.IsNullOrEmpty(revenue.exrate) ? "0" : revenue.exrate);
                sqlCommand.Parameters.AddWithValue("@19", string.IsNullOrEmpty(revenue.basicamt) ? "0" : revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@20", string.IsNullOrEmpty(revenue.provisional) ? "0" : revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", string.IsNullOrEmpty(revenue.taxinvno) ? "" : revenue.taxinvno);
                sqlCommand.Parameters.AddWithValue("@22", string.IsNullOrEmpty(revenue.taxinvdate) ? "" : revenue.taxinvdate);
                sqlCommand.Parameters.AddWithValue("@23", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@24", string.IsNullOrEmpty(revenue.arrls) ? "0" : revenue.arrls);

                if (revenue.txtype == "L" && !string.IsNullOrEmpty(revenue.arrls) && revenue.arrls == "1" && !string.IsNullOrEmpty(revenue.inv1))
                {
                    if (nextInvNo > 0 && tempId == revenue.billid)  // && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@25", revenue.inv1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "invno", revenue.inv1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@25", revenue.inv1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@25", revenue.inv1 + "0001");
                            nextInvNo = 1;
                        }
                        tempId = revenue.billid;
                        tempCurr = revenue.currency;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@25", string.IsNullOrEmpty(revenue.invno) ? "" : revenue.invno);
                }

                sqlCommand.Parameters.AddWithValue("@26", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@27", string.IsNullOrEmpty(revenue.shipmentno) ? "" : revenue.shipmentno);
                sqlCommand.Parameters.AddWithValue("@28", string.IsNullOrEmpty(revenue.note1) ? "" : revenue.note1);
                sqlCommand.Parameters.AddWithValue("@29", string.IsNullOrEmpty(revenue.ourref) ? "" : revenue.ourref);
                sqlCommand.Parameters.AddWithValue("@30", string.IsNullOrEmpty(revenue.stationid) ? "" : revenue.stationid);
                sqlCommand.Parameters.AddWithValue("@31", string.IsNullOrEmpty(revenue.mbl) ? "" : revenue.mbl);
                sqlCommand.Parameters.AddWithValue("@32", string.IsNullOrEmpty(revenue.hbl) ? "" : revenue.hbl);
                sqlCommand.Parameters.AddWithValue("@33", string.IsNullOrEmpty(revenue.manifest) ? "" : revenue.manifest);

                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string AddNewRevenueEx(string sqid, Revenue revenue)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO revenue ("
                + "uuid,dettype,txtype,rtype,custid,custname,terms,amtpp,arcode,ardesc,adddesc,custref,ctnrno,uom,qty,rate,amt,currency,exrate,basicamt,provisional,taxinvno,taxinvdate,adduser,release,invno,glacct,basecurrency"
                + ") "
                + "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25, @26, @27)"
                , sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@0", revenue.uuid);
                sqlCommand.Parameters.AddWithValue("@1", "AR");
                sqlCommand.Parameters.AddWithValue("@2", revenue.txtype);
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.custid);
                sqlCommand.Parameters.AddWithValue("@5", revenue.custname);
                sqlCommand.Parameters.AddWithValue("@6", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@7", revenue.amtpp);
                sqlCommand.Parameters.AddWithValue("@8", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@9", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@10", revenue.adddesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.custref);
                sqlCommand.Parameters.AddWithValue("@12", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@13", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@14", revenue.qty);
                sqlCommand.Parameters.AddWithValue("@15", revenue.rate);
                sqlCommand.Parameters.AddWithValue("@16", revenue.amt);
                sqlCommand.Parameters.AddWithValue("@17", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@18", revenue.exrate ?? 0);
                sqlCommand.Parameters.AddWithValue("@19", revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@20", revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", string.IsNullOrEmpty(revenue.taxinvno) ? "" : revenue.taxinvno);
                sqlCommand.Parameters.AddWithValue("@22", string.IsNullOrEmpty(revenue.taxinvdate) ? "" : revenue.taxinvdate);
                sqlCommand.Parameters.AddWithValue("@23", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@24", revenue.release);

                var prefix = revenue.rtype == "IN" ? revenue.inv1 : revenue.rtype == "DB" ? revenue.db1 : revenue.cr1;

                if (string.IsNullOrEmpty(revenue.invno) && revenue.txtype == "L" && revenue.release == 1 && !string.IsNullOrEmpty(prefix))
                {
                    if (nextInvNo > 0 && tempId == revenue.custid && tempRtype == revenue.rtype)        // && tempCurr == revenue.currency
                    {
                        sqlCommand.Parameters.AddWithValue("@25", prefix + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "invno", prefix);

                        if (newInvno != -1)
                        {
                            revenue.invno = prefix + newInvno.ToString("D4");
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            revenue.invno = prefix + "0001";
                            nextInvNo = 1;
                        }

                        sqlCommand.Parameters.AddWithValue("@25", revenue.invno);

                        tempId = revenue.custid;
                        tempCurr = revenue.currency;
                        tempRtype = revenue.rtype;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@25", string.IsNullOrEmpty(revenue.invno) ? "" : revenue.invno);
                }

                sqlCommand.Parameters.AddWithValue("@26", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@27", string.IsNullOrEmpty(revenue.basecurrency) ? "" : revenue.basecurrency);

                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string UpdateRevenue2(string sqid, RevenueType revenue)
        {
            DateTime currentDateTime = DateTime.Now;
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand(
                "Update revenue SET "
                    + "rtype=@3"
                    + ",custid=@4"
                    + ",custname=@5"
                    + ",terms=@6"
                    + ",amtpp=@7"
                    + ",arcode=@8"
                    + ",ardesc=@9"
                    + ",adddesc=@10"
                    + ",custref=@11"
                    + ",ctnrno=@12"
                    + ",uom=@13"
                    + ",qty=@14"
                    + ",rate=@15"
                    + ",amt=@16"
                    + ",currency=@17"
                    + ",exrate=@18"
                    + ",basicamt=@19"
                    + ",provisional=@20"
                    + ",taxinvno=@21"
                    + ",taxinvdate=@22"
                    + ",lastuser=@24"
                    + ",lastdate=@25"
                    + ",release=@26"
                    + ",invno=@27"
                    + ",glacct=@28"
                    + (revenue.isReleaseCleared ? ",invdate='1900-01-01'" : "")
                    + " WHERE uuid='" + revenue.uuid + "' AND detid='" + revenue.detid + "'", sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.billid);
                sqlCommand.Parameters.AddWithValue("@5", revenue.billname);
                sqlCommand.Parameters.AddWithValue("@6", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@7", revenue.amtpp);
                sqlCommand.Parameters.AddWithValue("@8", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@9", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@10", revenue.adddesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.custref);
                sqlCommand.Parameters.AddWithValue("@12", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@13", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@14", string.IsNullOrEmpty(revenue.qty) ? "0" : revenue.qty);
                sqlCommand.Parameters.AddWithValue("@15", string.IsNullOrEmpty(revenue.rate) ? "0" : revenue.rate);
                sqlCommand.Parameters.AddWithValue("@16", string.IsNullOrEmpty(revenue.amt) ? "0" : revenue.amt);
                sqlCommand.Parameters.AddWithValue("@17", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@18", string.IsNullOrEmpty(revenue.exrate) ? "0" : revenue.exrate);
                sqlCommand.Parameters.AddWithValue("@19", string.IsNullOrEmpty(revenue.basicamt) ? "0" : revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@20", string.IsNullOrEmpty(revenue.provisional) ? "0" : revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", string.IsNullOrEmpty(revenue.taxinvno) ? "" : revenue.taxinvno);
                sqlCommand.Parameters.AddWithValue("@22", string.IsNullOrEmpty(revenue.taxinvdate) ? "" : revenue.taxinvdate);
                sqlCommand.Parameters.AddWithValue("@24", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@25", currentDateTime);
                sqlCommand.Parameters.AddWithValue("@26", string.IsNullOrEmpty(revenue.arrls) ? "0" : revenue.arrls);

                if (revenue.txtype == "L"
                    && !string.IsNullOrEmpty(revenue.arrls)
                    && revenue.arrls == "1"
                    && !string.IsNullOrEmpty(revenue.inv1)
                    && (string.IsNullOrEmpty(revenue.invno) || (!string.IsNullOrEmpty(revenue.invno) && !revenue.invno.Contains(revenue.inv1))))
                {
                    if (nextInvNo > 0 && tempId == revenue.billid)      // && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@27", revenue.inv1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "invno", revenue.inv1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.inv1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.inv1 + "0001");
                            nextInvNo = 1;
                        }

                        tempId = revenue.billid;
                        tempCurr = revenue.currency;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@27", string.IsNullOrEmpty(revenue.invno) ? "" : revenue.invno);
                }

                sqlCommand.Parameters.AddWithValue("@28", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string UpdateRevenueEx(string sqid, Revenue revenue)
        {
            DateTime currentDateTime = DateTime.Now;
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand(
                "Update revenue SET "
                    + "rtype=@3"
                    + ",custid=@4"
                    + ",custname=@5"
                    + ",terms=@6"
                    + ",amtpp=@7"
                    + ",arcode=@8"
                    + ",ardesc=@9"
                    + ",adddesc=@10"
                    + ",custref=@11"
                    + ",ctnrno=@12"
                    + ",uom=@13"
                    + ",qty=@14"
                    + ",rate=@15"
                    + ",amt=@16"
                    + ",currency=@17"
                    + ",exrate=@18"
                    + ",basicamt=@19"
                    + ",provisional=@20"
                    + ",taxinvno=@21"
                    + ",taxinvdate=@22"
                    + ",lastuser=@24"
                    + ",lastdate=@25"
                    + ",release=@26"
                    + ",invno=@27"
                    + ",glacct=@28"
                    + (revenue.isReleaseCleared ? ",invdate='1900-01-01'" : "")
                    + ",basecurrency=@29"
                    + " WHERE uuid='" + revenue.uuid + "' AND detid='" + revenue.detid + "'", sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.custid);
                sqlCommand.Parameters.AddWithValue("@5", revenue.custname);
                sqlCommand.Parameters.AddWithValue("@6", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@7", revenue.amtpp);
                sqlCommand.Parameters.AddWithValue("@8", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@9", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@10", revenue.adddesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.custref);
                sqlCommand.Parameters.AddWithValue("@12", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@13", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@14", revenue.qty);
                sqlCommand.Parameters.AddWithValue("@15", revenue.rate);
                sqlCommand.Parameters.AddWithValue("@16", revenue.amt);
                sqlCommand.Parameters.AddWithValue("@17", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@18", revenue.exrate ?? 0);
                sqlCommand.Parameters.AddWithValue("@19", revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@20", revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", string.IsNullOrEmpty(revenue.taxinvno) ? "" : revenue.taxinvno);
                sqlCommand.Parameters.AddWithValue("@22", string.IsNullOrEmpty(revenue.taxinvdate) ? "" : revenue.taxinvdate);
                sqlCommand.Parameters.AddWithValue("@24", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@25", currentDateTime);
                sqlCommand.Parameters.AddWithValue("@26", revenue.release);

                var prefix = revenue.rtype == "IN" ? revenue.inv1 : revenue.rtype == "DB" ? revenue.db1 : revenue.cr1;

                if (revenue.txtype == "L"
                    && revenue.release == 1
                    && !string.IsNullOrEmpty(prefix)
                    && (string.IsNullOrEmpty(revenue.invno) || (!string.IsNullOrEmpty(revenue.invno) && !revenue.invno.Contains(prefix))))
                {

                    if (nextInvNo > 0 && tempId == revenue.custid && tempRtype == revenue.rtype)        // && tempCurr == revenue.currency
                    {
                        sqlCommand.Parameters.AddWithValue("@27", prefix + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "invno", prefix);

                        if (newInvno != -1)
                        {
                            revenue.invno = prefix + newInvno.ToString("D4");
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            revenue.invno = prefix + "0001";
                            nextInvNo = 1;
                        }

                        sqlCommand.Parameters.AddWithValue("@27", revenue.invno);

                        tempId = revenue.custid;
                        tempCurr = revenue.currency;
                        tempRtype = revenue.rtype;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@27", string.IsNullOrEmpty(revenue.invno) ? "" : revenue.invno);
                }

                sqlCommand.Parameters.AddWithValue("@28", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@29", string.IsNullOrEmpty(revenue.basecurrency) ? "" : revenue.basecurrency);

                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string AddNewCost2(string sqid, RevenueType revenue)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO revenue ("
                + "uuid,dettype,txtype,rtype,costpp,vendid,vendname,vendref,terms,arcode,ardesc,ctnrno,uomc,qtyc,ratec,cost,currencyc,exratec,basicamt,provisional,adduser,release,voucherno,glacct,note2,venddate"
                + ",shipmentno,ourref,stationid,mbl,hbl,manifest,perc,adddesc"
                + ")"
                + " VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25"
                + ", @26, @27, @28, @29, @30, @31, @32, @33"
                + ")"
                , sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@0", revenue.uuid);
                sqlCommand.Parameters.AddWithValue("@1", revenue.dettype);
                sqlCommand.Parameters.AddWithValue("@2", revenue.txtype);
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.costpp);
                sqlCommand.Parameters.AddWithValue("@5", revenue.vendid);
                sqlCommand.Parameters.AddWithValue("@6", revenue.vendname);
                sqlCommand.Parameters.AddWithValue("@7", revenue.vendref);
                sqlCommand.Parameters.AddWithValue("@8", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@9", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@10", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@12", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@13", string.IsNullOrEmpty(revenue.qty) ? "0" : revenue.qty);
                sqlCommand.Parameters.AddWithValue("@14", string.IsNullOrEmpty(revenue.rate) ? "0" : revenue.rate);
                sqlCommand.Parameters.AddWithValue("@15", string.IsNullOrEmpty(revenue.cost) ? "0" : revenue.cost);
                sqlCommand.Parameters.AddWithValue("@16", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@17", string.IsNullOrEmpty(revenue.exrate) ? "0" : revenue.exrate);
                sqlCommand.Parameters.AddWithValue("@18", string.IsNullOrEmpty(revenue.basicamt) ? "0" : revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@19", string.IsNullOrEmpty(revenue.provisional) ? "0" : revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@20", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@21", string.IsNullOrEmpty(revenue.aprls) ? "0" : revenue.aprls);

                if (revenue.txtype == "L" && !string.IsNullOrEmpty(revenue.aprls) && revenue.aprls == "1" && !string.IsNullOrEmpty(revenue.voucher1))
                {
                    if (nextInvNo > 0 && tempId == revenue.vendid && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "voucherno", revenue.voucher1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + "0001");
                            nextInvNo = 1;
                        }

                        tempId = revenue.billid;
                        tempCurr = revenue.currency;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@22", "");
                }

                sqlCommand.Parameters.AddWithValue("@23", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@24", revenue.note2);
                sqlCommand.Parameters.AddWithValue("@25", revenue.venddate);

                sqlCommand.Parameters.AddWithValue("@26", string.IsNullOrEmpty(revenue.shipmentno) ? "" : revenue.shipmentno);
                sqlCommand.Parameters.AddWithValue("@27", string.IsNullOrEmpty(revenue.ourref) ? "" : revenue.ourref);
                sqlCommand.Parameters.AddWithValue("@28", string.IsNullOrEmpty(revenue.stationid) ? "" : revenue.stationid);
                sqlCommand.Parameters.AddWithValue("@29", string.IsNullOrEmpty(revenue.mbl) ? "" : revenue.mbl);
                sqlCommand.Parameters.AddWithValue("@30", string.IsNullOrEmpty(revenue.hbl) ? "" : revenue.hbl);
                sqlCommand.Parameters.AddWithValue("@31", string.IsNullOrEmpty(revenue.manifest) ? "" : revenue.manifest);
                sqlCommand.Parameters.AddWithValue("@32", revenue.perc);
                sqlCommand.Parameters.AddWithValue("@33", string.IsNullOrEmpty(revenue.adddesc) ? "" : revenue.adddesc);

                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string AddNewCostEx(string sqid, Revenue revenue)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand(
                "INSERT INTO revenue ("
                + "uuid,dettype,txtype,rtype,costpp,vendid,vendname,vendref,terms,arcode,ardesc,ctnrno,uomc,qtyc,ratec,cost,currencyc,exratec,basicamt,provisional,adduser,release,voucherno,glacct,note2,venddate,basecurrency"
                + ") "
                + "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17, @18, @19, @20, @21, @22, @23, @24, @25, @26)"
                , sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@0", revenue.uuid);
                sqlCommand.Parameters.AddWithValue("@1", "AP");
                sqlCommand.Parameters.AddWithValue("@2", revenue.txtype);
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.costpp);
                sqlCommand.Parameters.AddWithValue("@5", revenue.vendid);
                sqlCommand.Parameters.AddWithValue("@6", revenue.vendname);
                sqlCommand.Parameters.AddWithValue("@7", revenue.vendref);
                sqlCommand.Parameters.AddWithValue("@8", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@9", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@10", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@12", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@13", revenue.qty);
                sqlCommand.Parameters.AddWithValue("@14", revenue.rate);
                sqlCommand.Parameters.AddWithValue("@15", revenue.cost);
                sqlCommand.Parameters.AddWithValue("@16", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@17", revenue.exrate ?? 0);
                sqlCommand.Parameters.AddWithValue("@18", revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@19", revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@20", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@21", revenue.release);

                if (revenue.txtype == "L" && revenue.release == 1 && !string.IsNullOrEmpty(revenue.voucher1))
                {
                    if (nextInvNo > 0 && tempId == revenue.vendid && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "voucherno", revenue.voucher1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@22", revenue.voucher1 + "0001");
                            nextInvNo = 1;
                        }

                        tempId = revenue.vendid;
                        tempCurr = revenue.currency;
                    }
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@22", "");
                }

                sqlCommand.Parameters.AddWithValue("@23", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@24", revenue.note2);
                sqlCommand.Parameters.AddWithValue("@25", revenue.venddate);
                sqlCommand.Parameters.AddWithValue("@26", string.IsNullOrEmpty(revenue.basecurrency) ? "" : revenue.basecurrency);

                int nRow = sqlCommand.ExecuteNonQuery();

                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string UpdateCost2(string sqid, RevenueType revenue)
        {
            DateTime currentDateTime = DateTime.Now;
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            bool isRelease = revenue.txtype == "L" && !string.IsNullOrEmpty(revenue.aprls) && revenue.aprls == "1" && !string.IsNullOrEmpty(revenue.voucher1);
            SqlCommand sqlCommand = new SqlCommand("Update revenue SET rtype=@3,costpp=@4,vendid=@5,vendname=@6, vendref=@7, terms=@8, arcode=@9,ardesc=@10,ctnrno=@11,uomc=@12,qtyc=@13,ratec=@14,cost=@15, currencyc=@16,exratec=@17,basicamt=@18,provisional=@19,lastuser=@21, lastdate=@22, release=@23, glacct=@24, note2=@25, venddate=@26" + (isRelease ? ", voucherno=@27" : " ") + " WHERE uuid='" + revenue.uuid + "' AND detid='" + revenue.detid + "'", sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.costpp);
                sqlCommand.Parameters.AddWithValue("@5", revenue.vendid);
                sqlCommand.Parameters.AddWithValue("@6", revenue.vendname);
                sqlCommand.Parameters.AddWithValue("@7", revenue.vendref);
                sqlCommand.Parameters.AddWithValue("@8", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@9", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@10", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@12", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@13", string.IsNullOrEmpty(revenue.qty) ? "0" : revenue.qty);
                sqlCommand.Parameters.AddWithValue("@14", string.IsNullOrEmpty(revenue.rate) ? "0" : revenue.rate);
                sqlCommand.Parameters.AddWithValue("@15", string.IsNullOrEmpty(revenue.cost) ? "0" : revenue.cost);
                sqlCommand.Parameters.AddWithValue("@16", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@17", string.IsNullOrEmpty(revenue.exrate) ? "0" : revenue.exrate);
                sqlCommand.Parameters.AddWithValue("@18", string.IsNullOrEmpty(revenue.basicamt) ? "0" : revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@19", string.IsNullOrEmpty(revenue.provisional) ? "0" : revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@22", currentDateTime);
                sqlCommand.Parameters.AddWithValue("@23", string.IsNullOrEmpty(revenue.aprls) ? "0" : revenue.aprls);
                sqlCommand.Parameters.AddWithValue("@24", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@25", revenue.note2);
                sqlCommand.Parameters.AddWithValue("@26", revenue.venddate);
                if (isRelease)
                {
                    if (nextInvNo > 0 && tempId == revenue.billid)      // && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "voucherno", revenue.voucher1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + "0001");
                            nextInvNo = 1;
                        }
                        tempId = revenue.billid;
                        tempCurr = revenue.currency;
                    }
                }
                int nRow = sqlCommand.ExecuteNonQuery();
                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string UpdateCostEx(string sqid, Revenue revenue)
        {
            DateTime currentDateTime = DateTime.Now;
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();

            bool isRelease = revenue.txtype == "L" && revenue.release == 1 && !string.IsNullOrEmpty(revenue.voucher1);
            bool resetVoucherNo = revenue.release == 0 && string.IsNullOrEmpty(revenue.voucherno);

            SqlCommand sqlCommand = new SqlCommand("Update revenue SET "
                + "rtype=@3"
                + ",costpp=@4"
                + ",vendid=@5"
                + ",vendname=@6"
                + ",vendref=@7"
                + ",terms=@8"
                + ",arcode=@9"
                + ",ardesc=@10"
                + ",ctnrno=@11"
                + ",uomc=@12"
                + ",qtyc=@13"
                + ",ratec=@14"
                + ",cost=@15"
                + ",currencyc=@16"
                + ",exratec=@17"
                + ",basicamt=@18"
                + ",provisional=@19"
                + ",lastuser=@21"
                + ",lastdate=@22"
                + ",release=@23"
                + ",glacct=@24"
                + ",note2=@25"
                + ",venddate=@26"
                + (isRelease || resetVoucherNo ? ",voucherno=@27" : "")
                + ",basecurrency=@28"
                + " WHERE uuid='" + revenue.uuid + "' AND detid='" + revenue.detid + "'"
                , sqlConnection);

            try
            {
                sqlCommand.Parameters.AddWithValue("@3", revenue.rtype);
                sqlCommand.Parameters.AddWithValue("@4", revenue.costpp);
                sqlCommand.Parameters.AddWithValue("@5", revenue.vendid);
                sqlCommand.Parameters.AddWithValue("@6", revenue.vendname);
                sqlCommand.Parameters.AddWithValue("@7", revenue.vendref);
                sqlCommand.Parameters.AddWithValue("@8", revenue.terms);
                sqlCommand.Parameters.AddWithValue("@9", revenue.arcode);
                sqlCommand.Parameters.AddWithValue("@10", revenue.ardesc);
                sqlCommand.Parameters.AddWithValue("@11", revenue.ctnrno);
                sqlCommand.Parameters.AddWithValue("@12", revenue.uom);
                sqlCommand.Parameters.AddWithValue("@13", revenue.qty);
                sqlCommand.Parameters.AddWithValue("@14", revenue.rate);
                sqlCommand.Parameters.AddWithValue("@15", revenue.cost);
                sqlCommand.Parameters.AddWithValue("@16", revenue.currency);
                sqlCommand.Parameters.AddWithValue("@17", revenue.exrate ?? 0);
                sqlCommand.Parameters.AddWithValue("@18", revenue.basicamt);
                sqlCommand.Parameters.AddWithValue("@19", revenue.provisional);
                sqlCommand.Parameters.AddWithValue("@21", revenue.adduser);
                sqlCommand.Parameters.AddWithValue("@22", currentDateTime);
                sqlCommand.Parameters.AddWithValue("@23", revenue.release);
                sqlCommand.Parameters.AddWithValue("@24", string.IsNullOrEmpty(revenue.glacct) ? "" : revenue.glacct);
                sqlCommand.Parameters.AddWithValue("@25", revenue.note2);
                sqlCommand.Parameters.AddWithValue("@26", revenue.venddate);

                if (isRelease)
                {
                    if (nextInvNo > 0 && tempId == revenue.vendid && tempCurr == revenue.currency)
                    {
                        sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + nextInvNo.ToString("D4"));
                    }
                    else
                    {
                        int newInvno = GetNextInvno(ConfigurationManager.ConnectionStrings[sqid].ConnectionString, "voucherno", revenue.voucher1);

                        if (newInvno != -1)
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + newInvno.ToString("D4"));
                            nextInvNo = newInvno;
                        }
                        else
                        {
                            sqlCommand.Parameters.AddWithValue("@27", revenue.voucher1 + "0001");
                            nextInvNo = 1;
                        }

                        tempId = revenue.vendid;
                        tempCurr = revenue.currency;
                    }
                }
                else if (resetVoucherNo)
                {
                    sqlCommand.Parameters.AddWithValue("@27", "");
                }

                sqlCommand.Parameters.AddWithValue("@28", string.IsNullOrEmpty(revenue.basecurrency) ? "" : revenue.basecurrency);

                int nRow = sqlCommand.ExecuteNonQuery();
                return nRow > 0 ? "ok" : "Failed";
            }
            catch (System.Exception err)
            {
                return err.Message;
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }


        private string GenerateXlsx(HttpContext context)
        {
            string folderPath = context.Server.MapPath("xlsxTemplates");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }
            string templatePath = folderPath + "\\" + "XLS-REPORT-TEMPLATE.xlsx";
            string folderPath2 = context.Server.MapPath("xlsxFiles");
            if (!Directory.Exists(folderPath2))
            {
                Directory.CreateDirectory(folderPath2);
            }
            string fileName = "XLS-REPORT-" + DateTime.Now.ToString("yyyyMMddHHmmssffff") + ".xlsx";
            string xlsxPath = folderPath2 + "\\" + fileName;
            WorkBook workBook = WorkBook.Load(templatePath);
            WorkSheet workSheet = workBook.WorkSheets.First();
            workSheet["A1:A4"].Style.Font.Height = 12;
            workSheet["A1:A4"].Style.Font.Bold = true;
            workSheet["A1:A4"].Style.Font.Name = "Arial";
            workSheet["A1"].Value = "TTS WORLDWIDE, LLC";
            workSheet["A2"].Value = "Sales Analysis Report";
            workSheet["A3"].Value = "Invoice Date 01/01/2023 to 02/07/2023, Department = ALL, Format = DETAILED";
            workSheet["A4"].Value = "02/07/2023 @ 10:20";

            workSheet["A6:O6"].Style.SetBackgroundColor("#9999ff");
            workSheet["A7"].Value = "REGAL MOLD & DIE";
            workSheet["B7"].Value = "CHI2AI009896";
            workSheet["C7"].Value = "AESZX223785";
            workSheet["D7"].Value = "CHI2AI009896";
            workSheet["E7"].Value = "01/09/2023";
            workSheet["F7"].Value = "OZ";
            workSheet["G7"].Value = "GUANGZHOU";
            workSheet["H7"].Value = "01/04/2023";
            workSheet["I7"].Value = "01/04/2023";
            workSheet["J7"].Value = "CHICAGO";
            workSheet["K7"].Value = "";
            workSheet["L7:L15"].FormatString = "###,###,###.00";
            workSheet["L7"].Value = 0;
            workSheet["L8"].Value = 6612.4;
            workSheet["L9"].Value = 125;
            workSheet["L10"].Value = 45;
            workSheet["L11"].Value = 25;
            workSheet["L12"].Value = 495;
            workSheet["L13"].Value = 3683.81;
            workSheet["L14"].Value = 220;
            workSheet["L15"].Value = workSheet["L7: L14"].Sum();
            workSheet["M7"].Value = "MAESTRO INTERNATIONAL CARGO";
            workSheet["N7:N15"].FormatString = "###,###,###.00";
            workSheet["O7:O15"].FormatString = "###,###,###.00";
            workSheet["N7"].Value = 190;
            workSheet["N8"].Value = 5799.4;
            workSheet["N9"].Value = 85;
            workSheet["N10"].Value = 0;
            workSheet["N11"].Value = 0;
            workSheet["N12"].Value = 633;
            workSheet["N13"].Value = 3683.81;
            workSheet["N14"].Value = 0;
            workSheet["N15"].Value = workSheet["N7: N14"].Sum();
            workSheet["O7"].Value = -190;
            workSheet["O8"].Value = 813;
            workSheet["O9"].Value = 40;
            workSheet["O10"].Value = 45;
            workSheet["O11"].Value = 25;
            workSheet["O12"].Value = -138;
            workSheet["O13"].Value = 0;
            workSheet["O14"].Value = 220;
            workSheet["O15"].Value = workSheet["O7: O14"].Sum();

            workBook.SaveAs(xlsxPath);
            return xlsxPath;
        }

        private string AddNewContact(string sqid, HttpContext context)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            string companyName = context.Request.Params["contname"].ToString();
            string city = context.Request.Params["contcity"].ToString();
            string companyLetters = new String(companyName.Where(Char.IsLetter).ToArray()).ToUpper();
            string cityLetters = new String(city.Where(Char.IsLetter).ToArray()).ToUpper();
            string tempId = companyLetters.Substring(0, 5) + cityLetters.Substring(0, 4);
            SqlCommand command = new SqlCommand("SELECT COUNT(*) FROM contacts WHERE custid like '" + tempId + "%'", sqlConnection);
            Int32 count = (Int32)command.ExecuteScalar();
            string custid = tempId + (count + 1).ToString().PadLeft(3, '0');
            string conttype = context.Request.Params["conttype"].ToString().ToUpper();
            string scac = context.Request.Params["contscac"].ToString().ToUpper();
            string prefix = context.Request.Params["contpfx"].ToString().ToUpper();
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO contacts (customertype, custid, custname, addr1, addr2, addr3, city, state, zip, iso, contact1, phone1, email1, ein , scac, prefix, iata, icao) " +
                                                    "VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14, @15, @16, @17)", sqlConnection);
            if (conttype == "SEA CARRIER")
            {
                SqlCommand sqlQuery = new SqlCommand("SELECT COUNT(*) FROM contacts WHERE custid='" + scac + "' AND customertype='SEA CARRIER'", sqlConnection);
                int recordCount = (int)sqlQuery.ExecuteScalar();
                if (recordCount > 0)
                {
                    return new JavaScriptSerializer().Serialize(
                        new
                        {
                            success = false,
                            message = "Cannot Create Contact, SCAC = " + scac + " already exist!",
                        });
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@1", scac);
                }
            }
            else if (conttype == "AIR CARRIER")
            {
                SqlCommand sqlQuery = new SqlCommand("SELECT COUNT(*) FROM contacts WHERE custid='" + prefix + "' AND customertype='AIR CARRIER'", sqlConnection);
                int recordCount = (int)sqlQuery.ExecuteScalar();
                if (recordCount > 0)
                {
                    return new JavaScriptSerializer().Serialize(
                        new
                        {
                            success = false,
                            message = "Cannot Create Contact, PREFIX = " + scac + " already exist!",
                        });
                }
                else
                {
                    sqlCommand.Parameters.AddWithValue("@1", prefix);
                }
            }
            else
            {
                sqlCommand.Parameters.AddWithValue("@1", custid.ToUpper());
            }

            try
            {
                sqlCommand.Parameters.AddWithValue("@0", conttype);
                sqlCommand.Parameters.AddWithValue("@2", companyName.ToUpper());
                sqlCommand.Parameters.AddWithValue("@3", context.Request.Params["contadd1"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@4", context.Request.Params["contadd2"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@5", context.Request.Params["contadd3"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@6", city.ToUpper());
                sqlCommand.Parameters.AddWithValue("@7", context.Request.Params["contst"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@8", context.Request.Params["contzip"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@9", context.Request.Params["contiso"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@10", context.Request.Params["contcont"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@11", context.Request.Params["contph"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@12", context.Request.Params["contemail"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@13", context.Request.Params["conttaxid"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@14", scac);
                sqlCommand.Parameters.AddWithValue("@15", prefix);
                sqlCommand.Parameters.AddWithValue("@16", context.Request.Params["contiata"].ToString().ToUpper());
                sqlCommand.Parameters.AddWithValue("@17", context.Request.Params["conticao"].ToString().ToUpper());
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = true
                    });
                }
                else
                {
                    return new JavaScriptSerializer().Serialize(new
                    {
                        success = false
                    });
                }
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private int AddFile(string sqid, string documentId, string filename, string extension, byte[] content, string fileSize, string uploaduserid, int customerview, string documenttype)
        {

            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlDatabase sqlDatabase = new SqlDatabase(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            SqlCommand sqlCommand = new SqlCommand("INSERT INTO web_files (documentno, file_name, file_ext, file_size, file_content, uploaduserid, customerview, documenttype) " +
                                                    "VALUES (@0, @1, @2, @3, @4, @5, @6, @7)", sqlConnection);

            try
            {
                sqlDatabase.AddInParameter(sqlCommand, "@0", SqlDbType.VarChar, documentId);
                sqlDatabase.AddInParameter(sqlCommand, "@1", SqlDbType.VarChar, filename);
                sqlDatabase.AddInParameter(sqlCommand, "@2", SqlDbType.NChar, extension);
                sqlDatabase.AddInParameter(sqlCommand, "@3", SqlDbType.Int, int.Parse(fileSize));
                sqlDatabase.AddInParameter(sqlCommand, "@4", SqlDbType.VarBinary, content);
                sqlDatabase.AddInParameter(sqlCommand, "@5", SqlDbType.VarChar, uploaduserid);
                sqlDatabase.AddInParameter(sqlCommand, "@6", SqlDbType.Int, customerview);
                sqlDatabase.AddInParameter(sqlCommand, "@7", SqlDbType.VarChar, documenttype);
                int nRow = sqlCommand.ExecuteNonQuery();
                if (nRow > 0)
                    return 0;
                else
                    return 1;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private WebFile[] GetListData(string sqid, string documentId, int customerview)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = null;
            if (customerview == -1)
                /// sqlCommand = new SqlCommand("SELECT *, format(cast(uploaddate as date), 'MM/dd/yyyy @ hh:mm') as fuploaddate FROM web_files WHERE documentno='" + documentId + "' AND (customerview = 0 OR customerview = 1)", sqlConnection);
                sqlCommand = new SqlCommand("SELECT *, convert(varchar, uploaddate, 100) as fuploaddate FROM web_files WHERE documentno='" + documentId + "' AND (customerview = 0 OR customerview = 1)", sqlConnection);
            else if (customerview == 1)
                ///sqlCommand = new SqlCommand("SELECT *, format(cast(uploaddate as date), 'MM/dd/yyyy @ hh:mm') as fuploaddate FROM web_files WHERE documentno='" + documentId + "' AND customerview = 1", sqlConnection);
                sqlCommand = new SqlCommand("SELECT *, convert(varchar, uploaddate, 100) as fuploaddate FROM web_files WHERE documentno='" + documentId + "' AND customerview = 1", sqlConnection);
            else
                throw new ApplicationException("Customer view undefined.");
            List<WebFile> lstTemp = new List<WebFile>();
            try
            {
                SqlDataReader rdr = sqlCommand.ExecuteReader();
                while (rdr.Read())
                {
                    WebFile temp = new WebFile();
                    temp.id = rdr["Id"].ToString();
                    temp.name = !string.IsNullOrEmpty(rdr["friendlyname"].ToString()) ? rdr["friendlyname"].ToString() : rdr["file_name"].ToString();
                    temp.quote = rdr["documentno"].ToString();
                    temp.ext = rdr["file_ext"].ToString().Trim();
                    temp.customerview = rdr["customerview"].ToString();
                    temp.documenttype = rdr["documenttype"].ToString();
                    temp.uploaddate = rdr["fuploaddate"].ToString();
                    temp.content = System.Convert.ToBase64String((byte[])rdr["file_content"]);

                    lstTemp.Add(temp);
                }
                WebFile[] strArrElements = new WebFile[lstTemp.Count];
                for (int i = 0; i < lstTemp.Count; i++)
                {
                    strArrElements[i] = lstTemp.ElementAt(i);
                }
                return strArrElements;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        private Boolean DeleteAttachment(string sqid, string id)
        {
            SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
            sqlConnection.Open();
            SqlCommand sqlCommand = new SqlCommand("DELETE FROM web_files where Id='" + id + "'", sqlConnection);
            try
            {
                sqlCommand.ExecuteNonQuery();
                return true;
            }
            catch (System.Exception err)
            {
                throw new ApplicationException(err.Message);
            }
            finally
            {
                if (sqlConnection != null)
                    sqlConnection.Close();
            }
        }

        void UpdateShipmentAlert(SqlConnection connection, int alertNo, ContainerTypeEx container)
        {
            if ((alertNo == 11 && !string.IsNullOrWhiteSpace(container.gateoutdate) && !string.IsNullOrWhiteSpace(container.etadoor1) && !string.IsNullOrWhiteSpace(container.etadoor2))
                || (alertNo == 3)
                || (alertNo == 4)
                || (alertNo == 6 && !string.IsNullOrWhiteSpace(container.discdate) && !string.IsNullOrWhiteSpace(container.lfdcust))
                || (alertNo == 7)
                || (alertNo == 8 && !string.IsNullOrWhiteSpace(container.rampdate2))
                || (alertNo == 9
                    && (container.ctype == "CY/IPI/DOOR" || container.ctype == "LL/IPI/DOOR" || container.ctype == "CY/RAMP" || container.ctype == "DOOR/RAMP" || container.ctype == "LL/RAMP")
                    && !string.IsNullOrWhiteSpace(container.onrdate))
                || (alertNo == 10 && !string.IsNullOrWhiteSpace(container.lfdcust) && !string.IsNullOrWhiteSpace(container.gateoutdate))
                || (alertNo == 12 && !string.IsNullOrWhiteSpace(container.empretdate) && !string.IsNullOrWhiteSpace(container.gateoutdate))
                || (alertNo == 13
                    && container.ctype == "CY/CY"
                    && !string.IsNullOrWhiteSpace(container.discdate)
                    && !string.IsNullOrWhiteSpace(container.lfdcust)
                    && !string.IsNullOrWhiteSpace(container.gateoutdate)
                    && !string.IsNullOrWhiteSpace(container.empretdate))
                || (alertNo == 13
                    && container.ctype == "CY/DOOR"
                    && !string.IsNullOrWhiteSpace(container.discdate)
                    && !string.IsNullOrWhiteSpace(container.lfdcust)
                    && !string.IsNullOrWhiteSpace(container.gateoutdate)
                    && !string.IsNullOrWhiteSpace(container.etadoor1)
                    && !string.IsNullOrWhiteSpace(container.appttime)
                    && !string.IsNullOrWhiteSpace(container.etadoor2)
                    && !string.IsNullOrWhiteSpace(container.empretdate))
                || (alertNo == 13
                    && container.ctype == "CY/RAMP"
                    && !string.IsNullOrWhiteSpace(container.discdate)
                    && !string.IsNullOrWhiteSpace(container.onrdate)
                    && !string.IsNullOrWhiteSpace(container.rampdate1)
                    && !string.IsNullOrWhiteSpace(container.rampdate2)
                    && !string.IsNullOrWhiteSpace(container.lfdcust)
                    && !string.IsNullOrWhiteSpace(container.gateoutdate)
                    && !string.IsNullOrWhiteSpace(container.empretdate))
                || (alertNo == 13
                    && container.ctype == "CY/IPI/DOOR"
                    && !string.IsNullOrWhiteSpace(container.discdate)
                    && !string.IsNullOrWhiteSpace(container.onrdate)
                    && !string.IsNullOrWhiteSpace(container.rampdate1)
                    && !string.IsNullOrWhiteSpace(container.rampdate2)
                    && !string.IsNullOrWhiteSpace(container.lfdcust)
                    && !string.IsNullOrWhiteSpace(container.gateoutdate)
                    && !string.IsNullOrWhiteSpace(container.etadoor1)
                    && !string.IsNullOrWhiteSpace(container.appttime)
                    && !string.IsNullOrWhiteSpace(container.etadoor2)
                    && !string.IsNullOrWhiteSpace(container.empretdate))
                )
            {

                using (var sqlCommand = new SqlCommand($"UPDATE shipment SET alert{alertNo.ToString("00")}=@2 WHERE uuid=@1" + (alertNo == 13 ? " AND alert15=1" : ""), connection))
                {
                    var alertValue = 1;

                    if (alertNo == 3)
                    {
                        alertValue = container.cusrel;
                    }
                    else if (alertNo == 4)
                    {
                        alertValue = container.exam;
                    }
                    else if (alertNo == 7)
                    {
                        alertValue = string.IsNullOrWhiteSpace(container.onrdate) ? 0 : 1;
                    }
                    else if (alertNo == 9)
                    {
                        alertValue = !string.IsNullOrWhiteSpace(container.pickno) ? 0 : 1;
                    }

                    sqlCommand.Parameters.AddRange(new SqlParameter[] {
                                new SqlParameter( "@1", container.uuid )
                                , new SqlParameter( "@2", alertValue)
                            });

                    sqlCommand.ExecuteNonQuery();
                }
            }
        }

        private string GetPurchaseOrderNo(string sqId, string poNo, string custId)
        {
            try
            {
                string sql = $@"
                SELECT 
                       (
                           RTRIM(
                               ISNULL(custid, '') + ' - ' +
                               ISNULL(custname, '') + ' - ' +
                               ISNULL(pono, '') + ' - ' +
                               ISNULL(CONVERT(varchar(10), podate, 23), '') + ' - ' +
                               ISNULL(destname, '') + ' - ' +
                               ISNULL(consname, '') + ' - ' +
                               ISNULL(suppname, '')
                           )
                       ) AS str,
                       pono,
                       consid,
                       consname,
                       consref,
                       suppid,
                       suppname,
                       suppref,
                       destcode,
                       destname
                FROM exppo
                WHERE custid = @custid
                AND (
                        pono LIKE @pono
                     OR destcode LIKE @pono
                     OR consref LIKE @pono
                     OR enduserref LIKE @pono
                     OR suppref LIKE @pono
                    );";

                List<ExppoDB> results = new List<ExppoDB>();

                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings[sqId].ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@custid", custId);
                    cmd.Parameters.AddWithValue("@pono", $"%{poNo}%");

                    conn.Open();

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            ExppoDB item = new ExppoDB
                            {
                                str = reader["str"]?.ToString(),
                                pono = reader["pono"]?.ToString(),
                                consid = reader["consid"]?.ToString(),
                                consname = reader["consname"]?.ToString(),
                                consref = reader["consref"]?.ToString(),
                                suppid = reader["suppid"]?.ToString(),
                                suppname = reader["suppname"]?.ToString(),
                                suppref = reader["suppref"]?.ToString(),
                                destcode = reader["destcode"]?.ToString(),
                                destname = reader["destname"]?.ToString(),
                            };
                            results.Add(item);
                        }
                    }
                }

                return (new JavaScriptSerializer().Serialize(results));
            }
            catch (SqlException ex)
            {
                return $"SQL Error: {ex.Message}";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }

        /* will update using IronXL later
		private bool ImportSection321(string sqid, string custid, string FilePath)
		{
			SqlConnection sqlConnection = new SqlConnection(ConfigurationManager.ConnectionStrings[sqid].ConnectionString);
			sqlConnection.Open();


			string sqlQuery = "SELECT * FROM section321profile WHERE custid='" + custid + "'"; ;
			SqlCommand cmd = new SqlCommand(sqlQuery, sqlConnection);

			Section321Profile profile = new Section321Profile();

			Boolean hasProfile = false;

			using (SqlDataReader rdr = cmd.ExecuteReader())
			{
				if (rdr.HasRows)
				{
					rdr.Read(); // get the first row
					profile.siteid = rdr["siteid"].ToString();
					profile.airpoul = rdr["airpoul"].ToString();
					profile.airoriginator = rdr["airoriginator"].ToString();
					profile.pfx = rdr["pfx"].ToString();
					profile.awb = rdr["awb"].ToString();
					profile.hawb = rdr["hawb"].ToString();
					profile.mawbindicator = rdr["mawbindicator"].ToString();
					profile.airoriginpol = rdr["airoriginpol"].ToString();
					profile.pcs = rdr["pcs"].ToString();
					profile.wt = rdr["wt"].ToString();
					profile.wtcode = rdr["wtcode"].ToString();
					profile.commodity = rdr["commodity"].ToString();
					profile.fdaindicator = rdr["fdaindicator"].ToString();
					profile.airiata = rdr["airiata"].ToString();
					profile.flightno = rdr["flightno"].ToString();
					profile.arrivaldate = rdr["arrivaldate"].ToString();
					profile.arrivalday = rdr["arrivalday"].ToString();
					profile.arrivalmonth = rdr["arrivalmonth"].ToString();
					profile.shipname = rdr["shipname"].ToString();
					profile.shipadd1 = rdr["shipadd1"].ToString();
					profile.shipcity = rdr["shipcity"].ToString();
					profile.shipst = rdr["shipst"].ToString();
					profile.shipzip = rdr["shipzip"].ToString();
					profile.shipiso = rdr["shipiso"].ToString();
					profile.shipph = rdr["shipph"].ToString();
					profile.consname = rdr["consname"].ToString();
					profile.consadd1 = rdr["consadd1"].ToString();
					profile.conscity = rdr["conscity"].ToString();
					profile.consst = rdr["consst"].ToString();
					profile.conszip = rdr["conszip"].ToString();
					profile.consiso = rdr["consiso"].ToString();
					profile.consph = rdr["consph"].ToString();
					profile.amendflag = rdr["amendflag"].ToString();
					profile.amendcode = rdr["amendcode"].ToString();
					profile.amendreason = rdr["amendreason"].ToString();
					profile.ptppoul = rdr["ptppoul"].ToString();
					profile.ptpdate = rdr["ptpdate"].ToString();
					profile.ptpday = rdr["ptpday"].ToString();
					profile.ptpmonth = rdr["ptpmonth"].ToString();
					profile.boardpcs = rdr["boardpcs"].ToString();
					profile.boardwt = rdr["boardwt"].ToString();
					profile.splitno = rdr["splitno"].ToString();
					profile.brokercode = rdr["brokercode"].ToString();
					profile.inbonddestination = rdr["inbonddestination"].ToString();
					profile.inbonddestinationtype = rdr["inbonddestinationtype"].ToString();
					profile.bondedcarrierid = rdr["bondedcarrierid"].ToString();
					profile.onwardcarrier = rdr["onwardcarrier"].ToString();
					profile.bondedpremisesid = rdr["bondedpremisesid"].ToString();
					profile.inbondcontrolno = rdr["inbondcontrolno"].ToString();
					profile.entrytype = rdr["entrytype"].ToString();
					profile.entryno = rdr["entryno"].ToString();
					profile.commodityiso = rdr["commodityiso"].ToString();
					profile.commodityvalue = rdr["commodityvalue"].ToString();
					profile.commoditycurrency = rdr["commoditycurrency"].ToString();
					profile.commidityhts = rdr["commidityhts"].ToString();
					profile.expressrelease = rdr["expressrelease"].ToString();
					profile.trackingno = rdr["trackingno"].ToString();
					profile.seauom = rdr["seauom"].ToString();
					profile.seascac = rdr["seascac"].ToString();
					profile.seavessel = rdr["seavessel"].ToString();
					profile.seavoyage = rdr["seavoyage"].ToString();
					profile.seaflag = rdr["seaflag"].ToString();
					profile.seambl = rdr["seambl"].ToString();
					profile.seapor = rdr["seapor"].ToString();
					profile.seapol = rdr["seapol"].ToString();
					profile.seapoul = rdr["seapoul"].ToString();
					profile.seaeta = rdr["seaeta"].ToString();
					profile.seashipname = rdr["seashipname"].ToString();
					profile.seashipadd1 = rdr["seashipadd1"].ToString();
					profile.seashipcity = rdr["seashipcity"].ToString();
					profile.seaconsname = rdr["seaconsname"].ToString();
					profile.seaconsadd1 = rdr["seaconsadd1"].ToString();
					profile.seaconscity = rdr["seaconscity"].ToString();
					profile.seactnrno = rdr["seactnrno"].ToString();
					profile.seasealno = rdr["seasealno"].ToString();
					profile.seactnrcode = rdr["seactnrcode"].ToString();
					profile.seactnrlen = rdr["seactnrlen"].ToString();
					profile.seactnrstatus = rdr["seactnrstatus"].ToString();
					profile.seactnrsvc = rdr["seactnrsvc"].ToString();
					profile.seamarks = rdr["seamarks"].ToString();
					profile.seataxidtype = rdr["seataxidtype"].ToString();
					profile.seataxid = rdr["seataxid"].ToString();
					profile.seaconsolname = rdr["seaconsolname"].ToString();
					profile.seaconsoladd1 = rdr["seaconsoladd1"].ToString();
					profile.seaconsolcity = rdr["seaconsolcity"].ToString();
					profile.seaconsoliso = rdr["seaconsoliso"].ToString();
					profile.seastuffname = rdr["seastuffname"].ToString();
					profile.seastuffadd1 = rdr["seastuffadd1"].ToString();
					profile.seastuffcity = rdr["seastuffcity"].ToString();
					profile.seastuffiso = rdr["seastuffiso"].ToString();
					profile.seasubtype = rdr["seasubtype"].ToString();

					hasProfile = true;
				}
			}

			if (!hasProfile) return false;

			Excel.Application xlApp = new Excel.Application();
			Excel.Workbook xlWorkbook = xlApp.Workbooks.Open(FilePath);

			Excel._Worksheet xlWorksheet = xlWorkbook.Sheets[1];
			Excel.Range xlRange = xlWorksheet.UsedRange;
			int rowCount = xlRange.Rows.Count;
			string[] intColumns = { "pcs", "boardpcs", "boardwt", "commodityvalue", "seactnrlen" };
			string[] floatColumns = { "wt" };
			try
			{

				for (int i = 2; i <= 10; i++)
				{

					Section321 section = new Section321();
					PropertyInfo[] properties = typeof(Section321).GetProperties();
					foreach (PropertyInfo property in properties)
					{
						string field = property.Name;
						var prop = profile.GetType().GetProperty(field);
						string column = prop.GetValue(profile).ToString();
						string digits = new String(column.SkipWhile(c => !Char.IsDigit(c)).TakeWhile(Char.IsDigit).ToArray());
						int rowNumber = i;
						string columnName = column;
						if (digits.Length > 0)
						{
							int pos = column.IndexOf(digits);
							columnName = column.Substring(0, pos);
							rowNumber = Int32.Parse(column.Substring(pos));
						}
						if (columnName.Length > 0)
						{
							if (xlWorksheet.Cells[rowNumber, columnName] != null && xlWorksheet.Cells[rowNumber, columnName].Value2 != null)
							{
								string value = xlWorksheet.Cells[rowNumber, columnName].Value2.ToString();
								if (intColumns.Contains(field))
									property.SetValue(section, Int32.Parse(value));
								else if (floatColumns.Contains(field))
									property.SetValue(section, float.Parse(value));
								else
									property.SetValue(section, value);
							}
						}

					}


					sqlQuery = "insert into section321(siteid, airpoul, airoriginator, pfx, awb, hawb, mawbindicator, airoriginpol, pcs, wt, wtcode, commodity, fdaindicator, airiata, flightno, arrivaldate, arrivalday, arrivalmonth, shipname, shipadd1, shipcity, shipst, shipzip, shipiso, shipph, consname, consadd1, conscity, consst, conszip, consiso, consph, amendflag, amendcode, amendreason, ptppoul, ptpdate, ptpday, ptpmonth, boardpcs, boardwt, splitno, brokercode, inbonddestination, inbonddestinationtype, bondedcarrierid, onwardcarrier, bondedpremisesid, inbondcontrolno, entrytype, entryno, commodityiso, commodityvalue, commoditycurrency, commidityhts, expressrelease, trackingno, seauom, seascac, seavessel, seavoyage, seaflag, seambl, seapor, seapol, seapoul, seaeta, seashipname, seashipadd1, seashipcity, seaconsname, seaconsadd1, seaconscity, seactnrno, seasealno, seactnrcode, seactnrlen, seactnrstatus, seactnrsvc, seamarks, seataxidtype, seataxid, seaconsolname, seaconsoladd1, seaconsolcity, seaconsoliso, seastuffname, seastuffadd1, seastuffcity, seastuffiso, seasubtype)" +
					   " values(@siteid, @airpoul, @airoriginator, @pfx, @awb, @hawb, @mawbindicator, @airoriginpol, @pcs, @wt, @wtcode, @commodity, @fdaindicator, @airiata, @flightno, @arrivaldate, @arrivalday, @arrivalmonth, @shipname, @shipadd1, @shipcity, @shipst, @shipzip, @shipiso, @shipph, @consname, @consadd1, @conscity, @consst, @conszip, @consiso, @consph, @amendflag, @amendcode, @amendreason, @ptppoul, @ptpdate, @ptpday, @ptpmonth, @boardpcs, @boardwt, @splitno, @brokercode, @inbonddestination, @inbonddestinationtype, @bondedcarrierid, @onwardcarrier, @bondedpremisesid, @inbondcontrolno, @entrytype, @entryno, @commodityiso, @commodityvalue, @commoditycurrency, @commidityhts, @expressrelease, @trackingno, @seauom, @seascac, @seavessel, @seavoyage, @seaflag, @seambl, @seapor, @seapol, @seapoul, @seaeta, @seashipname, @seashipadd1, @seashipcity, @seaconsname, @seaconsadd1, @seaconscity, @seactnrno, @seasealno, @seactnrcode, @seactnrlen, @seactnrstatus, @seactnrsvc, @seamarks, @seataxidtype, @seataxid, @seaconsolname, @seaconsoladd1, @seaconsolcity, @seaconsoliso, @seastuffname, @seastuffadd1, @seastuffcity, @seastuffiso, @seasubtype)";

					SqlCommand insert = new SqlCommand(sqlQuery, sqlConnection);
					insert.Parameters.AddWithValue("@siteid", section.siteid);
					insert.Parameters.AddWithValue("@airpoul", section.airpoul);
					insert.Parameters.AddWithValue("@airoriginator", section.airoriginator);
					insert.Parameters.AddWithValue("@pfx", section.pfx);
					insert.Parameters.AddWithValue("@awb", section.awb);
					insert.Parameters.AddWithValue("@hawb", section.hawb);
					insert.Parameters.AddWithValue("@mawbindicator", section.mawbindicator);
					insert.Parameters.AddWithValue("@airoriginpol", section.airoriginpol);
					insert.Parameters.AddWithValue("@pcs", section.pcs);
					insert.Parameters.AddWithValue("@wt", section.wt);
					insert.Parameters.AddWithValue("@wtcode", section.wtcode);
					insert.Parameters.AddWithValue("@commodity", section.commodity);
					insert.Parameters.AddWithValue("@fdaindicator", section.fdaindicator);
					insert.Parameters.AddWithValue("@airiata", section.airiata);
					insert.Parameters.AddWithValue("@flightno", section.flightno);
					insert.Parameters.AddWithValue("@arrivaldate", section.arrivaldate);
					insert.Parameters.AddWithValue("@arrivalday", section.arrivalday);
					insert.Parameters.AddWithValue("@arrivalmonth", section.arrivalmonth);
					insert.Parameters.AddWithValue("@shipname", section.shipname);
					insert.Parameters.AddWithValue("@shipadd1", section.shipadd1);
					insert.Parameters.AddWithValue("@shipcity", section.shipcity);
					insert.Parameters.AddWithValue("@shipst", section.shipst);
					insert.Parameters.AddWithValue("@shipzip", section.shipzip);
					insert.Parameters.AddWithValue("@shipiso", section.shipiso);
					insert.Parameters.AddWithValue("@shipph", section.shipph);
					insert.Parameters.AddWithValue("@consname", section.consname);
					insert.Parameters.AddWithValue("@consadd1", section.consadd1);
					insert.Parameters.AddWithValue("@conscity", section.conscity);
					insert.Parameters.AddWithValue("@consst", section.consst);
					insert.Parameters.AddWithValue("@conszip", section.conszip);
					insert.Parameters.AddWithValue("@consiso", section.consiso);
					insert.Parameters.AddWithValue("@consph", section.consph);
					insert.Parameters.AddWithValue("@amendflag", section.amendflag);
					insert.Parameters.AddWithValue("@amendcode", section.amendcode);
					insert.Parameters.AddWithValue("@amendreason", section.amendreason);
					insert.Parameters.AddWithValue("@ptppoul", section.ptppoul);
					insert.Parameters.AddWithValue("@ptpdate", section.ptpdate);
					insert.Parameters.AddWithValue("@ptpday", section.ptpday);
					insert.Parameters.AddWithValue("@ptpmonth", section.ptpmonth);
					insert.Parameters.AddWithValue("@boardpcs", section.boardpcs);
					insert.Parameters.AddWithValue("@boardwt", section.boardwt);
					insert.Parameters.AddWithValue("@splitno", section.splitno);
					insert.Parameters.AddWithValue("@brokercode", section.brokercode);
					insert.Parameters.AddWithValue("@inbonddestination", section.inbonddestination);
					insert.Parameters.AddWithValue("@inbonddestinationtype", section.inbonddestinationtype);
					insert.Parameters.AddWithValue("@bondedcarrierid", section.bondedcarrierid);
					insert.Parameters.AddWithValue("@onwardcarrier", section.onwardcarrier);
					insert.Parameters.AddWithValue("@bondedpremisesid", section.bondedpremisesid);
					insert.Parameters.AddWithValue("@inbondcontrolno", section.inbondcontrolno);
					insert.Parameters.AddWithValue("@entrytype", section.entrytype);
					insert.Parameters.AddWithValue("@entryno", section.entryno);
					insert.Parameters.AddWithValue("@commodityiso", section.commodityiso);
					insert.Parameters.AddWithValue("@commodityvalue", section.commodityvalue);
					insert.Parameters.AddWithValue("@commoditycurrency", section.commoditycurrency);
					insert.Parameters.AddWithValue("@commidityhts", section.commidityhts);
					insert.Parameters.AddWithValue("@expressrelease", section.expressrelease);
					insert.Parameters.AddWithValue("@trackingno", section.trackingno);
					insert.Parameters.AddWithValue("@seauom", section.seauom);
					insert.Parameters.AddWithValue("@seascac", section.seascac);
					insert.Parameters.AddWithValue("@seavessel", section.seavessel);
					insert.Parameters.AddWithValue("@seavoyage", section.seavoyage);
					insert.Parameters.AddWithValue("@seaflag", section.seaflag);
					insert.Parameters.AddWithValue("@seambl", section.seambl);
					insert.Parameters.AddWithValue("@seapor", section.seapor);
					insert.Parameters.AddWithValue("@seapol", section.seapol);
					insert.Parameters.AddWithValue("@seapoul", section.seapoul);
					insert.Parameters.AddWithValue("@seaeta", section.seaeta);
					insert.Parameters.AddWithValue("@seashipname", section.seashipname);
					insert.Parameters.AddWithValue("@seashipadd1", section.seashipadd1);
					insert.Parameters.AddWithValue("@seashipcity", section.seashipcity);
					insert.Parameters.AddWithValue("@seaconsname", section.seaconsname);
					insert.Parameters.AddWithValue("@seaconsadd1", section.seaconsadd1);
					insert.Parameters.AddWithValue("@seaconscity", section.seaconscity);
					insert.Parameters.AddWithValue("@seactnrno", section.seactnrno);
					insert.Parameters.AddWithValue("@seasealno", section.seasealno);
					insert.Parameters.AddWithValue("@seactnrcode", section.seactnrcode);
					insert.Parameters.AddWithValue("@seactnrlen", section.seactnrlen);
					insert.Parameters.AddWithValue("@seactnrstatus", section.seactnrstatus);
					insert.Parameters.AddWithValue("@seactnrsvc", section.seactnrsvc);
					insert.Parameters.AddWithValue("@seamarks", section.seamarks);
					insert.Parameters.AddWithValue("@seataxidtype", section.seataxidtype);
					insert.Parameters.AddWithValue("@seataxid", section.seataxid);
					insert.Parameters.AddWithValue("@seaconsolname", section.seaconsolname);
					insert.Parameters.AddWithValue("@seaconsoladd1", section.seaconsoladd1);
					insert.Parameters.AddWithValue("@seaconsolcity", section.seaconsolcity);
					insert.Parameters.AddWithValue("@seaconsoliso", section.seaconsoliso);
					insert.Parameters.AddWithValue("@seastuffname", section.seastuffname);
					insert.Parameters.AddWithValue("@seastuffadd1", section.seastuffadd1);
					insert.Parameters.AddWithValue("@seastuffcity", section.seastuffcity);
					insert.Parameters.AddWithValue("@seastuffiso", section.seastuffiso);
					insert.Parameters.AddWithValue("@seasubtype", section.seasubtype);
					insert.ExecuteNonQuery();

					totalRows += 1;
				}
			}
			catch (Exception err)
			{
				CloseExcel(xlWorkbook, xlApp);
				throw new ApplicationException(err.Message);
			}
			finally
			{
				if (sqlConnection != null)
					sqlConnection.Close();
			}

			CloseExcel(xlWorkbook, xlApp);
			return true;
		}

		private void CloseExcel(Excel.Workbook xlWorkbook, Excel.Application xlApp)
		{
			GC.Collect();
			GC.WaitForPendingFinalizers();

			//close and release
			xlWorkbook.Close();
			Marshal.ReleaseComObject(xlWorkbook);

			//quit and release
			xlApp.Quit();
			Marshal.ReleaseComObject(xlApp);
		}
		*/
        #endregion

    }

    public class Vessel
    {
        public string vessel
        {
            get; set;
        }
        public string imo
        {
            get; set;
        }
        public string flag
        {
            get; set;
        }
        public string callsign
        {
            get; set;
        }
        public string opscode
        {
            get; set;
        }
    }

    public class ArCode
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string arcr
        {
            get; set;
        }
        public string apdb
        {
            get; set;
        }
        public string apcode
        {
            get; set;
        }
        public string apname
        {
            get; set;
        }
        public string dbpost
        {
            get; set;
        }
        public string dbpostname
        {
            get; set;
        }
        public string crpost
        {
            get; set;
        }
        public string crpostname
        {
            get; set;
        }
        public string dbwip
        {
            get; set;
        }
        public string dbwipname
        {
            get; set;
        }
        public string crwip
        {
            get; set;
        }
        public string crwipname
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class ApCode
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string dbpost
        {
            get; set;
        }
        public string dbpostname
        {
            get; set;
        }
        public string crpost
        {
            get; set;
        }
        public string crpostname
        {
            get; set;
        }
        public string dbaccr
        {
            get; set;
        }
        public string dbaccrname
        {
            get; set;
        }
        public string craccr
        {
            get; set;
        }
        public string craccrname
        {
            get; set;
        }
    }

    public class Uncode
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string iso
        {
            get; set;
        }
        public string isoname
        {
            get; set;
        }
        public string schdair
        {
            get; set;
        }
        public string schdocn
        {
            get; set;
        }
        public string schk
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class VslCode
    {
        public string stationid
        {
            get; set;
        }
        public string vslcode
        {
            get; set;
        }
        public string vtype
        {
            get; set;
        }
        public string sailid
        {
            get; set;
        }
        public string scac1
        {
            get; set;
        }
        public string imo1
        {
            get; set;
        }
        public string vessel1
        {
            get; set;
        }
        public string flag1
        {
            get; set;
        }
        public string voyage1
        {
            get; set;
        }
        public string imo2
        {
            get; set;
        }
        public string vessel2
        {
            get; set;
        }
        public string flag2
        {
            get; set;
        }
        public string voyage2
        {
            get; set;
        }
        public string polcode
        {
            get; set;
        }
        public string polname
        {
            get; set;
        }
        public string obdate
        {
            get; set;
        }
        public string etd
        {
            get; set;
        }
        public string atd
        {
            get; set;
        }
        public string etd3
        {
            get; set;
        }
        public string poulcode
        {
            get; set;
        }
        public string poulname
        {
            get; set;
        }
        public string eta
        {
            get; set;
        }
        public string ata
        {
            get; set;
        }
        public string eta3
        {
            get; set;
        }
        public string vweek
        {
            get; set;
        }
        public string vyear
        {
            get; set;
        }
        public string transcode
        {
            get; set;
        }
        public string transname
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Glacct
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Sed
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string uom1
        {
            get; set;
        }
        public string uom2
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Schd
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Schk
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string country
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class CodeType
    {
        public string code
        {
            get; set;
        }
        public string expand
        {
            get; set;
        }
        public string iso
        {
            get; set;
        }
        public string edi01
        {
            get; set;
        }
        public string edi02
        {
            get; set;
        }
    }

    public class ClauseType
    {
        public string id
        {
            get; set;
        }
        public string clause
        {
            get; set;
        }
        public string clstype
        {
            get; set;
        }
        public string iso
        {
            get; set;
        }
    }

    public class RateListType
    {
        public string uuid
        {
            get; set;
        }
        public string ratetype
        {
            get; set;
        }
        public string ratepfx
        {
            get; set;
        }
        public string rateid
        {
            get; set;
        }
        public string tariffno
        {
            get; set;
        }
        public string ratestr
        {
            get; set;
        }

    }


    public class Contact
    {
        public string custname { get; set; }
        public string custid { get; set; }
        public string addr1 { get; set; }
        public string addr2 { get; set; }
        public string addr3 { get; set; }
        public string city { get; set; }
        public string state { get; set; }
        public string zip { get; set; }
        public string iso { get; set; }
        public string country { get; set; }
        public string phone1 { get; set; }
        public string email1 { get; set; }
        public string contact1 { get; set; }
        public string ein { get; set; }
        public string str { get; set; }
        public string erp01 { get; set; }
        public string erp02 { get; set; }
        public string firms { get; set; }
        public string rep1 { get; set; }
        public string terms { get; set; }
        public string csr { get; set; }
        public string destop { get; set; }
        public string usisf { get; set; }
        public string billid { get; set; }
        public string billname { get; set; }
        public string prefix { get; set; }
        public string iata { get; set; }
    }


    public class Station2
    {
        public string compname
        {
            get; set;
        }
        public string compid
        {
            get; set;
        }
        public string compcity
        {
            get; set;
        }
        public string kln
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Destination2
    {
        public string expand
        {
            get; set;
        }
        public string code
        {
            get; set;
        }
        public string shipname
        {
            get; set;
        }
        public string consname
        {
            get; set;
        }
        public string polname
        {
            get; set;
        }
        public string poulname
        {
            get; set;
        }
        public string apolname
        {
            get; set;
        }
        public string apoulname
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class LotNo
    {
        public string manifest
        {
            get; set;
        }
        public string mbl
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class Item
    {
        public string expand
        {
            get; set;
        }
        public string code
        {
            get; set;
        }
        public string schbcode
        {
            get; set;
        }
        public string schbdesc
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }
    public class OGctnr
    {
        public string ctnrtype
        {
            get; set;
        }
        public string ctnrno
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }
    public class IGctnr
    {
        public string ctnrtype
        {
            get; set;
        }
        public string ctnrno
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class SearchNo
    {
        public string no
        {
            get; set;
        }
        public string str
        {
            get; set;
        }
    }

    public class CtnrlistType
    {
        public string uuid
        {
            get; set;
        }
        public string ctnrno
        {
            get; set;
        }
        public string ctnrsize
        {
            get; set;
        }
    }

    public class WebFile
    {
        public string id
        {
            get; set;
        }
        public string name
        {
            get; set;
        }
        public string ext
        {
            get; set;
        }
        public string quote
        {
            get; set;
        }
        public string content
        {
            get; set;
        }
        public string customerview
        {
            get; set;
        }
        public string documenttype
        {
            get; set;
        }
        public string uploaddate
        {
            get; set;
        }
        public byte[] byteContent
        {
            get; set;
        }
    }

    public class LabelType
    {
        public string id
        {
            get; set;
        }
        public string name
        {
            get; set;
        }
        public string printer
        {
            get; set;
        }
        public string height
        {
            get; set;
        }
        public string width
        {
            get; set;
        }
        public string uom
        {
            get; set;
        }
        public string orientation
        {
            get; set;
        }
    }

    public class ContainerType
    {
        public string ctnrno
        {
            get; set;
        }
        public string uuid
        {
            get; set;
        }
        public string cusrel
        {
            get; set;
        }
        public string exam
        {
            get; set;
        }
        public string pickno
        {
            get; set;
        }
        public string discdate
        {
            get; set;
        }
        public string tapptdate
        {
            get; set;
        }
        public string tappttime
        {
            get; set;
        }
        public string onrdate
        {
            get; set;
        }
        public string rampdate1
        {
            get; set;
        }
        public string rampdate2
        {
            get; set;
        }
        public string lfdcust
        {
            get; set;
        }
        public string gateoutdate
        {
            get; set;
        }
        public string pdlfd
        {
            get; set;
        }
        public string etadoor1
        {
            get; set;
        }
        public string etadoor2
        {
            get; set;
        }
        public string apptdate
        {
            get; set;
        }
        public string appttime
        {
            get; set;
        }
        public string empretdate
        {
            get; set;
        }

        public string socsent { get; set; }
        public string socgrecv { get; set; }
    }

    public class ContainerTypeEx
    {
        public string ctnrno
        {
            get; set;
        }
        public string uuid
        {
            get; set;
        }
        public int cusrel
        {
            get; set;
        }
        public int exam
        {
            get; set;
        }
        public string pickno
        {
            get; set;
        }
        public string discdate
        {
            get; set;
        }
        public string tapptdate
        {
            get; set;
        }
        public string tappttime
        {
            get; set;
        }
        public string onrdate
        {
            get; set;
        }
        public string rampdate1
        {
            get; set;
        }
        public string rampdate2
        {
            get; set;
        }
        public string lfdcust
        {
            get; set;
        }
        public string gateoutdate
        {
            get; set;
        }
        public string pdlfd
        {
            get; set;
        }
        public string etadoor1
        {
            get; set;
        }
        public string etadoor2
        {
            get; set;
        }
        public string apptdate
        {
            get; set;
        }
        public string appttime
        {
            get; set;
        }
        public string empretdate
        {
            get; set;
        }
        public string ctype
        {
            get; set;
        }
        public string socsent { get; set; }
        public string socgrecv { get; set; }
    }

    public class CurrencyType
    {
        public string code
        {
            get; set;
        }
        public string exrate
        {
            get; set;
        }
    }

    public class DoHelpType
    {
        public string doid
        {
            get; set;
        }
        public string delvst
        {
            get; set;
        }
        public string locid
        {
            get; set;
        }
        public string locname
        {
            get; set;
        }
        public string dolocid
        {
            get; set;
        }
        public string dolocname
        {
            get; set;
        }
        public string delvid
        {
            get; set;
        }
        public string delvname
        {
            get; set;
        }
        public string delvadd1
        {
            get; set;
        }
        public string delvadd2
        {
            get; set;
        }
        public string delvadd3
        {
            get; set;
        }
        public string delvcity
        {
            get; set;
        }
        public string delvzip
        {
            get; set;
        }
        public string delviso
        {
            get; set;
        }
        public string delvcont
        {
            get; set;
        }
        public string delvph
        {
            get; set;
        }
        public string delvemail
        {
            get; set;
        }
        public string precarrid
        {
            get; set;
        }
        public string precarrname
        {
            get; set;
        }
        public string precarrcont
        {
            get; set;
        }
        public string precarrph
        {
            get; set;
        }
        public string precarrph2
        {
            get; set;
        }
        public string precarremail
        {
            get; set;
        }
        public string docomment
        {
            get; set;
        }
    }

    public class RevenueType
    {
        public string uuid
        {
            get; set;
        }
        public string txtype
        {
            get; set;
        }
        public string rtype
        {
            get; set;
        }
        public string ppd
        {
            get; set;
        }
        public string billid
        {
            get; set;
        }
        public string billname
        {
            get; set;
        }
        public string vendid
        {
            get; set;
        }
        public string vendname
        {
            get; set;
        }
        public string vendref
        {
            get; set;
        }
        public string glacct
        {
            get; set;
        }
        public string arglcode
        {
            get; set;
        }
        public string apglcode
        {
            get; set;
        }
        public string arcode
        {
            get; set;
        }
        public string apcode
        {
            get; set;
        }
        public string ardesc
        {
            get; set;
        }
        public string apdesc
        {
            get; set;
        }
        public string arnote
        {
            get; set;
        }
        public string apnote
        {
            get; set;
        }
        public string note1
        {
            get; set;
        }
        public string note2
        {
            get; set;
        }
        public string uom
        {
            get; set;
        }
        public string ctnrno
        {
            get; set;
        }
        public string qty
        {
            get; set;
        }
        public string curr
        {
            get; set;
        }
        public string rate
        {
            get; set;
        }
        public string exrate
        {
            get; set;
        }
        public decimal exrateN
        {
            get; set;
        }
        public string amt
        {
            get; set;
        }
        public string basicamt
        {
            get; set;
        }
        public string amtpp
        {
            get; set;
        }
        public string costpp
        {
            get; set;
        }
        public string adddesc
        {
            get; set;
        }
        public string currency
        {
            get; set;
        }
        public string provisional
        {
            get; set;
        }
        public string taxinvno
        {
            get; set;
        }
        public string taxinvdate
        {
            get; set;
        }
        public string cost
        {
            get; set;
        }
        public string genmethod
        {
            get; set;
        }
        public string invno
        {
            get; set;
        }
        public string vref
        {
            get; set;
        }
        public string arrls
        {
            get; set;
        }
        public string aprls
        {
            get; set;
        }
        public string invdate
        {
            get; set;
        }
        public string venddate
        {
            get; set;
        }
        public string terms
        {
            get; set;
        }
        public string duedate
        {
            get; set;
        }
        public string amtpaid
        {
            get; set;
        }
        public string amtrecv
        {
            get; set;
        }
        public string pydate
        {
            get; set;
        }
        public string custref
        {
            get; set;
        }
        public string custnote
        {
            get; set;
        }
        public string ourref
        {
            get; set;
        }
        public string lastuser
        {
            get; set;
        }
        public string lastdate
        {
            get; set;
        }
        public string adduser
        {
            get; set;
        }
        public string adddate
        {
            get; set;
        }
        public string verifyby
        {
            get; set;
        }
        public string verifytime
        {
            get; set;
        }
        public string jeno
        {
            get; set;
        }
        public string arpost
        {
            get; set;
        }
        public string appost
        {
            get; set;
        }
        public string detid
        {
            get; set;
        }
        public string voucherno
        {
            get; set;
        }
        public string inv1
        {
            get; set;
        }
        public string voucher1
        {
            get; set;
        }
        public string shipmentno
        {
            get; set;
        }
        public string stationid
        {
            get; set;
        }
        public string mbl
        {
            get; set;
        }
        public string hbl
        {
            get; set;
        }
        public string manifest
        {
            get; set;
        }
        public string dettype
        {
            get; set;
        }
        public int perc
        {
            get; set;
        }
        public string basecurrency
        {
            get; set;
        }

        public bool isReleaseCleared
        {
            get; set;
        }
    }


    public class Revenue
    {
        public string uuid { get; set; }
        public string txtype { get; set; }
        public string rtype { get; set; }
        public string amtpp { get; set; }
        public string custid { get; set; }
        public string custname { get; set; }
        public string glacct { get; set; }
        public string arcode { get; set; }
        public string ardesc { get; set; }
        public string adddesc { get; set; }
        public string uom { get; set; }
        public string ctnrno { get; set; }
        public decimal qty { get; set; }
        public string currency { get; set; }
        public decimal rate { get; set; }
        public decimal? exrate { get; set; }
        public decimal amt { get; set; }
        public string genmethod { get; set; }
        public string invno { get; set; }
        public int release { get; set; }
        public DateTime invdateDb { get; set; }
        public string invdate { get; set; }
        public string terms { get; set; }
        public DateTime duedateDb { get; set; }
        public string duedate { get; set; }
        public decimal amtpaid { get; set; }
        public DateTime pydateDb { get; set; }
        public string pydate { get; set; }
        public string custref { get; set; }
        public string note1 { get; set; }
        public string lastuser { get; set; }
        public DateTime lastdateDb { get; set; }
        public string lastdate { get; set; }
        public string adduser { get; set; }
        public DateTime adddateDb { get; set; }
        public string adddate { get; set; }
        public int detid { get; set; }
        public string jeno => this.rtype + this.detid.ToString();
        public int arpost { get; set; }
        public int provisional { get; set; }
        public string taxinvno { get; set; }
        public string taxinvdate { get; set; }
        public string dettype { get; set; }
        public string costpp { get; set; }
        public string vendid { get; set; }
        public string vendname { get; set; }
        public string note2 { get; set; }
        public string uomc { get; set; }
        public decimal qtyc { get; set; }
        public string currencyc { get; set; }
        public decimal ratec { get; set; }
        public decimal? exratec { get; set; }
        public decimal cost { get; set; }
        public string vendref { get; set; }
        public DateTime venddateDb { get; set; }
        public string venddate { get; set; }
        public string ourref { get; set; }
        public string verifyby { get; set; }
        public DateTime verifytimeDb { get; set; }
        public string verifytime { get; set; }
        public int appost { get; set; }
        public string voucherno { get; set; }
        public decimal basicamt { get; set; }
        public bool isReleaseCleared { get; set; }
        public string inv1 { get; set; }
        public string db1 { get; set; }
        public string cr1 { get; set; }
        public string voucher1 { get; set; }
        public int arrel { get; set; }
        public string stationid { get; set; }
        public string mbl { get; set; }
        public string hbl { get; set; }
        public string manifest { get; set; }
        public int perc { get; set; }
        public string basecurrency { get; set; }
        public bool isOffset { get; set; }
        public int aprel { get; set; }
    }


    class ShipmentNotes
    {
        public int noteid { get; set; }
        public string notetype { get; set; }
        public string shipmentno { get; set; }
        public string freightrelease { get; set; }
        public string adduser { get; set; }
        public DateTime adddate { get; set; }
        public bool isLocked { get; set; }
        public string lockuser { get; set; }
        public DateTime lockdate { get; set; }
        public bool isVoided { get; set; }
        public string voiduser { get; set; }
        public DateTime voiddate { get; set; }
        public string lastuser { get; set; }
        public DateTime lastdate { get; set; }
    }


    class ContactsProfile
    {
        public string localname { get; set; }
        public string localadd1 { get; set; }
        public string localadd2 { get; set; }
        public string localadd3 { get; set; }
        public string localcity { get; set; }
        public string localst { get; set; }
        public string localzip { get; set; }
        public string localiso { get; set; }
        public string localtaxcode { get; set; }
        public string locallimit { get; set; }
        public string aracctcode { get; set; }
        public string apacctcode { get; set; }
        public string arterms { get; set; }
        public string apterms { get; set; }
        public string arbank { get; set; }
        public string apbank { get; set; }
        public string fsales { get; set; }
        public string stationid { get; set; }
        public string custid { get; set; }
        public string custname { get; set; }
        public string adduser { get; set; }
        public DateTime adddate { get; set; }
        public string lastuser { get; set; }
        public DateTime lastdate { get; set; }
        public int serialno { get; set; }
        public string user { get; set; }
    }


    class ContractData
    {
        public string expand { get; set; }
        public string contractnotes { get; set; }
    }


    class StationBank
    {
        public int serial { get; set; }
        public string compid { get; set; }
        public string compname { get; set; }
        public int bankid { get; set; }
        public int primarybank { get; set; }
        public string code { get; set; }
        public string expand { get; set; }
        public string aba { get; set; }
        public string swift { get; set; }
        public string addr1 { get; set; }
        public string currency { get; set; }
        public string adduser { get; set; }
        public DateTime? adddate { get; set; }
        public string lastuser { get; set; }
        public DateTime? lastdate { get; set; }
        public string glacct { get; set; }
        public string bankdesc { get; set; }


        public StationBank Set(DbDataReader reader)
        {
            expand = reader["expand"].ToString();
            aba = reader["aba"].ToString();
            bankid = Convert.ToInt32(reader["bankid"]);
            adddate = Convert.ToDateTime(reader["adddate"]);
            adduser = reader["adduser"].ToString();
            addr1 = reader["addr1"].ToString();
            bankdesc = reader["bankdesc"].ToString();
            code = reader["code"].ToString();
            compid = reader["compid"].ToString();
            compname = reader["compname"].ToString();
            currency = reader["currency"].ToString();
            glacct = reader["glacct"].ToString();
            lastdate = Convert.ToDateTime(reader["lastdate"]);
            lastuser = reader["lastuser"].ToString();
            primarybank = Convert.ToInt32(reader["primarybank"]);
            serial = Convert.ToInt32(reader["serial"]);
            swift = reader["swift"].ToString();

            return this;
        }
    }


    class ValidationException : Exception
    {
        public ValidationException(string message = null) : base(message)
        {
        }
    }

    class StationBankByStationId
    {
        public int bankid { get; set; }
        public string code { get; set; }
        public string expand { get; set; }

        public StationBankByStationId Set(DbDataReader reader)
        {
            expand = reader["expand"].ToString();
            bankid = Convert.ToInt32(reader["bankid"]);
            code = reader["code"].ToString();
            return this;
        }
    }

    class CsNotesDB
    {
        public string NoteId { get; set; }
        public string AddUser { get; set; }
        public string AddDate { get; set; }
        public string CsNotes { get; set; }
        public string Uuid { get; set; }
        public string Shipmentno { get; set; }
        public string LastUser { get; set; }
        public string LastDate { get; set; }
        public bool IsUpdate { get; set; } = false;
    }

    class ShipmentDB
    {
        public string Uuid { get; set; }
        public string Upduser { get; set; }
    }

    #region Shipment Data for Subject Email
    public class ShipmentRow
    {
        public string Hbl { get; set; }
        public string Mbl { get; set; }
        public string Eta3 { get; set; }
        public string ConsName { get; set; }
        public string ShipName { get; set; }
        public string PolName { get; set; }

        public string PolCode { get; set; }
        public string PoulName { get; set; }
        public string PoulCode { get; set; }

    }

    public class ContainerTotals
    {
        public decimal TotalQty { get; set; }
        public string Uom { get; set; }
        public string Ctnrno { get; set; }
    }

    public class ShipmentQueryResult
    {
        public List<ShipmentRow> Shipments { get; } = new List<ShipmentRow>();
        public List<string> Ponos { get; } = new List<string>();
        public ContainerTotals Totals { get; } = new ContainerTotals();
    }
    #endregion

    #region MRUPD.html
    public class ExppoDB
    {
        public string str { get; set; }
        public string pono { get; set; }
        public string destname { get; set; }
        public string consname { get; set; }
        public string suppname { get; set; }
        public string consid { get; set; }
        public string consref { get; set; }
        public string suppid { get; set; }
        public string suppref { get; set; }
        public string destcode { get; set; }
    }
    #endregion
}