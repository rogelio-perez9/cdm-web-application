function _SaveDocToFile(sqid, folderPath, ids) {

    const isBlank = v => v == null || String(v).trim() === '';
    const missing = [];

    if (isBlank(sqid)) missing.push('sqid');
    if (isBlank(folderPath)) missing.push('folderPath');
    if (isBlank(ids)) missing.push('ids');

    if (missing.length) {
        alert('Missing required parameter(s): ' + missing.join(', '));
        return;
    }

    const cleanIds = String(ids)
        .split(/[,; ]+/)
        .map(s => s.trim())
        .filter(Boolean)
        .join(',');

    const q = {
        sqid: String(sqid).trim(),
        folderPath: String(folderPath).trim(),
        ids: cleanIds
    };

    $.ajax({
        url: `savedoctofile.ashx${toQueryString(q)}`,
        type: 'GET',
        dataType: 'json',
        success: function (resp) {
            if (resp && resp.ok === true) {
                alert(resp.message);
            } else {
                alert(resp && resp.message ? resp.message : 'No files saved.');
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.error('Request failed:', xhr && xhr.status, textStatus, errorThrown, xhr && xhr.responseText);
        }
    });
}

//$(function () {
//    const sqid = 'topoceanusa';
//    const folderPath = 'C:\\files';
//    const ids = '88, 85, 72';
//    _SaveDocToFile(sqid, folderPath, ids);
//})