        let dropArea = document.getElementById('drop_area')

            ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false)
            })

            ;['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false)
            })

            ;['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false)
            })


        dropArea.addEventListener('drop', handleDrop, false)

        function handleDrop(e) {
            let dt = e.dataTransfer
            let files = dt.files

            handleFiles(files)
        }

        function handleFiles(files) {
            files = [...files]
            files.forEach(uploadFile)
        }

        function uploadFile(file) {
            var uploadable = false;
            if ($("#quoteNo").val().length == 0) {
                alert("Please enter Quote No.");
                return;
            }
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = function () {
                const name = file.name
                const s = name.split('.')
                const ext = s[s.length - 1].toLowerCase()
                if (file.size > 1024 * 1024 * 3) {
                    $('#error_message').html('Invalid File Size ' + name + '. The file size should be less than 3M.').show();
                }
                if (file.type.indexOf('image/') == 0) {
                    uploadable = true;
                } else {
                    if (ext == "doc" || ext == "docx")
                        uploadable = true;
                    else if (ext == "pdf")
                        uploadable = true;
                    else if (ext == "xls" || ext == "xlsx")
                        uploadable = true;
                    else {
                        $('#error_message').html("Invalid file type. " + name).show();
                    }
                }

                if (uploadable) {
                    var data = new FormData();
                    data.append("Uploadedfile", file);
                    data.append("quoteNo", $("#quoteNo").val());

                    $.ajax({
                        type: "POST",
                        url: "Handler.ashx",
                        contentType: false,
                        processData: false,
                        data: data,
                        success: function (data) {
                            loadFiles();
                        }
                    }).fail(function (e) {
                        $('#uploading_progress').hide();
                        $('#error_message').html("Upload failed: " + file.name).show();
                    });
                }
            }
        }

        function highlight(e) {
            $('#error_message').hide();
            dropArea.classList.add('highlight')
        }

        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }


        function preventDefaults(e) {
            e.preventDefault()
            e.stopPropagation()
        }



        function loadFiles() {
            var quoteNo = $("#quoteNo").val();
            if (quoteNo.length == 0) return;
            $.ajax({
                url: 'Handler.ashx',
                contentType: "application/json; charset=utf-8",
                type: 'GET',
                data: { quoteNo: quoteNo },
                success: function (data) {
                    $("#attached_document").html("");
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(data, "text/xml");
                    var datas = xmlDoc.getElementsByTagName("Data");
                    for (var i = 0; i < datas.length; i++) {
                        showElementData(datas[i].childNodes[1].innerHTML, datas[i].childNodes[2].innerHTML, datas[i].childNodes[0].innerHTML)
                    }

                    $(".fileList").click(function () {
                        window.open("Handler.ashx?Id=" + $(this).attr("id"));
                    });

                    $(".delete-icon").click(function () {
                        var fname = $(this).prev().html();
                        var id = $(this).prev().attr("id");
                        if (confirm('Do you want to delete "' + fname + '"?')) {
                            deleteAttachment(id);
                        }
                    });

                },
                error: function (errorText) {
                    alert("Wwoops something went wrong !");

                }
            }).fail(function (e) {
                console.log("failed");
            });
        }

        function showElementData(fileName, fileExtension, id) {
            let tag = "";
            if (fileExtension == "doc" || fileExtension == "docx")
                tag = '<div class="list-item"><img src="images/docs.gif"><a id="' + id + '" class="fileList">' +
                    fileName +
                    '</a><div class="delete-icon"></div></div>'
            else if (fileExtension == "pdf")
                tag = '<div class="list-item"><img src="images/docs.gif"><a id="' + id + '" class="fileList">' +
                    fileName +
                    '</a><div class="delete-icon"></div></div>'
            else if (fileExtension == "xls" || fileExtension == "xlsx")
                tag = '<div class="list-item"><img src="images/docs.gif"><a id="' + id + '" class="fileList">' +
                    fileName +
                    '</a><div class="delete-icon"></div></div>'
            else if (fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "gif") {
                tag = '<div class="list-item"><img src="docs/quote.jpg"><a id="' + id + '" class="fileList">' +
                    fileName +
                    '</a><div class="delete-icon"></div></div>'
            }
            if (tag.length > 0) {
                $('#attached_document').append($(tag));

            }

        }

        function deleteAttachment(id) {
            $.ajax({
                url: 'Handler.ashx',
                contentType: "application/json; charset=utf-8",
                type: 'GET',
                data: { task: "delete", aid: id },
                success: function (data) {
                    if (!data.error) {
                        $("a#" + id).parent().remove();
                    }
                },
                error: function (errorText) {
                    alert("Wwoops something went wrong !");

                }
            }).fail(function (e) {
                console.log("failed");
            });
        }

        $(document).ready(function () {
            loadFiles();

            $("#quoteNo").on("change", function () {
                loadFiles();
            });

        });
