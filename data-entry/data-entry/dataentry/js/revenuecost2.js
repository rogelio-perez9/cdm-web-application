var savingRevenue = false
var savingCost = false
var termOptions = ''
var containerOptions = ''
var packageTypeOptions = ''
var currencyOptions = ''
var currencyValues = []
var isUpdatingRevenues = false
var isUpdatingCosts = false
var totalAmount = 0
var totalCost = 0

let g_bulkReleaseState = false
let g_isBulkReleaseCleared = false

let g_revenues = []
let g_isBulkRevenueDisabled = false

let g_costs = []
let g_isBulkCostDisabled = false

let g_totalAmountColor
let g_totalAmountBgColor


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
				$("#" + item.ui).val(data[item.api])
			})
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


function replaceBlank(d) {
	if (d.includes('1900')) return ''

	return d
}


function removeComma(d) {
	return d.replace(/,/g, '')
}


function getTruncatedValue(id, isUpper = false) {
	const el = $(`#${id}`)
	const val = el.val()?.trim() || ''

	if (val.length == 0) return ''

	const maxLength = el.attr('maxlength')
	const currentLength = val.length
	let truncatedValue = val

	if (isUpper) truncatedValue = val.toUpperCase()

	if (currentLength > maxLength) {
		truncatedValue = val.substring(0, maxLength)
	}

	return truncatedValue
}


function formatNumber(val, digits) {
	return Number(val).toLocaleString('en-US', { minimumFractionDigits: digits ?? 2, maximumFractionDigits: digits ?? 2 })
}


function toQueryString(o) {
	let separator = '?'
	let queryString = ''

	for (const [key, value] of Object.entries(o)) {
		queryString += `${separator}${key}=${encodeURIComponent(value)}`
		separator = '&'
	}

	return queryString
}


function copyOffsetRevenue(sqid, userId, uuid, invoiceNo, rType, offsetNo) {
	const q = {
		task: 'copyOffsetRevenue'
		, sqid: sqid
		, userid: userId
		, uuid: uuid
		, invno: invoiceNo
		, rtype: rType
		, 'offset-no': offsetNo
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'POST',
		contentType: 'application/json',
		success: function (response) {
			if (response.error) {
				alert(`Failed to copy revenues. ${response.message}`)
			}

			onLoadRevenueDetails()
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed to copy revenues. Please try later again!`)
		},
		complete: function () {
		}
	})
}


function onOffsetRevenue(id, invoiceNo, rType) {
	if (!window.confirm(`Are you sure you want to offset Invoice No. ${invoiceNo}`)) {
		return
	}

	const isUS = $('#cui').val().toUpperCase() == 'US'
	let sqid = $("#sqid").val()
	let userId = $("#userid").val()
	let uuid = $("#uuid").val()

	const q = {
		task: 'offsetRevenue'
		, sqid: sqid
		, userid: userId
		, uuid: uuid
		, invno: invoiceNo
		, 'new-doc-number': !isUS
		, 'prefix-inv': $("#inv1").val()
		, 'prefix-cr': $("#cr1").val()
		, 'prefix-db': $("#db1").val()
		, rtype: rType
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'POST',
		contentType: 'application/json',
		success: function (response) {
			if (response.error) {
				alert(`Failed to offset revenues. ${response.message}`)
			}
			else {
				if (window.confirm('Would you like create new transaction?')) {
					copyOffsetRevenue(sqid, userId, uuid, invoiceNo, rType, response.offsetNo)
				}
				else {
					onLoadRevenueDetails()
				}
			}
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed to offset revenues. Please try later again!`)
		},
		complete: function () {
		}
	})
}


function copyOffsetCost(sqid, userId, uuid, voucherNo, rType, offsetNo) {
	const q = {
		task: 'copyOffsetCost'
		, sqid: sqid
		, userid: userId
		, uuid: uuid
		, voucherno: voucherNo
		, rtype: rType
		, 'offset-no': offsetNo
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'POST',
		contentType: 'application/json',
		success: function (response) {
			if (response.error) {
				alert(`Failed to copy costs. ${response.message}`)
			}

			onLoadCostDetails()
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed to copy costs. Please try later again!`)
		},
		complete: function () {
		}
	})
}


function onOffsetCost(id, voucherNo, rType) {
	if (!window.confirm(`Are you sure you want to offset Voucher No. ${voucherNo}`)) {
		return
	}

	const isUS = $('#cui').val().toUpperCase() == 'US'

	let sqid = $("#sqid").val()
	let userId = $("#userid").val()
	let uuid = $("#uuid").val()

	const q = {
		task: 'offsetCost'
		, sqid: sqid
		, userid: userId
		, uuid: uuid
		, voucherno: voucherNo
		, 'new-doc-number': !isUS
		, 'prefix': $("#voucher1").val()
		, rtype: rType
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		type: 'POST',
		contentType: 'application/json',
		success: function (response) {
			if (response.error) {
				alert(`Failed to offset costs. ${response.message}`)
			}
			else {
				if (window.confirm('Would you like create new transaction?')) {
					copyOffsetCost(sqid, userId, uuid, voucherNo, rType, response.offsetNo)
				}
				else {
					onLoadCostDetails()
				}
			}
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed to offset costs. Please try later again!`)
		},
		complete: function () {
		}
	})
}


function onDeleteRevenue(id, item) {
	if (window.confirm("Do you really want to delete?")) {
		const sqid = $("#sqid").val()
		$.ajax({
			type: 'POST',
			url: `dataentry.ashx?task=delRevenue&sqid=${sqid}`,
			data: { uuid: item.uuid, detid: item.detid },
			success: function () {
				$(`#${id}`).remove()
			},
			error: function (err) {
				alert('Failed deleting a revenue. Please try later again!')
			}
		})
	}
}


function onDisplayTotal() {
	$('#bottom_total_amount').html(formatNumber(totalAmount))
	$('#bottom_total_cost').html(formatNumber(totalCost))
	let pl = totalAmount - totalCost
	$('#bottom_total_profit').html(formatNumber(pl))

	if (totalAmount == 0) {
		$('#bottom_total_margin').html('-')
	}
	else {
		$('#bottom_total_margin').html(formatNumber((1 - (totalCost / totalAmount)) * 100))
	}

	if (!g_totalAmountColor) {
		g_totalAmountColor = $('#bottom_total_amount').parent().css("color")
	}

	if (!g_totalAmountBgColor) {
		g_totalAmountBgColor = $('#bottom_total_amount').parent().css("background-color")
	}

	if (pl < 0) {
		$('#bottom_total_amount').parent().css({ color: 'white', 'background-color': 'red' })
	}
	else {
		$('#bottom_total_amount').parent().css({ color: g_totalAmountColor, 'background-color': g_totalAmountBgColor })
	}
}


function getRowStyle(colorElementId) {
	let colorString = $(`#${colorElementId}`).val()
	let colorTokens = colorString.split(';')
	let style = `color: #${colorTokens[0]}; :optional {background-color: #${colorTokens.length > 1 ? colorTokens[1] : '0'};}`
	return style
}


function onLoadRevenueDetails() {
	const sqid = $("#sqid").val()
	const chargemode = $('input[name="chargemode"]:checked').val()
	const uuid = $('#uuid').val()
	if (!uuid) return

	const q = {
		task: 'getRevenueDetailsEx'
		, sqid: $("#sqid").val()
		, uuid: $("#uuid").val()
		, chargemode: $('input[name="chargemode"]:checked').val()
	}

	$.ajax({
		url: `dataentry.ashx${toQueryString(q)}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			if (Array.isArray(res)) {
				$('#revenue_details_table tbody').remove()

				if (res.length === 0) {
					const tr = `<tbody><tr><td colspan=32>Not Found</td></tr></tbody>`
					$('#revenue_details_table').append(tr)
					totalAmount = 0
				}
				else {
					g_revenues = res
					$('#revenue_details_table').append('<tbody></tbody>')
					const tbody = $('#revenue_details_table tbody')
					let totalAmt = 0
					const cui = $('#cui').val()
					const isUS = cui.toUpperCase() == 'US'
					res.forEach((item, ind) => {
						const id = `${item.uuid}_${item.detid}_revenue_${ind}`
						let amt = item.amt || 0
						//if ( item.qty != 0 && item.rate != 0 && item.exrate != 0 ) amt = item.qty * ( item.rate * item.exrate )
						if (item.exrate != 0) amt = amt * item.exrate

						if (item.rtype == 'CR') totalAmt -= Number(amt)
						else totalAmt += Number(amt)

						let rowStyle = ''

						if (item.invno?.length > 0 && item.arpost == 0 && item.arrel != 1) {
							rowStyle = getRowStyle('rowcolor1')
						}
						else if (item.arpost == 1 && item.amtpaid == item.amt) {
							rowStyle = getRowStyle('rowcolor3')
						}
						else if (item.arpost == 1 && item.amtpaid != 0 && item.amtpaid != item.amt) {
							rowStyle = getRowStyle('rowcolor4')
						}
						else if (item.arpost == 1) {
							rowStyle = getRowStyle('rowcolor2')
						}
						else if (item.arrel == 1 && item.arpost == 0) {
							rowStyle = getRowStyle('rowcolor5')
						}

						let tr = `<tr id="${id}" style="${rowStyle}">`

						if (item.arpost == 1) {
							tr += `<td><div style="display: flex;"><img src="images/copy_icon.jpg" style="cursor: pointer; width: 30px; margin-right: 8px;" onclick="onCopyRevenue('${id}')" />`
							//+ `<img src="images/offset_icon.jpg" style="cursor: pointer; width: 30px;" onclick="onCopyRevenue('${id}', true)" />`

							if (item.invno && item.invno.length > 0 && !item.isOffset) {
								tr += `<img src="images/action_offset.jpg" style="cursor: pointer; width: 30px;" onclick="onOffsetRevenue(${item.detid}, '${item.invno}', '${item.rtype}')" />`
							}

							tr += `</div></td>`
						}
						else
							tr += `<td><div style="display: flex;"><img src="images/copy_icon.jpg" style="cursor: pointer; width: 30px;" onclick="onCopyRevenue('${id}')" /></div></td>`

						tr += `<td id='d-is-selected'><input type="checkbox" value="${item.detid}" ${(chargemode == 'A' || item.arpost == 1) ? "disabled" : ""}></td>`
						tr += `<td id='d-txtype'>${item.txtype}</td>`
						tr += `<td id='d-rtype'>${item.rtype + (item.isOffset ? ' (OF)' : '')}</td>`
						tr += `<td id='d-amtpp'>${item.amtpp}</td>`
						tr += `<td id='d-custid'>${item.custid}</td>`
						tr += `<td id='d-custname'>${item.custname}</td>`
						tr += `<td id='d-glacct'>${item.glacct}</td>`
						tr += `<td id='d-arcode'>${item.arcode}</td>`
						tr += `<td id='d-ardesc'>${item.ardesc}</td>`
						tr += `<td id='d-adddesc'>${item.adddesc}</td>`
						tr += `<td id='d-uom'>${item.uom}</td>`
						tr += `<td id='d-ctnrno'>${item.ctnrno}</td>`
						tr += `<td id='d-qty'>${item.qty}</td>`
						tr += `<td id='d-currency'>${item.currency}</td>`
						tr += `<td id='d-rate'>${formatNumber(item.rate)}</td>`
						tr += `<td id='d-amt'>${formatNumber(item.amt)}</td>`
						tr += `<td id='d-exrate'>${formatNumber(item.exrate, 4)}</td>`
						tr += `<td>${item.rtype == 'CR' ? '-' : ''}${formatNumber(amt)}</td>`
						tr += `<td id='d-genmethod'>${item.genmethod}</td>`
						tr += `<td id='d-invno'>${item.invno}</td>`
						tr += `<td id='d-release'><input type="checkbox" disabled ${item.release == 1 ? 'checked' : ''} /></td>`
						tr += `<td id='d-invdate'>${replaceBlank(item.invdate)}</td >`
						tr += `<td id='d-terms'>${item.terms}</td>`
						tr += `<td id='d-duedate'>${replaceBlank(item.duedate)}</td>`
						tr += `<td id='d-amtpaid'>${formatNumber(item.amtpaid)}</td>`
						tr += `<td id='d-pydate'>${replaceBlank(item.pydate)}</td>`
						tr += `<td id='d-custref'>${item.custref}</td>`
						tr += `<td id='d-note1' style='display:none'>${item.note1}</td>`
						tr += `<td id='d-lastuser'>${item.lastuser}</td>`
						tr += `<td id='d-lastdate'>${replaceBlank(item.lastdate)}</td>`
						tr += `<td id='d-adduser'>${item.adduser}</td>`
						tr += `<td id='d-adddate'>${replaceBlank(item.adddate)}</td>`

						tr += `<td id='d-ourref' style='display:none'>${item.ourref}</td>`
						tr += `<td id='d-stationid' style='display:none'>${item.stationid}</td>`
						tr += `<td id='d-mbl' style='display:none'>${item.mbl}</td>`
						tr += `<td id='d-hbl' style='display:none'>${item.hbl}</td>`
						tr += `<td id='d-manifest' style='display:none'>${item.manifest}</td>`
						tr += `<td id='d-basecurrency' style='display:none'>${item.basecurrency}</td>`

						if (isUS) {
							tr += `<td>${item.jeno}</td></tr>`
						}
						else {
							tr += `<td>${item.jeno}</td>`
							tr += `<td><input type="checkbox" disabled ${Number(item.provisional) == 1 ? 'checked' : ''} /></td>`
							tr += `<td>${item.taxinvno}</td>`
							tr += `<td>${replaceBlank(item.taxinvdate)}</td></tr>`
						}

						tbody.append(tr)
					})

					totalAmount = totalAmt
				}

				onDisplayTotal()
			}
		}
	})
}


function onLoadCostDetails() {
	const sqid = $("#sqid").val()
	const chargemode = $('input[name="chargemode"]:checked').val()
	const uuid = $('#uuid').val()
	if (!uuid) return
	$.ajax({
		url: `dataentry.ashx?task=getCostDetailsEx&sqid=${sqid}&uuid=${uuid}&chargemode=${chargemode}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function (res) {
			if (Array.isArray(res)) {
				$('#cost_details_table tbody').remove()
				if (res.length === 0) {
					const tr = `<tbody><tr><td colspan=32>Not Found</td></tr></tbody>`
					$('#cost_details_table').append(tr)
					totalCost = 0
				} else {
					g_costs = res
					$('#cost_details_table').append('<tbody></tbody>')
					const tbody = $('#cost_details_table tbody')
					let totalAmt = 0
					const cui = $('#cui').val()
					const isUS = cui.toUpperCase() == 'US'
					res.forEach((item, ind) => {
						const id = `${item.uuid}_${item.detid}_cost_${ind}`
						let amt = item.cost || 0
						//if ( item.qtyc != 0 && item.ratec != 0 && item.exratec != 0 ) amt = item.qtyc * ( item.ratec * item.exratec )
						if (item.exratec != 0) amt = amt * item.exratec

						totalAmt += item.rtype == 'CR' ? -Number(amt) : Number(amt)

						let rowStyle = ''

						///if (item.voucherno?.length > 0 && item.appost == 0 && item.aprel != 1) {
						if (item.appost == 0 && item.release != 1) {
							rowStyle = getRowStyle('rowcolor1')
						}
						else if (item.appost == 1 && item.amtpaid == 0) {
							rowStyle = getRowStyle('rowcolor2')
						}
						else if (item.release == 1 && item.appost == 0) {
							rowStyle = getRowStyle('rowcolor5')
						}
						else if (item.appost == 1 && item.amtpaid == item.cost) {
							rowStyle = getRowStyle('rowcolor3')
						}
						else if (item.appost == 1 && item.amtpaid != 0.00 && item.amtpaid != item.cost) {
							rowStyle = getRowStyle('rowcolor4')
						}

						let tr = `<tr id="${id}" style="${rowStyle}">`

						if (item.appost == 1) {
							tr += `<td><div style="display: flex;"><img src="images/copy_icon.jpg" style="cursor: pointer; width: 30px; margin-right: 8px;" onclick="onCopyCost('${id}')" />`
							//+ `<img src="images/offset_icon.jpg" style="cursor: pointer; width: 30px;" onclick="onCopyCost('${id}', true)" />`

							if (item.voucherno && item.voucherno.length > 0 && !item.isOffset) {
								tr += `<img src="images/action_offset.jpg" style="cursor: pointer; width: 30px;" onclick="onOffsetCost(${item.detid}, '${item.voucherno}', '${item.rtype}')" />`
							}

							tr += `</div></td>`
						}
						else
							tr += `<td><div style="display: flex;"><img src="images/copy_icon.jpg" style="cursor: pointer; width: 30px;" onclick="onCopyCost('${id}')" /></div></td>`

						tr += `<td><input type="checkbox" value="${item.detid}" ${(chargemode == 'A' || item.appost == 1) ? "disabled" : ""}></td>`
						tr += `<td>${item.txtype}</td>`
						tr += `<td>${item.rtype + (item.isOffset ? ' (OF)' : '')}</td>`
						tr += `<td>${item.costpp}</td>`
						tr += `<td>${item.vendid}</td>`
						tr += `<td>${item.vendname}</td>`
						tr += `<td>${item.glacct}</td>`
						tr += `<td>${item.arcode}</td>`
						tr += `<td>${item.ardesc}</td>`
						tr += `<td>${item.note2}</td>`
						tr += `<td>${item.uomc}</td>`
						tr += `<td>${item.ctnrno}</td>`
						tr += `<td>${item.qtyc}</td>`
						tr += `<td>${item.currencyc}</td>`
						tr += `<td>${formatNumber(item.ratec)}</td>`
						tr += `<td>${formatNumber(item.cost)}</td>`
						tr += `<td>${formatNumber(item.exratec, 4)}</td>`
						tr += `<td>${item.rtype == 'CR' ? '-' : ''}${formatNumber(amt)}</td>`
						tr += `<td>${item.vendref}</td>`
						tr += `<td>${replaceBlank(item.venddate)}</td>`
						tr += `<td>${item.voucherno}</td>`
						tr += `<td><input type="checkbox" disabled ${Number(item.release) == 1 ? 'checked' : ''} /></td>`
						tr += `<td>${item.verifyby}</td>`
						tr += `<td>${replaceBlank(item.verifytime)}</td>`
						tr += `<td>${item.terms}</td>`
						tr += `<td>${replaceBlank(item.duedate)}</td>`
						tr += `<td>${formatNumber(item.amtpaid)}</td>`
						tr += `<td>${replaceBlank(item.pydate)}</td>`
						tr += `<td>${item.ourref}</td>`
						tr += `<td>${item.lastuser}</td>`
						tr += `<td>${replaceBlank(item.lastdate)}</td>`
						tr += `<td>${item.adduser}</td>`
						tr += `<td>${replaceBlank(item.adddate)}</td>`

						tr += `<td style='display:none'>${item.stationid}</td>`
						tr += `<td style='display:none'>${item.mbl}</td>`
						tr += `<td style='display:none'>${item.hbl}</td>`
						tr += `<td style='display:none'>${item.manifest}</td>`
						tr += `<td style='display:none'>${item.adddesc}</td>`
						tr += `<td style='display:none'>${item.dettype}</td>`
						tr += `<td style='display:none'>${item.perc}</td>`
						tr += `<td style='display:none'>${item.basecurrency}</td>`

						if (isUS) {
							tr += `<td>${item.jeno}</td></tr>`
						} else {
							tr += `<td>${item.jeno}</td>`
							tr += `<td><input type="checkbox" disabled ${Number(item.provisional) == 1 ? 'checked' : ''} /></td></tr>`
						}

						tbody.append(tr)
					})

					totalCost = totalAmt
				}

				onDisplayTotal()
			}
		}
	})
}


function onBulkRevenueAdd(e) {
	if (g_isBulkRevenueDisabled) {
		alert("Cannot Add Item, Inv No. Posted")
		return
	}

	{
		let s = new Set()
		$(`#revenue_tbody [id^=invno]`).each((i, e) => {
			s.add(e.value)
		})

		if (s.size > 1) {
			alert("Cannot Add Item, More Than One Inv No. Listed")
			return
		}
	}

	let i = $(`#revenue_tbody tr`).length + 1
	let r = {}
	r.billid = $(`#revenue_tbody [id^=billid]`).last().val()
	r.billname = $(`#revenue_tbody [id^=billname]`).last().val()
	r.terms = $(`#revenue_tbody [id^=terms]`).last().val()
	r.rtype = $(`#revenue_tbody [id^=rtype]`).last().val()
	r.ppd = $(`#revenue_tbody [id^=amtpp]`).last().val()
	r.curr = $(`#revenue_tbody [id^=curr]`).last().val()
	r.exrate = $(`#revenue_tbody [id^=exrate]`).last().val()
	r.detid = 0

	onAddRevenueTr(i, r)
}


function onBulkCostAdd(e) {
	//if ( g_isBulkCostDisabled ) {
	//	alert( "Cannot Add Item, Inv No. Posted" )
	//	return
	//}

	//{
	//	let s = new Set()
	//	$( `#cost_tbody [id^=invno]` ).each( ( i, e ) => {
	//		s.add( e.value )
	//	} )

	//	if ( s.size > 1 ) {
	//		alert( "Cannot Add Item, More Than One Inv No. Listed" )
	//		return
	//	}
	//}

	let i = $(`#cost_tbody tr`).length + 1
	let r = {}
	r.rtype = $(`#cost_tbody [id^=rtype]`).last().val()
	r.costpp = $(`#cost_tbody [id^=costpp]`).last().val()
	r.vendid = $(`#cost_tbody [id^=vid]`).last().val()
	r.vendname = $(`#cost_tbody [id^=vnm]`).last().val()
	r.terms = $(`#cost_tbody [id^=vterms]`).last().val()
	r.curr = $(`#cost_tbody [id^=vcurr]`).last().val()
	r.exrate = $(`#cost_tbody [id^=vexrate]`).last().val()

	r.detid = 0

	onAddCostTr(i, r)
}


function onCheckChargeMode() {
	const chargemode = $('input[name="chargemode"]:checked').val()

	let revenueEntryHeader = "Bulk Revenue Entry"
	let costEntryHeader = "Bulk Cost Entry"
	let headerSuffix = ""
	let revenueHeaderSuffix = ""
	let costHeaderSuffix = ""

	let revenueEntryHeaderSelector = $('#revenue-bulk-section div h2')
	let costEntryHeaderSelector = $('#cost-bulk-section div h2')

	if (chargemode == 'A') {
		$('.add_revenue_cost_btn').hide()
		$('#add_bulk_btn').hide()
		$('#all_cost_select').hide()
		$('#all_revenue_select').hide()
	}
	else {
		$('.add_revenue_cost_btn').show()
		$('#add_bulk_btn').show()
		$('#all_cost_select').show()
		$('#all_revenue_select').show()

		if (chargemode == 'L') {
			headerSuffix = " - Local"
			revenueHeaderSuffix = " <a id='a_bulk_revenue_add' style='display: none'><img src='images/plus.gif' width='16' onclick='onBulkRevenueAdd(this)' /></a>"
			costHeaderSuffix = " <a id='a_bulk_cost_add' style='display: none'><img src='images/plus.gif' width='16' onclick='onBulkCostAdd(this)' /></a>"
		}
		else if (chargemode == 'F') {
			headerSuffix += " - Freight List"
		}
	}

	revenueEntryHeaderSelector.html(revenueEntryHeader + headerSuffix + revenueHeaderSuffix)
	costEntryHeaderSelector.html(costEntryHeader + headerSuffix + costHeaderSuffix)
}


function onLoadTerms() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: 'dataentry.ashx?task=getCodeTypes',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, type: 'TERMS' },
		success: function (res) {
			termOptions = `<option value=""></option>`
			res.forEach(function (item) {
				termOptions += `<option value="${item.code}">${item.expand}</option>`
			})
		}
	})
}


function onLoadContainers() {
	const sqid = $("#sqid").val()
	const uuid = $("#uuid").val()
	$.ajax({
		url: 'dataentry.ashx?task=getContainers',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, uuid },
		success: function (res) {
			containerOptions = `<option value=""></option>`
			res.forEach(function (item) {
				containerOptions += `<option value="${item.ctnrno}">${item.ctnrno}</option>`
			})
		}
	})
}


function onLoadPackageTypes() {
	const sqid = $("#sqid").val()
	$.ajax({
		url: 'dataentry.ashx?task=getCodeTypes',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, type: 'PACKAGE TYPE' },
		success: function (res) {
			packageTypeOptions = `<option value=""></option>`
			res.forEach(function (item) {
				packageTypeOptions += `<option value="${item.code}">${item.code}</option>`
			})
		}
	})
}


function onLoadCurrencies() {
	const sqid = $("#sqid").val()
	const basecurr = $('#basecurr').val()
	const currdate = $('#currdate').val()

	$.ajax({
		url: 'dataentry.ashx?task=getCurrenciesEx',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, basecurr, currdate },
		success: function (res) {
			currencyOptions = `<option value=""></option>`
			res.forEach(function (item) {
				currencyOptions += `<option value="${item.code}_${item.exrate}">${item.code}</option>`
				currencyValues.push(`${item.code}_${item.exrate}`)
			})
		}
	})
}


function calcAmt(nn) {
	const rate = Number($(`#rate${nn}`).val())
	const qty = Number($(`#qty${nn}`).val())
	if (qty > 0 && rate != 0) {
		$(`#amt${nn}`).val((qty * rate).toFixed(2))
		calcBamt(nn)
	}
}


function calcBamt(nn) {
	const amt = Number($(`#amt${nn}`).val())
	const exrate = Number($(`#exrate${nn}`).val())
	const $curr = $(`#curr${nn}`)
	const currency = $curr.find('option:selected').text().trim()
	const vexrate = Number($('#vexrate').val())
	const exrateReadonly = $('#exratereadonly').val() // "0" = NOT editable, "1" = editable

	// Detect "entering USD" only when currency actually changed
	const prevCurrency = $curr.data('prevCurrency')
	const enteredUSD = (currency === 'USD' && prevCurrency !== 'USD')
	$curr.data('prevCurrency', currency)

	// USD: whenever user switches into USD, default exrate to vexrate and recalc
	if (enteredUSD && vexrate > 0 && amt !== 0) {
		$(`#exrate${nn}`).val(vexrate.toFixed(4))
		$(`#bamt${nn}`).val((amt * vexrate).toFixed(2))
		return
	}

	// USD: behavior differs depending on whether exrate is editable
	if (currency === 'USD' && vexrate > 0 && amt !== 0) {

		// exratereadonly = 0 => NOT editable => always use vexrate
		if (exrateReadonly === '0') {
			$(`#exrate${nn}`).val(vexrate.toFixed(4))
			$(`#bamt${nn}`).val((amt * vexrate).toFixed(2))
			return
		}

		// exratereadonly = 1 => editable => use user's exrate when provided, otherwise fall back to vexrate
		if (exrate > 0) {
			$(`#bamt${nn}`).val((amt * exrate).toFixed(2))
		} else {
			$(`#bamt${nn}`).val((amt * vexrate).toFixed(2))
		}
		return
	}

	// Non-USD: original behavior
	if (amt != 0 && exrate > 0) $(`#bamt${nn}`).val((amt * exrate).toFixed(2))
}


function onAddNewRevenueRow(nn) {
	const ind = parseInt(nn, 10)
	if ($('#revenue_tbody tr').length == ind) {
		onAddRevenueTr(ind + 1)
	}
}


function calcVamt(nn) {
	const rate = Number($(`#vrate${nn}`).val())
	const qty = Number($(`#vqty${nn}`).val())
	if (qty > 0 && rate != 0) {
		$(`#cost${nn}`).val((qty * rate).toFixed(2))
		calcVbamt(nn)
	}
}


function calcVbamt(nn) {
	const cost = Number($(`#cost${nn}`).val())
	const exrate = Number($(`#vexrate${nn}`).val())
	const $curr = $(`#vcurr${nn}`)
	const currency = $curr.find('option:selected').text().trim()
	const vexrate = Number($('#vexrate').val())
	const exrateReadonly = $('#exratereadonly').val() // "0" = NOT editable, "1" = editable

	// Detect "entering USD" only when currency actually changed
	const prevCurrency = $curr.data('prevCurrency')
	const enteredUSD = (currency === 'USD' && prevCurrency !== 'USD')
	$curr.data('prevCurrency', currency)

	// USD: whenever user switches into USD, default exrate to vexrate and recalc
	if (enteredUSD && vexrate > 0 && cost !== 0) {
		$(`#vexrate${nn}`).val(vexrate.toFixed(4)) // <-- 4 = four decimals (use 2, 3, etc.)
		$(`#vbamt${nn}`).val((cost * vexrate).toFixed(2))
		return
	}

	// USD: behavior differs depending on whether exrate is editable
	if (currency === 'USD' && vexrate > 0 && cost !== 0) {

		// exratereadonly = 0 => NOT editable => always use vexrate
		if (exrateReadonly === '0') {
			$(`#vexrate${nn}`).val(vexrate.toFixed(4)) // <-- 4 = four decimals (use 2, 3, etc.)
			$(`#vbamt${nn}`).val((cost * vexrate).toFixed(2))
			return
		}

		// exratereadonly = 1 => editable => use user's exrate when provided, otherwise fall back to vexrate
		if (exrate > 0) {
			$(`#vbamt${nn}`).val((cost * exrate).toFixed(2))
		} else {
			$(`#vbamt${nn}`).val((cost * vexrate).toFixed(2))
		}
		return
	}

	// Non-USD: original behavior
	if (cost != 0 && exrate > 0) $(`#vbamt${nn}`).val((cost * exrate).toFixed(2))
}


function onAddNewCostRow(nn) {
	const ind = parseInt(nn, 10)
	if ($('#cost_tbody tr').length == ind) {
		onAddCostTr(ind + 1)
	}
}


function onAddRevenueTr(ind, revenue, isDisabled) {
	const txtype = $('input[name="chargemode"]:checked').val()
	const defarpp = $('#defarpp').val()
	const defcurr = $('#defcurr').val()
	const defexr = $('#defexr').val()
	const defctnr = $('#defctnr').val()
	const defhbl = $('#defhbl').val()
	const deflbs = $('#deflbs').val()
	const defkgs = $('#defkgs').val()
	const defcbm = $('#defcbm').val()
	const defchg = $('#defchg').val()
	const defmbl = $('#defmbl').val()
	const defflat = $('#defflat').val()
	const defuom = $('#defuom').val()
	const defqty = $('#defqty').val()
	const defcrf = $('#defcrf').val()
	const nn = String(ind).padStart(2, '0')
	let tr = ''
	tr += `<tr data-detid="${revenue?.detid ?? 0}">`

	if (revenue) {
		tr += `<th nowrap><input type="text" size="10" maxlength="15" id="billid${nn}" name="billid${nn}" value="${revenue?.billid || ''}"></th>`
		tr += `<th nowrap><input type="text" size="20" maxlength="35" id="billname${nn}" name="billname${nn}" value="${revenue?.billname || ''}" READONLY></th>`
		tr += `<th nowrap><select name="terms${nn}" id="terms${nn}">${termOptions}</select></th>`
		tr += `<th nowrap><select name="rtype${nn}" id="rtype${nn}"><option value="IN">Invoice</option><option value="CR">Credit</option><option value="DB">Debit</option></select></th>`
	}
	else if (txtype == 'F') {
		tr += `<th nowrap><input type="text" size="10" maxlength="15" id="billid${nn}" name="billid${nn}" value=""></th>`
		tr += `<th nowrap><input type="text" size="20" maxlength="35" id="billname${nn}" name="billname${nn}" value="" READONLY></th>`
		tr += `<th nowrap><select name="terms${nn}" id="terms${nn}">${termOptions}</select></th>`
	}

	tr += `<th nowrap><input type="checkbox" id="arrls${nn}" name="arrls${nn}" ${Number(revenue?.arrls) == 1 ? 'checked' : ''} ${txtype == 'F' || revenue?.provisional == 1 ? 'disabled' : ''} /></th>`
	tr += `<th nowrap>${ind}</th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="30" id="invno${nn}" name="invno${nn}" value="${revenue?.invno || ''}"></th>`
	tr += `<th nowrap> <select name="amtpp${nn}" id="amtpp${nn}"><option value=""></option><option value="PP">PPD</option><option value="CC">COL</option></select></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="arcode${nn}" name="arcode${nn}" value="${revenue?.arcode || ''}"><input type="hidden" id="glacct${nn}" value="${revenue?.arglcode || ''}" /></th>`
	tr += `<th nowrap><input type="text" size="20" maxlength="75" id="ardesc${nn}" name="ardesc${nn}" value="${revenue?.ardesc || ''}" READONLY></th>`
	tr += `<th nowrap><input type="text" size="30" maxlength="50" id="addesc${nn}" name="addesc${nn}" value="${revenue?.arnote || ''}"></th>`
	tr += `<th nowrap><input type="text" size="20" maxlength="20" id="cref${nn}"   name="cref${nn}"   value="${revenue?.custref || ''}"></th>`
	tr += `<th nowrap><select name="ctnr${nn}" id="ctnr${nn}">${containerOptions}</select></th>`
	tr += `<th nowrap><select name="uom${nn}" id="uom${nn}">${packageTypeOptions}</select></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="qty${nn}"   name="qty${nn}"   value="${revenue?.qty || ''}"></th>`
	tr += `<th nowrap><input type="text" size="9" maxlength="9" id="rate${nn}"  name="rate${nn}"   value="${revenue?.rate || ''}"></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="amt${nn}"  name="amt${nn}"   value="${revenue?.amt || ''}" READONLY></th>`
	tr += `<th nowrap><select name="curr${nn}" id="curr${nn}">${currencyOptions}</select></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="exrate${nn}"  name="exrate${nn}"   value="${revenue?.exrate || ''}" readonly></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="bamt${nn}"  name="bamt${nn}"   value="${revenue?.basicamt || ''}"></th>`
	tr += `<th style='display: none' nowrap><input type="text" id="basecurrency${nn}" value="${revenue?.basecurrency$ || ''}"></th>`

	const cui = $('#cui').val()

	if (cui.toUpperCase() != 'US') {
		if (txtype != 'F') {
			tr += `<th nowrap><input type="checkbox" id="prov${nn}" name="prov${nn}" ${revenue?.provisional == 1 ? 'checked' : ''} ${revenue?.arrls == 1 ? 'disabled' : ''}></th>`
		}

		tr += `<th nowrap><input type="text" size="20" maxlength="20" id="taxinv${nn}"   name="taxinv${nn}"   value="${revenue?.taxinvno || ''}"></th>`
		tr += `<th nowrap><input type="text" size="10" maxlength="10" id="taxdate${nn}"   name="taxdate${nn}"   value="${revenue?.taxinvdate || ''}"></th>`
	}

	tr += `</tr>`
	$('#revenue_tbody').append(tr)

	const salesConfig3 = {
		task: 'getArcodesWithMode',
		url: 'dataentry.ashx',
		queryParam: 'q',
		fieldId: `arcode${nn}`,
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		fields: [
			{ ui: `ardesc${nn}`, api: 'expand' },
			{ ui: `arcode${nn}`, api: 'code' },
			{ ui: `glacct${nn}`, api: 'arcr' }
		]
	}

	initCombineAutoComplete(salesConfig3, `&mode=${$('#mode').val()}`)

	$(`#uom${nn}`).on('change', function () {
		const uom = $(this).val()
		switch (uom) {
			case "CTNR":
				$(`#qty${nn}`).val(defctnr)
				break
			case "HBL":
				$(`#qty${nn}`).val(defhbl)
				break
			case "LBS":
				$(`#qty${nn}`).val(deflbs)
				break
			case "KGS":
				$(`#qty${nn}`).val(defkgs)
				break
			case "FLAT":
				$(`#qty${nn}`).val(defflat)
				break
			case "MBL":
				$(`#qty${nn}`).val(defmbl)
				break
			case "CBM":
				$(`#qty${nn}`).val(defcbm)
				break
			case "CHGWT":
				$(`#qty${nn}`).val(defchg)
				break
			default: $(`#qty${nn}`).val('')
		}
		calcAmt(nn)
	})

	$(`#qty${nn}`).on('change', () => {
		calcAmt(nn)
	})

	$(`#rate${nn}`).on('change', () => {
		calcAmt(nn)
	})

	$(`#amt${nn}`).on('change', () => {
		calcBamt(nn)
	})
	$(`#exrate${nn}`).on('change', () => {
		calcBamt(nn)
	})

	$(`#curr${nn}`).on('change', () => {
		const curr = $(`#curr${nn}`).val()
		if (curr) {
			$(`#exrate${nn}`).val(curr.split('_')[1])
			calcBamt(nn)
		}
	})

	$(`#arrls${nn}`).on('change', (e) => {
		$(`#invno${nn}`).prop('readonly', $(`#arrls${nn}`).is(':checked'))
		$(`#prov${nn}`).prop('disabled', e.target.checked)

		if ($('#cui').val().toUpperCase() != 'US' && !e.target.checked) {
			$(`#prov${nn}`).prop('checked', true).trigger('change')
		}

		let r = g_revenues.find(a => a.detid == e.target.parentNode.parentNode.attributes['data-detid'].value)

		if (r) {
			r.isReleaseCleared = r.release == 1 && !e.target.checked
		}
	})

	$(`#prov${nn}`).on('change', (e) => {
		$(`#arrls${nn}`).prop('disabled', e.target.checked)
	})

	$(`#arrls${nn}`).trigger('change')

	$(`#invno${nn}`).prop('readonly', $(`#arrls${nn}`).is(':checked'))

	if (cui.toUpperCase() != 'US') {
		$(`#taxdate${nn}`).datepicker()
	}

	if (revenue) {
		$(`#terms${nn}`).val(revenue.terms)
		$(`#rtype${nn}`).val(revenue.rtype)
		$(`#amtpp${nn}`).val(revenue.ppd)
		$(`#ctnr${nn}`).val(revenue.ctnrno)
		$(`#uom${nn}`).val(revenue.uom)

		for (let j = 0; j < currencyValues.length; j++) {
			if (currencyValues[j].includes(`${revenue.curr}_${revenue.exrate}`)) {
				$(`#curr${nn}`).val(currencyValues[j])
				const exrate = currencyValues[j].split('_')[1]
				$(`#exrate${nn}`).val(exrate)
				$(`#bamt${nn}`).val((Number(exrate) * Number(revenue.amt)).toFixed(2))
				break
			}
			else if (currencyValues[j].startsWith(revenue.curr)) {
				$(`#curr${nn}`).val(currencyValues[j])
				break
			}
		}

		if (!isDisabled) {
			const customerConfig = {
				url: 'dataentry.ashx',
				task: 'getContacts2',
				queryParam: 'q',
				fieldId: `billid${nn}`,
				tokenId: 'custid',
				searchKey: 'str',
				minChars: 2,
				preventDuplicates: false,
				fields: [
					{ ui: `billname${nn}`, api: 'custname' },
					{ ui: `billid${nn}`, api: 'custid' },
					{ ui: `terms${nn}`, api: 'terms' },
				]
			}

			initCombineAutoComplete(customerConfig)
		}
	}
	else if (txtype == 'F') {
		$(`#uom${nn}`).val(`${defuom}`)
		$(`#qty${nn}`).val(`${defqty}`)
		$(`#curr${nn}`).val(`${defcurr}_${defexr}`)
		const customerConfig = {
			url: 'dataentry.ashx',
			task: 'getContacts2',
			queryParam: 'q',
			fieldId: `billid${nn}`,
			tokenId: 'custid',
			searchKey: 'str',
			minChars: 2,
			preventDuplicates: false,
			fields: [
				{ ui: `billname${nn}`, api: 'custname' },
				{ ui: `billid${nn}`, api: 'custid' },
				{ ui: `terms${nn}`, api: 'terms' },
			]
		}

		initCombineAutoComplete(customerConfig)
	}
	else {
		$(`#amtpp${nn}`).val(defarpp)
		$(`#curr${nn}`).val(`${defcurr}_${defexr}`)
		$(`#exrate${nn}`).val(`${defexr}`)
		$(`#uom${nn}`).val(`${defuom}`)
		$(`#qty${nn}`).val(`${defqty}`)
		$(`#cref${nn}`).val(`${defcrf}`)
	}
}


function onAddCostTr(ind, cost) {
	const txtype = $('input[name="chargemode"]:checked').val()
	const defaprtype = $('#defaprtype').val()
	const defappp = $('#defappp').val()
	const defcurr = $('#defcurr').val()
	const defexr = $('#defexr').val()
	const defterms = $('#defterms').val()
	const defctnr = $('#defctnr').val()
	const defhbl = $('#defhbl').val()
	const deflbs = $('#deflbs').val()
	const defkgs = $('#defkgs').val()
	const defcbm = $('#defcbm').val()
	const defuom = $('#defuom').val()
	const defqty = $('#defqty').val()
	const defflat = $('#defflat').val()
	const nn = String(ind).padStart(2, '0')
	let tr = ''
	tr += `<tr data-detid="${cost?.detid ?? 0}">`
		+ `<th nowrap><input type="checkbox" id="aprls${nn}" name="aprls${nn}" ${Number(cost?.aprls) == 1 ? 'checked' : ''} ${txtype == 'F' || cost?.provisional == 1 ? 'disabled' : ''} /></th>`

	tr += `<th nowrap>${ind}</th>`
	tr += `<th nowrap><select name="rtype${nn}" id="rtype${nn}"><option value=""></option><option value="PO">PO</option><option value="CR">Credit</option><option value="DB">Debit</option></select></th>`
	tr += `<th nowrap><select name="costpp${nn}" id="costpp${nn}"><option value=""></option><option value="PP">PPD</option><option value="CC">COL</option></select></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="vid${nn}" name="vid${nn}" value="${cost?.vendid || ''}"></th>`
	tr += `<th nowrap><input type="text" size="20" maxlength="20" id="vnm${nn}" name="vnm${nn}" value="${cost?.vendname || ''}" readonly></th>`
	tr += `<th nowrap><input type="text" size="30" maxlength="30" id="vref${nn}"   name="vref${nn}" value="${cost?.vendref || ''}"></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="venddate${nn}"   name="venddate${nn}" value="${cost?.venddate || ''}"></th>`
	tr += `<th nowrap><select name="vterms${nn}" id="vterms${nn}">${termOptions}</select></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="apcode${nn}" name="apcode${nn}" value="${cost?.arcode || ''}"><input type="hidden" id="vglacct${nn}" value="${cost?.apglcode || ''}" /></th>`
	tr += `<th nowrap><input type="text" size="20" maxlength="20" id="apdesc${nn}" name="apdesc${nn}" value="${cost?.ardesc || ''}" READONLY></th>`
	tr += `<th nowrap><input type="text" size="20" maxlength="30" id="note2${nn}" name="apdesc${nn}" value="${cost?.note2 || ''}"></th>`
	tr += `<th nowrap><select name="vctnr${nn}" id="vctnr${nn}">${containerOptions}</select></th>`
	tr += `<th nowrap><select name="vuom${nn}" id="vuom${nn}">${packageTypeOptions}</select></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="vqty${nn}"   name="vqty${nn}"   value="${cost?.qty || ''}"></th>`
	tr += `<th nowrap><input type="text" size="9" maxlength="9" id="vrate${nn}"  name="vrate${nn}"   value="${cost?.rate || ''}"></th>`
	tr += `<th nowrap><input type="text" size="10" maxlength="10" id="cost${nn}"  name="cost${nn}"   value="${cost?.cost || ''}" READONLY></th>`
	tr += `<th nowrap><select name="vcurr${nn}" id="vcurr${nn}">${currencyOptions}</select></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="vexrate${nn}"  name="vexrate${nn}"   value="${cost?.exrate || ''}" readonly></th>`
	tr += `<th nowrap><input type="text" size="7" maxlength="7" id="vbamt${nn}"  name="vbamt${nn}"   value="${cost?.basicamt || ''}"></th>`
	tr += `<th style='display: none' nowrap><input type="text" id="basecurrency${nn}" value="${cost?.basecurrency$ || ''}"></th>`

	const cui = $('#cui').val()

	if (cui.toUpperCase() != 'US' && txtype != 'F') {
		tr += `<th nowrap><input type="checkbox" id="vprov${nn}" name="vprov${nn}" ${cost?.provisional == 1 ? 'checked' : ''} ${cost?.aprls == 1 ? 'disabled' : ''}></th>`
	}

	tr += `</tr>`
	$('#cost_tbody').append(tr)

	const vendorConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: `vid${nn}`,
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		fields: [
			{ ui: `vnm${nn}`, api: 'custname' },
			{ ui: `vid${nn}`, api: 'custid' },
			{ ui: `vterms${nn}`, api: 'terms' },
		]
	}

	initCombineAutoComplete(vendorConfig)

	const salesConfig3 = {
		task: 'getArcodesWithMode',
		url: 'dataentry.ashx',
		queryParam: 'q',
		fieldId: `apcode${nn}`,
		tokenId: 'code',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		fields: [
			{ ui: `apdesc${nn}`, api: 'expand' },
			{ ui: `apcode${nn}`, api: 'code' },
			{ ui: `vglacct${nn}`, api: 'apdb' }
		]
	}

	initCombineAutoComplete(salesConfig3, `&mode=${$('#mode').val()}`)

	$(`#vuom${nn}`).on('change', function () {
		const uom = $(this).val()
		switch (uom) {
			case "CTNR":
				$(`#vqty${nn}`).val(defctnr)
				break
			case "HBL":
				$(`#vqty${nn}`).val(defhbl)
				break
			case "LBS":
				$(`#vqty${nn}`).val(deflbs)
				break
			case "KGS":
				$(`#vqty${nn}`).val(defkgs)
				break
			case "CBM":
				$(`#vqty${nn}`).val(defcbm)
				break
			case "FLAT":
				$(`#vqty${nn}`).val(defflat)
				break
			case "CHGWT":
				$(`#vqty${nn}`).val(defchg)
				break
			default: $(`#vqty${nn}`).val('')
		}
	})

	$(`#venddate${nn}`).datepicker()
	$(`#vqty${nn}`).on('change', () => {
		calcVamt(nn)
	})

	$(`#vrate${nn}`).on('change', () => {
		calcVamt(nn)
	})

	$(`#cost${nn}`).on('change', () => {
		calcVbamt(nn)
	})

	$(`#vexrate${nn}`).on('change', () => {
		calcVbamt(nn)
	})

	$(`#vcurr${nn}`).on('change', () => {
		const curr = $(`#vcurr${nn}`).val()
		if (curr) {
			$(`#vexrate${nn}`).val(curr.split('_')[1])
			calcVbamt(nn)
		}
	})

	$(`#aprls${nn}`).on('change', (e) => {
		$(`#invno${nn}`).prop('readonly', $(`#aprls${nn}`).is(':checked'))
		$(`#vprov${nn}`).prop('disabled', e.target.checked)

		if ($('#cui').val().toUpperCase() != 'US' && !e.target.checked) {
			$(`#vprov${nn}`).prop('checked', true).trigger('change')
		}

		let c = g_costs.find(a => a.detid == e.target.parentNode.parentNode.attributes['data-detid'].value)

		if (c) {
			c.isReleaseCleared = c.release == 1 && !e.target.checked
		}
	})

	$(`#vprov${nn}`).on('change', (e) => {
		$(`#aprls${nn}`).prop('disabled', e.target.checked)
	})

	$(`#aprls${nn}`).trigger('change')

	$(`#invno${nn}`).prop('readonly', $(`#aprls${nn}`).is(':checked'))

	if (cost) {
		$(`#rtype${nn}`).val(cost.rtype)
		$(`#costpp${nn}`).val(cost.costpp)
		$(`#vctnr${nn}`).val(cost.ctnrno)
		$(`#vterms${nn}`).val(cost.terms)
		$(`#vuom${nn}`).val(cost.uom)

		for (let j = 0; j < currencyValues.length; j++) {
			if (currencyValues[j].includes(`${cost.curr}_${cost.exrate}`)) {
				$(`#vcurr${nn}`).val(currencyValues[j])
				const exrate = currencyValues[j].split('_')[1]
				$(`#vexrate${nn}`).val(exrate)
				$(`#vbamt${nn}`).val((Number(exrate) * Number(cost.cost)).toFixed(2))
				break
			}
		}
	}
	else {
		$(`#rtype${nn}`).val(defaprtype)
		$(`#costpp${nn}`).val(defappp)
		$(`#vcurr${nn}`).val(`${defcurr}_${defexr}`)
		$(`#vexrate${nn}`).val(`${defexr}`)
		$(`#vterms${nn}`).val(defterms)
		$(`#vuom${nn}`).val(defuom)
		$(`#vqty${nn}`).val(defqty)
	}
}


function onReleaseAllRevenuesBulk(e) {
	let hiddenBillIdCount = 0

	$(`#revenue_tbody [id^=arrls]`).each((index, element) => {
		if (!element.disabled) {
			$(element).prop('checked', e.checked).trigger("change")
			let billid = $(`#revenue_tbody [id^=billid]`).eq(index)
			billid.prop('disabled', e.checked)

			$(`#revenue_tbody [id^=curr]`).eq(index).prop('disabled', e.checked)
		}
	})

	//$( `#revenue_tbody [id^=arrls]` ).prop( 'checked', e.checked ).trigger( "change" )
	//$( `#revenue_tbody [id^=billid]` ).prop( 'disabled', e.checked )

	//if ( e.checked ) {
	//	$( `#revenue_tbody .token-input-list` ).hide()
	//	$( `#revenue_tbody [id^=billid]` ).show()
	//}
	//else {
	//	$( `#revenue_tbody .token-input-list` ).show()
	//	$( `#revenue_tbody [id^=billid]` ).hide()
	//}

	g_isBulkReleaseCleared = g_bulkReleaseState && !e.checked
	g_bulkReleaseState = e.checked
}


function onReleaseAllCostsBulk(e) {
	$(`#cost_tbody [id^=aprls]`).each((index, element) => {
		if (!element.disabled) {
			$(element).prop('checked', e.checked).trigger("change")
		}
	})

	//$( `#revenue_tbody [id^=billid]` ).prop( 'disabled', e.checked )

	//if ( e.checked ) {
	//	$( `#revenue_tbody .token-input-list` ).hide()
	//	$( `#revenue_tbody [id^=billid]` ).show()
	//}
	//else {
	//	$( `#revenue_tbody .token-input-list` ).show()
	//	$( `#revenue_tbody [id^=billid]` ).hide()
	//}

	//$( `#revenue_tbody [id^=curr]` ).prop( 'disabled', e.checked )

	g_isBulkReleaseCleared = g_bulkReleaseState && !e.checked
	g_bulkReleaseState = e.checked
}


function onShowBulkSection(revenues = [], costs = []) {
	$('#revenue-cost-display-section').hide()
	$('#revenue-cost-insert-section').show()
	const cui = $('#cui').val()
	const isCN = cui.toUpperCase() != 'US'
	let revenueTable = ""
	let costTable = ""
	const txtype = $('input[name="chargemode"]:checked').val()
	let saveButton = $('.container-table-btn[value=" S A V E "]')
	saveButton.prop("disabled", false)

	g_bulkReleaseState = false
	g_isBulkReleaseCleared = false

	if (isUpdatingRevenues) {
		$("#a_bulk_revenue_add").show()
	}
	else {
		$("#a_bulk_revenue_add").hide()
	}

	if (isUpdatingCosts) {
		$("#a_bulk_cost_add").show()
	}
	else {
		$("#a_bulk_cost_add").hide()
	}

	if (costs.length == 0) {
		if (revenues.length == 0) {
			if (txtype == 'L') {
				const defcid = $('#defcid').val()
				const defcnm = $('#defcnm').val()
				const defcrf = $('#defcrf').val()
				const defterms = $('#defterms').val()
				revenueTable += '<tr><th><div style="display: flex; align-items: center;"><span>Customer ID</span>'
				revenueTable += `<span style="margin-left: 24px;"><input type="text" size="15" maxlength="15" id="billid" name="billid" value="${defcid}"></span>`
				revenueTable += '<span style="margin-left: 24px;">Name</span>'
				revenueTable += `<span style="margin-left: 24px;"><input type="text" size="35" maxlength="35" id="billname" name="billname" value="${defcnm}" READONLY></span>`
				revenueTable += '<span style="margin-left: 24px;">Terms</span>'
				revenueTable += `<span style="margin-left: 24px;"><select name="terms" id="terms">${termOptions}</select></span>`
				revenueTable += '<span style="margin-left: 24px;">Revenue Type</span>'
				revenueTable += '<span style="margin-left: 24px;"><select name="rtype" id="rtype"><option value="IN">Invoice</option><option value="CR">Credit</option><option value="DB">Debit</option></select></span></div></th></tr>'
			}
			else {
				revenueTable += '<tr style="display: none;"><th><div style="display: flex; align-items: center;">'
				revenueTable += '<span style="margin-left: 24px;">Revenue Type</span>'
				revenueTable += '<span style="margin-left: 24px;"><select name="rtype" id="rtype"><option value="IN">Invoice</option><option value="CR">Credit</option><option value="DB">Debit</option></select></span></div></th></tr>'
			}
		}

		revenueTable += '<tr><th><table><thead>'

		if (revenues.length > 0) {
			g_isBulkRevenueDisabled = revenues.find(a => g_revenues.find(b => b.invno == a.invno && (b.arpost == 1 || b.arrel == 1))) != undefined
			saveButton.prop("disabled", g_isBulkRevenueDisabled)

			revenueTable += `<tr><th nowrap>Customer ID</th><th nowrap>Customer Name</th><th nowrap>Terms</th><th nowrap>Revenue Type</th>`
				+ `<th style="text-align:center;" nowrap><div style="display: flex;">Release<input type="checkbox" onclick="onReleaseAllRevenuesBulk(this)" ${g_isBulkRevenueDisabled ? "disabled" : ""} /></div></th>`
				+ `<th nowrap>Seq</th>`
				+ `<th nowrap>Inv No.</th><th nowrap>P/C</th><th nowrap>AR Code</th><th nowrap>AR Desc</th><th nowrap>Add Desc</th><th nowrap>Cust Ref</th><th nowrap>Container</th><th nowrap>UOM</th><th nowrap>Qty</th><th nowrap>Unit Price</th><th nowrap>Amount</th><th nowrap>Currency</th><th nowrap>ExRate</th><th nowrap>Basic Amt</th>${isCN ? '<th nowrap>Provisional</th><th nowrap>Tax Inv No.</th><th nowrap>Tax Inv Date</th>' : ''}</tr>`
		}
		else if (txtype == 'F') {
			revenueTable += `<tr><th nowrap>Customer ID</th><th nowrap>Customer Name</th><th nowrap>Terms</th><th nowrap>Release</th>`
				+ `<th nowrap>Seq</th>`
				+ `<th nowrap>Inv No.</th><th nowrap>P/C</th><th nowrap>AR Code</th><th nowrap>AR Desc</th><th nowrap>Add Desc</th><th nowrap>Cust Ref</th><th nowrap>Container</th><th nowrap>UOM</th><th nowrap>Qty</th><th nowrap>Unit Price</th><th nowrap>Amount</th><th nowrap>Currency</th><th nowrap>ExRate</th><th nowrap>Basic Amt</th>${isCN ? '<th nowrap>Tax Inv No.</th><th nowrap>Tax Inv Date</th>' : ''}</tr>`
		}
		else {
			revenueTable += `<tr><th nowrap>Release</th>`
				+ `<th nowrap>Seq</th>`
				+ `<th nowrap>Inv No.</th><th nowrap>P/C</th><th nowrap>AR Code</th><th nowrap>AR Desc</th><th nowrap>Add Desc</th><th nowrap>Cust Ref</th><th nowrap>Container</th><th nowrap>UOM</th><th nowrap>Qty</th><th nowrap>Unit Price</th><th nowrap>Amount</th><th nowrap>Currency</th><th nowrap>ExRate</th><th nowrap>Basic Amt</th>${isCN ? '<th nowrap>Provisional</th><th nowrap>Tax Inv No.</th><th nowrap>Tax Inv Date</th>' : ''}</tr>`
		}

		revenueTable += '</thead><tbody id="revenue_tbody"></tbody>'
		revenueTable += '</table></th></tr>'

		$('#revenue-bulk-section').show()
		$('#bulk_revenue_table').append(revenueTable)
	}
	else {
		$('#revenue-bulk-section').hide()
		$('#cost-bulk-section').show()
	}

	if (revenues.length == 0) {
		g_isBulkCostDisabled = costs.find(a => g_costs.find(b => b.voucherno == a.voucherno && b.appost == 1)) != undefined
		saveButton.prop("disabled", g_isBulkCostDisabled)

		costTable += `<thead><tr>`
			+ `<th nowrap><div style="display: flex;">Release<input type="checkbox" onclick="onReleaseAllCostsBulk(this)" ${g_isBulkCostDisabled ? "disabled" : ""} /></div></th>`
			+ `<th nowrap>Seq</th>`
			+ `<th nowrap>R-Type</th><th nowrap>P/C</th><th nowrap>Vendor ID</th><th nowrap>Vendor</th><th nowrap>Vendor Inv.</th><th>PO Date</th><th nowrap>Terms</th><th nowrap>AP Code</th><th nowrap>AP Desc</th><th>Append Description</th><th nowrap>Container</th><th nowrap>UOM</th><th nowrap>Qty</th><th nowrap>Unit Price</th><th nowrap>Cost</th><th nowrap>Currency</th><th nowrap>ExRate</th><th nowrap>Basic Amt</th>${isCN && txtype != 'F' ? '<th nowrap>Provisional</th>' : ''}`
			+ `</tr></thead>`

		costTable += '<tbody id="cost_tbody"></tbody>'

		$('#cost-bulk-section').show()
		$('#bulk_cost_table').append(costTable)
	}
	else {
		$('#revenue-bulk-section').show()
		$('#cost-bulk-section').hide()
	}

	if (revenues.length == 0 && costs.length == 0) {
		const defterms = $('#defterms').val()
		const defrtype = $('#defrtype').val()
		$('#terms').val(defterms)
		$('#rtype').val(defrtype)

		for (let i = 1; i < 11; i++) {
			onAddRevenueTr(i)
			onAddCostTr(i)
		}
	}
	else {
		for (let i = 1; i <= revenues.length; i++) {
			onAddRevenueTr(i, revenues[i - 1], g_isBulkRevenueDisabled)
		}

		for (let i = 1; i <= costs.length; i++) {
			onAddCostTr(i, costs[i - 1])
		}

		if (revenues.length > 0 && g_isBulkRevenueDisabled) {
			$(`#revenue_tbody tr th input`).each(function (index, e) {
				e.disabled = true
			})

			$(`#revenue_tbody tr th select`).each(function (index, e) {
				e.disabled = true
			})
		}

		if (costs.length > 0 && g_isBulkCostDisabled) {
			$(`#cost_tbody tr th input`).each(function (index, e) {
				e.disabled = true
			})

			$(`#cost_tbody tr th select`).each(function (index, e) {
				e.disabled = true
			})
		}
	}

	const customerConfig = {
		url: 'dataentry.ashx',
		task: 'getContacts2',
		queryParam: 'q',
		fieldId: 'billid',
		tokenId: 'custid',
		searchKey: 'str',
		minChars: 2,
		preventDuplicates: false,
		fields: [
			{ ui: 'billname', api: 'custname' },
			{ ui: 'billid', api: 'custid' },
			{ ui: `terms`, api: 'terms' },
		]
	}

	initCombineAutoComplete(customerConfig)
}


function onHideBulkSection() {
	isUpdatingRevenues = false
	isUpdatingCosts = false
	$('#revenue-cost-display-section').show()
	$('#revenue-cost-insert-section').hide()
	$('#bulk_revenue_table').empty()
	$('#bulk_cost_table').empty()
}


function onSaveBulk() {
	if (savingRevenue || savingCost) return

	onSaveBulkRevenues()
	onSaveBulkCosts()
}


function onSaveBulkRevenues() {
	if (isUpdatingCosts) return

	const sqid = $("#sqid").val()
	let revenues = []
	const txtype = $('input[name="chargemode"]:checked').val()
	const isF = txtype == 'F'
	let firstInvNo = null

	$(`#revenue_tbody tr`).each(function (index) {
		const nn = String(index + 1).padStart(2, '0')
		const amt = $(`#amt${nn}`).val()

		if (Number(amt) != 0) {
			const billid = isUpdatingRevenues || isF ? $(`#billid${nn}`).val() : $(`#billid`).val()?.trim()
			const terms = isUpdatingRevenues || isF ? $(`#terms${nn}`).val() : $(`#terms`).val()?.trim()
			const rtype = isUpdatingRevenues ? $(`#rtype${nn}`).val() : $(`#rtype`).val()?.trim()
			const amtpp = $(`#amtpp${nn}`).val().trim()
			const arcode = $(`#arcode${nn}`).val().trim()
			const currency = $(`#curr${nn}`).val().trim()

			if (!billid || !terms || !rtype || !amtpp || !arcode || !currency) {
				alert('Customer, Terms, Revenue Type, P/C, AR Code and Currency are required when Amount NOT zero.')
				revenues = []
				return false
			}

			let detid = $(this).data('detid')
			let r = g_revenues.find(a => a.detid == detid)

			const billname = isUpdatingRevenues || isF ? getTruncatedValue(`billname${nn}`) : getTruncatedValue('billname')
			const invno = g_isBulkReleaseCleared || r?.isReleaseCleared ? '' : getTruncatedValue(`invno${nn}`)

			let basecurrency = ($(`#basecurrency${nn}`).val() ?? '').trim()

			if (basecurrency.length == 0) {
				basecurrency = $('#basecurr').val()
			}

			if (!firstInvNo) {
				firstInvNo = invno
			}

			const revenue = {
				adduser: $('#userid').val(),
				uuid: $('#uuid').val(),
				detid: detid,
				txtype,
				rtype,
				custid: billid,
				custname: billname,
				terms: terms?.toUpperCase(),
				release: $(`#arrls${nn}`).is(':checked') ? '1' : '0',
				invno,
				amtpp,
				arcode,
				glacct: $(`#glacct${nn}`).val() || '',
				ardesc: getTruncatedValue(`ardesc${nn}`, true),
				adddesc: getTruncatedValue(`addesc${nn}`, true),
				custref: getTruncatedValue(`cref${nn}`, true),
				ctnrno: $(`#ctnr${nn}`).val() || '',
				uom: $(`#uom${nn}`).val() || '',
				qty: $(`#qty${nn}`).val() || 0,
				rate: $(`#rate${nn}`).val() || 0,
				amt,
				currency: currency.split('_')[0],
				exrate: $(`#exrate${nn}`).val(),
				basicamt: $(`#bamt${nn}`).val() || 0,
				inv1: $(`#inv1`).val() || '',
				db1: $(`#db1`).val() || '',
				cr1: $(`#cr1`).val() || '',
				isReleaseCleared: g_isBulkReleaseCleared,
				basecurrency
			}

			const cui = $('#cui').val()

			if (cui.toUpperCase() != 'US') {
				revenue.provisional = $(`#prov${nn}`).is(':checked') ? '1' : '0'
				revenue.taxinvno = getTruncatedValue(`taxinv${nn}`)
				revenue.taxinvdate = $(`#taxdate${nn}`).val()
			}

			revenues.push(revenue)
		}
	})

	if (revenues.length > 0) {
		savingRevenue = true
		$.ajax({
			url: `dataentry.ashx?task=${isUpdatingRevenues ? 'updateBulkRevenuesEx' : 'addBulkRevenuesEx'}&sqid=${sqid}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(revenues),
			success: function (response) {
				if (response.error) {
					alert(`Failed inserting revenues. ${response.message}`)
				}
				else {
					onLoadRevenueDetails()
					isUpdatingRevenues = false
					if (!savingCost) onHideBulkSection()
				}
			},
			error: function (error) {
				console.error('Error:', error)
				alert(`Failed inserting revenues. Please try later again!`)
			},
			complete: function () {
				savingRevenue = false
			}
		})
	}
}


function onSaveBulkCosts() {
	if (isUpdatingRevenues) return

	const sqid = $("#sqid").val()
	let costs = []

	$(`#cost_tbody tr`).each(function (index) {
		const nn = String(index + 1).padStart(2, '0')
		const c = $(`#cost${nn}`).val()

		if (Number(c) != 0) {
			const vendid = $(`#vid${nn}`).val().trim()
			const rtype = $(`#rtype${nn}`).val().trim()
			const costpp = $(`#costpp${nn}`).val().trim()
			const arcode = $(`#apcode${nn}`).val().trim()
			const currency = $(`#vcurr${nn}`).val().trim()

			if (!vendid || !rtype || !costpp || !arcode || !currency) {
				alert('Vendor, R-Type, P/C, AP Code and Currency are required when Cost NOT zero.')
				costs = []
				return false
			}

			let detid = $(this).data('detid')
			let c = g_costs.find(a => a.detid == detid)
			const voucherno = g_isBulkReleaseCleared || c?.isReleaseCleared ? '' : 'not-empty'

			let basecurrency = ($(`#basecurrency${nn}`).val() ?? '').trim()

			if (basecurrency.length == 0) {
				basecurrency = $('#basecurr').val()
			}

			const cost = {
				adduser: $('#userid').val(),
				uuid: $('#uuid').val(),
				detid: detid || 0,
				txtype: $('input[name="chargemode"]:checked').val(),
				rtype,
				vendid,
				vendname: getTruncatedValue(`vnm${nn}`),
				terms: $(`#vterms${nn}`).val()?.toUpperCase() || '',
				release: $(`#aprls${nn}`).is(':checked') ? '1' : '0',
				costpp,
				arcode,
				glacct: $(`#vglacct${nn}`).val() || '',
				ardesc: getTruncatedValue(`apdesc${nn}`),
				note2: getTruncatedValue(`note2${nn}`),
				vendref: $(`#vref${nn}`).val()?.toUpperCase(),
				venddate: $(`#venddate${nn}`).val() || '',
				ctnrno: $(`#vctnr${nn}`).val() || '',
				uom: $(`#vuom${nn}`).val() || '',
				qty: $(`#vqty${nn}`).val() || 0,
				rate: $(`#vrate${nn}`).val() || 0,
				cost: $(`#cost${nn}`).val(),
				currency: currency.split('_')[0],
				exrate: $(`#vexrate${nn}`).val(),
				basicamt: $(`#vbamt${nn}`).val() || 0,
				voucher1: $(`#voucher1`).val() || '',
				voucherno,
				basecurrency
			}

			const cui = $('#cui').val()

			if (cui.toUpperCase() != 'US') {
				cost.provisional = $(`#vprov${nn}`).is(':checked') ? '1' : '0'
			}

			costs.push(cost)
		}
	})

	if (costs.length > 0) {
		savingCost = true
		$.ajax({
			url: `dataentry.ashx?task=${isUpdatingCosts ? 'update' : 'add'}BulkCostsEx&sqid=${sqid}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(costs),
			success: function (response) {
				if (response.error) {
					alert(`Failed inserting costs. ${response.message}`)
				} else {
					onLoadCostDetails()
					isUpdatingCosts = false
					if (!savingRevenue) onHideBulkSection()
				}
			},
			error: function (error) {
				console.error('Error:', error)
				alert(`Failed inserting costs. Please try later again!`)
			},
			complete: function () {
				savingCost = false
			}
		})
	}
}


function onUpdateBulkRevenue() {
	const chargemode = $('input[name="chargemode"]:checked').val()
	if (chargemode == 'A') return
	const items = []
	$(`#revenue_details_table tbody tr`).each(function (index) {
		const checkbox = $(this).find('td:nth-child(2) input[type="checkbox"]')
		if (checkbox.is(':checked')) {
			let basecurrency = ($(this).find('td:nth-child(39)').html() ?? '').trim()

			if (basecurrency.length == 0) {
				basecurrency = $('#basecurr').val()
			}

			const id = $(this).attr('id')
			const detid = id.split('_')[1]
			const item = {
				detid,
				txtype: $(this).find('td:nth-child(3)').html(),
				rtype: $(this).find('td:nth-child(4)').html(),
				ppd: $(this).find('td:nth-child(5)').html(),
				billid: $(this).find('td:nth-child(6)').html(),
				billname: $(this).find('td:nth-child(7)').html(),
				arglcode: $(this).find('td:nth-child(8)').html(),
				arcode: $(this).find('td:nth-child(9)').html(),
				ardesc: $(this).find('td:nth-child(10)').html(),
				arnote: $(this).find('td:nth-child(11)').html(),
				uom: $(this).find('td:nth-child(12)').html(),
				ctnrno: $(this).find('td:nth-child(13)').html(),
				qty: removeComma($(this).find('td:nth-child(14)').html()),
				curr: $(this).find('td:nth-child(15)').html(),
				rate: removeComma($(this).find('td:nth-child(16)').html()),
				exrate: $(this).find('td:nth-child(18)').html(),
				basicamt: $(this).find('td:nth-child(19)').html(),
				amt: removeComma($(this).find('td:nth-child(17)').html()),
				genmethod: $(this).find('td:nth-child(20)').html(),
				invno: $(this).find('td:nth-child(21)').html(),
				arrls: $(this).find('td:nth-child(22) input[type="checkbox"]').is(':checked') ? '1' : '0',
				invdate: $(this).find('td:nth-child(23)').html(),
				terms: $(this).find('td:nth-child(24)').html(),
				duedate: $(this).find('td:nth-child(25)').html(),
				amtrecv: $(this).find('td:nth-child(26)').html(),
				pydate: $(this).find('td:nth-child(27)').html(),
				custref: $(this).find('td:nth-child(28)').html(),
				custnote: $(this).find('td:nth-child(29)').html(),
				lastuser: $(this).find('td:nth-child(30)').html(),
				lastdate: $(this).find('td:nth-child(31)').html(),
				adduser: $(this).find('td:nth-child(32)').html(),
				adddate: $(this).find('td:nth-child(33)').html(),
				jeno: $(this).find('td:nth-child(40)').html(),
				provisional: $(this).find('td:nth-child(41) input[type="checkbox"]').is(':checked') ? '1' : '0',
				taxinvno: $(this).find('td:nth-child(42)').html(),
				taxinvdate: $(this).find('td:nth-child(43)').html(),
				basecurrency
			}

			items.push(item)
		}
	})

	if (items.length > 0) {
		isUpdatingRevenues = true
		onShowBulkSection(items, [])
	}
}


function onUpdateBulkCost() {
	const chargemode = $('input[name="chargemode"]:checked').val()
	if (chargemode == 'A') return
	const items = []
	$(`#cost_details_table tbody tr`).each(function (index) {
		const checkbox = $(this).find('td:nth-child(2) input[type="checkbox"]')
		if (checkbox.is(':checked')) {
			const id = $(this).attr('id')
			const detid = id.split('_')[1]
			let basecurrency = ($(this).find('td:nth-child(39)').html() ?? '').trim()

			if (basecurrency.length == 0) {
				basecurrency = $('#basecurr').val()
			}

			const item = {
				detid,
				txtype: $(this).find('td:nth-child(3)').html(),
				rtype: $(this).find('td:nth-child(4)').html(),
				costpp: $(this).find('td:nth-child(5)').html(),
				vendid: $(this).find('td:nth-child(6)').html(),
				vendname: $(this).find('td:nth-child(7)').html(),
				apglcode: $(this).find('td:nth-child(8)').html(),
				arcode: $(this).find('td:nth-child(9)').html(),
				ardesc: $(this).find('td:nth-child(10)').html(),
				note2: $(this).find('td:nth-child(11)').html(),
				uom: $(this).find('td:nth-child(12)').html(),
				ctnrno: $(this).find('td:nth-child(13)').html(),
				qty: removeComma($(this).find('td:nth-child(14)').html()),
				curr: $(this).find('td:nth-child(15)').html(),
				rate: removeComma($(this).find('td:nth-child(16)').html()),
				exrate: $(this).find('td:nth-child(18)').html(),
				cost: removeComma($(this).find('td:nth-child(17)').html()),
				basicamt: removeComma($(this).find('td:nth-child(19)').html()),
				vendref: $(this).find('td:nth-child(20)').html(),
				venddate: $(this).find('td:nth-child(21)').html(),
				voucherno: $(this).find('td:nth-child(22)').html(),
				aprls: $(this).find('td:nth-child(23) input[type="checkbox"]').is(':checked') ? '1' : '0',
				verifyby: $(this).find('td:nth-child(24)').html(),
				verifytime: $(this).find('td:nth-child(25)').html(),
				terms: $(this).find('td:nth-child(26)').html(),
				duedate: $(this).find('td:nth-child(27)').html(),
				amtpaid: $(this).find('td:nth-child(28)').html(),
				pydate: $(this).find('td:nth-child(29)').html(),
				ourref: $(this).find('td:nth-child(30)').html(),
				lastuser: $(this).find('td:nth-child(31)').html(),
				lastdate: $(this).find('td:nth-child(32)').html(),
				adduser: $(this).find('td:nth-child(33)').html(),
				adddate: $(this).find('td:nth-child(34)').html(),
				jeno: $(this).find('td:nth-child(43)').html(),
				provisional: $(this).find('td:nth-child(44) input[type="checkbox"]').is(':checked') ? '1' : '0',
				basecurrency
			}

			items.push(item)
		}
	})

	if (items.length > 0) {
		isUpdatingCosts = true
		onShowBulkSection([], items)
	}
}


function onDeleteBulk(type) {
	const chargemode = $('input[name="chargemode"]:checked').val()
	if (chargemode == 'A') return
	const detids = []
	const ids = []
	const arcodes = [];

	$(`#${type}_details_table tbody tr`).each(function (index) {
		const checkbox = $(this).find('td:nth-child(2) input[type="checkbox"]')
		if (checkbox.is(':checked')) {
			arcodes.push($(this).find('td#d-glacct').text().trim());
			ids.push($(this).attr('id'))
			detids.push(checkbox.val())
		}
	})

	if (detids.length == 0) {
		alert('Please select the revenues to delete.')
	}
	else {
		if (window.confirm("Do you really want to delete?")) {
			const sqid = $("#sqid").val()
			const uuid = $('#uuid').val()
			$.ajax({
				type: 'POST',
				url: `dataentry.ashx?task=delRevenue&sqid=${sqid}`,
				data: { uuid: uuid, detids: detids.join('_'), arcodes: arcodes.join(',') },
				success: function () {
					ids.forEach(id => {
						$(`#${id}`).remove()
					})
				},
				error: function (err) {
					alert('Failed deleting, please try later again!')
				}
			})
		}
	}
}


function onCopyRevenue(id, isOffset = false) {
	const sqid = $("#sqid").val()
	const tr = $(`#revenue_details_table #${id}`)
	const detid = id.split('_')[1]
	const amt = removeComma(tr.find('td:nth-child(17)').html())
	const exrate = removeComma(tr.find('td:nth-child(18)').html())
	const rls = tr.find('td:nth-child(21) input[type="checkbox"]').is(':checked') ? '1' : '0'
	const arrls = isOffset ? rls : '0'
	const invno = isOffset ? tr.find('td:nth-child(20)').html() : ''
	let rtype = tr.find('td:nth-child(4)').html()
	let basecurrency = (tr.find('td:nth-child(39)').html() ?? '').trim()

	if (basecurrency.length == 0) {
		basecurrency = $('#basecurr').val()
	}

	if (isOffset)
		rtype = rtype == 'CR' ? 'DB' : 'CR'

	const revenue = {
		adduser: $('#userid').val(),
		uuid: $('#uuid').val(),
		detid: detid,
		txtype: tr.find('td:nth-child(3)').html(),
		rtype,
		billid: tr.find('td:nth-child(6)').html(),
		billname: tr.find('td:nth-child(7)').html(),
		terms: tr.find('td:nth-child(24)').html(),
		arrls,
		invno,
		amtpp: tr.find('td:nth-child(5)').html(),
		arcode: tr.find('td:nth-child(9)').html(),
		ardesc: tr.find('td:nth-child(10)').html(),
		adddesc: tr.find('td:nth-child(11)').html(),
		custref: tr.find('td:nth-child(28)').html(),
		ctnrno: tr.find('td:nth-child(13)').html(),
		uom: tr.find('td:nth-child(12)').html() || '',
		qty: removeComma(tr.find('td:nth-child(14)').html()),
		rate: removeComma(tr.find('td:nth-child(16)').html()),
		amt,
		currency: tr.find('td:nth-child(15)').html(),
		exrate,
		basicamt: (Number(amt) * Number(exrate)).toFixed(2),
		glacct: tr.find('td:nth-child(8)').html(),
		inv1: $(`#inv1`).val() || '',
		note1: tr.find('td:nth-child(29)').html(),
		shipmentno: $("#shipmentno").val(),
		ourref: tr.find('td:nth-child(34)').html(),
		stationid: tr.find('td:nth-child(35)').html(),
		mbl: tr.find('td:nth-child(36)').html(),
		hbl: tr.find('td:nth-child(37)').html(),
		manifest: tr.find('td:nth-child(38)').html(),
		basecurrency
	}

	const cui = $('#cui').val()

	if (cui.toUpperCase() != 'US') {
		revenue.provisional = tr.find('td:nth-child(34) input[type="checkbox"]').is(':checked') ? '1' : '0'
		revenue.taxinvno = tr.find('td:nth-child(35)').html()
		revenue.taxinvdate = tr.find('td:nth-child(36)').html()
	}

	$.ajax({
		url: `dataentry.ashx?task=addBulkRevenues&sqid=${sqid}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify([revenue]),
		success: function (response) {
			if (response.error) {
				alert(`Failed copying a revenue. ${response.message}`)
			} else {
				onLoadRevenueDetails()
			}
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed copying a revenue. Please try later again!`)
		}
	})
}


function onCopyCost(id, isOffset = false) {
	const sqid = $("#sqid").val()
	const tr = $(`#cost_details_table #${id}`)
	const detid = id.split('_')[1]
	const cost = removeComma(tr.find('td:nth-child(17)').html())
	const exrate = tr.find('td:nth-child(18)').html()
	const rls = tr.find('td:nth-child(22) input[type="checkbox"]').is(':checked') ? '1' : '0'
	const aprls = isOffset ? rls : '0'
	let rtype = tr.find('td:nth-child(4)').html()
	let basecurrency = (tr.find('td:nth-child(39)').html() ?? '').trim()

	if (basecurrency.length == 0) {
		basecurrency = $('#basecurr').val()
	}

	if (isOffset)
		rtype = rtype == 'CR' ? 'DB' : 'CR'

	const item = {
		adduser: $('#userid').val(),
		uuid: $('#uuid').val(),
		detid,
		txtype: tr.find('td:nth-child(3)').html(),
		rtype,
		vendid: tr.find('td:nth-child(6)').html(),
		vendname: tr.find('td:nth-child(7)').html(),
		terms: tr.find('td:nth-child(26)').html(),
		aprls,
		costpp: tr.find('td:nth-child(5)').html(),
		arcode: tr.find('td:nth-child(9)').html(),
		ardesc: tr.find('td:nth-child(10)').html(),
		vendref: tr.find('td:nth-child(20)').html(),
		ctnrno: tr.find('td:nth-child(13)').html(),
		uom: tr.find('td:nth-child(12)').html(),
		qty: removeComma(tr.find('td:nth-child(14)').html()),
		rate: removeComma(tr.find('td:nth-child(16)').html()),
		cost,
		currency: tr.find('td:nth-child(15)').html(),
		exrate,
		basicamt: (Number(cost) * Number(exrate)).toFixed(2),
		voucherno: tr.find('td:nth-child(22)').html(),
		venddate: tr.find('td:nth-child(21)').html(),
		glacct: tr.find('td:nth-child(8)').html(),
		note2: tr.find('td:nth-child(11)').html(),
		voucher1: $(`#voucher1`).val() || '',
		shipmentno: $("#shipmentno").val(),
		dettype: tr.find('td:nth-child(40)').html(),
		perc: tr.find('td:nth-child(41)').html(),
		ourref: tr.find('td:nth-child(30)').html(),
		stationid: tr.find('td:nth-child(35)').html(),
		mbl: tr.find('td:nth-child(36)').html(),
		hbl: tr.find('td:nth-child(37)').html(),
		manifest: tr.find('td:nth-child(38)').html(),
		basecurrency
	}

	$.ajax({
		url: `dataentry.ashx?task=addBulkCosts&sqid=${sqid}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify([item]),
		success: function (response) {
			if (response.error) {
				alert(`Failed copying a cost. ${response.message}`)
			} else {
				onLoadCostDetails()
			}
		},
		error: function (error) {
			console.error('Error:', error)
			alert(`Failed copying a cost. Please try later again!`)
		}
	})
}


function onSelectAllRevenue() {
	const isChecked = $('#all_revenue_select').is(':checked')
	$(`#revenue_details_table tbody tr`).each(function (index) {
		if (g_revenues[index].arpost == 0) {
			$(this).find('td:nth-child(2) input[type="checkbox"]').prop('checked', isChecked)
		}
	})
}


function onSelectAllCost() {
	const isChecked = $('#all_cost_select').is(':checked')
	$(`#cost_details_table tbody tr`).each(function (index) {
		if (g_costs[index].appost == 0) {
			$(this).find('td:nth-child(2) input[type="checkbox"]').prop('checked', isChecked)
		}
	})
}


$(document).ready(function () {
	$(window).scroll(function () {
		if (window.scrollY > 50) {
			$('#gotop').addClass('gotop-show')
		}
		else {
			$('#gotop').removeClass('gotop-show')
		}
	})

	$('#gotop').on('click', function () {
		window.scrollTo({ top: 0, behavior: 'smooth' })
		$('#gotop').removeClass('gotop-show')
	})

	const defcm = $('#defcm').val()
	$(`input[name="chargemode"][value="${defcm}"]`).prop('checked', true)

	onLoadTerms()
	onLoadContainers()
	onLoadPackageTypes()
	//onLoadCurrencies()
	onCheckChargeMode()
	onLoadRevenueDetails()
	onLoadCostDetails()

	$('#basecurr').change(e => {
		//const c = e.target.value
		onLoadCurrencies()
	})

	$('#basecurr').change()

	$('input[name="chargemode"]').on('change', () => {
		onCheckChargeMode()
		totalAmount = 0
		totalCost = 0
		onLoadRevenueDetails()
		onLoadCostDetails()
	})

	// Initialize a DOM watcher that keeps reacting to dynamic UI changes
	// (rows added/removed after user interactions)
	initExRateReadonlyWatcher();
})

function initExRateReadonlyWatcher() {

	// Helper to determine if exrate inputs should be editable
	// Accepts both "1" and "true" to prevent edge cases
	const isEditingAllowed = () => {
		const value = ($('#exratereadonly').val() || '').toString().toLowerCase();
		return value === '1' || value === 'true';
	};

	// Removes readonly from revenue exchange rate inputs (exrate01...exrateN)
	const applyRevenue = () => {
		if (!isEditingAllowed()) return;

		$('#revenue_tbody')
			.find('input[id^="exrate"][readonly]')
			.prop('readonly', false)
			.removeAttr('readonly');
	};

	// Removes readonly from cost exchange rate inputs (vexrate01...vexrateN)
	const applyCost = () => {
		if (!isEditingAllowed()) return;

		$('#cost_tbody')
			.find('input[id^="vexrate"][readonly]')
			.prop('readonly', false)
			.removeAttr('readonly');
	};

	// Run once in case the elements already exist on initial load
	applyRevenue();
	applyCost();

	// Observe DOM mutations to handle dynamic rendering
	// This allows the logic to re-run when rows are added after user actions
	const observer = new MutationObserver(function (mutations) {
		for (const mutation of mutations) {
			if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
				applyRevenue();
				applyCost();
				break; // One pass is enough per DOM change batch
			}
		}
	});

	// Watch the entire document since tbody elements may be injected dynamically
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}


