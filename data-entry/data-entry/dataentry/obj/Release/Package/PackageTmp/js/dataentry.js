/**** the function to build Autocomplete Field ****/
/* --- required params in config variable --- */
/* url: request url */
/* task: used to define API to auto complete */
/* fieldId: id of the autocomplete input in html(ex: vessel)  */
/* tokenId: id to identify the values fetched from database(ex: imo) */
/* searchKey: name of field to search in the fetched data (column name matched with fieldId in html)(ex: vessel) */
/* ---- optional params  --- */
/* queryParam: key to pass the value in autocomplete field(default: 'q') */
/* minChars: minimum legth of autocomplete field to search(default: 2)  */
/* preventDuplicates: define if prevent or not duplicated values in autocomplete select (default: false) */
/* fields: fields to be filled automatically, type object({ui: , api: }) */
/* field/ui: id of input, select or checkbox in html */
/* field/api: column name in database */
var html5QrCode
const qrElement = document.getElementById('qr-reader')
if (qrElement) html5QrCode = new Html5Qrcode('qr-reader')
var tempData = {}
var cameraPhoto = undefined
const AIR_CARRIER = 'AIR CARRIER'
const SEA_CARRIER = 'SEA CARRIER'
const tariffNoConfig = {
	task: 'getTariffNos',
	url: 'dataentry.ashx',
	queryParam: 'q',
	fieldId: 'tariffno',
	tokenId: 'uuid',
	searchKey: 'ratestr',
	minChars: 1,
	preventDuplicates: true,
	allowFreeTagging: true,
	serverKey: 'ratestr',
	container: 'tariffno_th',
	params: [
		{
			key: 'billid',
			field: `#billid_th #billid`
		}
	],
	fields: [
		{ ui: 'tariffno', api: 'tariffno' },
	]
}

function drawImageActualSize() {
	let canvas = document.querySelector("#camera-canvas")
	const ctx = canvas.getContext("2d")
	// Use the intrinsic size of image in CSS pixels for the canvas element
	canvas.width = this.naturalWidth
	canvas.height = this.naturalHeight

	// Will draw the image as 300x227, ignoring the custom size of 60x45
	// given in the constructor
	ctx.drawImage(this, 0, 0)

	// To use the custom size we'll have to specify the scale parameters
	// using the element's width and height properties - lets draw one
	// on top in the corner:
	ctx.drawImage(this, 0, 0, this.width, this.height)
}

function startCameraDefaultAll() {
	if (!cameraPhoto) return
	cameraPhoto.startCamera(JslibHtml5CameraPhoto.FACING_MODES.ENVIRONMENT, {})
		.then(() => {
			var log = `Camera started with default All`
			console.log(log)
		})
		.catch((error) => {
			console.error('Camera not started!', error)
		})
}

function takePhoto() {
	var sizeFactor = 1
	var imageType = JslibHtml5CameraPhoto.IMAGE_TYPES.PNG
	var imageCompression = 1

	var config = {
		sizeFactor,
		imageType,
		imageCompression
	}

	var dataUri = cameraPhoto.getDataUri(config)
	let canvas = document.querySelector("#camera-canvas")
	const image = new Image(canvas.width, canvas.height)
	image.onload = drawImageActualSize
	image.src = dataUri

	/*canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
	console.log('data==>Uri', dataUri)*/
	//imgElement.src = dataUri;
	stopCamera()
}

function stopCamera() {
	cameraPhoto.stopCamera()
		.then(() => {
			console.log('Camera stoped!')
		})
		.catch((error) => {
			console.log('No camera to stop!:', error)
		})
}

function initAutoComplete(config) {
	if ($(`#${config.fieldId}`).is('[readonly]')) return
	const initValue = $(`#${config.fieldId}`).val()
	const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : []
	const sqid = $("#sqid").val()
	if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
		console.error('Missing the required params')
		return false
	}
	let query = ''
	if (config.params) {
		config.params.forEach(p => {
			query += `&${p.key}=${$(p.field).val()}`
		})
	}
	$("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid + query, {
		queryParam: config.queryParam || 'q',
		propertyToSearch: config.searchKey,
		tokenValue: config.tokenId,
		minChars: config.minChars || 2,
		preventDuplicates: config.preventDuplicates || false,
		tokenLimit: config.tokenLimit || 1,
		prePopulate: prePopulate,
		allowFreeTagging: config.allowFreeTagging || false,
		onAdd: function (data) {
			if (config.allowFreeTagging && config.serverKey in data) {
				config.fields.forEach(item => {
					$("#" + item.ui).val(data[item.api])
				})
			} else {
				config.fields.forEach(item => {
					$("#" + item.ui).val('')
				})
				$("#" + config.fieldId).val(data[config.fieldId])
			}
			if (config.container) {
				$("#" + config.container + " .token-input-token > p").html(data[config.fieldId])
			}
			return true
		},
		onDelete: function () {
			config.fields.forEach(item => {
				$("#" + item.ui).val('')
			})
		},
		onReady: function () {
			$("#" + config.fieldId).val(initValue)
		}
	})
}

function initPairAutoComplete(config) {
	if ($(`#${config.fieldId}`).is('[readonly]')) return
	const initValue = $(`#${config.fieldId}`).val()
	const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : []
	const sqid = $("#sqid").val()
	if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
		console.error('Missing the required params')
		return false
	}
	return $("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid + "&searchkey=" + config.searchKey, {
		queryParam: config.queryParam || 'q',
		propertyToSearch: config.searchKey,
		tokenValue: config.tokenId,
		minChars: config.minChars || 2,
		preventDuplicates: config.preventDuplicates || false,
		tokenLimit: config.tokenLimit || 1,
		prePopulate: prePopulate,
		resultsLimit: 100,
		onAdd: function (data) {
			if (config.pairField && (tempData[config.pairKey] !== data[config.pairKey] || tempData.fieldId !== config.pairField)) {
				tempData = {
					fieldId: config.fieldId,
					[config.pairKey]: data[config.pairKey],
					[config.searchKey]: data[config.searchKey]
				}
				$("#" + config.pairField).tokenInput("clear")
				$("#" + config.pairField).tokenInput("add", { [config.pairKey]: data[config.pairKey], [config.searchKey]: data[config.searchKey] })
			}

			config.fields.forEach(item => {
				$("#" + item.ui).val(data[item.api])
			})
			return true
		},
		onDelete: function () {
			config.fields.forEach(item => {
				$("#" + item.ui).val('')
			})
			$("#" + config.pairField).tokenInput("clear")
			$("#token-input-" + config.fieldId).focus()
		},
		onReady: function () {
			$("#" + config.fieldId).val(initValue)
		}
	})
}


function initCombineAutoComplete(config, params = '') {
	if ($(`#${config.fieldId}`).is('[readonly]')) return

	const initValue = $(`#${config.fieldId}`).val()
	const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : []
	const sqid = $("#sqid").val()

	if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
		console.error('Missing the required params')
		return false
	}

	let requestUrl = config.url + "?task=" + config.task + "&sqid=" + sqid

	if (params)
		requestUrl += params

	$("#" + config.fieldId).tokenInput(requestUrl, {
		queryParam: config.queryParam || 'q',
		propertyToSearch: config.searchKey,
		tokenValue: config.tokenId,
		minChars: config.minChars || 2,
		preventDuplicates: config.preventDuplicates || false,
		tokenLimit: config.tokenLimit || 1,
		prePopulate: prePopulate,
		onAdd: function (data) {
			$("#" + config.fieldId).val(data[config.tokenId])
			$("#" + config.container + " .token-input-token > p").html(data[config.tokenId])

			config.fields.forEach(item => {
				if (item.type == 'checkbox') {
					$("#" + item.ui).prop('checked', Number(data[item.api]) == 1)
				}
				else if (item.type == 'ti') {
					if (data[item.api]?.length > 0) {
						const ti = $("#" + item.ui).data()
						const tiItem = {}
						tiItem[ti.settings.propertyToSearch] = data[item.api]

						$("#" + item.ui).tokenInput("add", tiItem)
						$("#" + item.ui).val(data[item.api])
					}
				}
				else {
					$("#" + item.ui).val(data[item.api])
				}
			})

			if (config.fieldId == 'billid' && config.container == 'billid_th') {
				$("#tariffno_th .token-input-list").remove()
				initAutoComplete(tariffNoConfig)
			}

			if (config.onAdd) config.onAdd(data)

			return true
		},
		onDelete: function () {
			config.fields.forEach(item => {
				if (item.type == 'checkbox') {
					$("#" + item.ui).prop('checked', false)
				}
				else if (item.type == 'ti') {
					$("#" + item.ui).tokenInput("clear")
				}
				else {
					$("#" + item.ui).val('')
				}
			})

			if (config.fieldId == 'billid' && config.container == 'billid_th') {
				let tariffno = $('#tariffno')

				if (tariffno.length) {
					$('#tariffno')?.tokenInput('clear')
				}

				$("#tariffno_th .token-input-list").remove()
				initAutoComplete(tariffNoConfig)
			}

			if (config.onDelete) config.onDelete()
		},
		onReady: function () {
			$("#" + config.fieldId).val(initValue)
		}
	})
}


function initCombineAutoCompletePoulcode(config, params = '') {
	if ($(`#${config.fieldId}`).is('[readonly]')) return
	const initValue = $(`#${config.fieldId}`).val()
	const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : []
	const sqid = $("#sqid").val()
	if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
		console.error('Missing the required params')
		return false
	}
	let requestUrl = config.url + "?task=" + config.task + "&sqid=" + sqid
	if (params)
		requestUrl += params
	$("#" + config.fieldId).tokenInput(requestUrl, {
		queryParam: config.queryParam || 'q',
		propertyToSearch: config.searchKey,
		tokenValue: config.tokenId,
		minChars: config.minChars || 2,
		preventDuplicates: config.preventDuplicates || false,
		tokenLimit: config.tokenLimit || 1,
		prePopulate: prePopulate,
		onAdd: function (data) {
			const v = data[config.tokenId]
			$("#" + config.fieldId).val(v)
			$("#" + config.container + " .token-input-token > p").html(v)

			config.fields.forEach(item => {
				const v = data[item.api]
				$("#" + item.ui).val(v)
			})

			const ss = data.code?.substring(0, 2)
			if (ss) {
				const eustates = $('#eustates').val()
				if (ss == 'US') $("#ams").prop('checked', true)
				else if (ss == 'CA') $("#caaci").prop('checked', true)
				else if (eustates?.includes(ss)) $("#euics").prop('checked', true)
			}
			return true
		},
		onDelete: function () {
			config.fields.forEach(item => {
				$("#" + item.ui).val('')
			})
			$("#ams").prop('checked', false)
			$("#caaci").prop('checked', false)
			$("#euics").prop('checked', false)
		},
		onReady: function () {
			$("#" + config.fieldId).val(initValue)
		}
	})
}

function formatNumber(n) {
	// format number 1000000 to 1,234,567
	return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function formatCurrency(input, blur) {
	// appends $ to value, validates decimal side
	// and puts cursor back in right position.
	var input_val = input.val()
	if (input_val === "") { return }
	var original_len = input_val.length
	var caret_pos = input.prop("selectionStart")
	if (input_val.indexOf(".") >= 0) {
		var decimal_pos = input_val.indexOf(".")
		var left_side = input_val.substring(0, decimal_pos)
		var right_side = input_val.substring(decimal_pos)
		left_side = formatNumber(left_side)
		right_side = formatNumber(right_side); mal
		if (blur === "blur") {
			right_side += "00"
		}
		right_side = right_side.substring(0, 2)
		input_val = "$" + left_side + "." + right_side
	} else {
		input_val = formatNumber(input_val)
		input_val = "$" + input_val
		if (blur === "blur") {
			input_val += ".00"
		}
	}
	input.val(input_val)
	var updated_len = input_val.length
	caret_pos = updated_len - original_len + caret_pos
	input[0].setSelectionRange(caret_pos, caret_pos)
}

function onLoadCompanyTypes() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: 'dataentry.ashx?task=getCompanyTypes',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid: sqid },
		success: function (res) {
			$('#conttype').empty().append(`<option value="">-- SELECT FROM LIST --</option>`)
			res.forEach(function (item) {
				$('#conttype').append(`<option value="${item.code}">${item.expand}</option>`)
			})
		}
	})
}

function onLoadCountries() {
	$.ajax({
		url: 'dataentry.ashx?task=getCountries',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			$('#contiso').empty().append(`<option value="">-- Country --</option>`)
			res.forEach(function (item) {
				$('#contiso').append(`<option value="${item.iso}">${item.expand}</option>`)
			})
		}
	})
}

function onLoadStates() {
	const iso = $('#contiso').val() || ''
	$.ajax({
		url: 'dataentry.ashx?task=getStates',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { iso: iso },
		success: function (res) {
			$('#contst').empty().append(`<option value="">-- State --</option>`)
			res.forEach(function (item) {
				$('#contst').append(`<option value="${item.code}">${item.expand}</option>`)
			})
		}
	})
}

function onLoadCodes(codetype, selectId) {
	const sqid = $("#sqid").val()
	$.ajax({
		url: `dataentry.ashx?task=getCodes&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { codetype },
		success: function (res) {
			$(`#${selectId}`).empty().append(`<option value="">-- Select --</option>`)
			if (Array.isArray(res)) {
				res.forEach(function (item) {
					$(`#${selectId}`).append(`<option value="${item.code}">${item.expand}</option>`)
				})
			}

		}
	})
}

function loadSalesRep() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: `dataentry.ashx?task=getSalesRep&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			const el = $('#salesrep')
			el.empty().append(`<option value="">-- Select --</option>`)
			res.forEach(function (item) {
				el.append(`<option value="${item.code}" data-edi02="${item.edi02}" id="salesrep_${item.code}">${item.expand}</option>`)
			})
		}
	})
}

function onChangeSalesRep() {
	const edi02 = $(`#salesrep_${$('#salesrep').val()}`).data('edi02')
	$('#soffid2').val(edi02 || '')
}

function onCloseContactDialog() {
	$('#contact-dialog').dialog('close')
}

function onAddContact(event) {
	event.preventDefault()
	const sqid = $("#sqid").val()
	const formData = new FormData(document.getElementById('contact-form'))
	let validCarrier = true
	$('#contact-form .validate-message').removeClass('error')
	if (formData.get('contname').length < 5) {
		$('#contname').next('.validate-message').addClass('error').html('The length must be at least 5 characters.')
		validCarrier = false
	}
	if (formData.get('contcity').length < 4) {
		$('#contzip').next('.validate-message').addClass('error').html('The length must be at least 4 characters.')
		validCarrier = false
	}
	if (formData.get('conttype').toUpperCase() == SEA_CARRIER) {
		const scac = formData.get('contscac')
		if (scac.length != 4) {
			$('#contscac').next('.validate-message').addClass('error').html('This field is required and the length must be 4 characters.')
			validCarrier = false
		}
	} else if (formData.get('conttype').toUpperCase() == AIR_CARRIER) {
		const contpfx = formData.get('contpfx')
		const contiata = formData.get('contiata')
		const conticao = formData.get('conticao')
		if (contpfx.length != 3) {
			$('#contpfx').next('.validate-message').addClass('error').html('This field is required and the length must be 3 characters.')
			validCarrier = false
		}
		if (contiata.length != 2) {
			$('#contiata').next('.validate-message').addClass('error').html('This field is required and the length must be 2 characters.')
			validCarrier = false
		}
		if (conticao.length != 3) {
			$('#conticao').next('.validate-message').addClass('error').html('This field is required and the length must be 3 characters.')
			validCarrier = false
		}
	}
	if (!validCarrier) return
	$('#contact-save-btn').prop("disabled", true)
	const data = $('#contact-form').serialize()
	$.ajax({
		type: 'POST',
		url: `dataentry.ashx?task=addContact&sqid=${sqid}`,
		data: data,
		success: function (response) {
			if (response.success) {
				$('#contact-form').trigger("reset")
				alert('Added a new contact successfully!')
				onCloseContactDialog()
			} else {
				alert(response.message || 'Failed adding a new contact, please try again later.')
			}
			$('#contact-save-btn').prop("disabled", false)
		},
		error: function (error) {
			$('#contact-save-btn').prop("disabled", false)
			alert('Failed adding a new contact, please try again later.')
		}
	})
}

function loadClauses() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: `dataentry.ashx?task=getClauses&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			$('#comclscode').empty().append(`<option value="">-- Select --</option>`)
			res.forEach(function (item) {
				$('#comclscode').append(`<option value="${item.id}">${item.clause}</option>`)
			})
		}
	})
}

function loadClause() {
	const sqid = $("#sqid").val()
	const code = $('#comclscode').val()
	$.ajax({
		url: `dataentry.ashx?task=getClause&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { code },
		success: function (res) {
			if (Array.isArray(res) && res.length == 1) {
				$('#comclsdesc').val(res[0].clause)
			}
			else $('#comclsdesc').val('')
		}
	})
}

function loadOceanClauses() {
	$.ajax({
		url: `dataentry.ashx?task=getOceanClauses2`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			$('#ocnclscode').empty().append(`<option value="">-- Select --</option>`)
			res.forEach(function (item) {
				$('#ocnclscode').append(`<option value="${item.id}">${item.clause}</option>`)
			})
		}
	})
}

function loadOceanClause() {
	const code = $('#ocnclscode').val()
	$.ajax({
		url: `dataentry.ashx?task=getOceanClause`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { code },
		success: function (res) {
			if (Array.isArray(res) && res.length == 1) {
				$('#ocnclsdesc').val(res[0].clause)
			}
			else $('#ocnclsdesc').val('')
		}
	})
}

function loadTariffNo() {
	const sqid = $("#sqid").val()
	const billid = $('#billid').val() || ""
	$.ajax({
		url: `dataentry.ashx?task=getTariffNo&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { billid },
		success: function (res) {
			if (Array.isArray(res) && res.length > 0) {
				$('#tariffno').tokenInput('add', res[0])
			}
			else $('#tariffno').val('')
		}
	})
}

function onOpenGuide(module, language, title, borderColor, textColor) {
	$.ajax({
		url: 'dataentry.ashx?task=getGuide',
		contentType: "charset=utf-8",
		type: 'GET',
		data: { module, language },
		success: function (res) {
			$('#guide-dialog').dialog('option', 'title', title)
			document.querySelector('.contact-dialog.ui-widget.ui-widget-content').style.borderColor = borderColor
			document.querySelector('#guide-dialog #dialog-content').style.color = textColor
			$('#guide-dialog #dialog-content').html(res)
			$('#guide-dialog').dialog('open')
		}
	})
}

function onOpenCtnrlistDialog(uuid) {
	$('#ctnrlist-dialog').dialog({
		autoOpen: false,
		width: 800,
		position: {
			my: "top",
			at: "top"
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: function (event, ui) {
			$('#ctnrlist-dialog #divInDialog').load('ctnrlist.html', function () {
				onLoadCtnrlist(uuid)
			})
		},
		close: function () {
			$('#ctnrlist-dialog #divInDialog').html('')
		}
	})
	$('#ctnrlist-dialog').dialog('open')
}

function onCloseCtnrlistDialog() {
	$('#ctnrlist-dialog').dialog('close')
	$('#ctnrlist-dialog').dialog('destroy')
}

function onLoadCtnrlist(uuid) {
	const sqid = $("#sqid").val()
	if (!uuid) return
	$.ajax({
		url: `dataentry.ashx?task=getCtnrlist&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { uuid },
		success: function (res) {
			let trs = `<tr><th align="left">Container No.</th><th align="left">Container Type</th></tr>`
			if (Array.isArray(res) && res.length > 0) {
				res.forEach(item => {
					trs += `<tr><th align="left">${item.ctnrno}</th>`
					trs += `<th align="left">${item.ctnrsize}</th></tr>`
				})
			}
			$('#ctnrlist').html(trs)
		}
	})
}

function onOpenCamera() {
	$('#camera-dialog').dialog({
		autoOpen: false,
		width: 800,
		position: {
			my: "top",
			at: "top"
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: async function (event, ui) {
			$('#camera-dialog #divInDialog').load('camera.html', async function () {
				var videoElement = document.querySelector("#camera-video")
				cameraPhoto = new JslibHtml5CameraPhoto.default(videoElement)
				startCameraDefaultAll()

				$('#click-photo').on('click', function () {
					$('#camera-video').hide()
					$('#camera-canvas').show()
					$('#click-photo').hide()
					$('#reset-photo').show()
					$('#upload-photo').show()
					takePhoto()
				})
				$('#reset-photo').on('click', function () {
					$('#camera-canvas').hide()
					$('#camera-video').show()
					$('#click-photo').show()
					$('#reset-photo').hide()
					$('#upload-photo').hide()
					startCameraDefaultAll()
				})
				$('#upload-photo').on('click', function () {
					$(this).prop('disabled', true)
					onUploadCameraImage()
				})
			})
		},
		close: function () {
			stopCamera()
			$('#camera-dialog #divInDialog').html('')
		}
	})
	$('#camera-dialog').dialog('open')
}

function onCloseCamera() {
	stopCamera()
	$('#camera-dialog').dialog('close')
	$('#camera-dialog').dialog('destroy')
}

function onUploadCameraImage() {
	let file = null
	const filename = $('#procname').val() || 'test'
	document.querySelector("#camera-canvas").toBlob(function (blob) {
		file = new File([blob], `${filename}.png`, { type: 'image/png' })
		const uuid = $('#uuid').val()
		if (!uuid || !file) return
		let data = new FormData()
		data.append('Uploadedfile', file)
		data.append('documentId', uuid)
		data.append('uploaduserid', $('#userid').val())
		data.append('customerview', $('#customerview').val())
		const sqid = $('#sqid').val()
		$.ajax({
			type: 'POST',
			url: 'dataentry.ashx?task=uploadfile&sqid=' + sqid,
			contentType: false,
			processData: false,
			data: data,
			success: function () {
				loadFiles($('#uuid').val(), 'camera_attached_documents')
				onCloseCamera()
			},
			error: function (err) {
				alert('Failed uploading an image')
				$('#upload-photo').prop('disabled', false)
			}
		})
	}, 'image/png')
}

function generateAndDownloadXlsx() {
	window.open('dataentry.ashx?task=generateAndDownloadXlsx')
}

function onOpenSignature() {
	$('#signature-dialog').dialog({
		autoOpen: false,
		width: 602,
		position: {
			my: "top",
			at: "top"
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: async function (event, ui) {
			$('#signature-dialog #divInDialog').load('signature.html', async function () {

			})
		},
		close: function () {
			onCloseSignature()
		}
	})
	$('#signature-dialog').dialog('open')
}

function onCloseSignature() {
	$('#signature-dialog #divInDialog').html('')
	$('#signature-dialog').dialog('close')
	$('#signature-dialog').dialog('destroy')
}

function onOpenQRReader() {
	Html5Qrcode.getCameras().then(cameras => {
		if (cameras && cameras.length) {
			$('#qr-reader-container').show().css('display', 'flex')
			var cameraId = cameras[0].id
			html5QrCode.start(
				cameraId,
				{
					fps: 10,
					qrbox: { width: 500, height: 500 },
				},
				qrCodeMessage => {
					console.log(`QR Code detected: ${qrCodeMessage}`)
					onSuccessQRCode(qrCodeMessage)
				},
				errorMessage => {
					console.log(`QR Code no longer in front of camera.`)
				})
				.catch(err => {
					console.log(`Unable to start scanning, error: ${err}`)
				})
		}
	}).catch(err => {
		console.log('failed getting camera: ', err)
		onOpenQRReader()
	})
}

function onSuccessQRCode(code) {
	$('#qr-code-value').val(code)
	onStopQRReader()
}

function onStopQRReader() {
	$('#qr-reader-container').hide()
	html5QrCode.stop().then(ignore => {
		// QR Code scanning is stopped. 
		console.log('QR Code scanning stopped.')
	}).catch(err => {
		// Stop failed, handle it. 
		console.log('Unable to stop scanning.')
	})
}

function getLabelOptions() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: 'dataentry.ashx?task=getLabels',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid: sqid },
		success: function (res) {
			const selectElement = $('#labelid')
			selectElement.empty().append(`<option value="">-- SELECT FROM LIST --</option>`)
			res.forEach(function (item) {
				const value = `${item.id}#${item.name}#${item.printer || ''}#${item.height || '6'}#${item.width || '4'}#${item.uom || 'I'}#${item.orientation || '0'}`
				selectElement.append(`<option value="${value}">${item.name}</option>`)
			})
		}
	})
}

function getLabel() {
	const sqid = $("#sqid").val()
	const id = $('#labelid').val()
	if (!id) return
	$.ajax({
		url: 'dataentry.ashx?task=getLabel',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, id },
		success: function (res) {
			if (Array.isArray(res) && res.length > 0) {
				const result = res[0]
				const previewElement = $('#label-preview')
				const uom = result.uom?.toUpperCase() == 'C' ? 'cm' : 'in'
				const height = (result.height || '6') + uom
				const width = (result.width || '4') + uom
				const isLandscape = Number(result.orientation || 0) == 1
				previewElement.text(result.name).css({
					position: 'relative',
					width: isLandscape ? height : width,
					height: isLandscape ? width : height,
				})
			}
		}
	})
}

function getPageProperties() {
	const properties = $('#labelid').val().split('#')
	return {
		printer: properties[2],
		height: properties[3],
		width: properties[4],
		uom: properties[5],
		orientation: properties[6]
	}
}

function onChangeLabelProperties() {
	const value = $('#labelid').val()
	if (!value) return
	const properties = getPageProperties()
	const previewElement = $('#label-preview')
	const uom = properties.uom?.toUpperCase() == 'C' ? 'cm' : 'in'
	const height = properties.height + uom
	const width = properties.width + uom
	const isLandscape = Number(properties.orientation) == 1
	previewElement.css({
		position: 'relative',
		width: isLandscape ? height : width,
		height: isLandscape ? width : height,
	})
	generatePrintView()
}

function generatePrintView() {
	const pageProperties = getPageProperties()
	const uom = pageProperties.uom?.toUpperCase() == 'C' ? 'cm' : 'in'
	const height = pageProperties.height + uom
	const width = pageProperties.width + uom
	const isLandscape = Number(pageProperties.orientation) == 1
	const pageWidth = isLandscape ? height : width
	const pageHeight = isLandscape ? width : height
	printLabels.forEach((labels, pageInd) => {
		const pageDiv = document.createElement('div')
		pageDiv.style.position = 'relative'
		pageDiv.style.width = pageWidth
		pageDiv.style.height = pageHeight
		/*if (pageInd > 0 && pageInd < printLabels.length) {
			const breakLine = document.createElement('p');
			breakLine.className = 'page-break';
			pageDiv.appendChild(breakLine);
		}*/
		document.getElementById("label-preview").appendChild(pageDiv)
		labels.forEach((properties, ind) => {
			const div = document.createElement("div")
			div.style.position = 'absolute'
			div.style.top = `${properties.row}%`
			div.style.left = `${properties.col}%`
			if (properties.alignment === 'C') {
				div.style.left = '0%'
				div.style.width = '100%'
				div.style.textAlign = 'center'
			} else {
				div.style.textAlign = 'left'
			}
			div.style.fontFamily = properties.fontName
			div.style.fontSize = properties.fontSize
			div.style.fontWeight = properties.fontWeight
			const elementId = `label-element-${pageInd}-${ind}`
			div.id = elementId

			pageDiv.appendChild(div)
			switch (properties.dataType) {
				case 'QR':
					const qrId = `qr-element-${pageInd}-${ind}`
					$(`#${elementId}`).html(`<div id="${qrId}"><div>`)
					$(`#${qrId}`).css({
						display: 'flex',
						justifyContent: 'center',
					})
					new QRCode(document.getElementById(qrId), {
						text: properties.data,
						width: 128,
						height: 128,
						colorDark: "#000000",
						colorLight: "#ffffff",
						correctLevel: QRCode.CorrectLevel.H
					})
					break
				case '1D':
					const svgId = `svg-element-${pageInd}-${ind}`
					$(`#${elementId}`).html(`<svg id="${svgId}"><svg>`)
					JsBarcode(`#${svgId}`, properties.data, {
						height: 40,
						displayValue: false
					})
					break
				default:
					div.innerHTML = properties.data
					break
			}
		})
	})
}


function printLabel() {
	const label = $('#labelid').val()
	if (!label) {
		alert('Choose a Print Label.')
		return
	}
	const pageProperties = getPageProperties()
	const uom = pageProperties.uom?.toUpperCase() == 'C' ? 'cm' : 'in'
	const height = pageProperties.height + uom
	const width = pageProperties.width + uom
	const isLandscape = Number(pageProperties.orientation) == 1
	const pageWidth = isLandscape ? height : width
	const pageHeight = isLandscape ? width : height
	const pageStyle = `<style>body {padding: 0; margin: 0;} @media print { body {margin: 0; print-color-adjust: exact; -webkit-print-color-adjust: exact; } header,footer { display: none; } @page { margin: 0;  margin-left: 0; margin-right: 0; margin-top: 0; margin-bottom: 0; size: ${pageWidth} ${pageHeight}; } .page-break { page-break-before: always; }}</style>`
	const originalContent = document.body.innerHTML
	const divContent = document.getElementById('label-preivew-container').innerHTML
	document.body.innerHTML = `${pageStyle}${divContent}`
	window.print()
	document.body.innerHTML = originalContent
	location.reload()
}


function clearAtport(element) {
	document.getElementById('entryno').value = element.getAttribute('data-product-name')
}


function toDateString(date) {
	const d = new Date(date)
	return d.toLocaleDateString()
}


function toTimeString(date) {
	const d = new Date(date)
	return d.toLocaleTimeString()
}


function getWeekOfYear(date, firstDayOfWeek) {
	moment.locale('dataentry-woy', {
		week: {
			dow: firstDayOfWeek
		}
	})

	let m = moment(date).locale('dataentry-woy')

	return {
		week: m.week(), year: m.weekYear()
	}
}


$(document).ready(function () {
	$(window).scroll(function () {
		if (window.scrollY > 50) {
			$('#gotop').addClass('gotop-show')
		} else {
			$('#gotop').removeClass('gotop-show')
		}
	})

	$('#gotop').on('click', function () {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		$('#gotop').removeClass('gotop-show')
	})

	$('#guide-dialog').dialog({
		autoOpen: false,
		modal: true,
		width: window.innerWidth * 0.5,
		height: window.innerHeight * 0.8,
		classes: {
			"ui-dialog": "contact-dialog"
		},
	})

	$('#contact-dialog').dialog({
		autoOpen: false,
		width: 1024,
		position: {
			my: "top",
			at: "top",
			of: window
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: function (event, ui) {
			$('#contact-dialog #divInDialog').load('popup.html', function () {
				onLoadCompanyTypes()
				onLoadCountries()
				onLoadStates()
				onLoadCodes('SALES REP', 'contsrep')
				onLoadCodes('TERMS', 'contterms')
				$('#contiso').on('change', function () {
					onLoadStates()
				})
				$('#conttype').on('change', function () {
					const conttype = $(this).val().toUpperCase()
					if (conttype == SEA_CARRIER) {
						$("tr[data-for='SEA_CARRIER']").show()
						$("tr[data-for='AIR_CARRIER']").hide()
					} else if (conttype == AIR_CARRIER) {
						$("tr[data-for='SEA_CARRIER']").hide()
						$("tr[data-for='AIR_CARRIER']").show()
					} else {
						$("tr[data-for='SEA_CARRIER']").hide()
						$("tr[data-for='AIR_CARRIER']").hide()
					}
				})
			})
		}
	})

	$('.new-contact-dialog-opener').on('click', () => {
		$('#contact-dialog').dialog('open')
	})

	$('input[name="ratetype"]').on('change', (event) => {
		if (event.target.value == "1") {
			$('#all-in-rate-section').show()
			$('#charge-code-section').hide()
		} else {
			$('#all-in-rate-section').hide()
			$('#charge-code-section').show()
		}
	})

	$("input[data-type='currency']").on({
		keyup: function () {
			formatCurrency($(this))
		},
		blur: function () {
			formatCurrency($(this), "blur")
		}
	})

	loadFiles($('#uuid').val(), 'camera_attached_documents')

	// Drag & Drop Section
	loadFiles($('#attach-documentId').val(), 'attached_documents')

	$('#attach-documentId').on('change', function () {
		loadFiles($(this).val(), 'attached_documents')
	})

	$('#drag_label').on('click', function () {
		$('#file_elem').trigger('click')
	})
	//

	$('#camera-button').on('click', function (event) {
		event.preventDefault()
		onOpenCamera()
	})
	// Generate and Download XLSX
	$('#xls-btn').on('click', function (event) {
		event.preventDefault()
		generateAndDownloadXlsx()
	})

	// Signature Capture
	$('#signature-btn').on('click', function (event) {
		event.preventDefault()
		onOpenSignature()
	})

	// QR code and Bar code read
	$('#qr-code-btn').on('click', function (event) {
		event.preventDefault()
		onOpenQRReader()
	})

	// Load Labels
	getLabelOptions()
	$('#labelid').on('change', () => {
		onChangeLabelProperties()
	})

	$("#date").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#reqshipdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#followupdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#pickdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#pickdate2").datepicker({
		dateFormat: "mm/dd/yy",
	})

	$("#etd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etd4").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta4").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etadelv1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etadelv2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#dfrom").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#dto").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#entrydate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#importdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#carriereta").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#exportdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#obdate1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#intransitdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#prestmndate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#lfd").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#expdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#issdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#godate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#refdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#invdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#duedate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#coodate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#refdate1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#refdate2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#refdate3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#refdate4").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#indate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#outdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#indate2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#outdate2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#poadate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#poaexp").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#shipdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#aescutoff").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cutoff").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#docdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vgmdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#inlanddate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#raildate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#early").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#effdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#avldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#eta03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etd01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etd02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#etd03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#bkgdate01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#bkgdate02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#bkgdate03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#gidate01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#gidate02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#gidate03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#sidate01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#sidate02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#sidate03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vgmdate01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vgmdate02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vgmdate03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cbpdate01").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cbpdate02").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cbpdate03").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#manufdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#inspdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#nextinsp").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#datesent").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#mrdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#daterecv").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#verifieddate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#bkgdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#clsdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#pdlfd").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#chaslfd").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#socsent").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#socgrecv").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#gatein").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#gateout").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#empretdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#oblchange").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#fogdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#oetd").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#oeta").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#soreldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#duedelv").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#dorecvdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cusreldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#brkhbldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#brkdocsdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#brkandate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cussubentdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#reldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#prereldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#obldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#telexsurdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#telexreldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#swbdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#otelexsurdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#ooblstatdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#oexpdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#dstlastimpdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#mblreldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#reqpaydate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#sentofdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#sendmsgdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#mobldate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#mobltrkdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#delvdate").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#poedate").datepicker({
		dateFormat: "mm/dd/yy",
	})

	$("#etd1").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#etd1").datepicker('getDate')
				let woy = getWeekOfYear(date, 1)
				$('#sweek').val(woy.week)
				$('#syear').val(woy.year)
			}
		},
	})

	function setSiDate(date, elementId) {
		let d = new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000)
		let day = d.getDay()

		if (day == 0 || day == 6) {
			d = new Date(d.getTime() - (day == 0 ? 2 : 1) * 24 * 60 * 60 * 1000)
		}

		$(`#${elementId}`).datepicker('setDate', d)
	}

	function setCyDate(date, elementId) {
		let d = new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000)
		$(`#${elementId}`).datepicker('setDate', d)
	}

	$("#v1etd1").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1etd1").datepicker('getDate')
				let woy = getWeekOfYear(date, 1)
				$('#vweek').val(woy.week)
				$('#vyear').val(woy.year)
				setSiDate(date, 'v1sid1')
				setCyDate(date, 'v1cyd1')
			}
		},
	})

	$("#v1atd1").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1atd1").datepicker('getDate')
				$("#v1onb1").datepicker('setDate', date)
			}
		},
	})

	$("#v1sid1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1cyd1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1onb1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1eta1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1ata1").datepicker({
		dateFormat: "mm/dd/yy",
	})

	$("#v1etd2").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1etd2").datepicker('getDate')
				setSiDate(date, 'v1sid2')
				setCyDate(date, 'v1cyd2')
			}
		},
	})

	$("#v1atd2").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1atd2").datepicker('getDate')
				$("#v1onb2").datepicker('setDate', date)
			}
		},
	})

	$("#v1sid2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1cyd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1onb2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1eta2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1ata2").datepicker({
		dateFormat: "mm/dd/yy",
	})

	$("#v1etd3").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1etd3").datepicker('getDate')
				setSiDate(date, 'v1sid3')
				setCyDate(date, 'v1cyd3')
			}
		},
	})

	$("#v1atd3").datepicker({
		dateFormat: "mm/dd/yy",
		onClose: (d, o) => {
			if (d?.length > 0) {
				let date = $("#v1atd3").datepicker('getDate')
				$("#v1onb3").datepicker('setDate', date)
			}
		},
	})

	$("#v1sid3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1cyd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1onb3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1eta3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v1ata3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2etd1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2atd1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2sid1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2cyd1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2onb1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2eta1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2ata1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2etd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2atd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2sid2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2cyd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2onb2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2eta2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2ata2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2etd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2atd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2sid3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2cyd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2onb3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2eta3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#v2ata3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta1").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta2").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta3").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd4").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta4").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd5").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta5").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd6").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta6").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxetd7").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#vxeta7").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#isfenroll").datepicker({
		dateFormat: "mm/dd/yy",
	})
	$("#cargoready").datepicker({
		dateFormat: "mm/dd/yy",
	})

	$('#comclscode').on('change', function () {
		loadClause()
	})
	$('#ocnclscode').on('change', function () {
		loadOceanClause()
	})

	loadClauses()
	loadOceanClauses()
	loadSalesRep()

	/* Autocomplete Vessel  */
	const vesselConfig = {
		task: 'getVessels',
		url: 'dataentry.ashx',
		queryParam: 'q',
		fieldId: 'vessel',
		tokenId: 'imo',
		searchKey: 'vessel',
		minChars: 2,
		preventDuplicates: true,
		allowFreeTagging: true,
		serverKey: 'flag',
		fields: [
			{ ui: 'vessel', api: 'vessel' },
			{ ui: 'imo', api: 'imo' },
			{ ui: 'imoflag', api: 'flag' }
		]
	}
	initAutoComplete(vesselConfig)

	const vessel2Config = {
		task: 'getVessels',
		url: 'dataentry.ashx',
		queryParam: 'q',
		fieldId: 'vessel2',
		tokenId: 'imo2',
		searchKey: 'vessel',
		minChars: 2,
		preventDuplicates: true,
		allowFreeTagging: true,
		serverKey: 'flag',
		fields: [
			{ ui: 'vessel2', api: 'vessel' },
			{ ui: 'imo2', api: 'imo' },
			{ ui: 'imoflag2', api: 'flag' }
		]
	}
	initAutoComplete(vessel2Config)

	/* Autocomplete Vessel Code */
	const vesselCode = {
		url: 'dataentry.ashx',
		task: 'getVesselCode',
		queryParam: 'q',
		fieldId: 'vslcode',
		tokenId: 'vslcode',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vslcode_th',
		fields: [
			{ ui: 'vslcode', api: 'vslcode' },
			{ ui: 'vesselid', api: 'sailid' },
			{ ui: 'sweek', api: 'vweek' },
			{ ui: 'syear', api: 'vyear' },
			{ ui: 'scacid', api: 'scac1', type: 'ti' },
			{ ui: 'vessel2', api: 'vessel1', type: 'ti' },
			{ ui: 'voyage2', api: 'voyage1' },
			{ ui: 'imo2', api: 'imo1' },
			{ ui: 'imoflag2', api: 'flag1' },
			{ ui: 'polcode', api: 'polcode', type: 'ti' },
			{ ui: 'polname', api: 'polname' },
			{ ui: 'obdate1', api: 'obdate' },
			{ ui: 'etd1', api: 'etd' },
			{ ui: 'etd2', api: 'atd' },
			{ ui: 'etd3', api: 'etd3' },
			{ ui: 'vessel', api: 'vessel2', type: 'ti' },
			{ ui: 'imo', api: 'imo2' },
			{ ui: 'imoflag', api: 'flag2' },
			{ ui: 'voyage', api: 'voyage2' },
			{ ui: 'trncode', api: 'transcode', type: 'ti' },
			{ ui: 'trnname', api: 'transname' },
			{ ui: 'poulcode', api: 'poulcode', type: 'ti' },
			{ ui: 'poulname', api: 'poulname' },
			{ ui: 'eta1', api: 'eta' },
			{ ui: 'eta2', api: 'ata' },
			{ ui: 'eta3', api: 'eta3' }
		]
	}
	initCombineAutoComplete(vesselCode, `&stationid=${$("#station1").val()}`)

	/* Place of Receipt by Code */
	const placeConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'porcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'porcode_th',
		fields: [
			{ ui: 'porname', api: 'expand' },
			{ ui: 'porcode', api: 'code' }
		]
	}
	initCombineAutoComplete(placeConfigByCode)

	/* Port of Loading By code  */
	const portConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'polcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'polcode_th',
		fields: [
			{ ui: 'polname', api: 'expand' },
			{ ui: 'polcode', api: 'code' }
		]
	}
	initCombineAutoComplete(portConfigByCode)

	const pol1ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1polcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1polcode1_th',
		fields: [
			{ ui: 'v1polname1', api: 'expand' },
			{ ui: 'v1polcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(pol1ConfigByCodev1)

	const poul1ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1poulcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1poulcode1_th',
		fields: [
			{ ui: 'v1poulname1', api: 'expand' },
			{ ui: 'v1poulcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(poul1ConfigByCodev1)

	const pol2ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1polcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1polcode2_th',
		fields: [
			{ ui: 'v1polname2', api: 'expand' },
			{ ui: 'v1polcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(pol2ConfigByCodev1)

	const poul2ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1poulcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1poulcode2_th',
		fields: [
			{ ui: 'v1poulname2', api: 'expand' },
			{ ui: 'v1poulcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(poul2ConfigByCodev1)

	const pol3ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1polcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1polcode3_th',
		fields: [
			{ ui: 'v1polname3', api: 'expand' },
			{ ui: 'v1polcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(pol3ConfigByCodev1)

	const poul3ConfigByCodev1 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v1poulcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v1poulcode3_th',
		fields: [
			{ ui: 'v1poulname3', api: 'expand' },
			{ ui: 'v1poulcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(poul3ConfigByCodev1)

	const pol1ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2polcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2polcode1_th',
		fields: [
			{ ui: 'v2polname1', api: 'expand' },
			{ ui: 'v2polcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(pol1ConfigByCodev2)

	const poul1ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2poulcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2poulcode1_th',
		fields: [
			{ ui: 'v2poulname1', api: 'expand' },
			{ ui: 'v2poulcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(poul1ConfigByCodev2)

	const pol2ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2polcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2polcode2_th',
		fields: [
			{ ui: 'v2polname2', api: 'expand' },
			{ ui: 'v2polcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(pol2ConfigByCodev2)

	const poul2ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2poulcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2poulcode2_th',
		fields: [
			{ ui: 'v2poulname2', api: 'expand' },
			{ ui: 'v2poulcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(poul2ConfigByCodev2)

	const pol3ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2polcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2polcode3_th',
		fields: [
			{ ui: 'v2polname3', api: 'expand' },
			{ ui: 'v2polcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(pol3ConfigByCodev2)

	const poul3ConfigByCodev2 = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'v2poulcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'v2poulcode3_th',
		fields: [
			{ ui: 'v2poulname3', api: 'expand' },
			{ ui: 'v2poulcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(poul3ConfigByCodev2)

	const pol1ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode1_th',
		fields: [
			{ ui: 'vxpolname1', api: 'expand' },
			{ ui: 'vxpolcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(pol1ConfigByCodevx)

	const poul1ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode1',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode1_th',
		fields: [
			{ ui: 'vxpoulname1', api: 'expand' },
			{ ui: 'vxpoulcode1', api: 'code' }
		]
	}
	initCombineAutoComplete(poul1ConfigByCodevx)

	const pol2ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode2_th',
		fields: [
			{ ui: 'vxpolname2', api: 'expand' },
			{ ui: 'vxpolcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(pol2ConfigByCodevx)

	const poul2ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode2_th',
		fields: [
			{ ui: 'vxpoulname2', api: 'expand' },
			{ ui: 'vxpoulcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(poul2ConfigByCodevx)

	const pol3ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode3_th',
		fields: [
			{ ui: 'vxpolname3', api: 'expand' },
			{ ui: 'vxpolcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(pol3ConfigByCodevx)

	const poul3ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode3_th',
		fields: [
			{ ui: 'vxpoulname3', api: 'expand' },
			{ ui: 'vxpoulcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(poul3ConfigByCodevx)

	const pol4ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode4',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode4_th',
		fields: [
			{ ui: 'vxpolname4', api: 'expand' },
			{ ui: 'vxpolcode4', api: 'code' }
		]
	}
	initCombineAutoComplete(pol4ConfigByCodevx)

	const poul4ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode4',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode4_th',
		fields: [
			{ ui: 'vxpoulname4', api: 'expand' },
			{ ui: 'vxpoulcode4', api: 'code' }
		]
	}
	initCombineAutoComplete(poul4ConfigByCodevx)

	const pol5ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode5',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode5_th',
		fields: [
			{ ui: 'vxpolname5', api: 'expand' },
			{ ui: 'vxpolcode5', api: 'code' }
		]
	}
	initCombineAutoComplete(pol5ConfigByCodevx)

	const poul5ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode5',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode5_th',
		fields: [
			{ ui: 'vxpoulname5', api: 'expand' },
			{ ui: 'vxpoulcode5', api: 'code' }
		]
	}
	initCombineAutoComplete(poul5ConfigByCodevx)

	const pol6ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode6',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode6_th',
		fields: [
			{ ui: 'vxpolname6', api: 'expand' },
			{ ui: 'vxpolcode6', api: 'code' }
		]
	}
	initCombineAutoComplete(pol6ConfigByCodevx)

	const poul6ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode6',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode6_th',
		fields: [
			{ ui: 'vxpoulname6', api: 'expand' },
			{ ui: 'vxpoulcode6', api: 'code' }
		]
	}
	initCombineAutoComplete(poul6ConfigByCodevx)

	const pol7ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpolcode7',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpolcode7_th',
		fields: [
			{ ui: 'vxpolname7', api: 'expand' },
			{ ui: 'vxpolcode7', api: 'code' }
		]
	}
	initCombineAutoComplete(pol7ConfigByCodevx)

	const poul7ConfigByCodevx = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'vxpoulcode7',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'vxpoulcode7_th',
		fields: [
			{ ui: 'vxpoulname7', api: 'expand' },
			{ ui: 'vxpoulcode7', api: 'code' }
		]
	}
	initCombineAutoComplete(poul7ConfigByCodevx)

	/* Transhipment Port By code  */
	const transConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'trncode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'trncode_th',
		fields: [
			{ ui: 'trnname', api: 'expand' },
			{ ui: 'trncode', api: 'code' }
		]
	}
	initCombineAutoComplete(transConfigByCode)

	/* Port of Discharge by code  */
	const dischargeConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'poulcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'poulcode_th',
		fields: [
			{ ui: 'poulname', api: 'expand' },
			{ ui: 'poulcode', api: 'code' }
		]
	}
	initCombineAutoCompletePoulcode(dischargeConfigByCode)

	/* Place of Delivery by code  */
	const deliveryConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'podcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'podcode_th',
		fields: [
			{ ui: 'podname', api: 'expand' },
			{ ui: 'podcode', api: 'code' }
		]
	}
	initCombineAutoComplete(deliveryConfigByCode)

	/* Destination port  */
	const destConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'dstcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'dstcode_th',
		fields: [
			{ ui: 'dstname', api: 'expand' },
			{ ui: 'dstcode', api: 'code' }
		]
	}
	initCombineAutoComplete(destConfigByCode)

	/* Final Destination port  */
	const fdestConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'fdcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'fdcode_th',
		fields: [
			{ ui: 'fdname', api: 'expand' },
			{ ui: 'fdcode', api: 'code' }
		]
	}
	initCombineAutoComplete(fdestConfigByCode)

	/* BOL release code  */
	const bolreleaseConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'bolcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'bolcode_th',
		fields: [
			{ ui: 'bolname', api: 'expand' },
			{ ui: 'bolcode', api: 'code' }
		]
	}
	initCombineAutoComplete(bolreleaseConfigByCode)

	/* Freight Payment code  */
	const freightpaymentConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'paycode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'paycode_th',
		fields: [
			{ ui: 'payname', api: 'expand' },
			{ ui: 'paycode', api: 'code' }
		]
	}
	initCombineAutoComplete(freightpaymentConfigByCode)

	/* Place of Issue code  */
	const placeissueConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getUncodes2',
		queryParam: 'q',
		fieldId: 'isscode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'isscode_th',
		fields: [
			{ ui: 'issname', api: 'expand' },
			{ ui: 'isscode', api: 'code' }
		]
	}
	initCombineAutoComplete(placeissueConfigByCode)


	/* Schedule D */
	const schdConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchd2',
		queryParam: 'q',
		fieldId: 'schdcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'schd_th',
		fields: [
			{ ui: 'schdname', api: 'expand' },
			{ ui: 'schdcode', api: 'code' }
		]
	}
	initCombineAutoComplete(schdConfigByCode)

	/* Schedule D */
	const schdConfigByCode2 = {
		url: 'dataentry.ashx',
		task: 'getSchd2',
		queryParam: 'q',
		fieldId: 'schdcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'schd_th',
		fields: [
			{ ui: 'schdname2', api: 'expand' },
			{ ui: 'schdcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(schdConfigByCode2)

	/* Schedule D */
	const schdConfigByCode3 = {
		url: 'dataentry.ashx',
		task: 'getSchd2',
		queryParam: 'q',
		fieldId: 'entrycode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'entrycode_th',
		fields: [
			{ ui: 'entryname', api: 'expand' },
			{ ui: 'entrycode', api: 'code' }
		]
	}
	initCombineAutoComplete(schdConfigByCode3)

	/* Port of Entry */
	const portentryConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchd2',
		queryParam: 'q',
		fieldId: 'portentry',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'portentry_th',
		fields: [
			{ ui: 'portentryname', api: 'expand' },
			{ ui: 'portentry', api: 'code' }
		]
	}
	initCombineAutoComplete(portentryConfigByCode)

	/* Port of Entry */
	const poeConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchd2',
		queryParam: 'q',
		fieldId: 'poecode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'portentry_th',
		fields: [
			{ ui: 'poename', api: 'expand' },
			{ ui: 'poecode', api: 'code' }
		]
	}
	initCombineAutoComplete(poeConfigByCode)



	/* Schedule K */
	const schkConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchk2',
		queryParam: 'q',
		fieldId: 'schkcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'schk_th',
		fields: [
			{ ui: 'schkname', api: 'expand' },
			{ ui: 'schkcode', api: 'code' }
		]
	}
	initCombineAutoComplete(schkConfigByCode)

	/* Schedule K */
	const schk2ConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchk2',
		queryParam: 'q',
		fieldId: 'schkcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'schk2_th',
		fields: [
			{ ui: 'schkname2', api: 'expand' },
			{ ui: 'schkcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(schk2ConfigByCode)

	/* Schedule K */
	const schk3ConfigByCode = {
		url: 'dataentry.ashx',
		task: 'getSchk2',
		queryParam: 'q',
		fieldId: 'schkcode3',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'schk3_th',
		fields: [
			{ ui: 'schkname3', api: 'expand' },
			{ ui: 'schkcode3', api: 'code' }
		]
	}
	initCombineAutoComplete(schk3ConfigByCode)

	//// PORT //////
	/* Place of Receipt by Code */
	const placeConfigByCode2 = {
		url: 'dataentry.ashx',
		task: 'getPort',
		queryParam: 'q',
		fieldId: 'porcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'porcode2_th',
		pairKey: 'expand',
		fields: [
			{ ui: 'porname2', api: 'expand' },
			{ ui: 'porcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(placeConfigByCode2)

	/* Port of Loading By code  */
	const portConfigByCode2 = {
		url: 'dataentry.ashx',
		task: 'getPort',
		queryParam: 'q',
		fieldId: 'polcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'polcode2_th',
		fields: [
			{ ui: 'polname2', api: 'expand' },
			{ ui: 'polcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(portConfigByCode2)

	/* Port of Discharge by code  */
	const dischargeConfigByCode2 = {
		url: 'dataentry.ashx',
		task: 'getPort',
		queryParam: 'q',
		fieldId: 'poulcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'poulcode2_th',
		fields: [
			{ ui: 'poulname2', api: 'expand' },
			{ ui: 'poulcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(dischargeConfigByCode2)

	/* Place of Delivery by code  */
	const deliveryConfigByCode2 = {
		url: 'dataentry.ashx',
		task: 'getPort',
		queryParam: 'q',
		fieldId: 'podcode2',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'podcode2_th',
		fields: [
			{ ui: 'podname2', api: 'expand' },
			{ ui: 'podcode2', api: 'code' }
		]
	}
	initCombineAutoComplete(deliveryConfigByCode2)

	/* SED */
	/*const sedConfig = {
		url: 'dataentry.ashx',
		task: 'getSeds',
		queryParam: 'q',
		fieldId: 'seddesc',
		tokenId: 'code',
		searchKey: 'expand',
		minChars: 2,
		preventDuplicates: false,
		pairField: 'sedcode',
		pairKey: 'code',
		fields: [
			{ ui: 'seddesc', api: 'expand' },
			{ ui: 'sedcode', api: 'code' },
			{ ui: 'seduom1', api: 'uom1' },
			{ ui: 'seduom2', api: 'uom2' }
		]
	};
	initPairAutoComplete(sedConfig);
	*/
	const sedConfig = {
		url: 'dataentry.ashx',
		task: 'getSeds2',
		queryParam: 'q',
		fieldId: 'sedcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'sed_th',
		fields: [
			{ ui: 'seddesc', api: 'expand' },
			{ ui: 'sedcode', api: 'code' },
			{ ui: 'seduom1', api: 'uom1' },
			{ ui: 'seduom2', api: 'uom2' }
		]
	}
	initCombineAutoComplete(sedConfig)


	/* GL Account */
	const glacctConfig = {
		url: 'dataentry.ashx',
		task: 'getAcct',
		queryParam: 'q',
		fieldId: 'acctcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'acctcode_th',
		fields: [
			{ ui: 'acctname', api: 'expand' },
			{ ui: 'acctcode', api: 'code' }
		]
	}
	initCombineAutoComplete(glacctConfig)

	/*  Shipper */
	const shipperConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'shipid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'shipid_th',
		fields: [
			{ ui: 'shipname', api: 'custname' },
			{ ui: 'shipid', api: 'custid' },
			{ ui: 'shipadd1', api: 'addr1' },
			{ ui: 'shipadd2', api: 'addr2' },
			{ ui: 'shipadd3', api: 'addr3' },
			{ ui: 'shipcity', api: 'city' },
			{ ui: 'shipst', api: 'state' },
			{ ui: 'shipzip', api: 'zip' },
			{ ui: 'shipiso', api: 'iso' },
			{ ui: 'shipcont', api: 'contact1' },
			{ ui: 'shipph', api: 'phone1' },
			{ ui: 'shipemail', api: 'email1' },
			{ ui: 'shiptaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(shipperConfig)

	/*  Consignee */
	const consigneeConfig = {
		url: 'dataentry.ashx',
		task: 'getContactsConsignee',
		queryParam: 'q',
		fieldId: 'consid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'consid_th',
		fields: [
			{ ui: 'consname', api: 'custname' },
			{ ui: 'consid', api: 'custid' },
			{ ui: 'consadd1', api: 'addr1' },
			{ ui: 'consadd2', api: 'addr2' },
			{ ui: 'consadd3', api: 'addr3' },
			{ ui: 'conscity', api: 'city' },
			{ ui: 'consst', api: 'state' },
			{ ui: 'conszip', api: 'zip' },
			{ ui: 'consiso', api: 'iso' },
			{ ui: 'conscont', api: 'contact1' },
			{ ui: 'consph', api: 'phone1' },
			{ ui: 'consemail', api: 'email1' },
			{ ui: 'constaxid', api: 'ein' },
			{ ui: 'billid', api: 'billid', type: 'ti' },
			{ ui: 'billname', api: 'billname' },
			{ ui: 'usisf', api: 'usisf', type: 'checkbox' }
		]
	}
	initCombineAutoComplete(consigneeConfig)

	/*  Notify Party */
	const notifyConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'notiid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'notiid_th',
		fields: [
			{ ui: 'notiname', api: 'custname' },
			{ ui: 'notiid', api: 'custid' },
			{ ui: 'notiadd1', api: 'addr1' },
			{ ui: 'notiadd2', api: 'addr2' },
			{ ui: 'notiadd3', api: 'addr3' },
			{ ui: 'noticity', api: 'city' },
			{ ui: 'notist', api: 'state' },
			{ ui: 'notizip', api: 'zip' },
			{ ui: 'notiiso', api: 'iso' },
			{ ui: 'noticont', api: 'contact1' },
			{ ui: 'notiph', api: 'phone1' },
			{ ui: 'notiemail', api: 'email1' },
			{ ui: 'notitaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(notifyConfig)

	/*  2nd Notify Party */
	const notify2Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'noti2id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'noti2id_th',
		fields: [
			{ ui: 'noti2name', api: 'custname' },
			{ ui: 'noti2id', api: 'custid' },
			{ ui: 'noti2add1', api: 'addr1' },
			{ ui: 'noti2add2', api: 'addr2' },
			{ ui: 'noti2add3', api: 'addr3' },
			{ ui: 'noti2city', api: 'city' },
			{ ui: 'noti2st', api: 'state' },
			{ ui: 'noti2zip', api: 'zip' },
			{ ui: 'noti2iso', api: 'iso' },
			{ ui: 'noti2cont', api: 'contact1' },
			{ ui: 'noti2ph', api: 'phone1' },
			{ ui: 'noti2email', api: 'email1' },
			{ ui: 'noti2taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(notify2Config)

	/* Bill To  */
	const billtoConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'billid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'billid_th',
		fields: [
			{ ui: 'billname', api: 'custname' },
			{ ui: 'billid', api: 'custid' },
			{ ui: 'billadd1', api: 'addr1' },
			{ ui: 'billadd2', api: 'addr2' },
			{ ui: 'billadd3', api: 'addr3' },
			{ ui: 'billcity', api: 'city' },
			{ ui: 'billst', api: 'state' },
			{ ui: 'billzip', api: 'zip' },
			{ ui: 'billiso', api: 'iso' },
			{ ui: 'billcont', api: 'contact1' },
			{ ui: 'billph', api: 'phone1' },
			{ ui: 'billemail', api: 'email1' },
			{ ui: 'billtaxid', api: 'ein' },
			{ ui: 'terms', api: 'terms' }
		]
	}
	initCombineAutoComplete(billtoConfig)

	initAutoComplete(tariffNoConfig)

	/* Bill To 2  */
	const billto2Config = {
		url: 'dataentry.ashx',
		task: 'getContacts4',
		queryParam: 'q',
		fieldId: 'bill2id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'bill2id_th',
		fields: [
			{ ui: 'bill2name', api: 'custname' },
			{ ui: 'bill2id', api: 'custid' },
			{ ui: 'bill2add1', api: 'addr1' },
			{ ui: 'bill2add2', api: 'addr2' },
			{ ui: 'bill2add3', api: 'addr3' },
			{ ui: 'bill2city', api: 'city' },
			{ ui: 'bill2st', api: 'state' },
			{ ui: 'bill2zip', api: 'zip' },
			{ ui: 'bill2iso', api: 'iso' },
			{ ui: 'bill2cont', api: 'contact1' },
			{ ui: 'bill2ph', api: 'phone1' },
			{ ui: 'bill2email', api: 'email1' },
			{ ui: 'bill2taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(billto2Config)

	/*  Customer */
	const customerConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'custid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'custid_th',
		fields: [
			{ ui: 'custname', api: 'custname' },
			{ ui: 'custid', api: 'custid' },
			{ ui: 'custadd1', api: 'addr1' },
			{ ui: 'custadd2', api: 'addr2' },
			{ ui: 'custadd3', api: 'addr3' },
			{ ui: 'custcity', api: 'city' },
			{ ui: 'custst', api: 'state' },
			{ ui: 'custzip', api: 'zip' },
			{ ui: 'custiso', api: 'iso' },
			{ ui: 'custcont', api: 'contact1' },
			{ ui: 'custph', api: 'phone1' },
			{ ui: 'custemail', api: 'email1' },
			{ ui: 'custtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(customerConfig)

	/* Pick Up  */

	const pickupConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'pickid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'pickid_th',
		fields: [
			{ ui: 'pickname', api: 'custname' },
			{ ui: 'pickid', api: 'custid' },
			{ ui: 'pickadd1', api: 'addr1' },
			{ ui: 'pickadd2', api: 'addr2' },
			{ ui: 'pickadd3', api: 'addr3' },
			{ ui: 'pickcity', api: 'city' },
			{ ui: 'pickst', api: 'state' },
			{ ui: 'pickzip', api: 'zip' },
			{ ui: 'pickiso', api: 'iso' },
			{ ui: 'pickcont', api: 'contact1' },
			{ ui: 'pickph', api: 'phone1' },
			{ ui: 'pickemail', api: 'email1' },
			{ ui: 'picktaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(pickupConfig)

	/* Deliver To  */

	const delivertoConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'delvid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'delvid_th',
		fields: [
			{ ui: 'delvname', api: 'custname' },
			{ ui: 'delvid', api: 'custid' },
			{ ui: 'delvadd1', api: 'addr1' },
			{ ui: 'delvadd2', api: 'addr2' },
			{ ui: 'delvadd3', api: 'addr3' },
			{ ui: 'delvcity', api: 'city' },
			{ ui: 'delvst', api: 'state' },
			{ ui: 'delvzip', api: 'zip' },
			{ ui: 'delviso', api: 'iso' },
			{ ui: 'delvcont', api: 'contact1' },
			{ ui: 'delvph', api: 'phone1' },
			{ ui: 'delvemail', api: 'email1' },
			{ ui: 'delvtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(delivertoConfig)

	const delivertoConfig2 = {
		url: 'dataentry.ashx',
		task: 'getContactsWarehouse',
		queryParam: 'q',
		fieldId: 'delvid2',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'delvid_th',
		fields: [
			{ ui: 'delvname', api: 'custname' },
			{ ui: 'delvid2', api: 'custid', type: 'ti' },
			{ ui: 'delvadd1', api: 'addr1' },
			{ ui: 'delvadd2', api: 'addr2' },
			{ ui: 'delvadd3', api: 'addr3' },
			{ ui: 'delvcity', api: 'city' },
			{ ui: 'delvst', api: 'state' },
			{ ui: 'delvzip', api: 'zip' },
			{ ui: 'delviso', api: 'iso' },
			{ ui: 'delvcont', api: 'contact1' },
			{ ui: 'delvph', api: 'phone1' },
			{ ui: 'delvemail', api: 'email1' },
			{ ui: 'delvtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(delivertoConfig2)


	/*  Origin Agent  */
	const originAgentConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'oagtid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'oagtid_th',
		fields: [
			{ ui: 'oagtname', api: 'custname' },
			{ ui: 'oagtid', api: 'custid' },
			{ ui: 'oagtadd1', api: 'addr1' },
			{ ui: 'oagtadd2', api: 'addr2' },
			{ ui: 'oagtadd3', api: 'addr3' },
			{ ui: 'oagtcity', api: 'city' },
			{ ui: 'oagtst', api: 'state' },
			{ ui: 'oagtzip', api: 'zip' },
			{ ui: 'oagtiso', api: 'iso' },
			{ ui: 'oagtcont', api: 'contact1' },
			{ ui: 'oagtph', api: 'phone1' },
			{ ui: 'oagtemail', api: 'email1' },
			{ ui: 'oagttaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(originAgentConfig)

	/*  Destination Agent */
	const destAgentConfig = {
		url: 'dataentry.ashx',
		task: 'getStation2',
		queryParam: 'q',
		fieldId: 'dagtid',
		tokenId: 'compid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'dagtid_th',
		fields: [
			{ ui: 'dagtname', api: 'compname' },
			{ ui: 'dagtid', api: 'compid' },
			{ ui: 'kerry', api: 'kerry', type: 'checkbox' }
		]
	}
	initCombineAutoComplete(destAgentConfig)

	/*  Destination Office */
	const destOfficeConfig = {
		url: 'dataentry.ashx',
		task: 'getStation2',
		queryParam: 'q',
		fieldId: 'station2',
		tokenId: 'compid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'station2_th',
		fields: [
			{ ui: 'station2name', api: 'compname' },
			{ ui: 'station2', api: 'compid' },
			{ ui: 'kerry', api: 'kln', type: 'checkbox' }
		]
	}
	initCombineAutoComplete(destOfficeConfig)

	/*  Origin Office */
	const originOfficeConfig = {
		url: 'dataentry.ashx',
		task: 'getStation2',
		queryParam: 'q',
		fieldId: 'station1',
		tokenId: 'compid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'station1_th',
		fields: [
			{ ui: 'station1name', api: 'compname' },
			{ ui: 'station1', api: 'compid' },
			{ ui: 'kerry', api: 'kln', type: 'checkbox' }
		]
	}
	initCombineAutoComplete(originOfficeConfig)


	/*  Sales Office */
	const salesOfficeConfig = {
		url: 'dataentry.ashx',
		task: 'getStation2',
		queryParam: 'q',
		fieldId: 'soffid',
		tokenId: 'compid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'soffid_th',
		fields: [
			{ ui: 'soffname', api: 'compname' },
			{ ui: 'soffid', api: 'compid' }
		]
	}
	initCombineAutoComplete(salesOfficeConfig)




	/*  Forwarder */

	const forwarderConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'forwid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'forwid_th',
		fields: [
			{ ui: 'forwname', api: 'custname' },
			{ ui: 'forwid', api: 'custid' },
			{ ui: 'forwadd1', api: 'addr1' },
			{ ui: 'forwadd2', api: 'addr2' },
			{ ui: 'forwadd3', api: 'addr3' },
			{ ui: 'forwcity', api: 'city' },
			{ ui: 'forwst', api: 'state' },
			{ ui: 'forwzip', api: 'zip' },
			{ ui: 'forwiso', api: 'iso' },
			{ ui: 'forwcont', api: 'contact1' },
			{ ui: 'forwph', api: 'phone1' },
			{ ui: 'forwemail', api: 'email1' },
			{ ui: 'forwtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(forwarderConfig)

	/*  Supplier */
	const supplierConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'suppid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'suppid_th',
		fields: [
			{ ui: 'suppname', api: 'custname' },
			{ ui: 'suppid', api: 'custid' },
			{ ui: 'suppadd1', api: 'addr1' },
			{ ui: 'suppadd2', api: 'addr2' },
			{ ui: 'suppadd3', api: 'addr3' },
			{ ui: 'suppcity', api: 'city' },
			{ ui: 'suppst', api: 'state' },
			{ ui: 'suppzip', api: 'zip' },
			{ ui: 'suppiso', api: 'iso' },
			{ ui: 'suppcont', api: 'contact1' },
			{ ui: 'suppph', api: 'phone1' },
			{ ui: 'suppemail', api: 'email1' },
			{ ui: 'supptaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(supplierConfig)

	/*  Supplier 2*/
	const supplier2Config = {
		url: 'dataentry.ashx',
		task: 'getContacts3',
		queryParam: 'q',
		fieldId: 'supp2id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'supp2id_th',
		fields: [
			{ ui: 'supp2name', api: 'custname' },
			{ ui: 'supp2id', api: 'custid' },
			{ ui: 'supp2add1', api: 'addr1' },
			{ ui: 'supp2add2', api: 'addr2' },
			{ ui: 'supp2add3', api: 'addr3' },
			{ ui: 'supp2city', api: 'city' },
			{ ui: 'supp2st', api: 'state' },
			{ ui: 'supp2zip', api: 'zip' },
			{ ui: 'supp2iso', api: 'iso' },
			{ ui: 'supp2cont', api: 'contact1' },
			{ ui: 'supp2ph', api: 'phone1' },
			{ ui: 'supp2email', api: 'email1' },
			{ ui: 'supp2taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(supplier2Config)

	/*  Broker */

	const brokerConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'brokid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'brokid_th',
		fields: [
			{ ui: 'brokname', api: 'custname' },
			{ ui: 'brokid', api: 'custid' },
			{ ui: 'brokadd1', api: 'addr1' },
			{ ui: 'brokadd2', api: 'addr2' },
			{ ui: 'brokadd3', api: 'addr3' },
			{ ui: 'brokcity', api: 'city' },
			{ ui: 'brokst', api: 'state' },
			{ ui: 'brokzip', api: 'zip' },
			{ ui: 'brokiso', api: 'iso' },
			{ ui: 'brokcont', api: 'contact1' },
			{ ui: 'brokph', api: 'phone1' },
			{ ui: 'brokemail', api: 'email1' },
			{ ui: 'broktaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(brokerConfig)

	/*  Carr1id */
	const carr1Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'carr1id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'carr1id_th',
		fields: [
			{ ui: 'carr1name', api: 'custname' },
			{ ui: 'carr1id', api: 'custid' },
			{ ui: 'carr1add1', api: 'addr1' },
			{ ui: 'carr1add2', api: 'addr2' },
			{ ui: 'carr1add3', api: 'addr3' },
			{ ui: 'carr1city', api: 'city' },
			{ ui: 'carr1st', api: 'state' },
			{ ui: 'carr1zip', api: 'zip' },
			{ ui: 'carr1iso', api: 'iso' },
			{ ui: 'carr1cont', api: 'contact1' },
			{ ui: 'carr1ph', api: 'phone1' },
			{ ui: 'carr1email', api: 'email1' },
			{ ui: 'carr1taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(carr1Config)

	/*  Carr2id */
	const carr2Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'carr2id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'carr2id_th',
		fields: [
			{ ui: 'carr2name', api: 'custname' },
			{ ui: 'carr2id', api: 'custid' },
			{ ui: 'carr2add1', api: 'addr1' },
			{ ui: 'carr2add2', api: 'addr2' },
			{ ui: 'carr2add3', api: 'addr3' },
			{ ui: 'carr2city', api: 'city' },
			{ ui: 'carr2st', api: 'state' },
			{ ui: 'carr2zip', api: 'zip' },
			{ ui: 'carr2iso', api: 'iso' },
			{ ui: 'carr2cont', api: 'contact1' },
			{ ui: 'carr2ph', api: 'phone1' },
			{ ui: 'carr2email', api: 'email1' },
			{ ui: 'carr2taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(carr2Config)

	/*  carr3id */
	const carr3Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'carr3id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'carr3id_th',
		fields: [
			{ ui: 'carr3name', api: 'custname' },
			{ ui: 'carr3id', api: 'custid' },
			{ ui: 'carr3add1', api: 'addr1' },
			{ ui: 'carr3add2', api: 'addr2' },
			{ ui: 'carr3add3', api: 'addr3' },
			{ ui: 'carr3city', api: 'city' },
			{ ui: 'carr3st', api: 'state' },
			{ ui: 'carr3zip', api: 'zip' },
			{ ui: 'carr3iso', api: 'iso' },
			{ ui: 'carr3cont', api: 'contact1' },
			{ ui: 'carr3ph', api: 'phone1' },
			{ ui: 'carr3email', api: 'email1' },
			{ ui: 'carr3taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(carr3Config)

	/*  carr4id */
	const carr4Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'carr4id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'carr4id_th',
		fields: [
			{ ui: 'carr4name', api: 'custname' },
			{ ui: 'carr4id', api: 'custid' },
			{ ui: 'carr4add1', api: 'addr1' },
			{ ui: 'carr4add2', api: 'addr2' },
			{ ui: 'carr4add3', api: 'addr3' },
			{ ui: 'carr4city', api: 'city' },
			{ ui: 'carr4st', api: 'state' },
			{ ui: 'carr4zip', api: 'zip' },
			{ ui: 'carr4iso', api: 'iso' },
			{ ui: 'carr4cont', api: 'contact1' },
			{ ui: 'carr4ph', api: 'phone1' },
			{ ui: 'carr4email', api: 'email1' },
			{ ui: 'carr4taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(carr4Config)

	/*  carr5id */
	const carr5Config = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'carr5id',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'carr5id_th',
		fields: [
			{ ui: 'carr5name', api: 'custname' },
			{ ui: 'carr5id', api: 'custid' },
			{ ui: 'carr5add1', api: 'addr1' },
			{ ui: 'carr5add2', api: 'addr2' },
			{ ui: 'carr5add3', api: 'addr3' },
			{ ui: 'carr5city', api: 'city' },
			{ ui: 'carr5st', api: 'state' },
			{ ui: 'carr5zip', api: 'zip' },
			{ ui: 'carr5iso', api: 'iso' },
			{ ui: 'carr5cont', api: 'contact1' },
			{ ui: 'carr5ph', api: 'phone1' },
			{ ui: 'carr5email', api: 'email1' },
			{ ui: 'carr5taxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(carr5Config)

	/*  IOR */
	const iorConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'iorid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'iorid_th',
		fields: [
			{ ui: 'iorname', api: 'custname' },
			{ ui: 'iorid', api: 'custid' },
			{ ui: 'ioradd1', api: 'addr1' },
			{ ui: 'ioradd2', api: 'addr2' },
			{ ui: 'ioradd3', api: 'addr3' },
			{ ui: 'iorcity', api: 'city' },
			{ ui: 'iorst', api: 'state' },
			{ ui: 'iorzip', api: 'zip' },
			{ ui: 'ioriso', api: 'iso' },
			{ ui: 'iorcont', api: 'contact1' },
			{ ui: 'iorph', api: 'phone1' },
			{ ui: 'ioremail', api: 'email1' },
			{ ui: 'iortaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(iorConfig)


	/*  USPPI */
	const USPPIConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'usppiid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'usppiid_th',
		fields: [
			{ ui: 'usppiname', api: 'custname' },
			{ ui: 'usppiid', api: 'custid' },
			{ ui: 'usppiadd1', api: 'addr1' },
			{ ui: 'usppiadd2', api: 'addr2' },
			{ ui: 'usppiadd3', api: 'addr3' },
			{ ui: 'usppicity', api: 'city' },
			{ ui: 'usppist', api: 'state' },
			{ ui: 'usppizip', api: 'zip' },
			{ ui: 'usppiiso', api: 'iso' },
			{ ui: 'usppicont', api: 'contact1' },
			{ ui: 'usppiph', api: 'phone1' },
			{ ui: 'usppiemail', api: 'email1' },
			{ ui: 'usppitaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(USPPIConfig)

	/*  Entry Location */
	const EntLocConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'entlocid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'entlocid_th',
		fields: [
			{ ui: 'entlocname', api: 'custname' },
			{ ui: 'entlocid', api: 'custid' },
			{ ui: 'entlocadd1', api: 'addr1' },
			{ ui: 'entlocadd2', api: 'addr2' },
			{ ui: 'entlocadd3', api: 'addr3' },
			{ ui: 'entloccity', api: 'city' },
			{ ui: 'entlocst', api: 'state' },
			{ ui: 'entloczip', api: 'zip' },
			{ ui: 'entlociso', api: 'iso' },
			{ ui: 'entloccont', api: 'contact1' },
			{ ui: 'entlocph', api: 'phone1' },
			{ ui: 'entlocemail', api: 'email1' },
			{ ui: 'entloctaxid', api: 'ein' },
			{ ui: 'entlocfirms', api: 'firms' }
		]
	}
	initCombineAutoComplete(EntLocConfig)

	/*  Rail */
	const RailConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'railid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'railid_th',
		fields: [
			{ ui: 'railname', api: 'custname' },
			{ ui: 'railid', api: 'custid' },
			{ ui: 'railadd1', api: 'addr1' },
			{ ui: 'railadd2', api: 'addr2' },
			{ ui: 'railadd3', api: 'addr3' },
			{ ui: 'railcity', api: 'city' },
			{ ui: 'railst', api: 'state' },
			{ ui: 'railzip', api: 'zip' },
			{ ui: 'railiso', api: 'iso' },
			{ ui: 'railcont', api: 'contact1' },
			{ ui: 'railph', api: 'phone1' },
			{ ui: 'railemail', api: 'email1' },
			{ ui: 'railtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(RailConfig)

	/*  Ramp */
	const RampConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'rampid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'rampid_th',
		fields: [
			{ ui: 'rampname', api: 'custname' },
			{ ui: 'rampid', api: 'custid' },
			{ ui: 'rampadd1', api: 'addr1' },
			{ ui: 'rampadd2', api: 'addr2' },
			{ ui: 'rampadd3', api: 'addr3' },
			{ ui: 'rampcity', api: 'city' },
			{ ui: 'rampst', api: 'state' },
			{ ui: 'rampzip', api: 'zip' },
			{ ui: 'rampiso', api: 'iso' },
			{ ui: 'rampcont', api: 'contact1' },
			{ ui: 'rampph', api: 'phone1' },
			{ ui: 'rampemail', api: 'email1' },
			{ ui: 'ramptaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(RampConfig)

	/*  Return Empty */
	const ReturnEmptyConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'returnid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'returnid_th',
		fields: [
			{ ui: 'returnname', api: 'custname' },
			{ ui: 'returnid', api: 'custid' },
			{ ui: 'returnadd1', api: 'addr1' },
			{ ui: 'returnadd2', api: 'addr2' },
			{ ui: 'returnadd3', api: 'addr3' },
			{ ui: 'returncity', api: 'city' },
			{ ui: 'returnst', api: 'state' },
			{ ui: 'returnzip', api: 'zip' },
			{ ui: 'returniso', api: 'iso' },
			{ ui: 'returncont', api: 'contact1' },
			{ ui: 'returnph', api: 'phone1' },
			{ ui: 'returnemail', api: 'email1' },
			{ ui: 'returntaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(ReturnEmptyConfig)

	/*  Load At */
	const LoadConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'loadid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'loadid_th',
		fields: [
			{ ui: 'loadname', api: 'custname' },
			{ ui: 'loadid', api: 'custid' },
			{ ui: 'loadadd1', api: 'addr1' },
			{ ui: 'loadadd2', api: 'addr2' },
			{ ui: 'loadadd3', api: 'addr3' },
			{ ui: 'loadcity', api: 'city' },
			{ ui: 'loadst', api: 'state' },
			{ ui: 'loadzip', api: 'zip' },
			{ ui: 'loadiso', api: 'iso' },
			{ ui: 'loadcont', api: 'contact1' },
			{ ui: 'loadph', api: 'phone1' },
			{ ui: 'loademail', api: 'email1' },
			{ ui: 'loadtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(LoadConfig)

	/*  End User ID */
	const enduserConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'enduserid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'enduserid_th',
		fields: [
			{ ui: 'endusername', api: 'custname' },
			{ ui: 'enduserid', api: 'custid' },
			{ ui: 'enduseradd1', api: 'addr1' },
			{ ui: 'enduseradd2', api: 'addr2' },
			{ ui: 'enduseradd3', api: 'addr3' },
			{ ui: 'endusercity', api: 'city' },
			{ ui: 'enduserst', api: 'state' },
			{ ui: 'enduserzip', api: 'zip' },
			{ ui: 'enduseriso', api: 'iso' },
			{ ui: 'endusercont', api: 'contact1' },
			{ ui: 'enduserph', api: 'phone1' },
			{ ui: 'enduseremail', api: 'email1' },
			{ ui: 'endusertaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(enduserConfig)

	/*  Principal */
	const principalConfig = {
		url: 'dataentry.ashx',
		task: 'getContactsPrincipal',
		queryParam: 'q',
		fieldId: 'prinid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'prinid_th',
		onAdd: onChangeSalesRep,
		onDelete: onChangeSalesRep,
		fields: [
			{ ui: 'prinname', api: 'custname' },
			{ ui: 'prinid', api: 'custid' },
			{ ui: 'prinadd1', api: 'addr1' },
			{ ui: 'prinadd2', api: 'addr2' },
			{ ui: 'prinadd3', api: 'addr3' },
			{ ui: 'princity', api: 'city' },
			{ ui: 'prinst', api: 'state' },
			{ ui: 'prinzip', api: 'zip' },
			{ ui: 'priniso', api: 'iso' },
			{ ui: 'princont', api: 'contact1' },
			{ ui: 'prinph', api: 'phone1' },
			{ ui: 'prinemail', api: 'email1' },
			{ ui: 'printaxid', api: 'ein' },
			{ ui: 'csid', api: 'csr' },
			{ ui: 'dopsid', api: 'destop' },
			{ ui: 'salesrep', api: 'rep1' },
			{ ui: 'billid', api: 'billto', type: 'ti' },
			{ ui: 'billname', api: 'billname' },
		]
	}
	initCombineAutoComplete(principalConfig)

	/*  AMS Consignee */
	const amsconsConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'liveid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'liveid_th',
		fields: [
			{ ui: 'livename', api: 'custname' },
			{ ui: 'liveid', api: 'custid' },
			{ ui: 'liveadd1', api: 'addr1' },
			{ ui: 'liveadd2', api: 'addr2' },
			{ ui: 'liveadd3', api: 'addr3' },
			{ ui: 'livecity', api: 'city' },
			{ ui: 'livest', api: 'state' },
			{ ui: 'livezip', api: 'zip' },
			{ ui: 'liveiso', api: 'iso' },
			{ ui: 'livecont', api: 'contact1' },
			{ ui: 'liveph', api: 'phone1' },
			{ ui: 'liveemail', api: 'email1' },
			{ ui: 'livetaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(amsconsConfig)

	/*  Warehouse */
	const wareConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'wareid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'wareid_th',
		fields: [
			{ ui: 'warename', api: 'custname' },
			{ ui: 'wareid', api: 'custid' },
			{ ui: 'wareadd1', api: 'addr1' },
			{ ui: 'wareadd2', api: 'addr2' },
			{ ui: 'wareadd3', api: 'addr3' },
			{ ui: 'warecity', api: 'city' },
			{ ui: 'warest', api: 'state' },
			{ ui: 'warezip', api: 'zip' },
			{ ui: 'wareiso', api: 'iso' },
			{ ui: 'warecont', api: 'contact1' },
			{ ui: 'wareph', api: 'phone1' },
			{ ui: 'wareemail', api: 'email1' },
			{ ui: 'waretaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(wareConfig)

	/*  SOC Provider */
	const socprovConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'socprovid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'socprovid_th',
		fields: [
			{ ui: 'socprovname', api: 'custname' },
			{ ui: 'socprovid', api: 'custid' },
			{ ui: 'socprovadd1', api: 'addr1' },
			{ ui: 'socprovadd2', api: 'addr2' },
			{ ui: 'socprovadd3', api: 'addr3' },
			{ ui: 'socprovcity', api: 'city' },
			{ ui: 'socprovst', api: 'state' },
			{ ui: 'socprovzip', api: 'zip' },
			{ ui: 'socproviso', api: 'iso' },
			{ ui: 'socprovcont', api: 'contact1' },
			{ ui: 'socprovph', api: 'phone1' },
			{ ui: 'socprovemail', api: 'email1' },
			{ ui: 'socprovtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(socprovConfig)

	/*  SOC BCO */
	const socbcoConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'socbcoid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'socbcoid_th',
		fields: [
			{ ui: 'socbconame', api: 'custname' },
			{ ui: 'socbcoid', api: 'custid' },
			{ ui: 'socbcoadd1', api: 'addr1' },
			{ ui: 'socbcoadd2', api: 'addr2' },
			{ ui: 'socbcoadd3', api: 'addr3' },
			{ ui: 'socbcocity', api: 'city' },
			{ ui: 'socbcost', api: 'state' },
			{ ui: 'socbcozip', api: 'zip' },
			{ ui: 'socbcoiso', api: 'iso' },
			{ ui: 'socbcocont', api: 'contact1' },
			{ ui: 'socbcoph', api: 'phone1' },
			{ ui: 'socbcoemail', api: 'email1' },
			{ ui: 'socbcotaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(socbcoConfig)

	/*  Co-Load */
	const coloadConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'coloadid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'coloadid_th',
		fields: [
			{ ui: 'coloadname', api: 'custname' },
			{ ui: 'coloadid', api: 'custid' },
			{ ui: 'coloadadd1', api: 'addr1' },
			{ ui: 'coloadadd2', api: 'addr2' },
			{ ui: 'coloadadd3', api: 'addr3' },
			{ ui: 'coloadcity', api: 'city' },
			{ ui: 'coloadst', api: 'state' },
			{ ui: 'coloadzip', api: 'zip' },
			{ ui: 'coloadiso', api: 'iso' },
			{ ui: 'coloadcont', api: 'contact1' },
			{ ui: 'coloadph', api: 'phone1' },
			{ ui: 'coloademail', api: 'email1' },
			{ ui: 'coloadtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(coloadConfig)

	/*  DO Location */
	const dolocConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'dolocid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'dolocid_th',
		fields: [
			{ ui: 'dolocname', api: 'custname' },
			{ ui: 'dolocid', api: 'custid' },
			{ ui: 'dolocadd1', api: 'addr1' },
			{ ui: 'dolocadd2', api: 'addr2' },
			{ ui: 'dolocadd3', api: 'addr3' },
			{ ui: 'doloccity', api: 'city' },
			{ ui: 'dolocst', api: 'state' },
			{ ui: 'doloczip', api: 'zip' },
			{ ui: 'dolociso', api: 'iso' },
			{ ui: 'doloccont', api: 'contact1' },
			{ ui: 'dolocph', api: 'phone1' },
			{ ui: 'dolocemail', api: 'email1' },
			{ ui: 'doloctaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(dolocConfig)

	/*  Pre Carrier ID */
	const precarrConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'precarrid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'precarrid_th',
		fields: [
			{ ui: 'precarrname', api: 'custname' },
			{ ui: 'precarrid', api: 'custid' },
			{ ui: 'precarradd1', api: 'addr1' },
			{ ui: 'precarradd2', api: 'addr2' },
			{ ui: 'precarradd3', api: 'addr3' },
			{ ui: 'precarrcity', api: 'city' },
			{ ui: 'precarrst', api: 'state' },
			{ ui: 'precarrzip', api: 'zip' },
			{ ui: 'precarriso', api: 'iso' },
			{ ui: 'precarrcont', api: 'contact1' },
			{ ui: 'precarrph', api: 'phone1' },
			{ ui: 'precarremail', api: 'email1' },
			{ ui: 'precarrtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(precarrConfig)

	const precarrConfig2 = {
		url: 'dataentry.ashx',
		task: 'getContactsTrucker',
		queryParam: 'q',
		fieldId: 'precarrid2',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'precarrid2_th',
		fields: [
			{ ui: 'precarrname', api: 'custname' },
			{ ui: 'precarrid2', api: 'custid' },
			{ ui: 'precarradd1', api: 'addr1' },
			{ ui: 'precarradd2', api: 'addr2' },
			{ ui: 'precarradd3', api: 'addr3' },
			{ ui: 'precarrcity', api: 'city' },
			{ ui: 'precarrst', api: 'state' },
			{ ui: 'precarrzip', api: 'zip' },
			{ ui: 'precarriso', api: 'iso' },
			{ ui: 'precarrcont', api: 'contact1' },
			{ ui: 'precarrph', api: 'phone1' },
			{ ui: 'precarremail', api: 'email1' },
			{ ui: 'precarrtaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(precarrConfig2)

	/*  DO Chassis ID */
	const dochassConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'dochassid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'dochassid_th',
		fields: [
			{ ui: 'dochassname', api: 'custname' },
			{ ui: 'dochassid', api: 'custid' },
			{ ui: 'dochassadd1', api: 'addr1' },
			{ ui: 'dochassadd2', api: 'addr2' },
			{ ui: 'dochassadd3', api: 'addr3' },
			{ ui: 'dochasscity', api: 'city' },
			{ ui: 'dochassst', api: 'state' },
			{ ui: 'dochasszip', api: 'zip' },
			{ ui: 'dochassiso', api: 'iso' },
			{ ui: 'dochasscont', api: 'contact1' },
			{ ui: 'dochassph', api: 'phone1' },
			{ ui: 'dochassemail', api: 'email1' },
			{ ui: 'dochasstaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(dochassConfig)

	/*  DO Bill To ID */
	const dobillConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'dobillid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'dobillid_th',
		fields: [
			{ ui: 'dobillname', api: 'custname' },
			{ ui: 'dobillid', api: 'custid' },
			{ ui: 'dobilladd1', api: 'addr1' },
			{ ui: 'dobilladd2', api: 'addr2' },
			{ ui: 'dobilladd3', api: 'addr3' },
			{ ui: 'dobillcity', api: 'city' },
			{ ui: 'dobillst', api: 'state' },
			{ ui: 'dobillzip', api: 'zip' },
			{ ui: 'dobilliso', api: 'iso' },
			{ ui: 'dobillcont', api: 'contact1' },
			{ ui: 'dobillsph', api: 'phone1' },
			{ ui: 'dobillemail', api: 'email1' },
			{ ui: 'dobilltaxid', api: 'ein' }
		]
	}
	initCombineAutoComplete(dobillConfig)




	/*  SCAC */
	const scacConfig = {
		url: 'dataentry.ashx',
		task: 'getContactsScac',
		queryParam: 'q',
		fieldId: 'scacid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'scacid_th',
		fields: [
			{ ui: 'scacname', api: 'custname' },
			{ ui: 'scacid', api: 'custid' }
		],
		onAdd: d => {
			$('#contract').val('')
		}
	}
	initCombineAutoComplete(scacConfig)

	const scac1Config = {
		url: 'dataentry.ashx',
		task: 'getContactsScac',
		queryParam: 'q',
		fieldId: 'scac1',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'scac1id_th',
		fields: [
			{ ui: 'scac1name', api: 'custname' },
			{ ui: 'scac1', api: 'custid' }
		]
	}
	initCombineAutoComplete(scac1Config)

	const scac2Config = {
		url: 'dataentry.ashx',
		task: 'getContactsScac',
		queryParam: 'q',
		fieldId: 'scac2',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'scac2id_th',
		fields: [
			{ ui: 'scac2name', api: 'custname' },
			{ ui: 'scac2', api: 'custid' }
		]
	}
	initCombineAutoComplete(scac2Config)





	/*  Port Location */
	const portlocConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'portlocid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'portlocid_th',
		fields: [
			{ ui: 'portlocname', api: 'custname' },
			{ ui: 'portlocid', api: 'custid' },
			{ ui: 'portlocfirms', api: 'firms' }
		]
	}
	initCombineAutoComplete(portlocConfig)

	/*  Item Master */
	const ItemMasterConfig = {
		url: 'dataentry.ashx',
		task: 'getItem2',
		queryParam: 'q',
		fieldId: 'itemcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'itemid_th',
		fields: [
			{ ui: 'itemdesc', api: 'expand' },
			{ ui: 'itemcode', api: 'code' },
			{ ui: 'sedcode', api: 'schbcode' },
			{ ui: 'seddesc', api: 'schbdesc' }
		]
	}
	initCombineAutoComplete(ItemMasterConfig)





	/*  Out Gate Container */
	const OGctnrConfig = {
		url: 'dataentry.ashx',
		task: 'getOGctnr',
		queryParam: 'q',
		fieldId: 'ogctnr',
		tokenId: 'ctnrno',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'ogid_th',
		fields: [
			{ ui: 'ogtype', api: 'ctnrtype' },
			{ ui: 'ogctnr', api: 'ctnrno' }
		]
	}
	initCombineAutoComplete(OGctnrConfig)

	/*  In Gate Container */
	const IGctnrConfig = {
		url: 'dataentry.ashx',
		task: 'getIGctnr',
		queryParam: 'q',
		fieldId: 'igctnr',
		tokenId: 'ctnrno',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'igid_th',
		fields: [
			{ ui: 'igtype', api: 'ctnrtype' },
			{ ui: 'igctnr', api: 'ctnrno' }
		]
	}
	initCombineAutoComplete(IGctnrConfig)

	/*  Out Gate Chassis */
	const OGchasConfig = {
		url: 'dataentry.ashx',
		task: 'getOGchas',
		queryParam: 'q',
		fieldId: 'ogchas',
		tokenId: 'ctnrno',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'ogcid_th',
		fields: [
			{ ui: 'ogctype', api: 'ctnrtype' },
			{ ui: 'ogchas', api: 'ctnrno' }
		]
	}
	initCombineAutoComplete(OGchasConfig)

	/*  In Gate Chassis */
	const IGchasConfig = {
		url: 'dataentry.ashx',
		task: 'getIGchas',
		queryParam: 'q',
		fieldId: 'igchas',
		tokenId: 'ctnrno',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'igcid_th',
		fields: [
			{ ui: 'igctype', api: 'ctnrtype' },
			{ ui: 'igchas', api: 'ctnrno' }
		]
	}
	initCombineAutoComplete(IGchasConfig)

	/*  Destination */
	const destinationConfig = {
		url: 'dataentry.ashx',
		task: 'getDestination2',
		queryParam: 'q',
		fieldId: 'destcode',
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		container: 'destcode_th',
		fields: [
			{ ui: 'destname', api: 'expand' },
			{ ui: 'destcode', api: 'code' }
		]
	}
	initCombineAutoComplete(destinationConfig)




	for (let i = 1; i < 21; i += 1) {
		/* Sales Description */
		const sufix = String(i).padStart(2, '0')
		/*const salesConfig = {
			task: 'getArcodes',
			url: 'dataentry.ashx',
			queryParam: 'q',
			fieldId: 'ardesc' + sufix,
			tokenId: 'code',
			searchKey: 'str',
			minChars: 2,
			preventDuplicates: false,
			pairField: 'arcode' + sufix,
			pairKey: 'code',
			fields: [
				{ ui: 'ardesc' + sufix, api: 'expand' },
				{ ui: 'arcode' + sufix, api: 'code' }
			]
		};
		initPairAutoComplete(salesConfig);
		*/
		const salesConfig2 = {
			task: 'getArcodes',
			url: 'dataentry.ashx',
			queryParam: 'q',
			fieldId: 'arcode' + sufix,
			tokenId: 'code',
			searchKey: 'str',
			minChars: 2,
			preventDuplicates: false,
			//pairField: 'ardesc' + sufix,
			//pairKey: 'expand',
			fields: [
				{ ui: 'ardesc' + sufix, api: 'expand' },
				{ ui: 'arcode' + sufix, api: 'code' }
			]
		}
		initCombineAutoComplete(salesConfig2)

		/* COS Description */
		const cosConfig = {
			task: 'getApcodes',
			url: 'dataentry.ashx',
			queryParam: 'q',
			fieldId: 'apdesc' + sufix,
			tokenId: 'code',
			searchKey: 'expand',
			minChars: 2,
			preventDuplicates: false,
			pairField: 'apcode' + sufix,
			pairKey: 'code',
			fields: [
				{ ui: 'apdesc' + sufix, api: 'expand' },
				{ ui: 'apcode' + sufix, api: 'code' }
			]
		}
		initPairAutoComplete(cosConfig)

		const cosConfig2 = {
			task: 'getApcodes',
			url: 'dataentry.ashx',
			queryParam: 'q',
			fieldId: 'apcode' + sufix,
			tokenId: 'code',
			searchKey: 'code',
			minChars: 2,
			preventDuplicates: false,
			pairField: 'apdesc' + sufix,
			pairKey: 'expand',
			fields: [
				{ ui: 'apdesc' + sufix, api: 'expand' },
				{ ui: 'apcode' + sufix, api: 'code' }
			]
		}
		initPairAutoComplete(cosConfig2)
	}
	const stationid = $('#stationid').val()
	const bkgcfmtype = $('#bkgcfmtype').val()
	for (let i = 1; i < 51; i += 1) {
		/* Containers */
		const sufix = String(i).padStart(2, '0')
		const AssignContainerConfig = {
			url: 'dataentry.ashx',
			task: 'getAssignctnr',
			queryParam: 'q',
			fieldId: 'ctnrno' + sufix,
			tokenId: 'ctnrno',
			searchKey: 'str',
			minChars: 2,
			preventDuplicates: false,
			container: 'assign' + sufix + 'id_th',
			fields: [
				{ ui: 'ctnrtype' + sufix, api: 'ctnrtype' },
				{ ui: 'ctnrno' + sufix, api: 'ctnrno' }
			]
		}
		initCombineAutoComplete(AssignContainerConfig, `&stationid=${stationid}&bkgcfmtype=${bkgcfmtype}`)
	}

	let now = new Date()
	//yyyymmddhhmmss 
	let localTimeString = `${now.getFullYear()}`
		+ `${(now.getMonth() + 1).toString().padStart(2, '0')}`
		+ `${now.getDate().toString().padStart(2, '0')}`
		+ `${now.getHours().toString().padStart(2, '0')}`
		+ `${now.getMinutes().toString().padStart(2, '0')}`
		+ `${now.getSeconds().toString().padStart(2, '0')}`

	$('#localtime').val(localTimeString)
	$('#localtime2').val(localTimeString)

	{
		var x, i, j, selElmnt, a, b, c

		x = document.getElementsByClassName("custom-select")
		for (i = 0; i < x.length; i++) {
			selElmnt = x[i].getElementsByTagName("select")[0]
			a = document.createElement("DIV")
			a.setAttribute("class", "select-selected")
			a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML
			x[i].appendChild(a)
			b = document.createElement("DIV")
			b.setAttribute("class", "select-items select-hide")
			for (j = 0; j < selElmnt.length; j++) {
				c = document.createElement("DIV")
				c.innerHTML = selElmnt.options[j].innerHTML
				c.addEventListener("click", function (e) {
					var y, i, k, s, h
					s = this.parentNode.parentNode.getElementsByTagName("select")[0]
					h = this.parentNode.previousSibling
					for (i = 0; i < s.length; i++) {
						if (s.options[i].innerHTML == this.innerHTML) {
							s.selectedIndex = i
							h.innerHTML = this.innerHTML
							y = this.parentNode.getElementsByClassName("same-as-selected")
							for (k = 0; k < y.length; k++) {
								y[k].removeAttribute("class")
							}

							this.setAttribute("class", "same-as-selected")
							break
						}
					}

					$(s).trigger('change')
					h.click()
				})

				b.appendChild(c)
			}

			x[i].appendChild(b)
			a.addEventListener("click", function (e) {
				e.stopPropagation()
				closeAllSelect(this)
				this.nextSibling.classList.toggle("select-hide")
				this.classList.toggle("select-arrow-active")
			})
		}

		document.addEventListener("click", closeAllSelect)

		function closeAllSelect(elmnt) {
			var x, y, i, arrNo = []
			x = document.getElementsByClassName("select-items")
			y = document.getElementsByClassName("select-selected")
			for (i = 0; i < y.length; i++) {
				if (elmnt == y[i]) {
					arrNo.push(i)
				} else {
					y[i].classList.remove("select-arrow-active")
				}
			}

			for (i = 0; i < x.length; i++) {
				if (arrNo.indexOf(i)) {
					x[i].classList.add("select-hide")
				}
			}
		}
	}

	$('#contractown').on('change', e => {
		$('#contract').val('')
	})

	$('#select-contract-dialog').dialog({
		autoOpen: false,
		modal: true,
		//title: $( "#hbl" ).val(),
		width: 'auto',
		buttons: [
			{
				id: 0,
				text: "Cancel",
				click: function () {
					$(this).dialog("close")
				}
			},
			{
				id: 1,
				text: "Select",
				click: function () {
					let contract = $('input[name="select-contract-radio"]:checked').val()

					if (contract?.length > 0) {
						$('#contract').val(contract)
					}

					$(this).dialog("close")
				}
			}
		]
	})

	$('#contract').on('focus', e => {
		let scac = $('#scacid').val()
		let code = $('#contractown').val()
		let contract = $('#contract').val()

		if (scac?.length == 0 || code?.length == 0 || (g_selectedScac == scac && g_selectedCode == code && g_isContractSelectionInProgress)) {
			g_isContractSelectionInProgress = false
			return
		}

		g_selectedScac = scac
		g_selectedCode = code
		g_isContractSelectionInProgress = true

		$('#select-contract-table').empty()
		loadContractData(scac, code, addContractData, (d) => {
			if (d.length == 0) {
				return
			}

			$('#select-contract-dialog').dialog('option', 'title', code)
			$('#select-contract-dialog').dialog('open')
		})
	})

	function updateFlp1() {
		$('#flp1').val(100 - (new Number($('#flp2').val()) + new Number($('#flp3').val()) + new Number($('#flp4').val())))
	}

	$('#flp2').on('change', () => {
		updateFlp1()
	})

	$('#flp3').on('change', () => {
		updateFlp1()
	})

	$('#flp4').on('change', () => {
		updateFlp1()
	})
})


let g_selectedScac
let g_selectedCode
let g_isContractSelectionInProgress


function addContractData(d) {
	let tr = $('#select-contract-table').append($('<tr>')
		.append($('<td>')
			.append($('<input>')
				.attr('type', 'radio')
				.attr('name', 'select-contract-radio')
				.attr('value', d.expand)
			)
		)
		.append($('<td>')
			.text(d.expand)
		)
		.append($('<td>')
			.text(d.contractnotes)
		)
	)
}


function loadContractData(scac, code, itemHandler, completeHandler) {
	const q = {
		task: 'getContractData'
		, scac: scac
		, code: code
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			if (Array.isArray(res)) {
				res.forEach(item => {
					itemHandler(item)
				})

				completeHandler(res)
			}
		}
	})
}


$('.top-scroll-wrapper1').on('scroll', function (e) {
	$('.top-scroll-wrapper2').scrollLeft($('.top-scroll-wrapper1').scrollLeft())
})

$('.top-scroll-wrapper2').on('scroll', function (e) {
	$('.top-scroll-wrapper1').scrollLeft($('.top-scroll-wrapper2').scrollLeft())
})

$(window).on('load', function (e) {
	$('.top-scroll-div1').width($('table').width())
	$('.top-scroll-div2').width($('table').width())
})


function toQueryString(o) {
	let separator = '?'
	let queryString = ''

	for (const [key, value] of Object.entries(o)) {
		queryString += `${separator}${key}=${encodeURIComponent(value)}`
		separator = '&'
	}

	return queryString
}


$(document).ready(function () {
	formatDateTimeRaw();
	loadBankForInvoice();

	// When page loads, get the invno and call the function setEmailToPrtinv
	setEmailToPrtinv();
	// Also, when the select changes, fire the function setEmailToPrtinv
	$('#invno').on('change', function () {
		setEmailToPrtinv();
	});
});

// Load the Banks by stationId
function loadBankForInvoice() {
	const stationid = $('#stationid').val();
	const sqid = $('#sqid').val();

	if ($('#bank').length <= 0) return;
	$('#bank').empty();

	const q = {
		task: 'getBanksByStationId'
		, sqid: sqid
		, stationid: stationid
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'GET',
		contentType: 'application/json',
		success: function (response) {
			response.forEach(item => {
				$('#bank').append($('<option></option>').val(item.bankid).html(`${item.code} - ${item.expand}`));
			});
		},
		error: function (error) {
			console.error('Error:', error)
		},
		complete: function () {
		}
	})
}

// Format the string value to the follow format: yyyy/mm/dd/hh:mm
function formatDateTimeRaw() {
	// add into the array the input and form ids that needs to has the same format
	const inputToSetFormat = [
		{
			formId: 'dataEntryForm',
			inputId: 'localtime2'
		}
	];

	inputToSetFormat.forEach((i) => {
		const dateTimeRaw = $(`#${i.formId} #${i.inputId}`).val();
		if (dateTimeRaw != undefined || dateTimeRaw != null)
			$(`#${i.formId} #${i.inputId}`).val(formatDateTime(dateTimeRaw));
	});

	function formatDateTime(datetime) {
		// Entry: yyyymmddhhmm 
		const year = datetime.substring(0, 4);
		const month = datetime.substring(4, 6);
		const day = datetime.substring(6, 8);
		const hour = datetime.substring(8, 10);
		const minute = datetime.substring(10, 12);
		// Output: yyyy/mm/dd/hh/mm
		return `${year}/${month}/${day}/${hour}:${minute}`
	}
}

function setEmailToPrtinv() {

	const sqid = $('#sqid').val();
	const invno = $('#invno').val();
	const stationid = $('#stationid').val();

	// Prevent send empty values
	//if ($('#invno').length <= 0 && $('#sqid').length <= 0 && $('#stationid').length <= 0) return;
	if ($('#invno').length <= 0 && $('#sqid').length <= 0) return;

	// Call GetBillingEmailToPrtinv
	const q = {
		task: 'getBillingEmailToPrtinv'
		, sqid
		, invno
		, stationid
	}
	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'GET',
		contentType: 'application/json',
		success: function (response) {
			$('#emailto').val(response);
		},
		error: function (error) {
			console.error('Error:', error)
		},
		complete: function () {
		}
	});
}