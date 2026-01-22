/* START SUBJECT STRING BUILDER */
let hblArray = [];
let invArray = [];

function addUnique(arr, val) {
	if (val && !arr.includes(val)) arr.push(val);
}
function removeValue(arr, val) {
	const i = arr.indexOf(val);
	if (i !== -1) arr.splice(i, 1);
}

function addRemoveInvoice($el, needJustRemove) {
	const value = $el.val();

	if (needJustRemove) {
		// remove any known values from this select that could be in invArray
		$el.find("option").each(function () {
			const optVal = $(this).val();
			if (optVal) removeValue(invArray, optVal);
		});
	} else {
		// Remove any prior option from this particular select, then add the new one
		$el.find("option").each(function () {
			const optVal = $(this).val();
			if (optVal) removeValue(invArray, optVal);
		});
		addUnique(invArray, value);
	}
}

function clearSubject() {
	$("#subject, [name='subject']").val("");
}

function hasAnyHblChecked() {
	return $("input[type='checkbox'][id^='hbl-']:checked").length > 0;
}

/* ==========================================
   ✅ ADDED: rebuild arrays from DOM (source of truth)
   - Fixes invoice dropdown changes (inv-###)
   - Ensures we only include invoices for CHECKED HBL rows
   ========================================== */
function syncArraysFromDom() {
	hblArray = [];
	invArray = [];

	const $checkedHbls = $("input[type='checkbox'][id^='hbl-']:checked");
	$checkedHbls.each(function () {
		const $hbl = $(this);
		const suffix = ($hbl.attr("id") || "").replace("hbl-", "");
		const hblVal = $hbl.val();

		addUnique(hblArray, hblVal);

		// Only include invoice for checked rows
		const $inv = $(`#inv-${suffix}`);
		if ($inv.length) addRemoveInvoice($inv, false);
	});
}

function subjectStringBuilderHandler(suffix, evt) {
	// Prefer the event target; fallback to guess by suffix if event isn't passed
	const $el = evt?.target
		? $(evt.target)
		: $(`#hbl-${suffix}, #inv-${suffix}`).first();

	if (!$el.length) return;

	/* ✅ CHANGED:
	   Gate ALL recalcs (including invoice dropdown changes) by:
	   - if no HBL checked => subject must be empty
	   Then rebuild arrays from DOM and recalc
	*/
	if (!hasAnyHblChecked()) {
		clearSubject();
		hblArray = [];
		invArray = [];
		return;
	}

	// Always keep arrays in sync with the UI state
	syncArraysFromDom();
	subjectStringBuilder(hblArray, invArray);
}

async function subjectStringBuilder(hblList, invList) {
	const h = (Array.isArray(hblList) && hblList.length > 0) ? hblList.join(", ") : "";
	const v = (Array.isArray(invList) && invList.length > 0) ? invList.join(", ") : "";

	// ✅ CHANGED: No HBL => subject must be empty (no base text)
	if (h === "") {
		clearSubject();
		return;
	}

	let subjectString = "";
	$("#subject, [name='subject']").val("");

	try {
		const response = await getShipmentDataForSubject(h);

		if (response && response.Result) {
			// Start Text (always when HBL exists)
			subjectString += "TOPOCEAN CONSOLIDATION SERVICE ARRIVAL NOTICE ";

			let ponosString = "";
			let invString = "";

			let uniquePonos = null;
			let uniqueConsName = null;
			let uniqueEta3 = null;
			let uniqueMbl = null;
			let uniquePolName = null;
			let uniquePolCode = null; // if Port Code is Checked (Origin code)
			let uniqueShipName = null;
			let uniqueDischargePortName = null; // if Discharge Port is Checked (PoulName)
			let uniquePoulCode = null; // if Port Code is Checked (Discharge port code)

			// PO NO (no duplicates)
			if (Array.isArray(response.Result.Ponos) && response.Result.Ponos.length > 0) {
				uniquePonos = [...new Set(response.Result.Ponos.map(p => p.trim()).filter(Boolean))];
				if (uniquePonos.length > 0) {
					ponosString = " - PO NO. " + uniquePonos.join(", ");
				}
			}

			// PCS (keep your original formatting / logic)
			let totalString = "";
			if (response.Result.Totals
				&& typeof response.Result.Totals.TotalQty !== "undefined"
				&& response.Result.Totals.TotalQty !== null
				&& response.Result.Totals.Uom
				&& response.Result.Totals.Uom.trim() !== ""
			) {
				// NOTE: keeping your original order: UOM then QTY
				totalString = ` - PCS: ${response.Result.Totals.Uom.trim()} ${response.Result.Totals.TotalQty}`;
			}

			// Container No. (new field; optional data)
			let containerNo = ""; // If Container No. is Checked
			// NOTE: You referenced Totals.Ctnrno. Keep it exactly as you had it.
			if (response.Result.Totals
				&& response.Result.Totals.Ctnrno
				&& response.Result.Totals.Ctnrno.trim() !== ""
			) {
				containerNo = ` - CONTAINER(S): ${response.Result.Totals.Ctnrno.trim()}`;
			}

			if (Array.isArray(response.Result.Shipments) && response.Result.Shipments.length > 0) {
				const s = response.Result.Shipments;

				uniqueConsName = [...new Set(s.map(x => x.ConsName?.trim()).filter(Boolean))];
				uniqueEta3 = [...new Set(s.map(x => x.Eta3?.trim()).filter(Boolean))];
				uniqueMbl = [...new Set(s.map(x => x.Mbl?.trim()).filter(Boolean))];
				uniquePolName = [...new Set(s.map(x => x.PolName?.trim()).filter(Boolean))];

				// New/optional fields if backend provides them
				uniquePolCode = [...new Set(s.map(x => x.PolCode?.trim()).filter(Boolean))];
				uniqueShipName = [...new Set(s.map(x => x.ShipName?.trim()).filter(Boolean))];
				uniqueDischargePortName = [...new Set(s.map(x => x.PoulName?.trim()).filter(Boolean))];
				uniquePoulCode = [...new Set(s.map(x => x.PoulCode?.trim()).filter(Boolean))];
			}

			/* ✅ CHANGED:
			   Invoice behavior matches your original idea:
			   - if user selects inv-### => include it
			   - if user clears inv-### => remove it
			   (No dependency on #sinv checkbox)
			*/
			if (v !== "") {
				invString = ` - INVOICE NO.: ${v}`;
			}

			/* ==========================================
			   ✅ New rules for non-dynamic checkboxes:
			   - Only include sections when their checkbox is checked
			   (sshipname, sorigin, spcs, sctnrno, spoulname, spoulcode)
			   ========================================== */
			const isShipperChecked = $("#sshipname").is(":checked");
			const isOriginChecked = $("#sorigin").is(":checked");
			const isPcsChecked = $("#spcs").is(":checked");
			const isContainerChecked = $("#sctnrno").is(":checked");
			const isDischargePortChecked = $("#spoulname").is(":checked");
			const isPortCodeChecked = $("#spoulcode").is(":checked");

			// Build base (always when HBL exists)
			subjectString += ` - HBOL ${h}`;

			if (uniqueMbl && uniqueMbl.length) subjectString += ` - MBOL ${uniqueMbl.join(", ")}`;
			if (ponosString) subjectString += ponosString;
			if (uniqueEta3 && uniqueEta3.length) subjectString += ` - ETA ${uniqueEta3.join(", ")}`;
			if (uniqueConsName && uniqueConsName.length) subjectString += ` - CONSIGNEE: ${uniqueConsName.join(", ")}`;

			// SHIPPER (only if checked)
			if (isShipperChecked && uniqueShipName && uniqueShipName.length) {
				subjectString += ` - SHIPPER: ${uniqueShipName.join(", ")}`;
			}

			// ORIGIN (only if checked)
			if (isOriginChecked && uniquePolName && uniquePolName.length) {
				let originText = uniquePolName.join(", ");

				// If port code checked and PolCode exists, append as "(CODE)"
				if (isPortCodeChecked && uniquePolCode && uniquePolCode.length) {
					originText += ` (${uniquePolCode.join(", ")})`;
				}

				subjectString += ` - ORIGIN: ${originText}`;
			}

			// PCS (only if checked)
			if (isPcsChecked && totalString) {
				subjectString += totalString;
			}

			// DISCHARGE PORT (only if checked)
			if (isDischargePortChecked && uniqueDischargePortName && uniqueDischargePortName.length) {
				let dischargeText = uniqueDischargePortName.join(", ");

				// If port code checked and PoulCode exists, append as "(CODE)"
				if (isPortCodeChecked && uniquePoulCode && uniquePoulCode.length) {
					dischargeText += ` (${uniquePoulCode.join(", ")})`;
				}

				subjectString += ` - DISCHARGE PORT: ${dischargeText}`;
			}

			// INVOICE (driven by dropdown selection)
			if (invString) subjectString += invString;

			// CONTAINER(S) (only if checked)
			if (isContainerChecked && containerNo) {
				subjectString += containerNo;
			}
		}

		$("#subject, [name='subject']").val(subjectString);

	} catch (err) {
		console.error("Error fetching shipment data:", err);
		clearSubject();
		return null;
	}
}

function getShipmentDataForSubject(hblValues) {
	const q = {
		task: "getShipmentDataForSubject",
		sqid: $("#sqid").val(),
		hblValues: hblValues
	};

	// Return a Promise
	return new Promise((resolve, reject) => {
		$.ajax({
			url: `dataentry.ashx${toQueryString(q)}`,
			type: "GET",
			contentType: "application/json",
			success: function (response) {
				resolve(response); // ✅ return server result
			},
			error: function (xhr, status, error) {
				reject({ status, error, responseText: xhr.responseText });
			}
		});
	});
}

function initSubjectStringBuilderOnLoad() {
	// ✅ CHANGED: Always start empty on load (no base text by default)
	clearSubject();

	// Reset arrays
	hblArray = [];
	invArray = [];

	// Only build if there is at least one dynamic HBL checked
	if (!hasAnyHblChecked()) return;

	// ✅ CHANGED: sync from DOM + build (handles invoices too)
	syncArraysFromDom();
	subjectStringBuilder(hblArray, invArray);
}

$(document).ready(function () {
	// ✅ CHANGED: remove default "ARRIVAL NOTICE" on load; only show if we calculate
	clearSubject();

	// ✅ Build on load only if any dynamic HBL checkbox is checked
	initSubjectStringBuilderOnLoad();

	// (Non-dynamic checkboxes become read-only after load, so no bindings needed)
});

/* END SUBJECT STRING BUILDER */
