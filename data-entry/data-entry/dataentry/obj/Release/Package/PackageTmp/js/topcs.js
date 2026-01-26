var selectedId
var loading = false
var saving = false
var hourOptions = ""
var minuteOptions = ""

function replaceBlank( d ) {
	if ( d.includes( '1900' ) ) return ''
	return d
}

function onLoadContaiers( uuid ) {
	selectedId = uuid
	const sqid = $( "#sqid" ).val()
	if ( !uuid || !sqid ) return
	const mbl = $( `#container_tr_${uuid} .mbl` ).val()
	const hbl = $( `#container_tr_${uuid} .hbl` ).val()
	loading = true
	$.ajax( {
		url: `dataentry.ashx?task=getContainerRows`,
		contentType: "application/json; charset=utf-8",
		type: 'GET',
		data: { sqid, uuid },
		success: function ( res ) {
			let temp = `<tr id="container_expand_tr_${uuid}"><td colspan=29><div class="expand-div" id="container_update_div_${uuid}"><table class="expand_table" id="container_update_table_${uuid}"></table></div></td></tr>`
			$( temp ).insertAfter( $( `#container_tr_${uuid}` ) )
			const table = $( `#container_update_table_${uuid}` )
			temp = `<tr>
					<td class="container-table-th" nowrap>Select</td>
					<td class="container-table-th" nowrap>MBL</td>
					<td class="container-table-th" nowrap>HBL</td>
					<td class="container-table-th" nowrap>Customs Rls</td>
					<td class="container-table-th" nowrap>Exam</td>
					<td class="container-table-th" nowrap>Container No.</td>
					<td class="container-table-th" nowrap>Pickup No.</td>
					<td class="container-table-th" nowrap>Discharge Date</td>
					<td class="container-table-th" nowrap>Terminal Appt</td>
					<td class="container-table-th" nowrap>On Rail Date</td>
					<td class="container-table-th" nowrap>ETA Ramp</td>
					<td class="container-table-th" nowrap>ATA Ramp</td>
					<td class="container-table-th" nowrap>LFD to Customer</td>
					<td class="container-table-th" nowrap>Out Gate</td>
					<td class="container-table-th" nowrap>Per Diem LFD</td>
					<td class="container-table-th" nowrap>ETA Door</td>
					<td class="container-table-th" nowrap>Appt Time</td>
					<td class="container-table-th" nowrap>Final ATA Door</td>
					<td class="container-table-th" nowrap>Empty Return</td>
					<td class="container-table-th" nowrap>Container Usage</td>
				</tr>`
			table.append( temp )
			if ( Array.isArray( res ) && res.length > 0 ) {
				res.forEach( ( item, ind ) => {
					const n = ind + 1
					const nn = String( n ).padStart( 2, '0' )
					temp = `<tr data-ctnrno="${item.ctnrno}"><td class="container-table-td" nowrap><input type='checkbox' id="se${nn}" name="se${nn}" value="${nn}"></td>
							<td class="container-table-td" nowrap><input type='text' id="mb${nn}" name="mb${nn}" size="20" maxlength="20" value="${mbl}" READONLY></td>
							<td class="container-table-td" nowrap><input type='text' id="hb${nn}" name="hb${nn}" size="20" maxlength="20" value="${hbl}" READONLY></td>
							<td class="container-table-td" nowrap><input type='checkbox' id="cr${nn}" name="cr${nn}" ${item.cusrel == '1' ? 'checked' : ''}></td>
							<td class="container-table-td" nowrap><input type='checkbox' id="ex${nn}" name="ex${nn}" ${item.exam == '1' ? 'checked' : ''}></td>
							<td class="container-table-td" nowrap><input type='text' id="ct${nn}" name="ct${nn}" size="12" maxlength="12" value="${replaceBlank( item.ctnrno )}" READONLY></td>
							<td class="container-table-td" nowrap><input type='text' id="pu${nn}" name="pu${nn}" size="12" maxlength="12" value="${replaceBlank( item.pickno )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="ds${nn}" name="ds${nn}" size="10" maxlength="10" value="${replaceBlank( item.discdate )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="th${nn}" name="th${nn}" size="10" maxlength="10" value="${replaceBlank( item.tapptdate )}"> @ <select name="tt1${nn}" id="tt1${nn}">${hourOptions}</select>:<select name="tt2${nn}" id="tt2${nn}">${minuteOptions}</select></td>
							<td class="container-table-td" nowrap><input type='text' id="or${nn}" name="or${nn}" size="10" maxlength="10" value="${replaceBlank( item.onrdate )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="er${nn}" name="er${nn}" size="10" maxlength="10" value="${replaceBlank( item.rampdate1 )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="ar${nn}" name="ar${nn}" size="10" maxlength="10" value="${replaceBlank( item.rampdate2 )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="lc${nn}" name="lc${nn}" size="10" maxlength="10" value="${replaceBlank( item.lfdcust )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="og${nn}" name="og${nn}" size="10" maxlength="10" value="${replaceBlank( item.gateoutdate )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="pl${nn}" name="pl${nn}" size="10" maxlength="10" value="${replaceBlank( item.pdlfd )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="ed${nn}" name="ed${nn}" size="10" maxlength="10" value="${replaceBlank( item.etadoor1 )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="ad${nn}" name="ad${nn}" size="10" maxlength="10" value="${replaceBlank( item.apptdate )}"> @ <select name="at1${nn}" id="at1${nn}">${hourOptions}</select>:<select name="at2${nn}" id="at2${nn}">${minuteOptions}</select></td>
							<td class="container-table-td" nowrap><input type='text' id="fa${nn}" name="fa${nn}" size="10" maxlength="10" value="${replaceBlank( item.etadoor2 )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="em${nn}" name="em${nn}" size="10" maxlength="10" value="${replaceBlank( item.empretdate )}"></td>
							<td class="container-table-td" nowrap><input type='text' id="cu${nn}" name="cu${nn}" size="5" maxlength="5" value="0"></td></tr>`
					table.append( temp )
					$( `#ds${nn}` ).datepicker()
					$( `#or${nn}` ).datepicker()
					$( `#er${nn}` ).datepicker()
					$( `#th${nn}` ).datepicker()
					$( `#ar${nn}` ).datepicker()
					$( `#lc${nn}` ).datepicker()
					$( `#og${nn}` ).datepicker()
					$( `#pl${nn}` ).datepicker()
					$( `#ed${nn}` ).datepicker()
					$( `#ad${nn}` ).datepicker()
					$( `#fa${nn}` ).datepicker()
					$( `#em${nn}` ).datepicker()
					const tappttime = item.tappttime || '0000'
					const appttime = item.appttime || '0000'
					$( `#tt1${nn}` ).val( tappttime.substring( 0, 2 ) )
					$( `#tt2${nn}` ).val( tappttime.substring( 2 ) )
					$( `#at1${nn}` ).val( appttime.substring( 0, 2 ) )
					$( `#at2${nn}` ).val( appttime.substring( 2 ) )
					let er = new Date( item.empretdate )
					let og = new Date( item.gateoutdate )
					let differenceInTime = er.getTime() - og.getTime()
					let differenceInDays = Math.round( differenceInTime / ( 1000 * 3600 * 24 ) + 1 )
					if ( differenceInDays < 0 ) {
						differenceInDays = 0
					}
					$( `#cu${nn}` ).val( differenceInDays )
				} )
				temp = `<tr><td style="text-align:left;font-size:10px;background:#ffff33;" colspan=20><input type="button" value=" S A V E " class="container-table-btn" onclick="onSaveContainers()">&nbsp;&nbsp;<input type="button"value=" C A N C E L " class="container-table-btn" onclick="onCancelContainers()"></td></tr>`
				table.append( temp )
				temp = `<div class="expand-div"><table class="expand_table" id="container_bulk_update_table_${uuid}"></table></div>`
				$( temp ).insertAfter( $( `#container_update_div_${uuid}` ) )
				const table2 = $( `#container_bulk_update_table_${uuid}` )
				temp = `<tr><th class="container-bulk-table-th" nowrap colspan=14>BULK UPDATE</th></tr>`
				temp += `<tr>
					<th class="container-bulk-table-td" nowrap>Update All</th>
					<th class="container-bulk-table-td" nowrap>Customs File</th>
					<th class="container-bulk-table-td" nowrap>Exam</th>
					<th class="container-bulk-table-td" nowrap>Discharge Date</th>
					<th class="container-bulk-table-td" nowrap>On Rail Date</th>
					<th class="container-bulk-table-td" nowrap>ETA Ramp</th>
					<th class="container-bulk-table-td" nowrap>ATA Ramp</th>
					<th class="container-bulk-table-td" nowrap>LFD to Customer</th>
					<th class="container-bulk-table-td" nowrap>Out Gate</th>
					<th class="container-bulk-table-td" nowrap>Per Diem LFD</th>
					<th class="container-bulk-table-td" nowrap>ETA Door</th>
					<th class="container-bulk-table-td" nowrap>Appt Time</th>
					<th class="container-bulk-table-td" nowrap>Final ATA Door</th>
					<th class="container-bulk-table-td" nowrap>Empty Return</th>
				</tr>`
				temp += `<tr>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="uaon" name="uaon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="cfon" name="cfon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="exon" name="exon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="ddon" name="ddon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="oron" name="oron" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="eron" name="eron" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="aron" name="aron" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="lcon" name="lcon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="ogon" name="ogon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="plon" name="plon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="edon" name="edon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="apon" name="apon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="faon" name="faon" class="active-switch"></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="emon" name="emon" class="active-switch"></th>
				</tr>`
				temp += `<tr>
					<th class="container-bulk-table-td" nowrap>&nbsp;</th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="cf"  name="cf" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='checkbox' id="ex"  name="ex" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="dd"  name="dd"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="or"  name="or"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="er"  name="er"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="ar"  name="ar"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="lc"  name="lc"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="og"  name="og"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="pl"  name="pl"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="ed"  name="ed"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="apd" name="apd" size="10" maxlength="10" disabled> @ <select name="apt1" id="apt1" disabled>${hourOptions}</select>:<select name="apt2" id="apt2" disabled>${minuteOptions}</select></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="fa"  name="fa"  size="10" maxlength="10" disabled></th>
					<th class="container-bulk-table-td" nowrap><input type='text'     id="em"  name="em"  size="10" maxlength="10" disabled></th>
				</tr>`
				temp += `<tr>
					<th style="text-align:left;font-size:10px;background-color:#ffff33;" colspan=20>
						<input type="button" value=" B U L K * S A V E " class="container-table-btn" onclick="onBulkSave()">
						&nbsp;&nbsp;
						<input type="button" value=" C A N C E L " class="container-table-btn" onclick="onCancelContainers()">
					</th>
				</tr>`
				table2.append( temp )
				const bulkFields = ['cf', 'ex', 'dd', 'or', 'er', 'ar', 'lc', 'og', 'pl', 'ed', 'fa', 'em']
				const apFields = ['apd', 'apt1', 'apt2']
				const calendarFields = ['dd', 'or', 'er', 'ar', 'lc', 'og', 'pl', 'ed', 'apd', 'fa', 'em']
				calendarFields.forEach( item => {
					$( `#${item}` ).datepicker()
				} )
				$( '.active-switch' ).on( 'change', function () {
					const id = $( this ).attr( 'id' )
					const isChecked = $( this ).is( ':checked' )
					const fieldId = id.substring( 0, 2 )
					if ( id == 'uaon' ) {
						bulkFields.forEach( item => {
							$( `#${item}on` ).prop( 'checked', isChecked )
							$( `#${item}` ).prop( 'disabled', !isChecked )
						} )
						$( `#apon` ).prop( 'checked', isChecked )
						apFields.forEach( item => {
							$( `#${item}` ).prop( 'disabled', !isChecked )
						} )
					} else if ( id == 'apon' ) {
						apFields.forEach( item => {
							$( `#${item}` ).prop( 'disabled', !isChecked )
						} )
					} else {
						$( `#${fieldId}` ).prop( 'disabled', !isChecked )
					}
				} )
			}
		},
		complete: function () {
			loading = false
		}
	} )
}

function onSaveContainers() {
	if ( saving ) return
	const sqid = $( "#sqid" ).val()
	let ctype = $( `#container_tr_${selectedId} input[class="ctype"]` ).val()
	let containers = []

	$( `#container_update_table_${selectedId} tr` ).each( function ( index ) {
		const nn = String( index ).padStart( 2, '0' )
		const ctnrno = $( this ).data( 'ctnrno' )
		const checked = $( `#se${nn}` ).is( ':checked' )
		if ( ctnrno && checked ) {
			const container = {
				uuid: selectedId,
				ctnrno,
				cusrel: $( `#cr${nn}` ).is( ':checked' ) ? 1 : 0,
				exam: $( `#ex${nn}` ).is( ':checked' ) ? 1 : 0,
				pickno: $( `#pu${nn}` ).val(),
				discdate: $( `#ds${nn}` ).val(),
				tapptdate: $( `#th${nn}` ).val(),
				tappttime: $( `#tt1${nn}` ).val() + $( `#tt2${nn}` ).val(),
				onrdate: $( `#or${nn}` ).val(),
				rampdate1: $( `#er${nn}` ).val(),
				rampdate2: $( `#ar${nn}` ).val(),
				lfdcust: $( `#lc${nn}` ).val(),
				gateoutdate: $( `#og${nn}` ).val(),
				pdlfd: $( `#pl${nn}` ).val(),
				etadoor1: $( `#ed${nn}` ).val(),
				apptdate: $( `#ad${nn}` ).val(),
				appttime: $( `#at1${nn}` ).val() + $( `#at2${nn}` ).val(),
				etadoor2: $( `#fa${nn}` ).val(),
				empretdate: $( `#em${nn}` ).val(),
				ctype: ctype
			}
			containers.push( container )
		}
	} )

	if ( containers.length > 0 ) {
		saving = true
		$.ajax( {
			url: `dataentry.ashx?task=updateContainerRowsEx&sqid=${sqid}`,
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify( containers ),
			success: function ( response ) {
				console.log( 'Server Response:', response )
				if ( response.error ) {
					alert( `Failed updating. Please try later again!` )
				} else {
					onCancelContainers()
				}
			},
			error: function ( error ) {
				console.error( 'Error:', error )
				alert( `Failed updating. Please try later again!` )
			},
			complete: function () {
				saving = false
			}
		} )
	}
}

function onBulkSave() {
	if ( saving ) return
	const sqid = $( "#sqid" ).val()
	let ctype = $( `#container_tr_${selectedId} input[class="ctype"]` ).val()

	const bulkFields = ['cf', 'ex', 'dd', 'or', 'er', 'ar', 'lc', 'og', 'pl', 'ed', 'ap', 'fa', 'em']
	const tableFields = ['cusrel', 'exam', 'discdate', 'onrdate', 'rampdate1', 'rampdate2', 'lfdcust', 'gateoutdate', 'pdlfd', 'etadoor1', 'apptdate', 'etadoor2', 'empretdate']
	let data = new FormData()
	let n = 0
	data.append( 'uuid', selectedId )
	data.append( 'ctype', ctype )

	bulkFields.forEach( ( item, index ) => {
		const isChecked = $( `#${item}on` ).is( ':checked' )
		if ( isChecked ) {
			const val = $( `#${item}` ).val()
			if ( item == 'ap' ) {
				data.append( 'apptdate', $( `#apd` ).val() )
				data.append( 'appttime', $( `#apt1` ).val() + $( `#apt2` ).val() )
				n += 1
			} else if ( item == 'cf' || item == 'ex' ) {
				data.append( tableFields[index], $( `#${item}` ).is( ':checked' ) ? '1' : '0' )
				n += 1
			} else {
				if ( val ) data.append( tableFields[index], val )
				n += 1
			}
		}
	} )

	if ( n == 0 ) return
	saving = true

	$.ajax( {
		type: 'POST',
		url: 'dataentry.ashx?task=updateBulkContainersEx&sqid=' + sqid,
		contentType: false,
		processData: false,
		data: data,
		success: function ( response ) {
			console.log( 'Server Response:', response )
			if ( response.error ) {
				alert( `Failed updating. Please try later again!` )
			} else {
				const uuid = selectedId
				onCancelContainers()
				onLoadContaiers( uuid )
			}
		},
		error: function ( err ) {
			alert( `Failed updating. Please try later again!` )
		},
		complete: function () {
			saving = false
		}
	} )
}

function onCancelContainers() {
	$( `#container_expand_tr_${selectedId}` ).remove()
	selectedId = undefined
}

$( document ).ready( function () {
	for ( i = 0; i < 24; i++ ) {
		const h = String( i ).padStart( 2, '0' )
		hourOptions += `<option value="${h}">${h}</option>`
	}
	for ( i = 0; i < 60; i++ ) {
		const m = String( i ).padStart( 2, '0' )
		minuteOptions += `<option value="${m}">${m}</option>`
	}
	$( '.container-edit-btn' ).on( 'click', function () {
		if ( loading ) return
		$( `#container_expand_tr_${selectedId}` ).remove()
		const recid = $( this ).parents( 'tr' ).data( 'recid' )
		onLoadContaiers( recid )
	} )
})

// Get previous notes saved by recid (uuid)
function GetNotesByRecid(rowNumber) {
	const parameters = {
		task: 'getNotesByRecid'
		, recid : $(`#recid${rowNumber}`).val()
		, sqid: $('#sqid').val()
	}

	return $.ajax({
		url: `dataentry.ashx${toQueryString(parameters)}`,
		type: 'GET',
		contentType: 'application/json'
	});
}

function buildNotesRows(notes) {
	return (!notes || notes.length == 0) ?
		`<tr>
			<td></td>
		 </tr>`
		: notes.map((note, idx) => {
		const cssClass = (idx % 2 === 0) ? "neonBlue" : "white";
		return `
      <tr class="note-row ${cssClass}">
        <td class="cell head-line">${note.AddUser} - ${note.AddDate}</td>
      </tr>
      <tr class="note-row ${cssClass}">
        <td class="cell body-line">${note.CsNotes}</td>
      </tr>
    `;
	}).join("");
}

async function openNotesModal(rowNumber) {
	try {
		const hblValue = $(`#hbl${rowNumber}`).val();
		const noteList = await GetNotesByRecid(rowNumber);

		if (document.getElementById("notesModalDiv")) return;

		const overlay = document.createElement("div");
		overlay.id = "notesModalDiv";
		overlay.innerHTML = `
		<div class="notes-modal" role="dialog" aria-modal="true" aria-labelledby="notesModalTitle" tabindex="-1">
		  <div class="modal-header">
			<h2 id="notesModalTitle">Notes to ${hblValue}</h2>
			<button class="x-close" aria-label="Close">&times;</button>
		  </div>

		  <div class="field">
			<textarea id="notesArea" placeholder="Type your notes here..."></textarea>
		  </div>

		  <div class="btn-row">
			<button id="saveBtn" class="btn btn-primary" disabled>Save</button>
			<button id="cancelBtn" class="btn btn-secondary">Cancel</button>
		  </div>

		  <div class="list-header">Previous Notes</div>
		  <div class="notes-table-wrap">
			<table class="notes-table" aria-label="Previous notes">
			  <tbody id="notesTbody">
				${buildNotesRows(noteList)}
			  </tbody>
			</table>
		  </div>
		</div>
	  `;

		const style = document.createElement("style");
		style.textContent = `
		#notesModalDiv {
		  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
		  display: flex; align-items: center; justify-content: center; z-index: 9999;
		}
		.notes-modal {
		  width: min(640px, 92vw); max-height: 86vh; overflow: hidden;
		  background: #fff; border-radius: 8px; padding: 16px 20px;
		  box-shadow: 0 8px 28px rgba(0,0,0,0.25);
		  font-family: Arial, sans-serif;
		}
		.modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 8px; }
		.modal-header h2 { margin: 0; font-size: 18px; }
		.x-close {
		  border: none; background: transparent; font-size: 22px; line-height: 1;
		  cursor: pointer; padding: 4px 8px; border-radius: 4px;
		}
		.x-close:hover { background: #f0f0f0; }

		.field { margin: 10px 0 12px 0; }
		.label { display:block; font-weight: 600; margin-bottom: 6px; }
		#notesArea {
		  width: 100%; min-height: 120px; box-sizing: border-box;
		  padding: 8px; border:1px solid #ccc; border-radius:4px; resize: vertical;
		}

		.btn-row { display:flex; gap:10px; margin-top: 12px; justify-content: flex-end; }
		.btn {
		  min-width: 120px;
		  padding: 10px 14px;
		  border: 1px solid #666;
		  border-radius: 4px;
		  cursor: pointer;
		  font-weight: 600;
		  color: #222;
		  background: #f7f7f7;
		  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
		}
		.btn:hover { background: #ededed; border-color: #555; }
		.btn:active { box-shadow: inset 0 1px 2px rgba(0,0,0,0.15); }
		.btn-primary   { background: #e6ecf5; border-color: #495a75; }
		.btn-primary:hover { background: #d8e1ef; }
		.btn-secondary { background: #f2f2f2; border-color: #7a7a7a; }
		.btn-secondary:hover { background: #e8e8e8; }

		.list-header { margin-top: 14px; font-weight: bold; }

		/* Scrollable table area */
		.notes-table-wrap {
		  margin-top: 8px;
		  max-height: 40vh; /* adjust as needed */
		  overflow-y: auto;
		  border: 1px solid #ddd;
		  border-radius: 6px;
		}

		.notes-table {
		  width: 100%;
		  border-collapse: separate;
		  border-spacing: 0;
		  table-layout: fixed;
		}

		.note-row .cell {
		  padding: 10px 12px;
		  word-wrap: break-word;
		  white-space: pre-wrap;
		}

		.note-row .head-line { border-bottom: none; }
		.note-row .body-line { border-bottom: 1px solid #d3d3d3; }

		.notes-table tr:last-child .body-line { border-bottom: none; }

		.note-row.neonBlue  .cell { background: #1589FF; color:#000000; }
		.note-row.white .cell { background: #FFFFFF; color:#000000; }

		.head-line { font-weight: 700; }
		.body-line { font-weight: 400; }

		/* Disabled state for buttons */
		.btn:disabled,
		.btn[disabled] {
			background: #e0e0e0;   /* light gray background */
			border-color: #b0b0b0; /* muted border */
			color: #777777;        /* dimmed text */
			cursor: not-allowed;
			opacity: 0.9;
		}

		.btn:disabled:hover {
			background: #e0e0e0;
			border-color: #b0b0b0;
		}
	  `;
		document.head.appendChild(style);
		document.body.appendChild(overlay);

		// Focus textarea on open
		const $ta = $("#notesArea");
		setTimeout(() => $ta.trigger("focus"), 0);

		const modalEl = overlay.querySelector(".notes-modal");
		modalEl.addEventListener("click", e => e.stopPropagation());
		overlay.addEventListener("click", () => {});

		function closeModal() {
			overlay.remove();
			style.remove();
		}
		$(".x-close, #cancelBtn").on("click", closeModal);

		// Disable/enable Save button based on textarea content
		const $saveBtn = $("#saveBtn");
		$ta.on("input", function () {
			const val = $(this).val().trim();
			$saveBtn.prop("disabled", val.length === 0);
		});

		
		$("#saveBtn").on("click", function () {
			const body = {
				uuid: $(`#recid${rowNumber}`).val(),
				shipmentno: $(`#hbl${rowNumber}`).val(),
				csnotes: $('#notesArea').val(),
				adduser: $('#userdet').val(),
			};
			const sqid = $('#sqid').val()

			$.ajax({
				url: `dataentry.ashx?task=saveNotesByRecid&sqid=${sqid}`,
				type: "POST",
				data: JSON.stringify(body),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function () {
					closeModal();
				},
				error: function (xhr, status, error) {
					console.error("Save failed:", status, error, xhr.responseText);
					closeModal();
				}
			});
		});

		// Block ESC closing (keep modal open). Comment out to allow ESC close.
		$(document).on("keydown.notesEsc", (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
			}
		});
	}
	catch (error)
	{
		console.error('Error fetching notes.', error)
	}
}


// Open Close File Modal
function openCloseFileModal(rowNumber) {
	if (document.getElementById("closeFileModalDiv")) return;

	const hblValue = $(`#hbl${rowNumber}`).val();

	const overlay = document.createElement("div");
	overlay.id = "closeFileModalDiv";
	overlay.innerHTML = `
    <div class="close-file-modal" role="dialog" aria-modal="true" aria-labelledby="closeFileModalTitle" tabindex="-1">
      <div class="modal-header">
        <h2 id="closeFileModalTitle">Close File</h2>
        <button class="x-close" aria-label="Close">&times;</button>
      </div>

      <div class="confirm-row">
        <label class="confirm-label">
          <span class="confirm-text">Do you want to Close HBL <strong>${hblValue}</strong>?</span>
          <input type="checkbox" id="confirmClose" />
        </label>
      </div>

      <div class="btn-row">
        <button id="saveBtn" class="btn btn-primary" disabled>Save</button>
        <button id="cancelBtn" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `;

	const style = document.createElement("style");
	style.textContent = `
    #closeFileModalDiv {
      position: fixed; inset: 0; background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }

    .close-file-modal {
      width: min(340px, 92vw);
      height: 200px;
      background: #fff; border-radius: 8px; padding: 16px 20px;
      box-shadow: 0 8px 28px rgba(0,0,0,0.25);
      font-family: Arial, sans-serif;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
    .modal-header h2 { margin: 0; font-size: 18px; }
    .x-close {
      border: none; background: transparent; font-size: 22px; line-height: 1;
      cursor: pointer; padding: 4px 8px; border-radius: 4px;
    }
    .x-close:hover { background: #f0f0f0; }

    .confirm-row { margin: 8px 0 6px 0; }
    .confirm-label { display:flex; align-items:center; justify-content:space-between; font-weight:600; }
    .confirm-text { font-size: 14px; }
    #confirmClose { margin-left: 0px; }

    .btn-row { display:flex; gap:10px; margin-top: 14px; justify-content: flex-end; }
    .btn {
      min-width: 120px;
      padding: 10px 14px;
      border: 1px solid #666;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      color: #222;
      background: #f7f7f7;
      transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .btn:hover { background: #ededed; border-color: #555; }
    .btn:active { box-shadow: inset 0 1px 2px rgba(0,0,0,0.15); }
    .btn-primary   { background: #e6ecf5; border-color: #495a75; }
    .btn-primary:hover { background: #d8e1ef; }
    .btn-secondary { background: #f2f2f2; border-color: #7a7a7a; }
    .btn-secondary:hover { background: #e8e8e8; }

    /* Disabled state for buttons */
    .btn:disabled,
    .btn[disabled] {
      background: #e0e0e0;
      border-color: #b0b0b0;
      color: #777777;
      cursor: not-allowed;
      opacity: 0.9;
    }
    .btn:disabled:hover {
      background: #e0e0e0;
      border-color: #b0b0b0;
    }
  `;
	document.head.appendChild(style);
	document.body.appendChild(overlay);

	const modalEl = overlay.querySelector(".close-file-modal");
	modalEl.addEventListener("click", e => e.stopPropagation());
	overlay.addEventListener("click", () => {});

	function closeModal() {
		overlay.remove();
		style.remove();
	}
	$(".x-close, #cancelBtn").on("click", closeModal);

	const $saveBtn = $("#saveBtn");
	$("#confirmClose").on("change", function () {
		$saveBtn.prop("disabled", !this.checked);
	});

	$("#saveBtn").on("click", function () {
		const body = {
			uuid: $(`#recid${rowNumber}`).val(),
			upduser: $("#userdet").val(),
		};
		const sqid = $("#sqid").val();

		$.ajax({
			url: `dataentry.ashx?task=closeFileByRecid&sqid=${sqid}`,
			type: "POST",
			data: JSON.stringify(body),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function () {
				closeModal();
			},
			error: function (xhr, status, error) {
				console.error("Close failed:", status, error, xhr.responseText);
				closeModal();
			}
		});
	});

	// Block ESC close
	$(document).on("keydown.closeFileEsc", (e) => {
		if (e.key === "Escape") {
			e.preventDefault();
		}
	});
}







