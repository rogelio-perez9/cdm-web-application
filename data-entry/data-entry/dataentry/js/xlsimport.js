var xlsFile;
var xlsxlsDropArea;
function DragNDrop(areaId) {
    xlsDropArea = document.getElementById(areaId);

    this.init = function (handleDrop) {

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            if (xlsDropArea) xlsDropArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            if (xlsDropArea) xlsDropArea.addEventListener(eventName, this.highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            if (xlsDropArea) xlsDropArea.addEventListener(eventName, this.unhighlight, false);
        });

        if (xlsDropArea) xlsDropArea.addEventListener('drop', handleDrop, false);
    }

    this.highlight = function (e) {
        if (xlsDropArea) xlsDropArea.classList.add('highlight');
    }

    this.unhighlight = function (e) {
        xlsDropArea.classList.remove('highlight');
    }

    this.preventDefaults = function (e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function handleXlsDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleXlsFiles(files);
}

function handleXlsFiles(files) {
    if (files.length > 0) {
        $('#xls_upload_btn').hide();
        $('#xls_submit_btns').show();
        $('#xls_notification').hide();
        const name = files[0].name;
        const s = name.split('.');
        const ext = s[s.length - 1].toLowerCase();
        if (!['xls', 'xlsx'].includes(ext)) {
            $('#xls_error_message').html('Invalid file type. ' + name).show();
            return;
        }
        xlsFile = files[0];
    }
}

function cancelXlsSubmit() {
    $('#xls_upload_btn').show();
    $('#xls_submit_btns').hide();
    $('#xls_drag_label').show();
    $('#xls_notification_gif').hide();
    $('#xls-file-input').val('');
    xlsFile = null;
}

//function handleXlsUploading(e) {
//    if (e.lengthComputable) {
//        var perc = Math.round((e.loaded / e.total) * 100);
//        // $('#xls_uploading_progress').val(perc);
//        if (perc >= 100) {
//            // $('#xls_uploading_progress').hide();
//            $('#xls_notification').html('Uploa...').show();
//            $('#xls_notification_gif').hide();
//        }
//    }
//}

function handleXlsSubmit() {
    if (!xlsFile) return;

    let data = new FormData();
    data.append('xlsfile', xlsFile);
    const sqid = $('#sqid').val();
    const custid = $('#xlsid').val();
    const xlsupload = $('#xlsupload').val();
    data.append('xlsupload', xlsupload);
    $('#xls_submit_btns').hide();
    $('#xls_drag_label').hide();

    $.ajax({
        type: 'POST',
        url: 'dataentry.ashx?task=uploadSection321&sqid=' + sqid + '&custid=' + custid ,
        contentType: false,
        processData: false,
        data: data,
        //xhr: function () {
        //    let myXhr = $.ajaxSettings.xhr();
        //    if (myXhr.upload) {
        //        myXhr.upload.addEventListener('progress', handleXlsUploading, false);
        //    }
        //    return myXhr;
        //},
        beforeSend: function () {
            // $('#xls_uploading_progress').val(0);
            // $('#xls_uploading_progress').show();
            $('#xls_notification').html('Uploading...').show();
            $('#xls_notification_gif').show();
        },
        success: function (data) {
            $('#xls_notification').html(`PROCESS COMPLETE! UPLOAD SUCCESSFULLY!`).show();
            $('#xlsfilename').val(xlsFile.name);
            cancelXlsSubmit();
            // window.alert(`PROCESS COMPLETE! ${data.total.toLocaleString('en')} BILLS PROCESS!`);
        },
        error: function (err) {
            $('#xls_error_message').html('Upload failed: ' + xlsFile.name).show();
            // $('#xls_uploading_progress').hide();
            $('#xls_notification').hide();
            cancelXlsSubmit();
        }
    }).fail(function (e) {
        // $('#xls_uploading_progress').hide();
        $('#xls_error_message').html('Upload failed: ' + xlsFile.name).show();
    });
}

$(document).ready(function () {
    var xlsdrogndrop = new DragNDrop('xls_drop_area');
    xlsdrogndrop.init(handleXlsDrop);

    $('#xls_upload_btn').click(function () {
        $('#xls-file-input').trigger('click');
    });
    $('#xls_cancel_btn').click(function () {
        cancelXlsSubmit();
    });
    $('#xls_submit_btn').click(function () {
        handleXlsSubmit();
    });
});