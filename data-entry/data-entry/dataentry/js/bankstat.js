let g_pid
let g_did = 0
let g_mid
let g_link
let g_rid
let g_sqid
let g_cui
let g_isUsCui
let g_userId
let g_custId
let g_custName
let g_isDeleteAction = false


function mapToHtml( o, mapper ) {
	for ( const propertyName in o ) {
		let elementId = propertyName
		let value = o[propertyName]

		if ( mapper ) {
			const map = mapper( propertyName )
			elementId = map?.elementId
			value = map?.value
		}

		if ( elementId ) {
			if ( typeof value == "boolean" ) {
				$( `#${elementId}` ).prop( 'checked', value )
			}
			else {
				$( `#${elementId}` ).val( value )
			}
		}
	}
}


function setBanks( banks ) {
	$( '#table-banks' ).empty()

	banks.forEach( b => {
		let bankid = b.bankid
		let bankdesc = b.bankdesc
		let code = b.code
		let expand = b.expand
		let addr1 = b.addr1
		let aba = b.aba
		let swift = b.swift
		let isPrimary = b.primarybank != 0

		$( '#table-banks' ).append(
			`<tr>
				<td>
					<a title='Edit Record' class="action_edit" href="statbank.dll?_&DID=${bankid}">&nbsp;</a>
					<a title='Delete Record' class="action_delete" href="statbank.dll?_&DID=${bankid}">&nbsp;</a>
				</td>
				<th>
					<a href="#">${bankdesc}</a>
				</th>
				<th>
					<a href="#">${code}</a>
				</th>
				<th>
					<a href="#">${expand}</a>
				</th>
				<th>
					<a href="#">${isPrimary ? '<img src="images/action_approve.gif" alt="Yes" style="width:25px;height:25px;">' : ''}</a>
				</th>
				<th>
					<a href="#">${addr1}</a>
				</th>
				<th>
					<a href="#">${aba}</a>
				</th>
				<th>
					<a href="#">${swift}</a>
				</th>
			</tr>
			`)
	} )

	$( '.action_edit' ).on( 'click', ( e ) => {
		e.preventDefault()
		resetBankDetails()
		loadStationBank( getActionDid( e ), setBankDetails )
	} )

	$( '.action_delete' ).on( 'click', ( e ) => {
		e.preventDefault()
		loadStationBank( getActionDid( e ), setBankDetails )
		$( `[type='submit']` ).text( 'C O N F I R M * D E L E T E' )
		$( `#confirmation-delete` ).show()
		g_isDeleteAction = true
	} )
}


function setBankDetails( bank ) {
	mapToHtml( bank, propertyName => {
		if ( ( propertyName == 'glacct' || propertyName == 'bankdesc' ) && !g_isUsCui ) {
			return null
		}

		let value = bank[propertyName]

		if ( propertyName == 'primarybank' ) {
			value = !( value == 0 )
		}

		return { elementId: propertyName, value: value }
	} )

	g_did = bank.bankid || g_did
}


function getBankDetails( isEmpty ) {
	return {
		bankid: g_did
		, serial: g_pid
		, compid: g_custId
		, compname: g_custName
		, primarybank: isEmpty ? null : ( $( '#primarybank' ).prop( 'checked' ) ? 1 : 0 )
		, code: isEmpty ? null : $( '#code' ).val()
		, expand: isEmpty ? null : $( '#expand' ).val()
		, aba: isEmpty ? null : $( '#aba' ).val()
		, swift: isEmpty ? null : $( '#swift' ).val()
		, addr1: isEmpty ? null : $( '#addr1' ).val()
		, glacct: isEmpty ? null : ( $( '#glacct' ).val() ?? '' )
		, bankdesc: isEmpty ? null : ( $( '#bankdesc' ).val() ?? '' )
	}
}


function resetBankDetails() {
	g_isDeleteAction = false
	g_did = 0
	setBankDetails( getBankDetails( true ) )
	$( `[type='submit']` ).text( 'S A V E' )
	$( `#confirmation-delete` ).hide()
}


function saveStationBank( bank, handler ) {
	const q = {
		task: 'saveStationBank'
		, sqid: g_sqid
		, userid: g_userId
	}

	$.ajax( {
		url: `dataentry.ashx${toQueryString( q )}`,
		type: 'POST',
		dataType: 'json',
		data: JSON.stringify( bank ),
		success: function ( response ) {
			handler( response )
		},
		error: function ( error ) {
			console.error( 'Error:', error )
		},
		complete: function () {
		}
	} )
}


function loadStationBank( bankId, handler ) {
	const q = {
		task: 'getStationBank'
		, sqid: g_sqid
		, bankid: bankId
	}

	$.ajax( {
		url: `dataentry.ashx${toQueryString( q )}`,
		type: 'GET',
		contentType: 'application/json',
		success: function ( response ) {
			handler( response )
		},
		error: function ( error ) {
			console.error( 'Error:', error )
		},
		complete: function () {
		}
	} )
}


function loadStationBanks( handler ) {
	const q = {
		task: 'getStationBanks'
		, sqid: g_sqid
		, serial: g_pid
	}

	$.ajax( {
		url: `dataentry.ashx${toQueryString( q )}`,
		type: 'GET',
		contentType: 'application/json',
		success: function ( response ) {
			handler( response )
		},
		error: function ( error ) {
			console.error( 'Error:', error )
		},
		complete: function () {
		}
	} )
}


function deleteStationBank( bankId, handler ) {
	const q = {
		task: 'deleteStationBank'
		, sqid: g_sqid
		, bankid: bankId
	}

	$.ajax( {
		url: `dataentry.ashx${toQueryString( q )}`,
		type: 'GET',
		contentType: 'application/json',
		success: function (response) {
			if (!response.error) {
				alert(`Account ${response.code} Deleted`)
			}

			handler( response )
		},
		error: function ( error ) {
			console.error( 'Error:', error )
		},
		complete: function () {
		}
	} )
}


function getActionDid( event ) {
	let href = $( event.currentTarget ).attr( 'href' )
	let urlParams = new URLSearchParams( href )
	let r = urlParams.get( 'DID' )
	return r
}


$( document ).ready( () => {
	let urlParams = new URLSearchParams( window.location.search )
	g_pid = urlParams.get( 'PID' ) || g_pid
	g_did = urlParams.get( 'DID' ) || g_did
	g_mid = urlParams.get( 'MID' ) || g_mid
	g_link = urlParams.get( 'LINK' ) || g_link
	g_rid = urlParams.get( 'RID' ) || g_rid
	g_sqid = $( "#sqid" ).val()
	g_userId = $( "#USERID" ).val()
	g_custId = $( "#CUSTID" ).val()
	g_custName = $( "#CUSTNAME" ).val()
	g_cui = $( "#CUI" ).val()
	g_isUsCui = g_cui.toLowerCase() == "us"

	loadStationBanks( setBanks )

	if ( g_did ) {
		loadStationBank( g_did, setBankDetails )
	}

	$( `[type='submit']` ).on( 'click'
		, ( e ) => {
			e.preventDefault()

			if ( g_isDeleteAction ) {
				if ( $( '#deleterecord' ).prop( 'checked' ) ) {
					deleteStationBank( g_did
						, ( r ) => {
							resetBankDetails()
							loadStationBanks( setBanks )
						} )
				}
			}
			else {
				saveStationBank( getBankDetails()
					, ( r ) => {
						resetBankDetails()
						loadStationBanks( setBanks )
					} )
			}
		} )

	$( `[type='button']` ).on( 'click', ( e ) => {
		resetBankDetails()
	} )
} )
