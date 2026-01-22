let dropArea = document.getElementById('drop_area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
}

function handleFiles(files) {
    files = [...files];
    files.forEach(uploadFile);
}

function uploadFile(file) {
    let uploadable = false;
    if ($('#documentId').val().length == 0) {
        alert('Please enter Document ID.');
        return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
        const name = file.name;
        const s = name.split('.');
        const ext = s[s.length - 1].toLowerCase();
        if (file.size > 1024 * 1024 * 3) {
            $('#error_message').html('Invalid File Size ' + name + '. The file size should be less than 3M.').show();
        }
        if (file.type.indexOf('image/') == 0) {
            uploadable = true;
        } else {
            if (ext == 'doc' || ext == 'docx')
                uploadable = true;
            else if (ext == 'pdf')
                uploadable = true;
            else if (ext == 'xls' || ext == 'xlsx')
                uploadable = true;
            else if (ext == 'msg' || ext == 'msg')
                uploadable = true;
            else {
                $('#error_message').html('Invalid file type. ' + name).show();
            }
        }

        if (uploadable) {
            let data = new FormData();
            data.append('Uploadedfile', file);
            data.append('documentId', $('#documentId').val());
            const sqid = $('#sqid').val();

            $.ajax({
                type: 'POST',
                url: 'dragndrop.ashx?task=uploadfile&sqid=' + sqid,
                contentType: false,
                processData: false,
                data: data,
                xhr: function () {
                    let myXhr = $.ajaxSettings.xhr();
                    if (myXhr.upload) {
                        myXhr.upload.addEventListener('progress', handleUploading, false);
                    }
                    return myXhr;
                },
                beforeSend: function () {
                    $('#uploading_progress').val(0);
                    $('#uploading_progress').show();
                },
                success: function (data) {
                    loadFiles();
                    $('#uploading_progress').hide();
                },
                error: function (err) {
                    $('#error_message').html('Upload failed: ' + file.name).show();
                    $('#uploading_progress').hide();
                }
            }).fail(function (e) {
                $('#uploading_progress').hide();
                $('#error_message').html('Upload failed: ' + file.name).show();
            });
        }
    }
}

function handleUploading(e) {
    if (e.lengthComputable) {
        var perc = Math.round((e.loaded / e.total) * 100);
        $('#uploading_progress').val(perc);
    }
}

function highlight(e) {
    $('#error_message').hide();
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function loadFiles() {
    var documentId = $('#documentId').val();
    if (documentId.length == 0) {
        $('#attached_documents').html('');
        return;
    }
    const sqid = $('#sqid').val();
    $.ajax({
        url: 'dragndrop.ashx?task=getfiles&sqid=' + sqid,
        contentType: 'application/json; charset=utf-8',
        type: 'GET',
        data: { documentId: documentId },
        success: function (data) {
            $('#attached_documents').html('');
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(data, 'text/xml');
            var datas = xmlDoc.getElementsByTagName('Data');
            for (var i = 0; i < datas.length; i++) {
                showElementData(datas[i].childNodes);
            }

            $('.fileList').click(function () {
                window.open('dragndrop.ashx?task=downfile&sqid=' + sqid + '&Id=' + $(this).attr('id'));
            });

            $('.delete-icon').click(function () {
                var fname = $(this).prev().html();
                var id = $(this).prev().attr('id');
                if (confirm('Do you want to delete "' + fname + '"?')) {
                    deleteAttachment(id);
                }
            });

        },
        error: function (errorText) {
            alert('Wwoops something went wrong !');

        }
    }).fail(function (e) {
        console.log('failed');
    });
}

function showElementData(data) {
    const fileName = data[1].innerHTML;
    const fileExtension = data[2].innerHTML;
    const id = data[0].innerHTML;
    const content = data[4].innerHTML;
    let tag = '';
    if (fileExtension == 'doc' || fileExtension == 'docx')
        tag = '<div class="list-item"><img src="images/doc.png"><a id="' + id + '" class="fileList">' +
            fileName + '</a><div class="delete-icon"></div></div>';
    else if (fileExtension =='pdf')
        tag = '<div class="list-item"><img src="images/pdf.png"><a id="' + id + '" class="fileList">' +
            fileName + '</a><div class="delete-icon"></div></div>';
    else if (fileExtension == 'msg')
        tag = '<div class="list-item"><img src="images/email.png"><a id="' + id + '" class="fileList">' +
            fileName + '</a><div class="delete-icon"></div></div>';
    else if (fileExtension == 'xls' || fileExtension == 'xlsx')
        tag = '<div class="list-item"><img src="images/xls.png"><a id="' + id + '" class="fileList">' +
            fileName + '</a><div class="delete-icon"></div></div>';
    else if (fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg' || fileExtension == 'gif') {
        tag = '<div class="list-item"><img src="data:image/jpg;base64,' + content + '"><a id="' + id + '" class="fileList">' +
            fileName + '</a><div class="delete-icon"></div></div>';
    }
    if (tag.length > 0) {
        $('#attached_documents').append($(tag));
    }

}

function deleteAttachment(id) {
    const sqid = $('#sqid').val();
    $.ajax({
        url: 'dragndrop.ashx?task=deletefile&sqid=' + sqid,
        contentType: 'application/json; charset=utf-8',
        type: 'GET',
        data: {
            aid: id
        },
        success: function (data) {
            if (!data.error) {
                $('#' + id).parent().remove();
            }
        },
        error: function (errorText) {
            alert('Wwoops something went wrong !');

        }
    }).fail(function (e) {
        console.log('failed');
    });
}

$(document).ready(function () {
    loadFiles();

    $('#documentId').on('change', function () {
        loadFiles();
    });

    $('#drag_label').on('click', function () {
        $('#file_elem').trigger('click');
    });
});