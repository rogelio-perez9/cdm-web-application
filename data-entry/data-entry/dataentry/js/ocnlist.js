// Get previous notes saved by recid (uuid)
function GetNotesByRecid(rowNumber) {
	const parameters = {
		task: 'getNotesByRecid',
		recid: $(`#recid${rowNumber}`).val(),
		sqid: $('#sqid').val()
	};

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

			// Keep original layout (text stays left, row height unchanged)
			// Add a tight trash icon on the right
			return `
      <tr class="note-row ${cssClass}" data-note-idx="${idx}">
        <td class="cell head-line">Created by: ${note.AddUser} - ${note.AddDate}
Last Update By:${note.LastUser} - ${note.LastDate}
			<button type="button" class="trash-btn" aria-label="Delete note" title="Delete note" id="deleteBtn">
				<svg class="trash-icon" viewBox="0 0 24 24" aria-hidden="true">
					<path d="M9 3h6a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-1l-1.1 13.2A2 2 0 0 1 14.9 24H9.1a2 2 0 0 1-1.99-1.8L6 8H5a1 1 0 0 1 0-2h4V4a1 1 0 0 1 1-1Zm2 3h2V5h-2v1Zm-1.9 7.3a1 1 0 0 1 1.1.9l.45 6.8a1 1 0 1 1-2 .2l-.45-6.8a1 1 0 0 1 .9-1.1Zm5.8 0a1 1 0 0 1 .9 1.1l-.45 6.8a1 1 0 1 1-2-.2l.45-6.8a1 1 0 0 1 1.1-.9Z"/>
				</svg>
			</button>
		</td>
      </tr>
      <tr class="note-row ${cssClass}" data-note-idx="${idx}">
        <td class="cell body-line">${note.CsNotes}</td>
		<input type="hidden" id="noteId" value="${note.NoteId}" />
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
			<h2 id="notesModalTitle">${hblValue} Notes.</h2>
			<button class="x-close" aria-label="Close">&times;</button>
		  </div>

		  <div class="field">
			<textarea id="notesArea" placeholder="Type your notes here..."></textarea>
			<input type="hidden" id="isDelete" value="false" />

			<!-- NEW: hidden boolean flag (default false). Turns true when user enters "update mode". -->
			<input type="hidden" id="isUpdateHidden" value="false" />
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
		  padding: 7px 12px;
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

		/* NEW: hover hand */
		.note-row:hover .cell { cursor: pointer; }

		/* NEW: trash icon (tight button, bigger icon), does not affect row height */
		.trash-btn{
			float: right;
			margin-right: 10px;
			margin-left: 10px;
			padding: 0;            /* small click area */
			width: 16px;           /* tight footprint */
			height: 16px;
			border: none;
			background: transparent;
			cursor: pointer;
			line-height: 0;        /* avoids line-box growth */
		}
		.trash-btn:hover { background: rgba(0,0,0,0.08); border-radius: 4px; }

		.trash-icon{
			width: 20px;           /* bigger icon */
			height: 20px;
			display: block;
			fill: currentColor;     /* blends with row color/text */
			pointer-events: none;   /* click stays on button */
		}

		/* =======================================================
		   NEW: Delete warning popup styles (ONLY ADD, no changes)
		   ======================================================= */
		#deleteWarningDiv{
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.55);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
		}
		.delete-warning-modal{
			width: min(520px, 92vw);
			background: #fff;
			border-radius: 10px;
			box-shadow: 0 14px 40px rgba(0,0,0,0.35);
			padding: 14px 16px;
			font-family: Arial, sans-serif;
		}
		.delete-warning-header{
			display: flex;
			align-items: flex-start;
			gap: 10px;
		}
		.delete-warning-icon{
			font-size: 22px;
			line-height: 1;
			margin-top: 1px;
		}
		.delete-warning-title-wrap{
			flex: 1;
		}
		.delete-warning-title{
			font-size: 16px;
			font-weight: 800;
			margin: 0;
		}
		.delete-warning-subtitle{
			margin-top: 2px;
			font-size: 13px;
			color: #444;
		}
		.delete-warning-x{
			border: none;
			background: transparent;
			font-size: 22px;
			line-height: 1;
			cursor: pointer;
			padding: 4px 8px;
			border-radius: 4px;
		}
		.delete-warning-x:hover{
			background: rgba(0,0,0,0.08);
		}
		.delete-warning-body{
			margin-top: 10px;
			padding: 10px 12px;
			border: 1px solid #f0c36d;
			background: #fff7e6;
			border-radius: 8px;
			font-size: 13px;
			color: #333;
		}
		.delete-warning-actions{
			display: flex;
			gap: 10px;
			justify-content: flex-end;
			margin-top: 12px;
		}
	  `;
		document.head.appendChild(style);
		document.body.appendChild(overlay);

		// Focus textarea on open
		const $ta = $("#notesArea");
		setTimeout(() => $ta.trigger("focus"), 0);

		const modalEl = overlay.querySelector(".notes-modal");
		modalEl.addEventListener("click", e => e.stopPropagation());
		overlay.addEventListener("click", () => { });

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

		// NEW: click any note row => load note.CsNotes into textarea + change Save -> Update + set hidden flag true
		$("#notesTbody").on("click", "tr.note-row", function () {
			const idx = Number($(this).data("note-idx"));
			const noteText = (noteList && noteList[idx] && noteList[idx].CsNotes) ? noteList[idx].CsNotes : "";

			$("#notesArea").val(noteText).trigger("input").trigger("focus");
			$("#saveBtn").text("Update");

			// default is "false"; when selecting a note we enter update mode
			$("#isUpdateHidden").val("true");

			// store correct noteId for update on the textarea (no UI changes)
			const $row = $(this);
			const $noteIdInput = $row.find("#noteId").length ? $row.find("#noteId") : $row.next("tr").find("#noteId");
			const clickedNoteId = ($noteIdInput.val() || "").toString().trim();
			$("#notesArea").data("noteid", clickedNoteId);
		});

		// =====================================================
		// Trash click => Warning popup + DELETE CALL
		// FIXED BUG: noteId was being read with $("#noteId").val() (always first one).
		// Now we capture the correct noteId from the clicked row, then delete on Accept.
		// =====================================================
		$("#notesTbody").on("click", "#deleteBtn", function (e) {
			e.preventDefault();
			e.stopPropagation();

			if (document.getElementById("deleteWarningDiv")) return;

			// Grab the correct noteId for THIS trash click:
			// deleteBtn is in the head-line <tr>, noteId hidden is in the NEXT <tr>
			const $headRow = $(this).closest("tr");
			const selectedNoteId = $headRow.next("tr").find("#noteId").val();

			const warnOverlay = document.createElement("div");
			warnOverlay.id = "deleteWarningDiv";
			warnOverlay.innerHTML = `
				<div class="delete-warning-modal" role="dialog" aria-modal="true" aria-labelledby="deleteWarningTitle" tabindex="-1">
					<div class="delete-warning-header">
						<div class="delete-warning-icon" aria-hidden="true">⚠️</div>
						<div class="delete-warning-title-wrap">
							<div id="deleteWarningTitle" class="delete-warning-title">Confirmation</div>
							<div class="delete-warning-subtitle">Are you sure you want to delete this record?</div>
						</div>
						<button type="button" class="delete-warning-x" aria-label="Close">&times;</button>
					</div>

					<div class="delete-warning-body">
						This action will mark the record for deletion and cannot be undone.
					</div>

					<div class="delete-warning-actions">
						<button type="button" id="deleteWarnAcceptBtn" class="btn btn-primary">Ok</button>
						<button type="button" id="deleteWarnCancelBtn" class="btn btn-secondary">Cancel</button>
					</div>
				</div>
			`;

			document.body.appendChild(warnOverlay);

			const warnModalEl = warnOverlay.querySelector(".delete-warning-modal");
			warnModalEl.addEventListener("click", ev => ev.stopPropagation());

			function closeWarnOnly() {
				warnOverlay.remove();
			}

			// Cancel / X => close ONLY warning
			warnOverlay.querySelector("#deleteWarnCancelBtn").addEventListener("click", function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				closeWarnOnly();
			});
			warnOverlay.querySelector(".delete-warning-x").addEventListener("click", function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				closeWarnOnly();
			});

			// Accept => set isDelete=true ONLY here, then DELETE
			warnOverlay.querySelector("#deleteWarnAcceptBtn").addEventListener("click", function (ev) {
				ev.preventDefault();
				ev.stopPropagation();

				$("#isDelete").val("true");

				const uuid = $(`#recid${rowNumber}`).val();
				const sqid = $('#sqid').val();
				const entry = $(`#hbl${rowNumber}`).val();
				const user = $('#userdet').val();

				const noteId = selectedNoteId;
				const isDelete = true;

				$.ajax({
					url: `dataentry.ashx?task=deleteNotesByRecid&sqid=${sqid}&uuid=${encodeURIComponent(uuid)}&isDelete=${isDelete}&noteId=${encodeURIComponent(noteId)}&entry=${entry}&user=${user}`,
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					success: function () {
						closeWarnOnly();
						closeModal();
					},
					error: function (xhr, status, error) {
						console.error("Delete failed:", status, error, xhr.responseText);
						closeWarnOnly();
						closeModal();
					}
				});
			});

			// Click outside => close ONLY warning (treat as cancel)
			warnOverlay.addEventListener("click", function () {
				closeWarnOnly();
			});

			// Focus accept for quick confirm
			setTimeout(() => warnOverlay.querySelector("#deleteWarnAcceptBtn").focus(), 0);
		});

		$("#saveBtn").on("click", function () {
			const isUpdateMode = ($("#isUpdateHidden").val() === "true");

			let noteId = "0";
			const storedNoteId = $("#notesArea").data("noteid");
			if (isUpdateMode && storedNoteId !== undefined && storedNoteId !== null && String(storedNoteId).trim() !== "") {
				noteId = String(storedNoteId).trim();
			}

			const body = {
				uuid: $(`#recid${rowNumber}`).val(),
				shipmentno: $(`#hbl${rowNumber}`).val(),
				csnotes: $('#notesArea').val(),
				adduser: $('#userdet').val(),
				isUpdate: isUpdateMode,
				noteId: noteId,
			};
			const sqid = $('#sqid').val();

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
	catch (error) {
		console.error('Error fetching notes.', error);
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
	overlay.addEventListener("click", () => { });

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


// Tooltip Notes
/* ==========================================
   Notes Tooltip (JS/jQuery only)
   - No HTML changes required
   - Content reads from data-lastuser / data-lastdate if present
	 (otherwise shows N/A for now; we’ll wire real values later)
   ========================================== */
(function initNotesTooltip() {
	// Avoid double-init
	if (window.__notesTooltipInitialized) return;
	window.__notesTooltipInitialized = true;

	// 1) Inject styles (only once)
	if (!document.getElementById("notesTooltipStyle")) {
		const style = document.createElement("style");
		style.id = "notesTooltipStyle";
		style.textContent = `
			/* Notes tooltip (warning/confirmation vibe) */
			#notesTooltip {
				position: absolute;
				min-width: 240px;
				max-width: 360px;
				background: #fff;
				border-radius: 10px;
				box-shadow: 0 14px 40px rgba(0,0,0,0.35);
				padding: 12px 14px;
				font-family: Arial, sans-serif;
				z-index: 10001;
				border: 1px solid rgba(0,0,0,0.08);

				opacity: 0;
				visibility: hidden;
				transform: translateY(4px);
				transition: opacity 0.12s ease, transform 0.12s ease, visibility 0.12s ease;
				pointer-events: none; /* IMPORTANT: does not block click */
			}
			#notesTooltip.is-visible {
				opacity: 1;
				visibility: visible;
				transform: translateY(0);
			}
			#notesTooltip .nt-header {
				display: flex;
				align-items: flex-start;
				gap: 10px;
				margin-bottom: 8px;
			}
			#notesTooltip .nt-icon {
				font-size: 18px;
				line-height: 1;
				margin-top: 1px;
			}
			#notesTooltip .nt-title {
				font-size: 13px;
				font-weight: 800;
				margin: 0;
			}
			#notesTooltip .nt-body {
				font-size: 12px;
				color: #333;
				border: 1px solid #f0c36d;
				background: #fff7e6;
				border-radius: 8px;
				padding: 10px 10px;

				/* CHANGED: allow wrapping so text doesn't overflow */
				white-space: normal;
				overflow-wrap: anywhere;
				word-break: break-word;
			}
			#notesTooltip .nt-body strong { font-weight: 800; }
			#notesTooltip .nt-arrow {
				position: absolute;
				width: 0; height: 0;
				border-left: 7px solid transparent;
				border-right: 7px solid transparent;
				border-top: 7px solid #fff;
				filter: drop-shadow(0 2px 1px rgba(0,0,0,0.12));
			}
		`;
		document.head.appendChild(style);
	}

	// 2) Create tooltip element once
	let $tip = $("#notesTooltip");
	if ($tip.length === 0) {
		$("body").append(`
			<div id="notesTooltip" role="tooltip" aria-hidden="true">
				<div class="nt-header">
					<div class="nt-icon" aria-hidden="true">👤</div>
					<div class="nt-title">Last Update</div>
				</div>

				<!-- CHANGED BODY LAYOUT:
				     Bold label on first line, user on next line, date on next line -->
				<div class="nt-body">
					<strong>Last Updated by:</strong><br>
					<span class="nt-user">N/A</span><br>
					<span class="nt-date">N/A</span>
				</div>

				<div class="nt-arrow" aria-hidden="true"></div>
			</div>
		`);
		$tip = $("#notesTooltip");
	}

	let currentEl = null;

	function setTooltipContent(lastUser, lastDate) {
		$tip.find(".nt-user").text(lastUser || "N/A");
		$tip.find(".nt-date").text(lastDate || "N/A");
	}

	function positionTooltip(el) {
		if (!el) return;

		const $el = $(el);
		const off = $el.offset();
		if (!off) return;

		const elW = $el.outerWidth();
		const elH = $el.outerHeight();

		// temp show to measure
		$tip.css({ left: -9999, top: -9999 }).addClass("is-visible");
		const tipW = $tip.outerWidth();
		const tipH = $tip.outerHeight();
		$tip.removeClass("is-visible");

		// Prefer above center
		let left = off.left + (elW / 2) - (tipW / 2);
		let top = off.top - tipH - 10;

		// Clamp within viewport (nice)
		const pad = 8;
		const winLeft = $(window).scrollLeft();
		const winTop = $(window).scrollTop();
		const winW = $(window).width();
		const winH = $(window).height();

		const minLeft = winLeft + pad;
		const maxLeft = winLeft + winW - tipW - pad;

		left = Math.max(minLeft, Math.min(left, maxLeft));

		// If not enough space above, show below
		const hasSpaceAbove = top >= winTop + pad;
		if (!hasSpaceAbove) {
			top = off.top + elH + 10;
		}

		$tip.css({ left, top });

		// Arrow positioning
		const arrow = $tip.find(".nt-arrow")[0];
		if (arrow) {
			// place arrow at top or bottom depending on placement
			if (!hasSpaceAbove) {
				// tooltip below element => arrow on top pointing up (use border-top, flip)
				arrow.style.borderTopColor = "transparent";
				arrow.style.borderBottom = "7px solid #fff";
				arrow.style.borderLeft = "7px solid transparent";
				arrow.style.borderRight = "7px solid transparent";
				arrow.style.top = "-7px";
				arrow.style.bottom = "auto";
			} else {
				// tooltip above => arrow on bottom pointing down
				arrow.style.borderBottom = "none";
				arrow.style.borderTop = "7px solid #fff";
				arrow.style.borderLeft = "7px solid transparent";
				arrow.style.borderRight = "7px solid transparent";
				arrow.style.bottom = "-7px";
				arrow.style.top = "auto";
			}

			// arrow horizontally aligned to element center (clamped)
			const elCenter = off.left + elW / 2;
			const tipLeft = left;
			let arrowLeft = elCenter - tipLeft - 7; // 7 = half arrow base
			arrowLeft = Math.max(14, Math.min(arrowLeft, tipW - 14));
			arrow.style.left = `${arrowLeft}px`;
		}
	}

	async function showTooltip(el) {
		currentEl = el;

		const args = getNotesArgsFromIcon(el);
		const rowNumber = args ? args.row : null;
		if (!rowNumber) return;

		let lastUser = "N/A";
		let lastDate = "N/A";

		try {
			// GetNotesByRecid returns a LIST (may not be ordered)
			const noteDetails = await GetNotesByRecid(rowNumber);

			if (Array.isArray(noteDetails) && noteDetails.length > 0) {
				// Pick the item with the MAX (most recent) LastDate (fallback to AddDate)
				const best = noteDetails.reduce((acc, cur) => {
					const curRaw = (cur && (cur.LastDate || cur.AddDate)) ? (cur.LastDate || cur.AddDate) : "";
					const accRaw = (acc && (acc.LastDate || acc.AddDate)) ? (acc.LastDate || acc.AddDate) : "";

					const curTime = curRaw ? Date.parse(curRaw) : NaN;
					const accTime = accRaw ? Date.parse(accRaw) : NaN;

					// If acc is empty/invalid, take cur when cur is valid
					if (!acc || (isNaN(accTime) && !isNaN(curTime))) return cur;

					// If cur is invalid, keep acc
					if (isNaN(curTime)) return acc;

					// Compare timestamps
					return curTime > accTime ? cur : acc;
				}, null);

				if (best) {
					lastUser = best.LastUser || best.AddUser || "N/A";
					lastDate = best.LastDate || best.AddDate || "N/A";
				}
			}
		} catch (err) {
			console.error("Tooltip notes fetch failed:", err);
		}

		setTooltipContent(lastUser, lastDate);
		positionTooltip(el);

		$tip.addClass("is-visible").attr("aria-hidden", "false");
	}


	function hideTooltip() {
		currentEl = null;
		$tip.removeClass("is-visible").attr("aria-hidden", "true");
	}

	// 3) Wire hover on the Notes icon (no HTML changes required)
	$(document).on("mouseenter", 'img[alt="Notes"][src*="notes.gif"]', function () {
		$(this).css("cursor", "pointer");
		showTooltip(this);
	});

	$(document).on("mouseleave", 'img[alt="Notes"][src*="notes.gif"]', function () {
		hideTooltip();
	});

	// Keep tooltip aligned on scroll/resize while visible
	$(window).on("scroll.notesTooltip resize.notesTooltip", function () {
		if (currentEl && $tip.hasClass("is-visible")) {
			positionTooltip(currentEl);
		}
	});
})();



function getNotesArgsFromIcon(imgEl) {
	if (!imgEl) return null;

	const onclick = imgEl.getAttribute("onclick");
	if (!onclick) return null;

	const m = onclick.match(/openNotesModal\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]*)['"]\s*\)/);
	if (!m) return null;

	return { row: m[1], hbl: m[2] };
}


$(document).on("mouseenter", 'img[alt="Notes"][src*="notes.gif"]', function () {
	const args = getNotesArgsFromIcon(this);
});