function validateForm(form) {
  var v1 = form.documentId.value;
	var v2 = form.xlsfilename.value;
  if (v1 == "") {
     alert("Your Upload Reference Cannot Be Blank");
     return false;
     }
  if (v2 == "") {
     alert("No XLS Uploaded, Click To Choose File, Select XLS, then Click Upload File");
     return false;
     }
	return true;
  }

