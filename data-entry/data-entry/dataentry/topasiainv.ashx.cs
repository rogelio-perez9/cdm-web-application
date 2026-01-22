using Humanizer;
using PdfSharpCore.Drawing;
using PdfSharpCore.Fonts;
using PdfSharpCore.Pdf;
using Scriban;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Tasks = System.Threading.Tasks;

namespace Invoices
{

    public class Topasiainv : IHttpAsyncHandler
    {
        public bool IsReusable => false;

        public IAsyncResult BeginProcessRequest(HttpContext context, AsyncCallback callback, object state)
        {
            var task = ProcessRequestAsync(context);
            var tcs = new TaskCompletionSource<object>(state);

            task.ContinueWith(t =>
            {
                if (t.IsFaulted) tcs.TrySetException(t.Exception.InnerExceptions);
                else if (t.IsCanceled) tcs.TrySetCanceled();
                else tcs.TrySetResult(null);

                callback?.Invoke(tcs.Task);
            });

            return tcs.Task;
        }

        public void EndProcessRequest(IAsyncResult result)
        {
            ((Tasks.Task)result).GetAwaiter().GetResult();
        }

        public void ProcessRequest(HttpContext context)
        {
            throw new NotSupportedException("Synchronous processing is not supported.");
        }

        private async Tasks.Task ProcessRequestAsync(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;

            string sqId = request.QueryString["sqid"];
            string sqId2 = request.QueryString["sqid2"];
            string stationId = request.QueryString["stationid"];
            string uuId = request.QueryString["uuId"];
            string invno = request.QueryString["invno"];
            string currId = request.QueryString["currId"];
            int bank = int.Parse(Uri.UnescapeDataString(request.QueryString["bank"]));
            string terms = request.QueryString["terms"];
            string dateOnly = request.QueryString["dateonly"];
            string dateTime = request.QueryString["datetime"];
            string rawDateTime = request.QueryString["rawdatetime"];

            try
            {
                var saveSucceeded = await GetAllDataAsync(sqId, sqId2, uuId, stationId, invno, currId, bank, terms, dateOnly, dateTime, rawDateTime);

                if (saveSucceeded.pdfBytes == null || saveSucceeded.pdfBytes.Length == 0)
                {
                    response.StatusCode = 500;
                    response.ContentType = "application/json";
                    return;
                }

                
                response.Clear();
                response.ContentType = "application/pdf";

                
                string disposition = $"inline; filename=\"{SanitizeFileName(saveSucceeded.pdfFileName)}\"";
                response.AddHeader("X-Filename", Uri.EscapeDataString(saveSucceeded.pdfFileName));
                response.AddHeader("Access-Control-Expose-Headers", "X-Filename, Content-Disposition, Content-Type, Content-Length");
                response.AddHeader("Content-Length", saveSucceeded.pdfBytes.Length.ToString());
                response.AddHeader("X-Success", "true");

                await response.OutputStream.WriteAsync(saveSucceeded.pdfBytes, 0, saveSucceeded.pdfBytes.Length);
                response.Flush();
            }
            catch (Exception ex)
            {
                response.StatusCode = 500;
                response.ContentType = "application/json";
                response.Write($"{{ \"status\": \"error\", \"message\": \"{ex.Message}\" }}");
            }


        }

        public async Task<(byte[] pdfBytes, string pdfFileName)> GetAllDataAsync(string sqId, string sqId2, string uuId, string stationId, string invno, string currId, int bank, string terms, string dateOnly, string dateTime, string rawDateTime)
        {
            string connectionString = ConfigurationManager.ConnectionStrings[sqId]?.ConnectionString;
            string connectionStringCompliance = ConfigurationManager.ConnectionStrings[sqId2]?.ConnectionString;

            if (string.IsNullOrWhiteSpace(connectionString) || string.IsNullOrWhiteSpace(connectionStringCompliance))
                throw new InvalidOperationException("One or both connection strings are missing or invalid.");

            try
            {
                using (var sqlConnectionCompliance = new SqlConnection(connectionStringCompliance))
                {
                    try
                    {
                        await sqlConnectionCompliance.OpenAsync();

                        using (var sqlConnection = new SqlConnection(connectionString))
                        {
                            try
                            {
                                await sqlConnection.OpenAsync();

                                var stationProfileTask = GetStationProfileInfoAsync(sqlConnectionCompliance, stationId);
                                var customerTask = GetCustomerInfoAsync(sqlConnection, uuId, invno);
                                var revenueTask = GetRevenueDetailsAsync(sqlConnection, uuId, invno, currId);
                                var containerTask = GetContainerInfoAsync(sqlConnection, uuId);
                                var shipmentTask = GetShipmentInfoAsync(sqlConnection, uuId);
                                var bankTask = GetBankDetailsAsync(sqlConnection, bank, stationId);

                                await Tasks.Task.WhenAll(stationProfileTask, customerTask, revenueTask, containerTask, shipmentTask, bankTask);

                                var stationProfileInfo = stationProfileTask.Result;
                                var customerInfo = customerTask.Result;
                                var revenueInfo = revenueTask.Result;
                                var containerInfo = containerTask.Result;
                                var shipmentInfo = shipmentTask.Result;
                                var bankInfo = bankTask.Result;
                                var totalInfoData = GenerateTotals(revenueInfo.Item2);

                                var (pdfBytes, isPdfCreated, pdfFileName) = GenerateInvoicePdf(
                                    stationProfileInfo,
                                    customerInfo,
                                    revenueInfo.Item1,
                                    containerInfo,
                                    shipmentInfo,
                                    bankInfo,
                                    terms,
                                    dateOnly,
                                    dateTime,
                                    rawDateTime,
                                    invno,
                                    currId,
                                    totalInfoData
                                );

                                if (isPdfCreated)
                                {
                                    CreateTxtInvoice(
                                        stationProfileInfo,
                                        customerInfo,
                                        revenueInfo.Item1,
                                        containerInfo,
                                        shipmentInfo,
                                        bankInfo,
                                        terms,
                                        dateOnly,
                                        dateTime,
                                        rawDateTime,
                                        invno,
                                        currId,
                                        totalInfoData
                                        );
                                    return (pdfBytes, pdfFileName);
                                }
                                else
                                {
                                    throw new Exception("Error creating the PDF file");
                                }

                            }
                            catch (SqlException sqlEx)
                            {
                                throw new Exception(sqlEx.Message);
                            }
                            catch (Exception ex)
                            {
                                throw new Exception(ex.Message);
                            }
                            finally
                            {
                                if (sqlConnection.State != ConnectionState.Closed)
                                {
                                    sqlConnection.Close();
                                }
                                sqlConnection.Dispose();
                            }
                        }
                    }
                    catch (SqlException sqlEx)
                    {
                        throw new Exception(sqlEx.Message);
                    }
                    catch (Exception ex)
                    {
                        throw new Exception(ex.Message);
                    }
                    finally
                    {
                        if (sqlConnectionCompliance.State != ConnectionState.Closed)
                        {
                            sqlConnectionCompliance.Close();
                        }
                        sqlConnectionCompliance.Dispose();
                    }
                }
            }
            catch (Exception outerEx)
            {
                throw new Exception($"Unhandled error: {outerEx.Message}", outerEx);
            }
        }

        public TotalInfo GenerateTotals(object totalFromRevenueInfo)
        {
            try
            {
                var totalsType = totalFromRevenueInfo.GetType();
                WordedAmounts wordedAmounts = new WordedAmounts();

                var grandTotalObj = totalsType.GetProperty("GrandTotal")?.GetValue(totalFromRevenueInfo);
                decimal grandTotalDecimal = 0;

                if (grandTotalObj != null)
                {
                    decimal.TryParse(grandTotalObj.ToString(), out grandTotalDecimal);
                }

                TotalInfo totalInfo = new TotalInfo()
                {
                    SubTotal = totalsType.GetProperty("SubTotal")?.GetValue(totalFromRevenueInfo)?.ToString(),
                    TotalGSTAmt = totalsType.GetProperty("TotalGSTAmt")?.GetValue(totalFromRevenueInfo)?.ToString(),
                    Total = totalsType.GetProperty("Total")?.GetValue(totalFromRevenueInfo)?.ToString(),
                    GrandTotal = grandTotalDecimal.ToString("N2"),
                    WordedAmount = wordedAmounts.ToDollarWords(grandTotalDecimal)
                };

                return totalInfo;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public (byte[] PdfBytes, bool Success, string pdfFileName) GenerateInvoicePdf(
            StationProfileInfo stationProfileInfo,
            CustomerInfo customerInfo,
            List<RevenueInfo> revenueInfo,
            ContainerInfo containerInfo,
            ShipmentInfo shipmentInfo,
            BankInfo bankInfo,
            string terms,
            string dateOnly,
            string dateTime,
            string rawDateTime,
            string invno,
            string currId,
            TotalInfo totalInfoData)
        {
            string pdfFileName = $"{invno}-{rawDateTime}.pdf";

            // string filePath = @"C:\invoices"; //TODO_ This folder path will come as parameter

            string fullFilePath = Path.Combine(AppContext.BaseDirectory, "TempInvoices", pdfFileName);

            GlobalFontSettings.FontResolver = NotoSansFontResolver.Instance;
            
            WordedAmounts wordedAmounts = new WordedAmounts();
            

            PdfSharpCore.Pdf.PdfDocument document = new PdfSharpCore.Pdf.PdfDocument();
            document.Info.Title = $"{invno}-{rawDateTime}";
           
            List<PdfPage> pages = new List<PdfPage>();
            List<XGraphics> graphics = new List<XGraphics>();
            List<double> pageYs = new List<double>();


            var xFontOptions = new XPdfFontOptions(PdfFontEncoding.Unicode);

            // Header Fonts
            var dateTimeFont = new XFont("NotoSansFont", 8, XFontStyle.Regular, xFontOptions);
            var headerTitleFont = new XFont("NotoSansFont", 14, XFontStyle.Bold, xFontOptions);
            var headerDesrFont1 = new XFont("NotoSansFont", 8, XFontStyle.Regular, xFontOptions);
            var headerDesrFont2 = new XFont("NotoSansFont", 9, XFontStyle.Regular, xFontOptions);
            // INVOICE
            var headerInvoiceFont = new XFont("NotoSansFont", 16, XFontStyle.Bold, xFontOptions);
            // 

            var fontRegular = new XFont("NotoSansFont", 9, XFontStyle.Regular, xFontOptions);
            var fontBold = new XFont("NotoSansFont", 9, XFontStyle.Bold, xFontOptions);
            // Items Fonts
            var fontRegularItems = new XFont("NotoSansFont", 8, XFontStyle.Regular, xFontOptions);
            var fontBoldItems = new XFont("NotoSansFont", 10, XFontStyle.Bold, xFontOptions);
            // Footer
            var fontFooterRegular = new XFont("NotoSansFont", 8, XFontStyle.Regular, xFontOptions);
            var fontFooterBold = new XFont("NotoSansFont", 8, XFontStyle.Bold, xFontOptions);
            var fontFooterLabelRegular = new XFont("NotoSansFont", 7, XFontStyle.Regular, xFontOptions);

            double x = 15;
            double marginTop = 80;
            double headerLineHeight = 10;
            double y = 2;
            double columnGap = 10;
            double horizontalMargin = 10;
            double yRight = marginTop;

            void AddNewPage()
            {
                var page = document.AddPage();

                var heightTotal = page.Height;

                var gfx = XGraphics.FromPdfPage(page);
                pages.Add(page);
                graphics.Add(gfx);
                pageYs.Add(marginTop + 250); // Start y after header
                DrawHeader(gfx, page); // Draw everything above Items Area
            }

            AddNewPage();
            void DrawHeader(XGraphics gfx, PdfPage page)
            {
                // --- Add Icon (top-right) ---
                string iconPath = Path.Combine(AppContext.BaseDirectory, "Icons", "topocean_block.jpg");
                if (File.Exists(iconPath))
                {
                    using (XImage icon = XImage.FromFile(iconPath))
                    {
                        double iconWidth = 50;
                        double iconHeight = 50;

                        double xPos = 20;
                        double yPos = 10;

                        gfx.DrawImage(icon, xPos, yPos, iconWidth, iconHeight);
                    }
                }


                y = 2;
                yRight = marginTop;
                // Company Header
                gfx.DrawString($"{dateTime}", dateTimeFont, XBrushes.Black, new XPoint(page.Width - 14 - gfx.MeasureString($"{dateTime}", dateTimeFont).Width, 15));
                gfx.DrawString($"{stationProfileInfo.Compname}", headerTitleFont, XBrushes.Black, new XRect(0, y, page.Width, 20), XStringFormats.Center);
                y += headerLineHeight + 2;

                gfx.DrawString($"{stationProfileInfo.Compadd1}, {stationProfileInfo.Compcity} {stationProfileInfo.Compzip}", headerDesrFont1, XBrushes.Black, new XRect(0, y, page.Width, 20), XStringFormats.Center);
                y += headerLineHeight;

                gfx.DrawString($"PH: {stationProfileInfo.Compphone}   FAX: {stationProfileInfo.Compfax}   {(!string.IsNullOrWhiteSpace(stationProfileInfo.Compemail) ? string.Concat("EM: ", stationProfileInfo.Compemail) : string.Empty)}", headerDesrFont2, XBrushes.Black, new XRect(0, y, page.Width, 20), XStringFormats.Center);
                y += headerLineHeight + 5;

                // INVOICE Title
                gfx.DrawString("INVOICE", headerInvoiceFont, XBrushes.Black, new XRect(0, y, page.Width, 20), XStringFormats.Center);
                y += 8;

                // Customer - Left
                y = marginTop;
                gfx.DrawString($"{customerInfo.CustName}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"{customerInfo.Addr1}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"{customerInfo.City}, {customerInfo.State} {customerInfo.Zip} {customerInfo.Iso}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"ATTN: {customerInfo.Contact1}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"PHONE: {customerInfo.Phone1}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"{shipmentInfo.Consignment} CONSIGNMENT", fontBold, XBrushes.Black, new XPoint(x, y));
                y += fontBold.GetHeight();

                gfx.DrawString($"CUSTOMER ID: {customerInfo.Custid}", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                // Customer/Shipment - Right
                //double yRight = marginTop;
                double rightColumnStart = page.Width / 2 + columnGap;

                gfx.DrawString("INVOICE", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {invno}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("DATE", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {dateOnly}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("TERMS", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {terms}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("FILE NO.", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {shipmentInfo.Manifest}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("MBL NO.", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {shipmentInfo.Mbl}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("HBL NO.", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {shipmentInfo.Hbl}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                
                double lineY = Math.Max(y, yRight);
                gfx.DrawLine(XPens.Black, horizontalMargin, lineY, page.Width - horizontalMargin, lineY);

                // Shipment - Left
                y = marginTop + 110;

                gfx.DrawString("VESSEL & VOYAGE", fontRegular, XBrushes.Black, new XPoint(x, y));
                gfx.DrawString($": {shipmentInfo.Vessel2} V.{shipmentInfo.Voyage2}", fontRegular, XBrushes.Black, new XPoint(x + 110, y));
                y += fontRegular.GetHeight();

                gfx.DrawString($"ETD {shipmentInfo.Polcode}", fontRegular, XBrushes.Black, new XPoint(x, y));
                gfx.DrawString($": {shipmentInfo.Etd1} {new string(' ', 3)} ETA {shipmentInfo.Poulcode} {shipmentInfo.Eta1}", fontRegular, XBrushes.Black, new XPoint(x + 110, y));
                y += fontRegular.GetHeight();

                gfx.DrawString("DESCRIPTION", fontRegular, XBrushes.Black, new XPoint(x, y));
                gfx.DrawString($": {shipmentInfo.Sicomm}", fontRegular, XBrushes.Black, new XPoint(x + 110, y));
                y += fontRegular.GetHeight();

                gfx.DrawString("WEEK NO", fontRegular, XBrushes.Black, new XPoint(x, y));
                gfx.DrawString($": {shipmentInfo.Sweek}", fontRegular, XBrushes.Black, new XPoint(x + 110, y));
                y += fontRegular.GetHeight();

                // Shipment/Container - Right
                yRight = marginTop + 110;

                gfx.DrawString("NO. OF PKGS", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {containerInfo.TotalQty}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("GROSS WEIGHT", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {containerInfo.TotalGrswt}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("MEASUREMENT", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {containerInfo.TotalVolume}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("PORT OF LOADING", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {shipmentInfo.Polname}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                gfx.DrawString("PORT OF DISCHARGE", fontRegular, XBrushes.Black, new XPoint(rightColumnStart, yRight));
                gfx.DrawString($": {shipmentInfo.Poulname}", fontRegular, XBrushes.Black, new XPoint(rightColumnStart + 110, yRight));
                yRight += fontRegular.GetHeight();

                horizontalMargin = 10;
                lineY = Math.Max(y, yRight) + 2;
                gfx.DrawLine(XPens.Black, horizontalMargin, lineY, page.Width - horizontalMargin, lineY);
                y = marginTop + 190;

                // Container No
                gfx.DrawString("CONTAINER NO:", fontRegular, XBrushes.Black, new XPoint(x, y));
                gfx.DrawString($"{containerInfo.ContainerNo}", fontRegular, XBrushes.Black, new XPoint(x + 72, y));
                y += fontRegular.GetHeight();

                horizontalMargin = 10;
                lineY = Math.Max(y, yRight) + 15;
                gfx.DrawLine(XPens.Black, horizontalMargin, lineY, page.Width - horizontalMargin, lineY);
                y = marginTop + 230;

                // Items Area
                gfx.DrawString($"ITEMS{new string(' ', 150)}Exchange Rate{new string(' ', 30)}{currId} AMOUNT{new string(' ', 8)}Tax Code", fontRegular, XBrushes.Black, new XPoint(x, y));
                y += fontRegular.GetHeight();

                horizontalMargin = 10;
                lineY = Math.Max(y - 4, yRight);
                gfx.DrawLine(XPens.Black, horizontalMargin, lineY, page.Width - horizontalMargin, lineY);
                y = marginTop + 250;
            }

            int currentPageIndex = 0;
            double itemHeight = 12; // Approximate height per item row
            double maxY = pages[currentPageIndex].Height - 330; // Leave space for footer

            var format = new XStringFormat
            {
                Alignment = XStringAlignment.Far, // Right-align horizontally
            };

            double yItems = 0;

            foreach (var item in revenueInfo)
            {
                var a = pageYs[currentPageIndex] + itemHeight;
                if (pageYs[currentPageIndex] + itemHeight > maxY)
                {
                    AddNewPage();
                    currentPageIndex++;
                }

                var gfx = graphics[currentPageIndex];
                yItems = pageYs[currentPageIndex];

                // Draw item row
                gfx.DrawString($"{item.Ardesc}", fontRegularItems, XBrushes.Black, new XPoint(x, yItems));
                gfx.DrawString($"{item.Currency} {item.Amt} / {item.Uom} X {item.Qty}", fontRegularItems, XBrushes.Black, new XPoint(x + 175, yItems));
                gfx.DrawString($"{item.Exrate}", fontRegularItems, XBrushes.Black, new XPoint(x + 365, yItems - 10), format);
                gfx.DrawString($"{currId}", fontRegularItems, XBrushes.Black, new XPoint(x + 410, yItems));
                gfx.DrawString($"{item.TotalAmount}", fontRegularItems, XBrushes.Black, new XPoint(x + 505, yItems - 10), format);
                gfx.DrawString($"e-General", fontRegularItems, XBrushes.Black, new XPoint(x + 525, yItems));

                pageYs[currentPageIndex] += itemHeight;
            }

            // Draw totals and final sections on last page
            var finalGfx = graphics[currentPageIndex];
            double finalY = pageYs[currentPageIndex];
            if (finalY > 700)
            {
                AddNewPage();
            }
            var wordedFormat = new XStringFormat
            {
                Alignment = XStringAlignment.Near, // Right-align horizontally
            };


            // Totals
            finalY -= 12;
            finalGfx.DrawString("===============", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY), format);
            finalY += 12;
            finalGfx.DrawString("Sub Total", fontRegularItems, XBrushes.Black, new XPoint(x + 435, finalY), format);
            //finalY += 0;
            finalGfx.DrawString($"{totalInfoData.SubTotal}", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY - 2), format);
            finalY += 12;
            finalGfx.DrawString("Total GST Amount", fontRegularItems, XBrushes.Black, new XPoint(x + 435, finalY), format);
            //finalY += 2;
            finalGfx.DrawString($"{totalInfoData.TotalGSTAmt}", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY - 2), format);
            finalY += 8;
            finalGfx.DrawString("===============", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY), format);
            finalY += 12;
            finalGfx.DrawString("Total", fontRegularItems, XBrushes.Black, new XPoint(x + 435, finalY), format);
            finalGfx.DrawString($"{totalInfoData.Total}", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY - 2), format);
            finalY += 12;
            finalGfx.DrawString("Grand Total", fontRegularItems, XBrushes.Black, new XPoint(x + 435, finalY), format);
            finalGfx.DrawString($"{totalInfoData.GrandTotal}", fontBoldItems, XBrushes.Black, new XPoint(x + 505, finalY - 2), format);

            horizontalMargin = 10;
            finalY = Math.Max(finalY + 15, yRight);
            finalGfx.DrawLine(XPens.Black, horizontalMargin, finalY, pages[currentPageIndex].Width - horizontalMargin, finalY);
            //finalY = marginTop + 365;

            // Worded Total
            finalY += 5;
            finalGfx.DrawString($"Total: {totalInfoData.WordedAmount} ({totalInfoData.GrandTotal}) ONLY", fontFooterRegular, XBrushes.Black, new XRect(13, finalY, pages[currentPageIndex].Width, 20), wordedFormat);
            finalY += 10;

            // Remarks
            finalGfx.DrawString("REMARKS:", fontFooterBold, XBrushes.Black, new XRect(13, finalY, pages[currentPageIndex].Width, 20), wordedFormat);
            finalY += 30;

            // Bank Details
            finalGfx.DrawString("BANKS DETAILS:", fontFooterBold, XBrushes.Black, new XRect(13, finalY, pages[currentPageIndex].Width, 20), wordedFormat);
            finalY += 20;
            DrawWrappedText(finalGfx, $"{bankInfo.Addr1}", fontFooterRegular, XBrushes.Black, new XPoint(13, finalY), 10, bankInfo.Swift);
            
            if (finalY > 700)
            {
                AddNewPage();
            }
            // Pagination + Footer
            for (int i = 0; i < pages.Count; i++)
            {
                double footerY = 700; //finalY;
                graphics[i].DrawString($"Page {i + 1} of {pages.Count}", fontFooterRegular, XBrushes.Black, new XRect(13, footerY, pages[i].Width, 20), wordedFormat);

                footerY += 15;
                graphics[i].DrawString($"{stationProfileInfo.Compname}", fontFooterBold, XBrushes.Black, new XRect(x + 130, footerY, pages[i].Width, 20), XStringFormats.Center);
                footerY += 25;

                var companyNameSize = finalGfx.MeasureString(stationProfileInfo.Compname, fontFooterBold);
                var lineWidth = companyNameSize.Width + 40;
                var lineStartX = (pages[i].Width - lineWidth) / 2;
                var lineEndX = pages[i].Width - 35;


                finalY = Math.Max(footerY, yRight);
                graphics[i].DrawLine(XPens.Black, lineStartX + 150, finalY, lineEndX, finalY);
                graphics[i].DrawString("Computer generated invoice, signature is not required", fontFooterLabelRegular, XBrushes.Black, new XRect(x + 130, footerY + 10, pages[i].Width, 20), XStringFormats.Center);
            }


            bool saveSucceeded = false;
            try
            {
                document.Save(fullFilePath);
                saveSucceeded = File.Exists(fullFilePath);

                using (var stream = new MemoryStream())
                {
                    document.Save(stream, false);
                    byte[] pdfBytes = stream.ToArray();

                    return (pdfBytes, saveSucceeded, pdfFileName);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #region TxtBuilder
        public bool CreateTxtInvoice(
            StationProfileInfo stationProfileInfo,
            CustomerInfo customerInfo,
            List<RevenueInfo> revenueInfo,
            ContainerInfo containerInfo,
            ShipmentInfo shipmentInfo,
            BankInfo bankInfo,
            string terms,
            string dateOnly,
            string dateTime,
            string rawDateTime,
            string invno,
            string currId,
            TotalInfo totalInfoData)
        {
            try
            {
                string directoryTemplatePath = Path.Combine(AppContext.BaseDirectory, "TempInvoices\\TxtTemplates");
                string fileTemplateName = $"topasianinv.txt"; ;
                string templatePath = Path.Combine(directoryTemplatePath, fileTemplateName);
                string txtFileName = $"{invno}-{rawDateTime}.txt";

                //string filePath = @"C:\invoices"; TODO: this folder path will come as parameter

                string fullFilePath = Path.Combine(AppContext.BaseDirectory, "TempInvoices", txtFileName);

                var stationProfileInfoTxt = stationProfileInfo;
                var customerInfoTxt = customerInfo;
                var revenueInfoTxt = revenueInfo;
                var containerInfoTxt = containerInfo;
                var shipmentInfoTxt = shipmentInfo;
                var bankInfoTxt = bankInfo;
                var totalInfoTxt = totalInfoData;
                var invoiceDataTxt = new
                {
                    terms,
                    dateOnly,
                    dateTime,
                    rawDateTime,
                    invno,
                    currId
                };

                var templateModel = new
                {
                    stationProfileInfoTxt,
                    customerInfoTxt,
                    revenueInfoTxt,
                    containerInfoTxt,
                    shipmentInfoTxt,
                    bankInfoTxt,
                    invoiceDataTxt,
                    totalInfoTxt
                };


                try
                {
                    if (File.Exists(fullFilePath))
                    {
                        var fileInfo = new FileInfo(fullFilePath);
                        if (fileInfo.Length > 0)
                        {
                            using (var fs = new FileStream(fullFilePath, FileMode.Truncate, FileAccess.Write, FileShare.None)) { }
                        }
                    }

                    using (var fs = new FileStream(fullFilePath, FileMode.OpenOrCreate, FileAccess.Write, FileShare.None))
                    using (var writer = new StreamWriter(fs))
                    {
                        var templateTxt = File.ReadAllText(templatePath);
                        var templateScriban = Template.Parse(templateTxt);
                        var result = templateScriban.Render(templateModel, member => member.Name);

                        writer.WriteLine(result);
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception(ex.Message);
                }
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        #endregion


        #region AsyncCalls
        public async Task<List<T>> ExecuteQueryListAsync<T>(SqlConnection conn, string query, Func<SqlDataReader, T> map, List<(string parameter, object value)> parameters)
        {
            var results = new List<T>();
            try
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null && parameters.Count > 0)
                    {
                        foreach (var param in parameters)
                        {
                            cmd.Parameters.Add(new SqlParameter(param.parameter, param.value ?? DBNull.Value));
                        }
                    }

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            results.Add(map(reader));
                        }
                    }
                }
            }
            catch (SqlException sqlEx)
            {
                throw new Exception(sqlEx.Message);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return results;
        }

        public async Task<T> ExecuteQuerySingleAsync<T>(SqlConnection conn, string query, Func<SqlDataReader, T> map, List<(string parameter, object value)> parameters)
        {
            try
            {
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    if (parameters != null && parameters.Count > 0)
                    {
                        foreach (var param in parameters)
                        {
                            cmd.Parameters.Add(new SqlParameter(param.parameter, param.value ?? DBNull.Value));
                        }
                    }

                    using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            return map(reader);
                        }
                    }
                }

                return default(T);
            }
            catch (SqlException sqlEx)
            {
                throw new Exception(sqlEx.Message);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<StationProfileInfo> GetStationProfileInfoAsync(SqlConnection conn, string stationId)
        {
            var parameters = new List<(string parameter, object value)>
            {
                ("@stationId", stationId)
            };
            string query = @"  SELECT
		                            [compname],
		                            [compadd1],
		                            [compadd2],
		                            [compadd3],
		                            [compcity],
		                            [compstate],
		                            [compzip],
		                            [compphone],
		                            [compfax],
		                            [compemail]
                               FROM [dbo].[stationprofile]
                              WHERE [stationId] = @stationId";

            return await ExecuteQuerySingleAsync(conn, query, reader => new StationProfileInfo
            {
                Compname = reader["compname"]?.ToString(),
                Compadd1 = reader["compadd1"]?.ToString(),
                Compadd2 = reader["compadd2"]?.ToString(),
                Compadd3 = reader["compadd3"]?.ToString(),
                Compcity = reader["compcity"]?.ToString(),
                Compstate = reader["compstate"]?.ToString(),
                Compzip = reader["compzip"]?.ToString(),
                Compphone = reader["compphone"]?.ToString(),
                Compfax = reader["compfax"]?.ToString(),
                Compemail = reader["compemail"]?.ToString()
            },
                parameters // parameters
            );
        }

        public async Task<CustomerInfo> GetCustomerInfoAsync(SqlConnection conn, string uuId, string invno)
        {
            var parameters = new List<(string parameter, object value)>
            {
                ("@uuId", uuId),
                ("@invno", invno)
            };
            string query = @"SELECT DISTINCT  
                                  C.[custname],
                                    [addr1],
                                    [city],
                                    [state],
                                    [contact1], --ATTN
                                    [phone1],
                                    [zip],
                                    [iso],
                                  R.[custid] --CUSTOMER ID
                               FROM [dbo].[contacts] AS C
                         INNER JOIN [dbo].[revenue] AS R
                               ON C.[custid] = R.[custid]
                            WHERE R.[uuid] = @uuId
                              AND R.[invno] = @invno";

            return await ExecuteQuerySingleAsync(conn, query, reader => new CustomerInfo
            {
                CustName = reader["custname"]?.ToString(),
                Addr1 = reader["addr1"]?.ToString(),
                City = reader["city"]?.ToString(),
                State = reader["state"]?.ToString(),
                Contact1 = reader["contact1"]?.ToString(),
                Phone1 = reader["phone1"]?.ToString(),
                Zip = reader["zip"]?.ToString(),
                Iso = reader["iso"]?.ToString(),
                Custid = reader["custid"]?.ToString(),
            },
                parameters // parameters
            );
        }

        public async Task<Tuple<List<RevenueInfo>, object>> GetRevenueDetailsAsync(SqlConnection conn, string uuId, string invno, string currId)
        {
            var currencyList = await GetRevenueCurrencyInfoAsync(conn, uuId, invno, currId);

            currencyList = string.Join(", ", currencyList.Split(',').Select(x => x.Trim().Trim('\'')).Where(x => x != currId).Select(x => $"'{x}'"));

            if (string.IsNullOrWhiteSpace(currencyList))
            {
                currencyList = "''";
            }

            var parameters = new List<(string parameter, object value)>
            {
                ("@uuId", uuId),
                ("@invno", invno),
                ("@currId", currId)

            };

            string query = $@"
                            WITH Currency AS (
                                SELECT 
                                    [basecurrency],
                                    [code],
                                    [exrate]
                                FROM [dbo].[currency]
                                WHERE (
                                        [basecurrency] = @currId OR [basecurrency] IN ({currencyList})
                                      )
                                    AND NOT (
                                        (
                                            [basecurrency] = @currId and [code] IN ({currencyList})
                                            )
                                        OR
                                        (
                                            [basecurrency] IN ({currencyList}) and [code] <> @currId
                                            )
                                       )
                                    AND CAST(GETDATE() AS DATE) BETWEEN [effdate] AND [expdate]
                                   )

                            SELECT
                                R.[arcode],
                                R.[ardesc],
                                R.[currency],
                                R.[amt],
                                R.[uom],
                                R.[qty],
                                R.[arcurr],
                                C.[basecurrency],
                                C.[code],
                                C.[exrate]
                            FROM [dbo].[revenue] R
                            JOIN Currency C
                                ON (
                                     (R.[currency] = C.[basecurrency] AND R.[currency] = C.[code])
                                    OR
                                     (R.[currency] IN ({currencyList}) AND C.[code] = @currId)
                                   )
                            WHERE R.[uuid] = @uuId
                              AND R.[invno] = @invno
                              AND NOT (
                                  R.[arcurr] = @currId AND
                                  C.[basecurrency] = @currId AND
                                  C.[code] = @currId AND
                                  R.[currency] <> @currId
                                  )
                         ORDER BY R.[currency] DESC
";
            var revenueInfo = await ExecuteQueryListAsync(conn, query, reader => new RevenueInfo
            {
                Arcode = reader["arcode"]?.ToString(),
                Ardesc = reader["ardesc"]?.ToString(),
                Currency = reader["currency"]?.ToString(),
                Amt = Decimal.Parse(reader["amt"]?.ToString()),
                Uom = reader["uom"]?.ToString(),
                Qty = Decimal.Parse(reader["qty"]?.ToString()),
                Arcurr = reader["arcurr"]?.ToString(),
                Basecurrency = reader["basecurrency"]?.ToString(),
                Code = reader["code"]?.ToString(),
                Exrate = Decimal.Parse(reader["exrate"].ToString()),
            },
                parameters // parameters
            );

            // Totals
            decimal SubTotalRaw = 0m;
            decimal TotalRaw = 0m;
            decimal TotalGSTAmtRaw = 0m;
            decimal GrandTotalRa = 0m;
            foreach (var item in revenueInfo)
            {
                item.TotalAmount = item.CalculateTotalAmount().ToString("N2", CultureInfo.InvariantCulture);
                SubTotalRaw += item.CalculateTotalAmount();
                TotalGSTAmtRaw += 0;
                TotalRaw = SubTotalRaw + TotalGSTAmtRaw;
                GrandTotalRa = SubTotalRaw + TotalGSTAmtRaw;
            }

            object totalFromRevenueInfo = new
            {
                SubTotal = SubTotalRaw.ToString("N2"),
                TotalGSTAmt = TotalGSTAmtRaw.ToString("N2"),
                Total = TotalRaw.ToString("N2"),
                GrandTotal = GrandTotalRa.ToString()
            };

            return Tuple.Create(revenueInfo, totalFromRevenueInfo);
        }

        public async Task<ShipmentInfo> GetShipmentInfoAsync(SqlConnection conn, string uuId)
        {
            var parameters = new List<(string parameter, object value)>
            {
                ("@uuId", uuId),
            };

            string query = @"SELECT
                                    [manifest],
                                    [mbl],
                                    [hbl],
                                    [vessel2],
                                    [voyage2],
                                    [polcode],
                                    FORMAT([etd1], 'MM/dd/yyyy') AS etd1,
                                    [poulcode],
                                    FORMAT([eta1], 'MM/dd/yyyy') AS eta1,
                                    [sicomm],
                                    [sweek],
                                    [polname],
                                    [poulname],
                                    CASE 
                                        WHEN [mode] = 'A' AND [trans] = 'E' THEN 'AIR EXPORT'
                                        WHEN [mode] = 'A' AND [trans] = 'I' THEN 'AIR IMPORT'
                                        WHEN [mode] = 'O' AND [trans] = 'E' THEN 'OCEAN EXPORT'
                                        WHEN [mode] = 'O' AND [trans] = 'I' THEN 'OCEAN IMPORT'
                                        ELSE ''
                                    END AS Consignment
                            FROM [dbo].[shipment]
                            WHERE [uuid] = @uuId";

            return await ExecuteQuerySingleAsync(conn, query, reader => new ShipmentInfo
            {
                Manifest = reader["manifest"]?.ToString(),
                Mbl = reader["mbl"]?.ToString(),
                Hbl = reader["hbl"]?.ToString(),
                Vessel2 = reader["vessel2"]?.ToString(),
                Voyage2 = reader["voyage2"]?.ToString(),
                Polcode = reader["polcode"]?.ToString(),
                Etd1 = reader["etd1"]?.ToString(),
                Poulcode = reader["poulcode"]?.ToString(),
                Eta1 = reader["eta1"]?.ToString(),
                Sicomm = reader["sicomm"]?.ToString(),
                Sweek = Int32.Parse(reader["sweek"]?.ToString()),
                Polname = reader["polname"]?.ToString(),
                Poulname = reader["poulname"]?.ToString(),
                Consignment = reader["Consignment"]?.ToString()
            },
                parameters // parameters
            );
        }

        public async Task<ContainerInfo> GetContainerInfoAsync(SqlConnection conn, string uuId)
        {
            var parameters = new List<(string parameter, object value)>
            {
                ("@uuId", uuId),
            };

            string query = @"SELECT  
                                        FORMAT(SUM([qty]) / 100.0, 'N2') AS [TotalQty],                     
                                        FORMAT(SUM([grswt]), 'N2') + ' KGS' AS [TotalGrswt],             
                                        FORMAT(SUM([volume]), 'N3') + ' CBM' AS [TotalVolume],
                                        STRING_AGG([ctnrno], ', ') WITHIN GROUP (ORDER BY [ctnrno] ASC) AS [ContainerNo]
                              FROM [dbo].[container]
                             WHERE [uuid] = @uuId";

            return await ExecuteQuerySingleAsync(conn, query, reader => new ContainerInfo
            {
                TotalQty = reader["TotalQty"]?.ToString(),
                TotalGrswt = reader["TotalGrswt"]?.ToString(),
                TotalVolume = reader["TotalVolume"]?.ToString(),
                ContainerNo = reader["ContainerNo"]?.ToString()
            },
                parameters // parameters
            );
        }

        public async Task<BankInfo> GetBankDetailsAsync(SqlConnection conn, int bank, string stationId)
        {
            var parameters = new List<(string parameter, object value)>
            {
                ("@stationId", stationId),
                ("@bank", bank)
            };

            string query = @"  SELECT 
                                    [expand],
                                    [aba],
                                    [swift],
                                    Replace(Replace(addr1,CHAR(10),' '),CHAR(13),'') as addr1
                              FROM [dbo].[stationbank]
                              WHERE [compid] = @stationId
                                AND [bankid] = @bank";
            return await ExecuteQuerySingleAsync(conn, query, reader => new BankInfo
            {
                Expand = reader["expand"]?.ToString(),
                Aba = reader["aba"].ToString(),
                Swift = reader["swift"]?.ToString(),
                Addr1 = reader["addr1"]?.ToString(),
            },
                parameters
            );
        }

        public async Task<string> GetRevenueCurrencyInfoAsync(SqlConnection conn, string uuId, string invno, string currId)
        {
            var currencyList = string.Empty;
            var parameters = new List<(string parameter, object value)>
            {
                ("@uuId", uuId),
                ("@invno", invno),
                ("@currId", currId)
            };

            string query = @"
                            SELECT
                                 [currency]
                            FROM [dbo].[revenue]
                           WHERE [uuid] = @uuId
                             AND [invno] = @invno";
            var response = await ExecuteQueryListAsync(conn, query, reader => new RevenueInfo
            {
                Currency = reader["currency"]?.ToString(),
            },
                parameters // parameters
            );

            currencyList = string.Join(", ", response
                                .Select(c => c.Currency?.Trim())
                                .Where(c => !string.IsNullOrWhiteSpace(c))
                                .Select(c => $"'{c.Replace("'", "''")}'"));



            return currencyList;
        }
        #endregion

        private static string SanitizeFileName(string fileName)
        {
            var safe = (fileName ?? "document.pdf").Replace("\"", "");
            return string.IsNullOrWhiteSpace(safe) ? "document.pdf" : safe;
        }

        public List<string> BankDetailsAddresInfo(string text, int maxLineLength)
        {
            var lines = new List<string>();
            var segments = text.Split(new[] { ':' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var segment in segments)
            {
                var words = segment.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                var currentLine = new StringBuilder();

                foreach (var word in words)
                {
                    if (currentLine.Length + word.Length + 1 > maxLineLength)
                    {
                        lines.Add(currentLine.ToString().TrimEnd());
                        currentLine.Clear();
                    }
                    currentLine.Append(word + " ");
                }

                if (currentLine.Length > 0)
                    lines.Add(currentLine.ToString().TrimEnd());
            }

            return lines;
        }

        public void DrawWrappedText(XGraphics gfx, string text, XFont font, XBrush brush, XPoint startPoint, double lineHeight, string swiftCode, int maxLineLength = 80)
        {
            var lines = BankDetailsAddresInfo(text, maxLineLength);
            double y = startPoint.Y;

            foreach (var line in lines)
            {
                gfx.DrawString(line, font, brush, new XPoint(startPoint.X, y));
                y += lineHeight;
            }

            gfx.DrawString($"SWIFT: {swiftCode}", font, brush, new XPoint(startPoint.X, y));
            y += lineHeight;
        }
    }

    #region Common Classes
    public class CustomerInfo
    {
        public string CustName { get; set; }
        public string Addr1 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Contact1 { get; set; }
        public string Phone1 { get; set; }
        public string Custid { get; set; }
        public string Zip { get; set; }
        public string Iso { get; set; }
    }

    public class RevenueInfo
    {
        public string Arcode { get; set; }
        public string Ardesc { get; set; }
        public string Currency { get; set; }
        public decimal Amt { get; set; }
        public string Uom { get; set; }
        public decimal Qty { get; set; }
        public string Arcurr { get; set; }
        public string Basecurrency { get; set; }
        public string Code { get; set; }
        public decimal Exrate { get; set; }
        public string TotalAmount { get; set; }
        public decimal CalculateTotalAmount() => Amt * Qty * Exrate;
    }

    public class TotalInfo
    {
        public string SubTotal { get; set; }
        public string TotalGSTAmt { get; set; } = "0.00";
        public string Total { get; set; }
        public string GrandTotal { get; set; }
        public string WordedAmount { get; set; }
    }

    public class ShipmentInfo
    {
        public string Manifest { get; set; }
        public string Mbl { get; set; }
        public string Hbl { get; set; }
        public string Vessel2 { get; set; }
        public string Voyage2 { get; set; }
        public string Polcode { get; set; }
        public string Etd1 { get; set; }
        public string Poulcode { get; set; }
        public string Eta1 { get; set; }
        public string Sicomm { get; set; }
        public int Sweek { get; set; }
        public string Polname {  get; set; }
        public string Poulname { get; set; }
        public string Consignment { get; set; }
    }

    public class ContainerInfo
    {
        public string TotalQty { get; set; }
        public string TotalGrswt { get; set; }
        public string TotalVolume { get; set; }
        public string ContainerNo { get; set; }
    }

    public class BankInfo
    {
        public string Expand { get; set; }
        public string Aba { get; set; }
        public string Swift { get; set; }
        public string Addr1 { get; set; }
        public string Addr1Wrap => WrapText(Addr1, 70);

        private static string WrapText(string input, int lineWidth)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var words = input.Split(' ', (char)StringSplitOptions.RemoveEmptyEntries);
            var lines = new List<string>();
            var current = "";

            foreach (var word in words)
            {
                var next = string.IsNullOrEmpty(current) ? word : current + " " + word;
                if (next.Length <= lineWidth || current.Length == 0)
                {
                    current = next;
                }
                else
                {
                    lines.Add(current);
                    current = word;
                }
            }

            if (!string.IsNullOrEmpty(current))
                lines.Add(current);

            return string.Join(Environment.NewLine, lines);
        }
    }

    public class StationProfileInfo
    {
        public string Compname { get; set; }
        public string Compadd1 { get; set; }
        public string Compadd2 { get; set; }
        public string Compadd3 { get; set; }
        public string Compcity { get; set; }
        public string Compstate { get; set; }
        public string Compzip { get; set; }
        public string Compphone { get; set; }
        public string Compfax { get; set; }
        public string Compemail { get; set; }
    }
    #endregion

    #region Txt Classes

    public class InvoiceTemplateModel
    {
        public CompanyInfoTxt Company { get; set; }
        public CustomerInfoTxt Customer { get; set; }
        public ShipmentInfoTxt Shipment { get; set; }
        public InvoiceInfoTxt Invoice { get; set; }
    }


    public class CompanyInfoTxt
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string Fax { get; set; }
        public string Email { get; set; }
    }

    public class CustomerInfoTxt
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Zip { get; set; }
        public string Country { get; set; }
        public string Attn { get; set; }
        public string Phone { get; set; }
        public string Id { get; set; }
        public string Consignment { get; set; }
    }

    public class ShipmentInfoTxt
    {
        public decimal PackageCount { get; set; }
        public string ETD { get; set; }
        public string ETA { get; set; }
        public string ETDDate { get; set; }
        public string ETADate { get; set; }
        public decimal GrossWeight { get; set; }
        public string Description { get; set; }
        public decimal Measurement { get; set; }
        public int WeekNo { get; set; }
        public string PortLoading { get; set; }
        public string PortDischarge { get; set; }
        public string ContainerNumbers { get; set; }
    }

    public class InvoiceItemTxt
    {
        public string Description { get; set; }
        public string Rate { get; set; } // e.g. "USD 3500.00 / CTNR"
        public string ExchangeRate { get; set; } // e.g. "7.2100"
        public string Amount { get; set; } // formatted string with separators
        public string TaxCode { get; set; }
        public string FormattedAmount { get; internal set; }
    }

    public class InvoiceInfoTxt
    {
        public string Number { get; set; }
        public string Date { get; set; }
        public string Terms { get; set; }
        public string FileNo { get; set; }
        public string MblNo { get; set; }
        public string HblNo { get; set; }
        public string VesselVoyage { get; set; }

        public string SubTotal { get; set; }
        public string GstTotal { get; set; }
        public string Total { get; set; }
        public string GrandTotal { get; set; }
        public string TotalWords { get; set; }

        public string Remarks { get; set; } = string.Empty;
        public string[] BankDetails { get; set; } // Multiline block
        public string Swift { get; set; } // e.g. "SWIFT: BKCHCNBJ300"
        public int PageNumber { get; set; }
        public int TotalPages { get; set; }


        public List<InvoiceItemTxt> Items { get; set; }
    }
    #endregion



    public class NotoSansFontResolver : IFontResolver
    {
        public static NotoSansFontResolver Instance { get; } = new NotoSansFontResolver();
        private NotoSansFontResolver() { }
        public string DefaultFontName => "NotoSansFont";

        public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
        {
            try
            {
                if (familyName == "NotoSansFont")
                {
                    return new FontResolverInfo(isBold ? "NotoSansFont#Bold" : "NotoSansFont#Regular");
                }

                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public byte[] GetFont(string faceName)
        {
            try
            {
                var fontDir = Path.Combine(AppContext.BaseDirectory, "Font");

                switch (faceName)
                {
                    case "NotoSansFont#Regular":
                        return File.ReadAllBytes(Path.Combine(fontDir, "NotoSansSC-Regular.ttf"));

                    case "NotoSansFont#Bold":
                        return File.ReadAllBytes(Path.Combine(fontDir, "NotoSansSC-Bold.ttf"));

                    default:
                        throw new InvalidOperationException($"Unknown face: {faceName}");
                }
            }
            catch (FileNotFoundException fnfEx)
            {
                throw new Exception(fnfEx.Message);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }

    public class WordedAmounts
    {
        public string ToDollarWords(decimal amount)
        {
            int dollars = (int)Math.Floor(amount);
            int cents = (int)Math.Round((amount - dollars) * 100);

            string dollarWords = dollars.ToWords().ToUpperInvariant().Replace("-", " ");
            string centWords = cents.ToWords().ToUpperInvariant().Replace("-", " ");

            string dollarUnit = dollars == 1 ? "DOLLAR" : "DOLLARS";
            string centUnit = cents == 1 ? "CENT" : "CENTS";

            return $"{dollarWords} {dollarUnit} AND {centWords} {centUnit}";
        }
    }

}