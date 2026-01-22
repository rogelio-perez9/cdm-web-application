let dropArea = document.getElementById( 'drop_area' );
const MAX_UPLOAD_FILE_SIZE = 20; // in MB
const AVAILABLE_FILE_TYPES = ['doc', 'docx', 'pdf', 'xls', 'xlsx', 'msg', 'mov', 'mp4'];
var uploadingFile;

['dragenter', 'dragover', 'dragleave', 'drop'].forEach( eventName => {
	if ( dropArea ) dropArea.addEventListener( eventName, preventDefaults, false );
} );

['dragenter', 'dragover'].forEach( eventName => {
	if ( dropArea ) dropArea.addEventListener( eventName, highlight, false );
} );

['dragleave', 'drop'].forEach( eventName => {
	if ( dropArea ) dropArea.addEventListener( eventName, unhighlight, false );
} );

if ( dropArea ) dropArea.addEventListener( 'drop', handleDrop, false );

function handleDrop( e ) {
	let dt = e.dataTransfer;
	let files = dt.files;

	handleFiles( files );
}

function handleFiles( files ) {
	files = [...files];
	files.forEach( checkFile );
}

function checkFile( file ) {
	console.log( 'file===>', file );
	let uploadable = false;
	if ( $( '#attach-documentId' ).val().length == 0 ) {
		alert( 'Please enter Document ID.' );
		return;
	}
	let reader = new FileReader();
	reader.readAsDataURL( file );
	reader.onloadend = function () {
		const name = file.name;
		const s = name.split( '.' );
		const ext = s[s.length - 1].toLowerCase();
		if ( file.size > 1024 * 1024 * MAX_UPLOAD_FILE_SIZE ) {
			$( '#error_message' ).html( 'Invalid File Size ' + name + '. The file size should be less than 3M.' ).show();
		}
		if ( file.type.indexOf( 'image/' ) == 0 ) {
			uploadable = true;
		} else {
			if ( AVAILABLE_FILE_TYPES.includes( ext ) ) uploadable = true;
			else {
				$( '#error_message' ).html( 'Invalid file type. ' + name ).show();
			}
		}
		console.log( 'uploadable===>', uploadable );
		if ( uploadable ) {
			uploadingFile = file;
			$( '#upload-file-dialog' ).dialog( 'open' );
		}
	}
}

function onUploadFile() {
	if ( !uploadingFile ) return;
	const documenttype = $( '#upload-file-dialog #upload_documenttype' ).val();
	if ( !documenttype ) {
		alert( 'Please select Document Type' );
		return;
	}
	let customerview = $( '#customerview' ).val();
	if ( customerview == '-1' ) {
		customerview = $( '#upload-file-dialog #upload_customerview' ).is( ':checked' ) ? 1 : 0;
	}
	let data = new FormData();
	data.append( 'Uploadedfile', uploadingFile );
	data.append( 'documentId', $( '#attach-documentId' ).val() );
	data.append( 'uploaduserid', $( '#userid' ).val() );
	data.append( 'customerview', customerview );
	data.append( 'documenttype', documenttype );
	const sqid = $( '#sqid' ).val();

	$.ajax( {
		type: 'POST',
		url: 'dataentry.ashx?task=uploadfile&sqid=' + sqid,
		contentType: false,
		processData: false,
		data: data,
		xhr: function () {
			let myXhr = $.ajaxSettings.xhr();
			if ( myXhr.upload ) {
				myXhr.upload.addEventListener( 'progress', handleUploading, false );
			}
			return myXhr;
		},
		beforeSend: function () {
			$( '#uploading_progress' ).val( 0 );
			$( '#uploading_progress' ).show();
		},
		success: function ( data ) {
			loadFiles( $( '#attach-documentId' ).val(), 'attached_documents' );
			$( '#uploading_progress' ).hide();
			onCloseUploadFileDialog();
		},
		error: function ( err ) {
			$( '#error_message' ).html( 'Upload failed: ' + file.name ).show();
			$( '#uploading_progress' ).hide();
		},
		complete: function () {
			uploadingFile = undefined;
		}
	} ).fail( function ( e ) {
		$( '#uploading_progress' ).hide();
		$( '#error_message' ).html( 'Upload failed: ' + file.name ).show();
	} );
}

function onCloseUploadFileDialog() {
	uploadingFile = undefined;
	$( '#upload-file-dialog' ).dialog( 'close' );
}
function handleUploading( e ) {
	if ( e.lengthComputable ) {
		var perc = Math.round( ( e.loaded / e.total ) * 100 );
		$( '#uploading_progress' ).val( perc );
	}
}

function highlight( e ) {
	$( '#error_message' ).hide();
	dropArea.classList.add( 'highlight' );
}

function unhighlight( e ) {
	dropArea.classList.remove( 'highlight' );
}

function preventDefaults( e ) {
	e.preventDefault();
	e.stopPropagation();
}

function loadFiles( documentId, containerId ) {
	const container = $( `#${containerId}` );
	const uploaduserid = $( '#userid' ).val();
	const customerview = $( '#customerview' ).val();

	if ( !documentId || !uploaduserid || ( customerview?.length ?? 0 ) === 0 ) {
		container.html( '' );
		return;
	}

	const sqid = $('#sqid').val();
	const canDeleteFiles = $('#allowdelete').val();

	$.ajax( {
		url: 'dataentry.ashx?task=getfiles&sqid=' + sqid,
		contentType: 'application/json; charset=utf-8',
		type: 'GET',
		data: { documentId, uploaduserid, customerview },
		success: function ( data ) {
			container.html( '' );
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString( data, 'text/xml' );
			var datas = xmlDoc.getElementsByTagName( 'Data' );
			for ( var i = 0; i < datas.length; i++ ) {
				showElementData( containerId, datas[i].childNodes );
			}

			$( `#${containerId} .fileList` ).click( function () {
				window.open( 'dataentry.ashx?task=downfile&sqid=' + sqid + '&Id=' + $( this ).attr( 'id' ) );
			} );

			$( `#${containerId} .delete-icon` ).click( function () {
				var fname = $( this ).prev().html();
				var id = $( this ).prev().attr( 'id' );
				if ( confirm( 'Do you want to delete "' + fname + '"?' ) ) {
					deleteAttachment( id );
				}
			} );

		},
		error: function ( errorText ) {
			alert( 'Wwoops something went wrong !' );

		}
	} ).fail( function ( e ) {
		console.log( 'failed' );
	} );
}


function showElementData( containerId, data ) {
	const fileName = data[1].innerHTML;
	const fileExtension = data[2].innerHTML;
	const id = data[0].innerHTML;
	const content = data[4].innerHTML;
	const documenttype = data[5].innerHTML;
	const uploaddate = data[6].innerHTML;
	const displayName = `${fileName}: ${documenttype} ${uploaddate}`;
	let tag = '';
	const thumbImages = {
		doc: 'images/doc.png',
		docx: 'images/doc.png',
		pdf: 'images/pdf.png',
		msg: 'images/email.png',
		xls: 'images/xls.png',
		xlsx: 'images/xls.png',
		mov: 'images/mov.gif',
		mp4: 'images/mp4.gif'
	}
	if ( fileExtension == 'msg' )
		tag = `<div class="list-item"><img src="${thumbImages[fileExtension]}" onclick="showMsgFile('${id}')"><a id="${id}" class="fileList">${displayName}</a><div class="delete-icon"></div></div>`;
	else if ( fileExtension == 'png' || fileExtension == 'jpg' || fileExtension == 'jpeg' || fileExtension == 'gif' ) {
		tag = `<div class="list-item"><img src="data:image/jpg;base64,${content}"><a id="${id}" class="fileList">${displayName}</a><div class="delete-icon"></div></div>`;
	} else {
		tag = `<div class="list-item"><img src="${thumbImages[fileExtension]}"><a id="${id}" class="fileList">${displayName}</a><div class="delete-icon"></div></div>`;
	}
	$( `#${containerId}` ).append( $( tag ) );
}

function deleteAttachment( id ) {
	const sqid = $( '#sqid' ).val();
	$.ajax( {
		url: 'dataentry.ashx?task=deletefile&sqid=' + sqid,
		contentType: 'application/json; charset=utf-8',
		type: 'GET',
		data: {
			aid: id
		},
		success: function ( data ) {
			if ( !data.error ) {
				$( '#' + id ).parent().remove();
			}
		},
		error: function ( errorText ) {
			alert( 'Wwoops something went wrong !' );

		}
	} ).fail( function ( e ) {
		console.log( 'failed' );
	} );
}

function showMsgFile( id ) {
	const sqid = $( '#sqid' ).val();
	$.ajax( {
		url: 'dataentry.ashx?task=showmsgfile&sqid=' + sqid,
		contentType: 'application/json; charset=utf-8',
		type: 'GET',
		data: {
			aid: id
		},
		success: function ( data ) {
			if ( !data.error ) {
				alert( 'Open MSG file success' );
			}
		},
		error: function ( errorText ) {
			alert( 'Wwoops something went wrong !' );

		}
	} ).fail( function ( e ) {
		console.log( 'failed' );
	} );
}

function onLoadDocumentTypes() {
	$.ajax( {
		url: `dataentry.ashx?task=getAesCodeTypes&type=DRAGNDROP`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function ( res ) {
			const selectElement = $( `#upload_documenttype` );
			selectElement.empty();
			res.forEach( function ( item ) {
				selectElement.append( `<option value="${item.code}">${item.expand}</option>` );
			} );
		}
	} );
}

$( document ).ready( function () {
	$( '#upload-file-dialog' ).dialog( {
		autoOpen: false,
		draggable: false,
		modal: true,
		width: 600,
		position: {
			my: "top",
			at: "top",
			of: window
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: function ( event, ui ) {
			$( '#upload-file-dialog #divInDialog' ).load( 'uploadFileDialog.html', function () {
				onLoadDocumentTypes();
				const customerview = $( '#customerview' ).val();
				if ( customerview == -1 ) $( '#upload_cutomerview_checkbox' ).show();
				else $( '#upload_cutomerview_checkbox' ).hide();
			} );
		}
	});

	// Trigger the function to remove delete action "button"
	waitForAllowDeleteInputInDOM();
});

function waitForAllowDeleteInputInDOM() {
	const interval = setInterval(function () {
		const $allowDelete = $('#allowdelete');
		const $deleteIcon = $('.delete-icon');

		// Waits until <input id="allowdelete" and <div class="delete-icon"></div>
		// Exist in the DOM
		if ($allowDelete.length && $deleteIcon.length) {
			const value = $allowDelete.val();
			// Added 1 or true to prevent edge cases
			if (value === '1' || value === 'true') {
				$deleteIcon.remove();
			}
			// Once deleted, remove loop
			clearInterval(interval);
		}
	}, 100);
	}
