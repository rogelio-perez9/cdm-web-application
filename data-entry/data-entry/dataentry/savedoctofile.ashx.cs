using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;

namespace SaveDocToFile
{

    public class SaveDocToFile : IHttpAsyncHandler
    {
        #region HttpHandler
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
            ((Task)result).GetAwaiter().GetResult();
        }

        public void ProcessRequest(HttpContext context)
        {
            throw new NotSupportedException("Synchronous processing is not supported.");
        }


        private async Task ProcessRequestAsync(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;

            string sqId = request.QueryString["sqid"];
            string folderPath = request.QueryString["folderPath"];
            string ids = request.QueryString["ids"];

            response.ContentType = "application/json";
            response.Charset = "utf-8";

            Func<bool, string, string> json = (ok, msg) =>
            "{\"ok\":" + (ok ? "true" : "false") + ",\"message\":\"" +
            System.Web.HttpUtility.JavaScriptStringEncode(msg ?? "") + "\"}";

            if (string.IsNullOrWhiteSpace(sqId) ||
                string.IsNullOrWhiteSpace(folderPath) ||
                string.IsNullOrWhiteSpace(ids))
            {
                var missing = new System.Collections.Generic.List<string>();
                if (string.IsNullOrWhiteSpace(sqId)) missing.Add("sqid");
                if (string.IsNullOrWhiteSpace(folderPath)) missing.Add("folderPath");
                if (string.IsNullOrWhiteSpace(ids)) missing.Add("ids");

                response.Write(json(false, "Missing required parameter(s): " + string.Join(", ", missing)));
                return;
            }

            try
            {
                bool saved = await SaveDocToFileAsync(sqId, folderPath, ids);
                response.Write(json(saved, saved ? "Files saved." : "No files saved."));
            }
            catch (Exception ex)
            {
                response.Write(json(false, "Server error: " + ex.Message));
            }
        }
        #endregion HttpHandler

        #region DataReader Methods
        public async Task<bool> SaveDocToFileAsync(string sqId, string folderPath, string ids)
        {
            var idList = ids
                .Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => int.TryParse(s.Trim(), out var n) ? (int?)n : null)
                .Where(n => n.HasValue)
                .Select(n => n.Value)
                .Distinct()
                .ToList();

            Directory.CreateDirectory(folderPath);

            var inParams = string.Join(", ", idList.Select((_, i) => $"@id{i}"));
            string sql = $@"SELECT 
                                [file_name],
                                [file_ext],
                                [file_content]
                           FROM [web_files]
                            WHERE id IN ({inParams})";

            string connectionString = ConfigurationManager.ConnectionStrings[sqId]?.ConnectionString;

            int saved = 0;

            try
            {
                using (var conn = new SqlConnection(connectionString))
                using (var cmd = new SqlCommand(sql, conn))
                {
                    for (int i = 0; i < idList.Count; i++)
                        cmd.Parameters.Add($"@id{i}", SqlDbType.Int).Value = idList[i];

                    await conn.OpenAsync().ConfigureAwait(false);

                    using (var reader = await cmd.ExecuteReaderAsync(CommandBehavior.SequentialAccess).ConfigureAwait(false))
                    {
                        int ordName = reader.GetOrdinal("file_name");
                        int ordExt = reader.GetOrdinal("file_ext");
                        int ordBlob = reader.GetOrdinal("file_content");

                        while (await reader.ReadAsync().ConfigureAwait(false))
                        {
                            var rawName = reader.IsDBNull(ordName) ? "file" : reader.GetString(ordName);
                            var extText = reader.IsDBNull(ordExt) ? "" : reader.GetString(ordExt);

                            var baseName = MakeSafeFileName(Path.GetFileNameWithoutExtension(rawName));
                            if (string.IsNullOrWhiteSpace(baseName)) baseName = "file";

                            var ext = NormalizeExtension(extText);
                            var destPath = GetUniquePath(Path.Combine(folderPath, baseName + ext));

                            if (reader.IsDBNull(ordBlob))
                                continue;

                            using (var webFile = new WebFiles
                            {
                                FileName = rawName,
                                FileExt = extText,
                                Content = reader.GetStream(ordBlob)
                            })
                            {
                                using (var fs = new FileStream(
                                    destPath,
                                    FileMode.Create,
                                    FileAccess.Write,
                                    FileShare.None,
                                    81920,
                                    useAsync: true))
                                {
                                    await webFile.Content.CopyToAsync(fs).ConfigureAwait(false);
                                    await fs.FlushAsync().ConfigureAwait(false);
                                }
                                saved++;
                            }
                        }
                    }
                }
            }
            catch (SqlException)
            {
                return false;
            }
            catch (IOException)
            {
                return false;
            }
            return saved > 0;
        }
        #endregion

        #region Common Methods and Classes

        private static string NormalizeExtension(string ext)
        {
            if (string.IsNullOrWhiteSpace(ext)) return "";
            ext = ext.Trim();
            if (!ext.StartsWith(".")) ext = "." + ext;
            return ext.ToLowerInvariant();
        }

        private static string MakeSafeFileName(string name)
        {
            var invalid = new string(Path.GetInvalidFileNameChars());
            var cleaned = Regex.Replace(name ?? "", $"[{Regex.Escape(invalid)}]", "_");
            cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();
            return cleaned.Length > 150 ? cleaned.Substring(0, 150) : cleaned;
        }

        private static string GetUniquePath(string path)
        {
            if (!File.Exists(path)) return path;

            var dir = Path.GetDirectoryName(path) ?? "";
            var name = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);

            int i = 1;
            string candidate;
            do
            {
                candidate = Path.Combine(dir, $"{name} ({i}){ext}");
                i++;
            } while (File.Exists(candidate));

            return candidate;
        }

        public class WebFiles : IDisposable
        {
            public string FileName { get; set; }
            public string FileExt { get; set; }
            public Stream Content {  get; set; } = Stream.Null;

            public void Dispose() => Content?.Dispose();
        }
        #endregion
    }

}