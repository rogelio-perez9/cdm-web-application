
function loadPackages(compid) {
    if (compid.length === 0) return;
    $.ajax({
        url: 'PackageLookUp.ashx?task=getpackages',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { compid: compid },
        success: function (res) {
            $('#package').empty().append(`<option value="">SELECT FROM LIST</option>`);
            res.forEach(function (item) {
                $('#package').append(`<option value="${item.pkgdetid}">${item.packagename}</option>`);
            });
            $('#package').val(packagevalue).trigger("change");
            packagevalue = '';
        },
        error: function (errorText) {
            alert("Wwoops something went wrong !");

        }
    }).fail(function (e) {
        console.log("failed");
    });
}

function loadPackage(pkgdetid) {
    if (!pkgdetid) {
        $('#assets_table tr.asset_row').remove();
        addAssetRow(1);
        $('#nonrfid_table tr.nonrfid_row').remove();
        addNonrfidRow(1);
        return;
    }
    $.ajax({
        url: 'PackageLookUp.ashx?task=getpackageDetails',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { pkgdetid: pkgdetid },
        success: function (res) {
            $('#assets_table tr.asset_row').remove();
            res.forEach(function (item, i) {
                addAssetRow(i + 1, false, item.itemqty, item.itemdesc, item.itemassetid);
            });

        },
        error: function (errorText) {
            alert("Wwoops something went wrong !");

        }
    }).fail(function (e) {
        console.log("failed");
    });

    $.ajax({
        url: 'PackageLookUp.ashx?task=getpackageMiscs',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { pkgdetid: pkgdetid },
        success: function (res) {
            $('#nonrfid_table tr.nonrfid_row').remove();
            res.forEach(function (item, i) {
                addNonrfidRow(i + 1, false, item.miscqty, item.miscdesc);
            });

        },
        error: function (errorText) {
            alert("Wwoops something went wrong !");

        }
    }).fail(function (e) {
        console.log("failed");
    });
}

function loadAssetDetails(recid) {
    if (!recid) return;
    $.ajax({
        url: 'PackageLookUp.ashx?task=getAssetDetails',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { recid: recid },
        success: function (res) {
            if (res.length > 0) $('#assets_table tr.asset_row').remove();
            res.forEach(function (item, i) {
                addAssetRow(i + 1, false, item.itemqty, item.itemdesc, item.itemassetid);
            });

        },
        error: function (errorText) {
            alert("Wwoops something went wrong !");

        }
    }).fail(function (e) {
        console.log("failed");
    });
}

function loadAPIs() {
    const apiRows = $('#loadout_table tr.api_row');
    if (!apiRows) addAPIRow(1);
    //var rowCount = document.getElementById('api_table').rows.length;
    //var APIs = new Array();
    //var a = 1;
    //for (i = 0; i < (rowCount - 1); i++) {
    //    APIs[i] = a.toString();
    //    a++;
    //}

    /*
    if (APIs.length === 0) addAPIRow(1);
    else {
        //$('#loadout_table tr.api_row').remove();
        APIs.forEach(function (item, i) {
            addAPIRow(i + 1, false, item);
        });
    }*/
}

function checkPkg() {
    if ($("#newpkg").is(":checked")) {
        $("#prompt_modal").modal({
            escapeClose: false,
            clickClose: false,
            showClose: false
        });
        return false;
    }
}

function delAsset(id) {
    $('#' + id).remove();
}

function delNonrfid(id) {
    $('#' + id).remove();
}

function delAPI(id) {
    $('#' + id).remove();
}

function addAssetDetail() {
    const last_row = $("#assets_table tr.asset_add").prev();
    if (!last_row.hasClass("asset_row")) {
        addAssetRow(1);
        return;
    }
    const qty = last_row.find(".qtynnn").val();
    const desc = last_row.find(".descnnn").val();
    if (qty.length === 0 || desc.length === 0 || parseInt(qty) < 1)
        return false;
    const id = last_row.attr('id')
    const nnn = id.substring(id.length - 3);
    if (last_row.hasClass('asset_new_row')) last_row.removeClass('asset_new_row');
    const newid = parseInt(nnn) + 1;
    addAssetRow(newid);
}

function addAssetRow(ind, isnew = true, qty = "", desc = "", assetid = "") {
    const id = ind.toString().padStart(3, '0');
    let tr = "";
    tr += `<tr class="asset_row ${isnew ? 'asset_new_row' : ''}" id="asset_detail_${id}">`;
    tr += `<th style="text-align:center;"><input type="number" size="5" placeholder="*" class="qtynnn" id="qty${id}" name="qty${id}" value="${qty}" style="text-align:right;">`;
    tr += `<th style="text-align:center;"><div class="descnnn-wrapper"><input type="text" size="50" placeholder="*" class="descnnn" id="desc${id}" name="desc${id}" value="${desc}">&nbsp;`;
    tr += `<img src="images/trash.gif" onclick="delAsset('asset_detail_${id}')">`;
    tr += `<input type="hidden" id="aid${id}" name="aid${id}" value="${assetid}"></div></th>`;
    tr += "</tr>";
    $('#assets_table tr.asset_add').before(tr);

    const descnnn = desc ? $('<textarea />').html(desc).text() : "";
    const preDest = descnnn ? [{ id: '99999999', assetdescription: descnnn }] : [];
    $(`#desc${id}`).tokenInput("PackageLookUp.ashx?task=getitemdescs", {
        propertyToSearch: "assetdescription",
        minChars: 2,
        preventDuplicates: true,
        tokenLimit: 1,
        prePopulate: preDest,
        onAdd: function (item) {
            const assetdescription = $('<textarea />').html(item.assetdescription).text();
            $(`#desc${id}`).val(assetdescription);
            $(`#aid${id}`).val(item.assetid);
            addAssetDetail();
            return true;
        },
        onDelete: function () {
            $(`#desc${id}`).val('');
        },
        onReady: function () {
            $(`#desc${id}`).val(descnnn);
        }
    });

}

function addNonrfidDetail() {
    const last_row = $("#nonrfid_table tr.nonrfid_add").prev();
    if (!last_row.hasClass("nonrfid_row")) {
        addNonrfidRow(1);
        return;
    }
    const qty = last_row.find(".miscqtynnn").val();
    const desc = last_row.find(".miscdescnnn").val();
    if (qty.length === 0 || desc.length === 0 || parseInt(qty) < 1)
        return false;
    const id = last_row.attr('id')
    const nnn = id.substring(id.length - 3);
    if (last_row.hasClass('nonrfid_new_row')) last_row.removeClass('nonrfid_new_row');
    const newid = parseInt(nnn) + 1;
    addNonrfidRow(newid);
}

function addNonrfidRow(ind, isnew = true, qty = "", desc = "") {
    const id = ind.toString().padStart(3, '0');
    let tr = "";
    tr += `<tr class="nonrfid_row ${isnew ? 'nonrfid_new_row' : ''}" id="nonrfid_detail_${id}">`;
    tr += `<th style="text-align:center;"><input type="text" size="50" placeholder="*" class="miscdescnnn" id="miscdesc${id}" name="miscdesc${id}" value="${desc}">`;
    tr += `<th style="text-align:center;"><div class="descnnn-wrapper"><input type="number" size="5" placeholder="*" class="miscqtynnn" id="miscqty${id}" name="miscqty${id}" value="${qty}" style="text-align:right;">&nbsp;`;
    tr += `<img src="images/trash.gif" onclick="delNonrfid('nonrfid_detail_${id}')">`;
    tr += `</div></th>`;
    tr += "</tr>";
    $('#nonrfid_table tr.nonrfid_add').before(tr);
}


function addAPI() {
    const last_row = $("#loadout_table tr.api_add").prev();
    if (!last_row.hasClass("api_row")) {
        addAPIRow(1);
        return;
    }
    const apinonn = last_row.find(".apinonn").val();
    if (apinonn.length === 0)
        return false;
    const id = last_row.attr('id')
    const nn = id.substring(id.length - 2);
    if (last_row.hasClass('api_new_row')) last_row.removeClass('api_new_row');
    const newid = parseInt(nn) + 1;
    addAPIRow(newid);
}

function addAPIRow(ind, isnew = true, APINO = "") {
    const id = ind.toString().padStart(2, '0');
    let tr = "";
    tr += `<tr class="api_row ${isnew ? 'api_new_row' : ''}" id="api_detail_${id}">`;
    tr += `<th colspan="2">`;
    tr += `<table>`;
    tr += `<tr>`;
    tr += `<th>API No.</th>`;
    tr += `<th><input class="apinonn" name="apino${id}" id="apino${id}" type="text" size="15" value="${APINO}" onchange="loadAPIDetail('${id}')">&nbsp;`;
    tr += `<img src="images/trash.gif" onclick="delAPI('api_detail_${id}')"></th>`;
    tr += `<tr>`;
    tr += `<tr>`;
    tr += `<th>Operator</th>`;
    tr += `<th><input name="apiop${id}" id="apiop${id}" type="text" size="45" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>Well Name</th>`;
    tr += `<th><input name="apiwell${id}" id="apiwell${id}" type="text" size="45" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>Well No.</th>`;
    tr += `<th><input name="apiwellno${id}" id="apiwellno${id}" type="text" size="10" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>County/Parish</th>`;
    tr += `<th><input name="apicty${id}" id="apicty${id}" type="text" size="45" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>State</th>`;
    tr += `<th>`;
    tr += `<select id="apist${id}" name="apist${id}" size="1">`;
    tr += `<option value=""></option>`;
    tr += `<option value="ALABAMA">ALABAMA</option>`;
    tr += `<option value="ALASKA">ALASKA</option>`;
    tr += `<option value="ARIZONA">ARIZONA</option>`;
    tr += `<option value="ARKANSAS">ARKANSAS</option>`;
    tr += `<option value="CALIFORNIA">CALIFORNIA</option>`;
    tr += `<option value="COLORADO">COLORADO</option>`;
    tr += `<option value="CONNECTICUT">CONNECTICUT</option>`;
    tr += `<option value="DELAWARE">DELAWARE</option>`;
    tr += `<option value="FLORIDA">FLORIDA</option>`;
    tr += `<option value="GEORGIA">GEORGIA</option>`;
    tr += `<option value="HAWAII">HAWAII</option>`;
    tr += `<option value="IDAHO">IDAHO</option>`;
    tr += `<option value="ILLINOIS">ILLINOIS</option>`;
    tr += `<option value="INDIANA">INDIANA</option>`;
    tr += `<option value="IOWA">IOWA</option>`;
    tr += `<option value="KANSAS">KANSAS</option>`;
    tr += `<option value="KENTUCKY">KENTUCKY</option>`;
    tr += `<option value="LOUISIANA">LOUISIANA</option>`;
    tr += `<option value="MAINE">MAINE</option>`;
    tr += `<option value="MARYLAND">MARYLAND</option>`;
    tr += `<option value="MASSACHUSETTS">MASSACHUSETTS</option>`;
    tr += `<option value="MICHIGAN">MICHIGAN</option>`;
    tr += `<option value="MINNESOTA">MINNESOTA</option>`;
    tr += `<option value="MISSISSIPPI">MISSISSIPPI</option>`;
    tr += `<option value="MISSOURI">MISSOURI</option>`;
    tr += `<option value="MONTANA">MONTANA</option>`;
    tr += `<option value="NEBRASKA">NEBRASKA</option>`;
    tr += `<option value="NEVEDA">NEVEDA</option>`;
    tr += `<option value="NEW HAMPSHIRE">NEW HAMPSHIRE</option>`;
    tr += `<option value="NEW JERSEY">NEW JERSEY</option>`;
    tr += `<option value="NEW MEXICO">NEW MEXICO</option>`;
    tr += `<option value="NEW YORK">NEW YORK</option>`;
    tr += `<option value="NORTH CAROLINA">NORTH CAROLINA</option>`;
    tr += `<option value="NORTH DAKOTA">NORTH DAKOTA</option>`;
    tr += `<option value="OHIO">OHIO</option>`;
    tr += `<option value="OKLAHOMA">OKLAHOMA</option>`;
    tr += `<option value="OREGON">OREGON</option>`;
    tr += `<option value="PENNSYLVANIA">PENNSYLVANIA</option>`;
    tr += `<option value="RHODE ISLAND">RHODE ISLAND</option>`;
    tr += `<option value="SOUTH CAROLINA">SOUTH CAROLINA</option>`;
    tr += `<option value="SOUTH DAKOTA">SOUTH DAKOTA</option>`;
    tr += `<option value="TENNESSEE">TENNESSEE</option>`;
    tr += `<option value="TEXAS">TEXAS</option>`;
    tr += `<option value="UTAH">UTAH</option>`;
    tr += `<option value="VERMONT">VERMONT</option>`;
    tr += `<option value="VIRGINIA">VIRGINIA</option>`;
    tr += `<option value="WASHINGTON">WASHINGTON</option>`;
    tr += `<option value="WEST VIRGINIA">WEST VIRGINIA</option>`;
    tr += `<option value="WISCONSIN">WISCONSIN</option>`;
    tr += `<option value="WYOMING">WYOMING</option>`;
    tr += `</select>`;
    tr += `</th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>GPS Latitude</th>`;
    tr += `<th><input name="apilat${id}" id="apilat${id}" type="text" size="15" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th>GPS Longitude</th>`;
    tr += `<th><input name="apilong${id}" id="apilong${id}" type="text" size="15" value=""></th>`;
    tr += `</tr>`;
    tr += `<tr>`;
    tr += `<th colspan=2><hr></th>`;
    tr += `</tr>`;
    tr += `</table>`;
    tr += `</th>`;
    tr += `</tr>`;

    $('#loadout_table tr.api_add').before(tr);
    loadAPIDetail(id);
}

function loadAPIDetail(id) {
    const apino = $(`#apino${id}`).val().padEnd(14, '0');
    if (apino) {
        $.ajax({
            url: 'PackageLookUp.ashx?task=getapi',
            contentType: "application/json; charset=utf-8",
            type: 'GET',
            data: { apino: apino },
            success: function (res) {
                const wellData = res.Well_Data[0];
                if (wellData.operator) {
                    $(`#apiop${id}`).val(wellData.operator);
                    $(`#apiwell${id}`).val(wellData.wellname);
                    $(`#apiwellno${id}`).val(wellData.WellNumber);
                    $(`#apicty${id}`).val(wellData.county);
                    $(`#apist${id}`).val(wellData.state);
                    $(`#apilat${id}`).val(wellData.latitude);
                    $(`#apilong${id}`).val(wellData.longitude);
                } else {
                    console.log("response", res);
                }
            }
        }).fail(function (e) {
            console.log("failed");
        });
    }
}

function checkForDuplicates(array) {
    let valuesAlreadySeen = []

    for (let i = 0; i < array.length; i++) {
        let value = array[i]
        if (valuesAlreadySeen.indexOf(value) !== -1) {
            return true
        }
        valuesAlreadySeen.push(value)
    }
    return false
}