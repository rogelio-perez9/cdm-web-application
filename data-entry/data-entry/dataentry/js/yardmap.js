var yardmapTimer;
var fetchingYardMaps = false;
$(document).ready(function () {
    startYardMapTimer();
    $("#rr").on("change", function () {
        startYardMapTimer();
    });
    $("#yard").on("change", function () {
        startYardMapTimer();
    });
    $("#location").on("change", function () {
        startYardMapTimer();
    });
    $("#at").on("change", function () {
        startYardMapTimer();
    });
    $("#ad").on("change", function () {
        startYardMapTimer();
    });
    $(".yard-map-btn").on("click", function () {
        const dd = $(this).data('value');
        $("#location").val(dd);
        startYardMapTimer();
    });
});

function startYardMapTimer() {
    if (yardmapTimer)
        clearInterval(yardmapTimer);
    const rr = $('#rr').val() || 15;
    loadYardMaps();
    yardmapTimer = setInterval(loadYardMaps, rr * 1000);
}


function loadYardMaps() {
    if (fetchingYardMaps) return;
    const location = $('#location').val();
    const yard = $('#yard').val() || '';
    const at = $('#at').val();
    const ad = $('#ad').val();
    fetchingYardMaps = true;
    $.ajax({
        url: 'yard-map.ashx?task=getYardMaps',
        contentType: 'application/json; charset=utf-8',
        type: 'GET',
        data: {
            yard,
            location,
            at,
            ad
        },
        success: function (data) {
            reloadYardMapTable(data);
            fetchingYardMaps = false;
        },
        error: function () {
            alert('Wwoops something went wrong !');
            fetchingYardMaps = false;
        }
    })
}

function reloadYardMapTable(data) {
    const tBody = $('#yard-maps-table tbody');
    tBody.html('');
    const yardmapIDs = [];
    const locationIDs = [];
    const atIDs = [];
    const adIDs = [];
    data.forEach(item => {
        let tr = `<tr>`;
        tr += `<td></td>`;
        tr += `<td>${item.yard}</td>`;
        tr += `<td style="text-align:center;">${item.location}</td>`;
        tr += `<td>${item.assettype}</td>`;
        tr += `<td>${item.assetdesc}</td>`;
        tBody.append(tr);
        if (yardmapIDs.indexOf(item.yard) === -1) yardmapIDs.push(item.yard);
        if (locationIDs.indexOf(item.location) === -1) locationIDs.push(item.location);
        if (atIDs.indexOf(item.assettype) === -1) atIDs.push(item.assettype);
        if (adIDs.indexOf(item.assetdesc) === -1) adIDs.push(item.assetdesc);
    });
    reloadButtons(locationIDs);
    reloadYardMapSelect("#yard", yardmapIDs);
    reloadYardMapSelect("#location", locationIDs.sort());
    reloadYardMapSelect("#at", atIDs);
    reloadYardMapSelect("#ad", adIDs);
}

function reloadYardMapSelect(elementId, ids) {
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
    $(".yard-map-btn").each((i, el) => {
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