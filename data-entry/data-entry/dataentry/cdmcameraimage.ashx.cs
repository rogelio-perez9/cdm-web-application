using System;
using System.IO;
using System.Web;

namespace dataentry
{
    /// <summary>
    /// Summary description for cdmcameraimage
    /// </summary>
    public class cdmcameraimage : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            if (context.Request.Files.Count > 0)
            {
                string dirPath = "D:\\web\\tenaris\\axis\\camerapicture";
                HttpFileCollection files = context.Request.Files;
                HttpPostedFile file = files[0];

                // Get the filename and extension
                string fileName = Path.GetFileName(file.FileName);
                string extension = Path.GetExtension(fileName);

                // Generate a new unique filename to avoid overwriting existing files
                string newFileName = Guid.NewGuid().ToString() + extension;

                // Set the path where the file will be saved
                string path = dirPath + newFileName;

                // Save the file to disk
                file.SaveAs(path);

                // Return a response to indicate the file was successfully saved
                context.Response.StatusCode = 200;
                context.Response.ContentType = "text/plain";
                context.Response.Write("File saved successfully.");
            }
            else
            {
                // Return an error response if no files were sent
                context.Response.StatusCode = 400;
                context.Response.ContentType = "text/plain";
                context.Response.Write("No files were sent.");
            }
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