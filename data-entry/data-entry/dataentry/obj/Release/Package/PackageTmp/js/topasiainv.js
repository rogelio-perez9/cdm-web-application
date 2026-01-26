function createInvoice() {
	const interval = setInterval(() => {
		const $bank = $('#bank'); // cache jQuery object
		if ($bank.length > 0) {
			const bankVal = $bank.val();
			if (bankVal !== null && bankVal !== undefined) {
				const dateTime = formatDateTime();
				createTopAsiaInvoice(dateTime);
				clearInterval(interval);
			}
		}
	}, 100);
}

function formatDateTime() {
	const now = new Date();

	const pad = (num) => num.toString().padStart(2, '0');

	const month = pad(now.getMonth() + 1);
	const day = pad(now.getDate());
	const year = now.getFullYear();
	const hours = pad(now.getHours());
	const minutes = pad(now.getMinutes());

	const formatDateOnly = `${month}/${day}/${year}`;
	const formatDateTime = `${month}/${day}/${year} @ ${hours}:${minutes}`;
	const rawDateTime = `${year}${month}${day}${hours}${minutes}`;

	return {
		dateOnly: formatDateOnly,
		dateTime: formatDateTime,
		rawDateTime: rawDateTime
	};
}
function createTopAsiaInvoice(dateTime) {
	const stationid = $('#stationid').val();
	const sqid = $('#sqid').val();
	const bank = $('#bank').val();
	const currId = $('#currid').val();
	const terms = $('#terms').val();

	const invno = $('#invno').val();
	const uuid = $('#RID').val();

	//const uuid = "00D1B295-8D61-4435-B3B9-87AA82C192AE";
	//const invno = "SGS25080004";

	const q = {
		sqid: sqid,
		sqid2: 'compliance',
		stationid: stationid,
		bank: bank,
		uuid: uuid,
		invno: invno,
		currId: currId,
		terms: terms,
		dateonly: dateTime.dateOnly,
		datetime: dateTime.dateTime,
		rawdatetime: dateTime.rawDateTime
	}


	$.ajax({
		url: `topasiainv.ashx${toQueryString(q)}`,
		type: 'GET',
		xhrFields: { responseType: 'blob' },
		success: function (data, status, xhr) {
			const headerName = xhr.getResponseHeader('X-Filename');
			const fileName = headerName ? decodeURIComponent(headerName) : 'document.pdf';

			const blob = new Blob([data], { type: 'application/pdf' });
			const url = URL.createObjectURL(blob);

			history.replaceState({ app: true }, "", location.href);
			history.pushState({ pdf: true }, "", location.href);

			document.body.innerHTML = "";
			document.body.style.margin = "0";
			document.body.style.height = "100vh";
			document.body.style.overflow = "hidden";

			const wrapper = document.createElement("div");
			wrapper.style.display = "flex";
			wrapper.style.flexDirection = "column";
			wrapper.style.height = "100vh";

			const btnContainer = document.createElement("div");
			btnContainer.style.display = "flex";
			btnContainer.style.justifyContent = "center";
			btnContainer.style.padding = "10px";
			btnContainer.style.background = "rgba(255,255,255,0.9)";

			const a = document.createElement('a');
			a.href = url;
			a.download = fileName;
			a.textContent = 'Download PDF';
			Object.assign(a.style, {
				padding: '8px 16px',
				background: '#fff',
				border: '1px solid #ccc',
				borderRadius: '6px',
				textDecoration: 'none',
				color: '#111',
				fontFamily: 'system-ui, sans-serif',
				fontSize: '14px',
				boxShadow: '0 2px 8px rgba(0,0,0,.15)'
			});

			btnContainer.appendChild(a);

			const iframe = document.createElement("iframe");
			iframe.src = url;
			iframe.style.width = "100%";
			iframe.style.flex = "1";
			iframe.style.border = "0";

			wrapper.appendChild(btnContainer);
			wrapper.appendChild(iframe);
			document.body.appendChild(wrapper);
		}
	});
}

window.addEventListener("popstate", (event) => {
	if (event.state && event.state.app) {
		location.reload();
		return;
	}

	if (!event.state && document.querySelector("iframe[src^='blob:']")) {
		location.reload();
	}
});

