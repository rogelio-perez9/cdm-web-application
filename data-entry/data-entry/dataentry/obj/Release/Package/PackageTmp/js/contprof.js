let g_sqid = ''
let g_stationId = ''
let g_mid = ''
let g_link = ''
let g_rid = ''
let g_pid = 1
let g_custId
let g_custName


function setContacts(data) {
	data.forEach(e => {
		g_custId = e.custid
		g_custName = e.custname

		$('#contacts-cust').text(`${e.custname} (${e.custid}) - Local Information`)
	})
}


function setContactsProfile(data) {
	data.forEach(e => {
		$('#localname').val(e.localname)
		$('#localadd1').val(e.localadd1)
		$('#localadd2').val(e.localadd2)
		$('#localadd3').val(e.localadd3)
		$('#localcity').val(e.localcity)
		$('#localst').val(e.localst)
		$('#localzip').val(e.localzip)
		$('#localiso').val(e.localiso)
		$('#localtaxcode').val(e.localtaxcode)
		$('#locallimit').val(e.locallimit)
		$('#aracctcode').val(e.aracctcode)
		$('#arterms').val(e.arterms)
		$('#fsales').val(e.fsales)
		$('#arbank').val(e.arbank)
		$('#apacctcode').val(e.apacctcode)
		$('#apterms').val(e.apterms)
		$('#apbank').val(e.apbank)

		$('#adduser').val(e.adduser)
		$('#adddate').val(`${toDateString(e.adddate)} @ ${toTimeString(e.adddate)}`)
		$('#lastuser').val(e.lastuser)
		$('#lastdate').val(`${toDateString(e.lastdate)} @ ${toTimeString(e.lastdate)}`)
	})
}


function loadContacts(sqid, serialNo, onLoad) {
	$.ajax({
		url: `dataentry.ashx?task=getContactsBySerialNo&serialno=${serialNo}&sqid=${sqid}`,
		dataType: 'json',
		success: (data) => {
			onLoad(data)
		},
		error: (jqXHR, textStatus, errorThrown) => {
			alert(`Error loading contacts: ${textStatus} - ${errorThrown}`)
		}
	})
}


function loadContactsProfile(sqid, stationId, serialNo, onLoad) {
	$.ajax({
		url: `dataentry.ashx?task=loadContactsProfile&stationId=${stationId}&sqid=${sqid}&serialNo=${serialNo}`,
		dataType: 'json',
		success: (data) => {
			onLoad(data)
		},
		error: (jqXHR, textStatus, errorThrown) => {
			alert(`Error loading contacts profile: ${textStatus} - ${errorThrown}`)
		}
	})
}


function saveContactsProfile(sqid
	, stationId
	, custId
	, custName
	, localName
	, localAdd1
	, localAdd2
	, localAdd3
	, localCity
	, localSt
	, localZip
	, localIso
	, localTaxcode
	, localLimit
	, arBank
	, arAcctCode
	, apAcctCode
	, arTerms
	, apTerms
	, apBank
	, fSales
	, serialNo
	, user
	, onComplete) {

	let isSuccess = false

	//if ( ( arAcctCode?.'').length == 0) {
	//	alert( 'A/R Account Code cannot be blank' )
	//	onComplete( isSuccess )
	//	return
	//}

	$.ajax({
		url: `dataentry.ashx?task=saveContactsProfile&sqid=${$("#sqid").val()}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify({
			stationid: stationId
			, custid: custId
			, custname: custName
			, localname: localName
			, localadd1: localAdd1
			, localadd2: localAdd2
			, localadd3: localAdd3
			, localcity: localCity
			, localst: localSt
			, localzip: localZip
			, localiso: localIso
			, localtaxcode: localTaxcode
			, locallimit: localLimit
			, arbank: arBank
			, aracctcode: arAcctCode
			, apacctcode: apAcctCode
			, arterms: arTerms
			, apterms: apTerms
			, apbank: apBank
			, fsales: fSales
			, serialno: serialNo
			, user: user
		}),
		success: function (response) {
			if (response.error) {
				alert(`Failed updating. ${response.message}`)
			}
			else {
				alert('Contact profile saved successfully.')
				isSuccess = true
			}
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed updating. Please try later again!`)
		},
		complete: function () {
			onComplete(isSuccess)
		}
	})
}


$(document).ready(() => {
	g_sqid = $("#sqid").val()
	g_stationId = $("[name='STATION1']").val()

	let urlParams = new URLSearchParams(window.location.search)
	g_pid = urlParams.get('PID') || g_pid

	loadContacts(g_sqid, g_pid, setContacts)
	loadContactsProfile(g_sqid, g_stationId, g_pid, setContactsProfile)

	// save
	$(`[name='A1']`).on('click', (e) => {
		$(e.target).prop("disabled", true)

		saveContactsProfile(g_sqid, g_stationId, g_custId, g_custName
			, $('#localname').val()
			, $('#localadd1').val()
			, $('#localadd2').val()
			, $('#localadd3').val()
			, $('#localcity').val()
			, $('#localst').val()
			, $('#localzip').val()
			, $('#localiso').val()
			, $('#localtaxcode').val()
			, $('#locallimit').val()
			, $('#arbank').val()
			, $('#aracctcode').val()
			, $('#apacctcode').val()
			, $('#arterms').val()
			, $('#apterms').val()
			, $('#apbank').val()
			, $('#fsales').val()
			, g_pid
			, $("[name='USERDET']").val()
			, () => $(e.target).prop("disabled", false))
	})

	// cancel
	$(`[name='B1']`).on('click', () => {
		window.location = $('.contact').attr("href")
	})
})
