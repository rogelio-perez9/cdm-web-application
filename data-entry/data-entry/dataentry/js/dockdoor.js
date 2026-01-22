var dockdoorTimer;
var fetchingDockDoor = false;
$(document).ready(function () {
    startTimer();
    $("#rr").on("change", function () {
        startTimer();
    });
    $("#wh").on("change", function () {
        startTimer();
    });
    $("#dd").on("change", function () {
        startTimer();
    });
    $("#tn").on("change", function () {
        startTimer();
    });
    $("#cn").on("change", function () {
        startTimer();
    });
    $(".dock-door-btn").on("click", function () {
        const dd = $(this).data('value');
        $("#dd").val(dd);
        startTimer();
    });
});

function startTimer() {
    if (dockdoorTimer)
        clearInterval(dockdoorTimer);
    const rr = $('#rr').val() || 15;
    loadDockDoors();
    dockdoorTimer = setInterval(loadDockDoors, rr * 1000);
}

function updateDD() {
    const dd = $("#dd").val();
    $(".dock-door-btn").each((i, el) => {
        $(el).removeClass('is-selected');
        const value = $(el).data('value');
        if (dd == value) {
            $(el).addClass('is-selected');
            setTimeout(() => { removeSelectedBackground(el) }, 500);
        }
    });
}

function loadDockDoors() {
    if (fetchingDockDoor) return;
    const wh = $('#wh').val();
    const dd = Number($('#dd').val()) || '';
    const tn = $('#tn').val();
    const cn = $('#cn').val();
    fetchingDockDoor = true;
    $.ajax({
        url: 'dock-door.ashx?task=getDockDoors',
        contentType: 'application/json; charset=utf-8',
        type: 'GET',
        data: {
            wh,
            dd,
            tn,
            cn
        },
        success: function (data) {
            reloadTable(data);
            fetchingDockDoor = false;
        },
        error: function () {
            alert('Wwoops something went wrong !');
            fetchingDockDoor = false;
        }
    })
}

function reloadTable(data) {
    const tBody = $('#dock-door-table tbody');
    tBody.html('');
    const dockdoorIDs = [];
    const warehouseIDs = [];
    const truckIDs = [];
    const containerIDs = [];
    data.forEach(item => {
        let tr = `<tr>`;
        tr += `<td></td>`;
        tr += `<td>${item.warehouse}</td>`;
        tr += `<td>${item.dockdoor}</td>`;
        tr += `<td>${item.truckid}</td>`;
        tr += `<td>${item.containerid}</td>`;
        tBody.append(tr);
        if (dockdoorIDs.indexOf(item.dockdoor) === -1) dockdoorIDs.push(item.dockdoor);
        if (warehouseIDs.indexOf(item.warehouse) === -1) warehouseIDs.push(item.warehouse);
        if (truckIDs.indexOf(item.truckid) === -1) truckIDs.push(item.truckid);
        if (containerIDs.indexOf(item.containerid) === -1) containerIDs.push(item.containerid);
    });
    reloadButtons(dockdoorIDs);
    reloadSelect("#dd", dockdoorIDs.sort());
    reloadSelect("#wh", warehouseIDs);
    reloadSelect("#tn", truckIDs);
    reloadSelect("#cn", containerIDs);
}

function reloadSelect(elementId, ids) {
    const el = $(elementId);
    const currentValue = el.val();
    el.empty();
    el.append($("<option></option>").attr("value", "").text(""));
    $.each(ids, function (key, value) {
        el.append($("<option></option>").attr("value", value).text(value));
    });
    el.val(currentValue);
}

function reloadButtons(ids) {
    $(".dock-door-btn").each((i, el) => {
        $(el).removeClass('is-matched');
        const value = String($(el).data('value'));
        if (ids.indexOf(value) !== -1) {
            $(el).addClass('is-matched');
            setTimeout(() => { removeSelectedBackground(el) }, 500);
        }
    });
}

function removeSelectedBackground(el) {
    $(el).removeClass('is-matched');
}