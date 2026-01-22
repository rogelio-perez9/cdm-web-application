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
            if ($("#docNo").val().length == 0) {
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
                    data.append("docNo", $("#docNo").val());

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
            var docNo = $("#docNo").val();
            if (docNo.length == 0) return;
            $.ajax({
                url: 'Handler.ashx',
                contentType: "application/json; charset=utf-8",
                type: 'GET',
                data: { docNo: docNo },
                success: function (data) {
                    $("#attached_document").html("");
                    var parser = new DOMParser();
                    var xmlDoc = parser.parseFromString(data, "text/xml");
                    var datas = xmlDoc.getElementsByTagName("Data");
                    for (var i = 0; i < datas.length; i++) {
                        showElementData(datas[i].childNodes[1].innerHTML, datas[i].childNodes[2].innerHTML, datas[i].childNodes[0].innerHTML)
                    }

                    $("#docNo").val(datas[datas.length - 1].childNodes[3].innerHTML);

                    $(".fileList").click(function () {
                        window.open("Handler.ashx?Id=" + $(this).attr("id"));
                    });
                    
                },
                error: function (errorText) {
                    alert("CDM WebFreight Cannot Connect to Document Manager !");
                    
                }
            }).fail(function (e) {
                console.log("failed");
            });
        }

        function showElementData(fileName, fileExtension, id) {
            let tag = "";
            if (fileExtension == "doc" || fileExtension == "docx")
                tag = '<a target-"_blank" id="' + id + '" class="fileList">' +
                    fileName +
                    '<div class="list-item"><img src="images/original-doc.png"></div></a>'
            else if (fileExtension == "pdf")
                tag = '<a target-"_blank" id="' + id + '" class="fileList">' +
                    fileName +
                    '<div class="list-item"><img src="images/original-pdf.png"></div></a>'
            else if (fileExtension == "xls" || fileExtension == "xlsx")
                tag = '<a target-"_blank" id="' + id + '" class="fileList">' +
                    fileName +
                    '<div class="list-item"><img src="images/original-xls.png"></div></a>'
            else if (fileExtension == "png" || fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "gif") {
                tag = '<a target-"_blank" id="' + id + '" class="fileList"><div class="list-item"><img src="images/original-jpeg.png">' +
                    fileName +
                    '</div></a>'
            }
            if (tag.length > 0) {
                $('#attached_document').append($(tag));
                
            }
                
        }
        
        $(document).ready(function () {
            loadFiles();

            $("#docNo").on("change", function () {
                loadFiles();
            })
        });
