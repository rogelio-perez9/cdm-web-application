var selectedDoId
var selectedDoNo


function onCopyDoHelp( doid ) {
	if ( !doid ) return
	const sqid = $( "#sqid" ).val()
	$.ajax( {
		url: `dataentry.ashx?task=getDoHelpDetails&sqid=${sqid}&doid=${doid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function ( res ) {
			Object.keys( res ).forEach( key => {
				if ( key == 'delvid' || key == 'precarrid' ) {
					$( `#${key}2` ).tokenInput( 'add', { custid: res[key] } )
				}
				else {
					$( `#${key}` ).val( res[key] )
				}
			} )
		}
	} )
}

function onDeleteDoHelp( doid ) {
	selectedDoId = doid
	onOpenConfirm( doid )
}

function onDisplayConfirmDialog( doid ) {
	const dotr = $( `#tr_do_${doid}` )
	$( `#do_location` ).html( dotr.find( 'td:nth-child(2)' ).html() )
	$( `#do_deliver_to` ).html( dotr.find( 'td:nth-child(3)' ).html() )
	$( `#do_trucker` ).html( dotr.find( 'td:nth-child(4)' ).html() )
}

function onConfirmDelete() {
	if ( !selectedDoId ) return
	const sqid = $( "#sqid" ).val()
	$.ajax( {
		url: `dataentry.ashx?task=deleteDoHelp&sqid=${sqid}&doid=${selectedDoId}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function () {
			$( `#dohelp_table_body #tr_do_${selectedDoId}` ).remove()
			onCloseConfirm()
		},
		error: function ( err ) {
			alert( 'Failed deleting a DO Helper Record. Please try later again!' )
		}
	} )
}

function onOpenConfirm( doid ) {
	$( '#dohelp-confirm-dialog' ).dialog( {
		autoOpen: false,
		width: 500,
		position: {
			my: "top",
			at: "top"
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: function ( event, ui ) {
			$( '#dohelp-confirm-dialog #divInDialog' ).load( 'confirmDoHelpDelete.html', function () {
				onDisplayConfirmDialog( doid )
			} )
		},
		close: function () {
			onCloseConfirm()
		}
	} )
	$( '#dohelp-confirm-dialog' ).dialog( 'open' )
}

function onCloseConfirm() {
	selectedDoId = undefined
	$( '#dohelp-confirm-dialog' ).dialog( 'close' )
}

function onDeleteDeliveryOrder( dono ) {
	selectedDoNo = dono
	onOpenDeleteConfirm( dono )
}

function onDisplayDeleteConfirmDialog( dono ) {
	const dotr = $( `#tr_delivery_order_${dono}` )
	$( `#delivery_order_no` ).html( dono )
	$( `#delivery_order_to` ).html( dotr.find( 'th:nth-child(4)' ).html() )
	$( `#delivery_order_trucker` ).html( dotr.find( 'th:nth-child(5)' ).html() )
}

function onConfirmDeliveryDelete() {
	if ( !selectedDoNo ) return
	const sqid = $( "#sqid" ).val()
	const rid = $( "#RID" ).val()
	const doid = $( "#DOID" ).val()
	const userid = $( "#USERID" ).val()
	$.ajax( {
		url: `dataentry.ashx?task=deleteDeliveryOrder&sqid=${sqid}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { doid, rid, userid, dono: selectedDoNo },
		success: function () {
			toastr.options.progressBar = true
			toastr.options.positionClass = "toast-center-center"
			toastr.success( `DO No ${selectedDoNo} Voided` )

			$( `#tr_delivery_order_${selectedDoNo}` ).children( 'th' ).eq( 0 ).children( 'a' ).text( selectedDoNo + ' (VOIDED)' )

			onCloseDeleteConfirm()
		},
		error: function ( err ) {
			alert( 'Failed deleting a DO Helper Order. Please try later again!' )
		}
	} )
}

function onOpenDeleteConfirm( dono ) {
	$( '#delivery-order-confirm-dialog' ).dialog( {
		autoOpen: false,
		width: 500,
		position: {
			my: "top",
			at: "top"
		},
		classes: {
			"ui-dialog": "contact-dialog"
		},
		open: function ( event, ui ) {
			$( '#delivery-order-confirm-dialog #divInDialog' ).load( 'dohelp-delete-confirm.html', function () {
				onDisplayDeleteConfirmDialog( dono )
			} )
		},
		close: function () {
			onCloseDeleteConfirm()
		}
	} )
	$( '#delivery-order-confirm-dialog' ).dialog( 'open' )
}

function onCloseDeleteConfirm() {
	selectedDoNo = undefined
	$( '#delivery-order-confirm-dialog' ).dialog( 'close' )
}

function onChangeVoidConfirm() {
	const checked = $( '#delivery_delete_confirm' ).is( ':checked' )
	$( '#void_save_btn' ).prop( 'disabled', !checked )
}

function onLoadDoHelp() {
	const sqid = $( "#sqid" ).val()
	const prinid = $( '#PRINID' ).val()
	if ( !prinid || !sqid ) return
	const sloc = $( '#sloc' ).val()
	const sdelv = $( '#sdelv' ).val()
	const struck = $( '#struck' ).val()
	$.ajax( {
		url: `dataentry.ashx?task=getDoHelps&sqid=${sqid}&prinid=${prinid}&sloc=${sloc}&sdelv=${sdelv}&struck=${struck}`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		success: function ( res ) {
			const tbody = $( '#dohelp_table_body' )
			if ( Array.isArray( res ) ) {
				$( '#dohelp_table_body tr' ).remove()
				if ( res.length === 0 ) {
					const tr = `<tr><td colspan=5>Not Found</td></tr>`
					tbody.append( tr )
				} else {
					res.forEach( ( item, ind ) => {
						let tr = ""
						tr += `<tr id="tr_do_${item.doid}"><td><input type="button" id="C${item.doid}" name="C${item.doid}" value=" COPY TO DO " style="border:1 solid #CDCDCD;font-family: tahoma,Verdana;font-size:12px;font-weight:bolder;height: 29px;position: relative;color:#000000;background-color:#38acec;padding-left:2px;padding-right:2px;padding-top:2px;padding-bottom:2px;" onClick="onCopyDoHelp('${item.doid}')"></td>`
						tr += `<td>${item.locname}</td>`
						tr += `<td>${item.delvadd1} ${item.delvcity}, ${item.delvcity ? item.delvst : ''}</td>`
						tr += `<td>${item.precarrname}</td>`
						tr += `<td><input type="button" id="D${item.doid}" name="D${item.doid}" value=" DELETE " style="border:1 solid #CDCDCD;font-family: tahoma,Verdana;font-size:12px;font-weight:bolder;height: 29px;position: relative;color:#fff;background-color:#FD1C03;padding-left:2px;padding-right:2px;padding-top:2px;padding-bottom:2px;" onClick="onDeleteDoHelp('${item.doid}')"></td>`
						tr += '</tr>'
						tbody.append( tr )
					} )
				}
			}
		}
	} )
}


$( document ).ready( function () {
	onLoadDoHelp()
	$( '#sloc' ).on( 'keyup', function () {
		onLoadDoHelp()
	} )
	$( '#sdelv' ).on( 'keyup', function () {
		onLoadDoHelp()
	} )
	$( '#struck' ).on( 'keyup', function () {
		onLoadDoHelp()
	} )

	toastr.options.timeOut = "5000"
} )
