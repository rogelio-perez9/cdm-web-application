function shipmentNotesVoidedByString( e ) {
	return 'VOIDED BY: ' + e.voiduser + ' @ ' + toDateString( e.voiddate ) + ' @ ' + toTimeString( e.voiddate )
}


function shipmentNotesLockedByString( e ) {
	return 'LOCKED BY: ' + e.lockuser + ' @ ' + toDateString( e.lockdate ) + ' @ ' + toTimeString( e.lockdate )
}


function shipmentNotesEnableSave( f ) {
	let buttons = $( "#new-note-dialog" ).dialog( "option", "buttons" )
	let saveButton = buttons.find( b => b.id == 1 )
	saveButton.disabled = !f
	$( "#new-note-dialog" ).dialog( "option", "buttons", buttons )
}


function shipmentNotesEdit( e ) {
	//let v = $( e.parentNode.parentNode ).children( "#notes-notes" ).text()
	let tr = e.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
	$( '#text-notes' ).val( $( tr ).children( "#notes-notes" ).text() )
	$( '#text-notes' ).prop( 'disabled', false )

	$( '#new-note-dialog' ).data( 'id', $( tr ).data( "id" ) )
	$( '#new-note-dialog' ).dialog( 'option', 'title', $( tr ).data( "shipmentno" ) )

	$( '#note-confirm-section' ).remove()
	shipmentNotesEnableSave( true )

	$( '#new-note-dialog' ).append(
		`<div id="note-confirm-section">
			<span id="note-confirm-text">Do you want to Lock Note?</span>
			<input id="note-confirm-check" type="checkbox" />
		</div>`)

	$( '#note-confirm-check' ).change( ( e ) => {
		$( '#text-notes' ).prop( 'disabled', e.target.checked )
		$( '#new-note-dialog' ).data( 'is-locked', e.target.checked )
	} )

	$( '#note-confirm-check' ).change()

	$( '#new-note-dialog' ).dialog( 'open' )
}


function shipmentNotesLock( e ) {
	let tr = e.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
	$( '#text-notes' ).val( $( tr ).children( "#notes-notes" ).text() )
	$( '#new-note-dialog' ).data( 'id', $( tr ).data( "id" ) )
	$( '#new-note-dialog' ).data( 'op', 'lock' )
	$( '#new-note-dialog' ).data( 'state', $( tr ).data( "isLocked" ) )
	$( '#new-note-dialog' ).dialog( 'option', 'title', $( tr ).data( "shipmentno" ) )

	$( '#note-confirm-section' ).remove()
	$( '#new-note-dialog' ).append(
		`<div id="note-confirm-section">
			<span id="note-confirm-text">Are you sure you want to
			${$( tr ).data( "isLocked" ) ? "Un-Lock" : "Lock"} 
			this Note?</span><input id="note-confirm-check" type="checkbox" ${!$( tr ).data( "isLocked" ) ? "checked" : ""} />
		</div>`)

	$( '#note-confirm-check' ).change( ( e ) => {
		$( '#text-notes' ).prop( 'disabled', $( tr ).data( "isLocked" ) ? !e.target.checked : e.target.checked )
		shipmentNotesEnableSave( e.target.checked )
	} )

	$( '#note-confirm-check' ).change()

	$( '#new-note-dialog' ).dialog( 'open' )
}


function shipmentNotesVoid( e ) {
	let tr = e.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
	$( '#text-notes' ).val( $( tr ).children( "#notes-notes" ).text() )
	$( '#new-note-dialog' ).data( 'id', $( tr ).data( "id" ) )
	$( '#new-note-dialog' ).data( 'op', 'void' )
	$( '#new-note-dialog' ).data( 'state', $( tr ).data( "isVoided" ) )
	$( '#new-note-dialog' ).dialog( 'option', 'title', $( tr ).data( "shipmentno" ) )

	$( '#note-confirm-section' ).remove()
	$( '#new-note-dialog' ).append(
		`<div id="note-confirm-section">
			<span id="note-confirm-text">Are you sure you want to
			${$( tr ).data( "isVoided" ) ? "Un-Void" : "Void"} 
			this Note?</span><input id="note-confirm-check" type="checkbox" ${!$( tr ).data( "isVoided" ) ? "checked" : ""} />
		</div>`)

	$( '#note-confirm-check' ).change( ( e ) => {
		$( '#text-notes' ).prop( 'disabled', $( tr ).data( "isVoided" ) ? !e.target.checked : e.target.checked )
		shipmentNotesEnableSave( e.target.checked )
	} )

	$( '#note-confirm-check' ).change()

	$( '#new-note-dialog' ).dialog( 'open' )
}


function setShipmentNotes( notes ) {
	$( "#notes_table_body" ).empty()

	notes.forEach( e => {
		$( "#notes_table_body" ).append(
			`<tr data-id="${e.noteid}" data-shipmentno="${e.shipmentno}" data-is-locked="${e.isLocked}" data-is-voided="${e.isVoided}"}>
				<th style="text-align: center; font-weight: normal;">
					<table style='padding: 0; line-height: 0; border-spacing: 0; border-width: 0;'>
						<tr style='padding: 0; line-height: 0; border-spacing: 0; border-width: 0;'>
							<th style="padding: 0; line-height: 0; border-spacing: 0; border-width: 0; width: 26px">${!e.isLocked && !e.isVoided ? '<img src="images/action_edit.gif" alt="Edit Note" style="width: 25px; height: 25px;" onclick="shipmentNotesEdit(this)">' : ''}</th>
							<th style="padding: 0; line-height: 0; border-spacing: 0; border-width: 0; width: 26px">${e.isLocked || !e.isVoided ? '<img src="images/action_lock.gif" alt="Lock Note" style="width: 25px; height: 25px;" onclick="shipmentNotesLock(this)">' : ''}</th>
							<th style="padding: 0; line-height: 0; border-spacing: 0; border-width: 0; width: 26px">${e.isVoided || !e.isLocked ? '<img src="images/action_void.gif" alt="Void Note" style="width: 25px; height: 25px;" onclick="shipmentNotesVoid(this)">' : ''}</th>
						</tr>
					</table>
				</th>
				<th id="notes-notes" style="text-align: center; font-weight: normal;">${e.freightrelease}</th>
				<th style="text-align: center; font-weight: normal;">${e.adduser} @ ${toDateString( e.adddate )} @ ${toTimeString( e.adddate )}</th>
				<th style="text-align: center; font-weight: normal;">${e.lastuser}</th>
				<th style="text-align: center; font-weight: normal;">${e.isVoided ? shipmentNotesVoidedByString( e ) : e.isLocked ? shipmentNotesLockedByString( e ) : 'ACTIVE'}</th>
			</tr>`
		)
	} )
}


function newNotesButtonEnable( f ) {
	$( '#21' ).prop( 'disabled', !f )
}


function saveShipmentNotes( notes ) {
	newNotesButtonEnable( false )

	$.ajax( {
		url: `dataentry.ashx?task=saveShipmentNotes&sqid=${$( "#sqid" ).val()}&uuid=${$( "#uuid" ).val()}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify( { notetype: $( "#notetype" ).val(), shipmentno: $( "#hbl" ).val(), freightrelease: notes, adduser: $( "#userid" ).val() } ),
		success: function ( response ) {
			if ( response.error ) {
				alert( `Failed inserting notes. ${response.message}` )
			}
			else {
				loadShipmentNotes()
			}
		},
		error: function ( error ) {
			console.error( 'Error:', error )
			alert( `Failed inserting notes. Please try later again!` )
		},
		complete: function () {
			newNotesButtonEnable( true )
		}
	} )
}


function loadShipmentNotes() {
	const sqid = $( "#sqid" ).val()
	const uuid = $( "#uuid" ).val()
	const shipmentno = $( "#hbl" ).val()

	$.ajax( {
		url: 'dataentry.ashx?task=loadShipmentNotes',
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, uuid, shipmentno },
		success: function ( res ) {
			setShipmentNotes( res )
		}
	} )
}


function updateShipmentNotes( id, notes, isLocked ) {
	$.ajax( {
		url: `dataentry.ashx?task=updateShipmentNotes&sqid=${$( "#sqid" ).val()}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify( { noteid: id, freightrelease: notes, lastuser: $( "#userid" ).val() } ),
		success: function ( response ) {
			if ( response.error ) {
				alert( `Failed updating notes. ${response.message}` )
			}
			else {
				if ( isLocked ) {
					lockShipmentNotes( id, notes, true )
				}
				else {
					loadShipmentNotes()
				}
			}
		},
		error: function ( error ) {
			console.error( 'Error:', error )
			alert( `Failed updating notes. Please try later again!` )
		},
		complete: function () {
		}
	} )
}


function lockShipmentNotes( id, notes, isLocked ) {
	$.ajax( {
		url: `dataentry.ashx?task=lockShipmentNotes&sqid=${$( "#sqid" ).val()}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify( { noteid: id, freightrelease: notes, lastuser: $( "#userid" ).val(), isLocked } ),
		success: function ( response ) {
			if ( response.error ) {
				alert( `Failed (un)locking notes. ${response.message}` )
			}
			else {
				loadShipmentNotes()
			}
		},
		error: function ( error ) {
			console.error( 'Error:', error )
			alert( `Failed (un)locking notes. Please try later again!` )
		},
		complete: function () {
		}
	} )
}


function voidShipmentNotes( id, notes, isVoided ) {
	$.ajax( {
		url: `dataentry.ashx?task=voidShipmentNotes&sqid=${$( "#sqid" ).val()}`,
		type: 'POST',
		contentType: 'application/json',
		data: JSON.stringify( { noteid: id, freightrelease: notes, lastuser: $( "#userid" ).val(), isVoided } ),
		success: function ( response ) {
			if ( response.error ) {
				alert( `Failed (un)voiding notes. ${response.message}` )
			}
			else {
				loadShipmentNotes()
			}
		},
		error: function ( error ) {
			console.error( 'Error:', error )
			alert( `Failed (un)voiding notes. Please try later again!` )
		},
		complete: function () {
		}
	} )
}


$( document ).ready( () => {
	$( '#new-note-dialog' ).dialog( {
		autoOpen: false,
		modal: true,
		//title: $( "#hbl" ).val(),
		width: 'auto',
		buttons: [
			{
				id: 0,
				text: "Cancel",
				click: function () {
					$( this ).dialog( "close" )
				}
			},
			{
				id: 1,
				text: "Save",
				click: function () {
					const id = $( this ).data( "id" )
					const notes = $( "#text-notes" ).val()

					if ( id == 0 ) {
						saveShipmentNotes( notes )
					}
					else {
						const op = $( this ).data( "op" )
						const state = $( this ).data( "state" )

						if ( op == "lock" ) {
							lockShipmentNotes( id, notes, !state )
						}
						else if ( op == "void" ) {
							voidShipmentNotes( id, notes, !state )
						}
						else {
							updateShipmentNotes( id, notes, $( this ).data( "is-locked" ) )
						}
					}

					$( this ).dialog( "close" )
				}
			}
		]
	} )

	$( '#21' ).on( 'click', () => {
		$( '#note-confirm-section' ).remove()
		$( '#new-note-dialog' ).data( 'id', 0 )
		$( '#new-note-dialog' ).dialog( 'option', 'title', $( "#hbl" ).val() )
		shipmentNotesEnableSave( true )
		$( '#text-notes' ).val( '' )
		$( '#text-notes' ).prop( 'disabled', false )
		$( '#new-note-dialog' ).dialog( 'open' )
	} )

	loadShipmentNotes()
} )
