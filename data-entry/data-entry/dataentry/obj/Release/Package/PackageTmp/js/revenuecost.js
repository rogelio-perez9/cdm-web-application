var selectedRevenue;
var selectedRevenueRow;
var selectedCost;
var selectedCostRow;


function initCombineAutoComplete(config, params = '') {
    if ($(`#${config.fieldId}`).is('[readonly]')) return;
    const initValue = $(`#${config.fieldId}`).val();
    const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : [];
    const sqid = $("#sqid").val();
    if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
        console.error('Missing the required params');
        return false;
    }
    let requestUrl = config.url + "?task=" + config.task + "&sqid=" + sqid;
    if (params)
        requestUrl += params;
    $("#" + config.fieldId).tokenInput(requestUrl, {
        queryParam: config.queryParam || 'q',
        propertyToSearch: config.searchKey,
        tokenValue: config.tokenId,
        minChars: config.minChars || 2,
        preventDuplicates: config.preventDuplicates || false,
        tokenLimit: config.tokenLimit || 1,
        prePopulate: prePopulate,
        onAdd: function (data) {
            $("#" + config.fieldId).val(data[config.tokenId]);
            $("#" + config.container + " .token-input-token > p").html(data[config.tokenId]);
            config.fields.forEach(item => {
                $("#" + item.ui).val(data[item.api]);
            });
            return true;
        },
        onDelete: function () {
            config.fields.forEach(item => {
                $("#" + item.ui).val('');
            });
        },
        onReady: function () {
            $("#" + config.fieldId).val(initValue);
        }
    });
}

function getContainerOptions(category) {
    const sqid = $("#sqid").val();
    const uuid = $("#uuid").val();
    $.ajax({
        url: `dataentry.ashx?task=getContainers&sqid=${sqid}&uuid=${uuid}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            const selectElement = $(`#${category}_edit_ctnrno`);
            selectElement.empty().append(`<option value=""></option>`);
            res.forEach(function (item) {
                selectElement.append(`<option value="${item.ctnrno}">${item.ctnrno}</option>`);
            });
            if (category == 'revenue' && selectedRevenue) $(`#revenue_edit_ctnrno`).val(selectedRevenue['ctnrno']);
            if (category == 'cost' && selectedCost) $(`#cost_edit_ctnrno`).val(selectedCost['ctnrno']);
        }
    });
}

function getCurrencyOptions(category) {
    const sqid = $("#sqid").val();
    $.ajax({
        url: `dataentry.ashx?task=getCurrencies&sqid=${sqid}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            const selectElement = $(`#${category}_edit_curr`);
            selectElement.empty();
            res.forEach(function (item) {
                selectElement.append(`<option value="${item.code}_${item.exrate}">${item.code}</option>`);
            });
            if (category == 'revenue' && selectedRevenue) $(`#${category}_edit_curr`).val(selectedRevenue['curr'] + '_' + selectedRevenue['exrate']);
            if (category == 'cost' && selectedCost) $(`#${category}_edit_curr`).val(selectedCost['curr'] + '_' + selectedCost['exrate']);
            const currExrate = selectElement.val();
            if (currExrate) $(`#${category}_edit_exrate`).html(currExrate.split('_')[1]);
        }
    });
}

function getUnitOptions(category) {
    const sqid = $("#sqid").val();
    $.ajax({
        url: `dataentry.ashx?task=getCodes&sqid=${sqid}&codetype=PACKAGE TYPE`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            const selectElement = $(`#${category}_edit_uom`);
            selectElement.empty().append('<option value=""></option>');
            res.forEach(function (item) {
                selectElement.append(`<option value="${item.code}">${item.code}</option>`);
            });
            if (category == 'revenue' && selectedRevenue) $(`#revenue_edit_uom`).val(selectedRevenue['uom']);
            if (category == 'cost' && selectedCost) $(`#cost_edit_uom`).val(selectedCost['uom']);
        }
    });
}

function onViewRevenue(id, item) {
    selectedRevenueRow = id;
    selectedRevenue = item;
    $('#revenue-view-dialog').dialog('open');
}

function onCloseRevenueViewDialog(edit = false) {
    const temp = selectedRevenue;
    $('#revenue-view-dialog').dialog('close');
    if (edit) selectedRevenue = temp;
}

function displayRevenueView() {
    const numbers = ['qty', 'rate', 'amt'];
    Object.keys(selectedRevenue).forEach(key => {
        $(`#revenue_view_${key}`).html(numbers.includes(key) ? parseFloat(selectedRevenue[key], 10).toLocaleString() : selectedRevenue[key]);
    });
}

function onEditRevenue(id, item) {
    selectedRevenueRow = id;
    selectedRevenue = item;
    $('#revenue-edit-dialog').dialog('open');
}

function onOpenEditRevenue() {
    onCloseRevenueViewDialog(true);
    onEditRevenue(selectedRevenueRow, selectedRevenue);
}

function onOpenAddRevenue() {
    onEditRevenue(selectedRevenueRow, selectedRevenue);
}

function calcAmt(category) {
    const exrate = Number($(`#${category}_edit_exrate`).html());
    const qty = Number($(`#${category}_edit_qty`).val());
    const rate = Number($(`#${category}_edit_rate`).val());
    if (exrate > 0 && qty > 0 && rate > 0) $(`#${category}_edit_amt`).val(qty * (rate * exrate));
}

function displayRevenueEdit() {
    const spans = ['txtype', 'exrate', 'genmethod', 'invno', 'invdate', 'duedate', 'amtrecv', 'pydate', 'lastuser', 'lastdate', 'adduser', 'adddate', 'jeno'];
    const inputs = ['rtype', 'ppd', 'billid', 'billname', 'arcode', 'arglcode', 'ardesc', 'arnote', 'uom', 'ctnrno', 'qty', 'rate', 'amt', 'terms', 'custref', 'custnote', 'detid'];
    const checks = ['arrls'];
    if (selectedRevenue) {
        spans.forEach(key => {
            $(`#revenue_edit_${key}`).html(selectedRevenue[key]);
        });
        inputs.forEach(key => {
            $(`#revenue_edit_${key}`).val(selectedRevenue[key]);
        });
        checks.forEach(key => {
            $(`#revenue_edit_${key}`).prop('checked', Number(selectedRevenue[key]) == 1);
        });
        $(`#revenue_edit_curr`).val(selectedRevenue['curr'] + '_' + selectedRevenue['exrate']);
    }
    $('.revenue-edit-dialog .ui-dialog-titlebar .ui-dialog-title').html(selectedRevenue ? 'Edit Revenue Details' : 'Add Revenue');
    const customerConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'revenue_edit_billid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        fields: [
            { ui: 'revenue_edit_billname', api: 'custname' },
            { ui: 'revenue_edit_billid', api: 'custid' },
        ]
    };
    initCombineAutoComplete(customerConfig);
    const arcodesConfig = {
        task: 'getArcodes',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'revenue_edit_arcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        fields: [
            { ui: 'revenue_edit_arcode', api: 'code' },
            { ui: 'revenue_edit_arglcode', api: 'arcr' },
            { ui: 'revenue_edit_ardesc', api: 'expand' },
        ]
    };
    initCombineAutoComplete(arcodesConfig);
    getContainerOptions('revenue');
    getCurrencyOptions('revenue');
    getUnitOptions('revenue');

    $('#revenue_edit_rtype').on('change', () => {
        const detid = $('#revenue_edit_detid').val();
        if (detid) $('#revenue_edit_jeno').html($('#revenue_edit_rtype').val() + detid);
    });
    $('#revenue_edit_curr').on('change', () => {
        const currExrate = $('#revenue_edit_curr').val();
        if (currExrate) $('#revenue_edit_exrate').html(currExrate.split('_')[1]);
        calcAmt('revenue');
    });
    $('#revenue_edit_qty').on('change', () => {
        calcAmt('revenue');
    });
    $('#revenue_edit_rate').on('change', () => {
        calcAmt('revenue');
    });
    if (selectedRevenue) {

    } else {
        $('#revenue_edit_txtype').html($('input[name="chargemode"]:checked').val());
    }
}

function onCloseRevenueEditDialog() {
    $('#revenue-edit-dialog').dialog('close');
    selectedRevenue = undefined;
}

function onSaveRevenue() {
    const sqid = $("#sqid").val();
    const amt = Number($('#revenue_edit_amt').val());
    if (amt > 0) {
        const requiredFields = ['billid', 'arcode', 'curr'];
        for (i = 0; i < requiredFields.length; i++) {
            const v = $(`#revenue_edit_${requiredFields[i]}`).val();
            if (!v) {
                alert('Customer, AR and Currency are required when Amount NOT zero.');
                return;
            }
        }
    }
    const formData = $('#revenue_form').serializeArray();
    formData.push({ name: 'uuid', value: $('#uuid').val() });
    formData.push({ name: 'userid', value: $('#userid').val() });
    formData.push({ name: 'txtype', value: $('#revenue_edit_txtype').html() });
    formData.push({ name: 'shipmentno', value: $('#shipmentno').val() });
    formData.push({ name: 'release', value: $('#revenue_edit_arrls').is(":checked") ? 1 : 0 });
    $('#revenue-save-btn').prop("disabled", true);
    $.ajax({
        type: 'POST',
        url: `dataentry.ashx?task=${selectedRevenue ? 'updateRevenue' : 'addRevenue'}&sqid=${sqid}`,
        data: formData,
        success: function (response) {
            if (response.success) {
                alert(`${selectedRevenue ? 'Updated' : 'Added'} a new revenue successfully!`);      
                onCloseRevenueEditDialog();
                onLoadRevenueDetails();
            } else {
                alert(response.message || `Failed ${selectedRevenue ? 'updating' : 'adding'} a new revenue, please try again later.`);
            }
        },
        error: function (err) {
            alert(`Failed ${selectedRevenue ? 'updating' : 'adding'} a revenue. Please try later again!`);
        }
    });
}

function onDeleteRevenue(id, item) {
    if (window.confirm("Do you really want to delete?")) {
        const sqid = $("#sqid").val();
        $.ajax({
            type: 'POST',
            url: `dataentry.ashx?task=delRevenue&sqid=${sqid}`,
            data: { uuid: item.uuid, detids: item.detid },
            success: function () {
                $(`#${id}`).remove();
            },
            error: function (err) {
                alert('Failed deleting a revenue. Please try later again!');
            }
        });
    }
}


function onLoadRevenueDetails() {
    const chargemode = $('input[name="chargemode"]:checked').val();
    const uuid = $('#uuid').val();
    if (!uuid) return;
    $.ajax({
        url: `dataentry.ashx?task=getRevenueDetails&uuid=${uuid}&chargemode=${chargemode}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            if (Array.isArray(res)) {
                $('#revenue_details_table tbody').remove();
                if (res.length === 0) {
                    const tr = `<tbody><tr><td colspan=32>Not Found</td></tr></tbody>`;
                    $('#revenue_details_table').append(tr);
                } else {
                    $('#revenue_details_table').append('<tbody></tbody>');
                    const tbody = $('#revenue_details_table tbody');
                    res.forEach((item, ind) => {
                        const id = `${item.uuid}_${item.detid}_revenue_${ind}`;
                        let amt = item.amt || 0;
                        if (item.qty != 0 && item.rate != 0 && item.exrate != 0) amt = item.qty * (item.rate * item.exrate);
                        let tr = "";
                        tr += `<tr id="${id}"><td><div style="display: flex;">`;
                        tr += `<img src = "./images/view.png" class="action-button" id = "${id}_view" />`;
                        if (Number(item.arpost) != 1) tr += `<img src="./images/icon-edit.png" class="action-button" id="${id}_edit" />`;
                        tr += `<img src="./images/delete.png" class="action-button" id="${id}_delete" /></div></td>`;
                        tr += `<td>${item.txtype}</td>`;
                        tr += `<td>${item.rtype}</td>`;
                        tr += `<td>${item.ppd}</td>`;
                        tr += `<td>${item.billid}</td>`;
                        tr += `<td>${item.billname}</td>`;
                        tr += `<td>${item.arglcode}</td>`;
                        tr += `<td>${item.arcode}</td>`;
                        tr += `<td>${item.ardesc}</td>`;
                        tr += `<td>${item.arnote}</td>`;
                        tr += `<td>${item.uom}</td>`;
                        tr += `<td>${item.ctnrno}</td>`;
                        tr += `<td>${Number(item.qty || 0).toLocaleString()}</td>`;
                        tr += `<td>${item.curr}</td>`;
                        tr += `<td>${Number(item.rate || 0).toLocaleString()}</td>`;
                        tr += `<td>${Number(item.exrate || 0).toLocaleString()}</td>`;
                        tr += `<td>${Number(amt).toLocaleString()}</td>`;
                        tr += `<td>${item.genmethod}</td>`;
                        tr += `<td>${item.invno}</td>`;
                        tr += `<td><input type="checkbox" disabled ${Number(item.arrls) == 1 ? 'checked' : ''} /></td>`;
                        tr += `<td>${item.invdate}</td>`;
                        tr += `<td>${item.terms}</td>`;
                        tr += `<td>${item.duedate}</td>`;
                        tr += `<td>${item.amtrecv}</td>`;
                        tr += `<td>${item.pydate}</td>`;
                        tr += `<td>${item.custref}</td>`;
                        tr += `<td>${item.custnote}</td>`;
                        tr += `<td>${item.lastuser}</td>`;
                        tr += `<td>${item.lastdate}</td>`;
                        tr += `<td>${item.adduser}</td>`;
                        tr += `<td>${item.adddate}</td>`;
                        tr += `<td>${item.jeno}</td></tr>`;
                        tbody.append(tr);
                        $(`#${id}_view`).on('click', function () { onViewRevenue(id, item); });
                        $(`#${id}_edit`).on('click', function () { onEditRevenue(id, item); });
                        $(`#${id}_delete`).on('click', function () { onDeleteRevenue(id, item); });
                    });
                }
            }
        }
    });
}

function onViewCost(id, item) {
    selectedCostRow = id;
    selectedCost = item;
    $('#cost-view-dialog').dialog('open');
}

function onCloseCostViewDialog(edit = false) {
    const temp = selectedCost;
    $('#cost-view-dialog').dialog('close');
    if (edit) selectedCost = temp;
}

function displayCostView() {
    const numbers = ['qty', 'rate', 'amt'];
    Object.keys(selectedCost).forEach(key => {
        $(`#cost_view_${key}`).html(numbers.includes(key) ? parseFloat(selectedCost[key], 10).toLocaleString() : selectedCost[key]);
    });
}

function onEditCost(id, item) {
    selectedCostRow = id;
    selectedCost = item;
    $('#cost-edit-dialog').dialog('open');
}

function onOpenEditCost() {
    onCloseCostViewDialog(true);
    onEditCost(selectedCostRow, selectedCost);
}

function onOpenAddCost() {
    onEditCost(selectedCostRow, selectedCost);
}

function displayCostEdit() {
    const spans = ['txtype', 'apglcode', 'exrate', 'venddate', 'duedate', 'amtpaid', 'pydate', 'lastuser', 'lastdate', 'adduser', 'adddate', 'jeno'];
    const inputs = ['rtype', 'ppd', 'vendid', 'vendname', 'apcode', 'apdesc', 'apnote', 'uom', 'ctnrno', 'qty', 'curr', 'rate', 'amt', 'vref', 'terms', 'ourref', 'detid'];
    const checks = ['aprls'];
    if (selectedCost) {
        spans.forEach(key => {
            $(`#cost_edit_${key}`).html(selectedCost[key]);
        });
        inputs.forEach(key => {
            $(`#cost_edit_${key}`).val(selectedCost[key]);
        });
        checks.forEach(key => {
            $(`#cost_edit_${key}`).prop('checked', Number(selectedCost[key]) == 1);
        });
    }
    $('.cost-edit-dialog .ui-dialog-titlebar .ui-dialog-title').html(selectedCost ? 'Edit Cost Details' : 'Add Cost');
    const customerConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'cost_edit_vendid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        fields: [
            { ui: 'cost_edit_vendname', api: 'custname' },
            { ui: 'cost_edit_vendid', api: 'custid' },
        ]
    };
    initCombineAutoComplete(customerConfig);
    const arcodesConfig = {
        task: 'getArcodes',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'cost_edit_apcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        fields: [
            { ui: 'cost_edit_apcode', api: 'code' },
            { ui: 'cost_edit_arglcode', api: 'apdb' },
            { ui: 'cost_edit_apdesc', api: 'expand' }
        ]
    };
    initCombineAutoComplete(arcodesConfig);
    getContainerOptions('cost');
    getCurrencyOptions('cost');
    getUnitOptions('cost');

    $('#cost_edit_rtype').on('change', () => {
        const detid = $('#cost_edit_detid').val();
        if (detid) $('#cost_edit_jeno').html($('#cost_edit_rtype').val() + detid);
    });
    $('#cost_edit_curr').on('change', () => {
        const currExrate = $('#cost_edit_curr').val();
        if (currExrate) $('#cost_edit_exrate').html(currExrate.split('_')[1]);
        calcAmt('cost');
    });
    $('#cost_edit_qty').on('change', () => {
        calcAmt('cost');
    });
    $('#cost_edit_rate').on('change', () => {
        calcAmt('cost');
    });
    if (selectedCost) {

    } else {
        $('#cost_edit_txtype').html($('input[name="chargemode"]:checked').val());
    }
}

function onCloseCostEditDialog() {
    $('#cost-edit-dialog').dialog('close');
    selectedCost = undefined;
}

function onSaveCost() {
    const sqid = $("#sqid").val();
    const amt = Number($('#cost_edit_amt').val());
    if (amt > 0) {
        const requiredFields = ['vendid', 'apcode', 'curr'];
        for (i = 0; i < requiredFields.length; i++) {
            const v = $(`#cost_edit_${requiredFields[i]}`).val();
            if (!v) {
                alert('Customer, AR and Currency are required when Amount NOT zero.');
                return;
            }
        }
    }
    const formData = $('#cost_form').serializeArray();
    formData.push({ name: 'uuid', value: $('#uuid').val() });
    formData.push({ name: 'userid', value: $('#userid').val() });
    formData.push({ name: 'txtype', value: $('#cost_edit_txtype').html() });
    formData.push({ name: 'shipmentno', value: $('#shipmentno').val() });
    formData.push({ name: 'release', value: $('#cost_edit_aprls').is(":checked") ? 1 : 0 });
    $('#cost-save-btn').prop("disabled", true);
    $.ajax({
        type: 'POST',
        url: `dataentry.ashx?task=${selectedCost ? 'updateCost' : 'addCost'}&sqid=${sqid}`,
        data: formData,
        success: function (response) {
            if (response.success) {
                alert(`${selectedCost ? 'Updated' : 'Added'} a new cost successfully!`);
                onCloseCostEditDialog();
                onLoadCostDetails();
            } else {
                alert(response.message || `Failed ${selectedCost ? 'updating' : 'adding'} a new cost, please try again later.`);
            }
        },
        error: function (err) {
            alert(`Failed ${selectedCost ? 'updating' : 'adding'} a cost. Please try later again!`);
        }
    });
}


function onLoadCostDetails() {
    const chargemode = $('input[name="chargemode"]:checked').val();
    const uuid = $('#uuid').val();
    if (!uuid) return;
    $.ajax({
        url: `dataentry.ashx?task=getCostDetails&uuid=${uuid}&chargemode=${chargemode}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            if (Array.isArray(res)) {
                $('#cost_details_table tbody').remove();
                if (res.length === 0) {
                    const tr = `<tbody><tr><td colspan=32>Not Found</td></tr></tbody>`;
                    $('#cost_details_table').append(tr);
                } else {
                    $('#cost_details_table').append('<tbody></tbody>');
                    const tbody = $('#cost_details_table tbody');
                    res.forEach((item, ind) => {
                        const id = `${item.uuid}_${item.jeno}_cost_${ind}`;
                        let amt = item.amt || 0;
                        if (item.qty != 0 && item.rate != 0 && item.exrate != 0) amt = item.qty * (item.rate * item.exrate);
                        let tr = "";
                        tr += `<tr id="${id}"><td><div style="display: flex;">`;
                        tr += `<img src = "./images/view.png" class="action-button" id="${id}_view" />`;
                        if (Number(item.appost) != 1) tr += `<img src="./images/icon-edit.png" class="action-button" id="${id}_edit" />`;
                        tr += `<img src="./images/delete.png" class="action-button" id="${id}_delete" /></div></td>`;
                        tr += `<td>${item.txtype}</td>`;
                        tr += `<td>${item.rtype}</td>`;
                        tr += `<td>${item.ppd}</td>`;
                        tr += `<td>${item.vendid}</td>`;
                        tr += `<td>${item.vendname}</td>`;
                        tr += `<td>${item.apglcode}</td>`;
                        tr += `<td>${item.apcode}</td>`;
                        tr += `<td>${item.apdesc}</td>`;
                        tr += `<td>${item.apnote}</td>`;
                        tr += `<td>${item.uom}</td>`;
                        tr += `<td>${item.ctnrno}</td>`;
                        tr += `<td>${Number(item.qty || 0).toLocaleString()}</td>`;
                        tr += `<td>${item.curr}</td>`;
                        tr += `<td>${Number(item.rate || 0).toLocaleString()}</td>`;
                        tr += `<td>${Number(item.exrate || 0).toLocaleString()}</td>`;
                        tr += `<td>${Number(amt).toLocaleString()}</td>`;
                        tr += `<td>${item.vref}</td>`;
                        tr += `<td><input type="checkbox" disabled ${Number(item.aprls) == 1 ? 'checked' : ''} /></td>`;
                        tr += `<td>${item.verifyby}</td>`;
                        tr += `<td>${item.verifytime}</td>`;
                        tr += `<td>${item.venddate}</td>`;
                        tr += `<td>${item.terms}</td>`;
                        tr += `<td>${item.duedate}</td>`;
                        tr += `<td>${item.amtpaid}</td>`;
                        tr += `<td>${item.pydate}</td>`;
                        tr += `<td>${item.ourref}</td>`;
                        tr += `<td>${item.lastuser}</td>`;
                        tr += `<td>${item.lastdate}</td>`;
                        tr += `<td>${item.adduser}</td>`;
                        tr += `<td>${item.adddate}</td>`;
                        tr += `<td>${item.jeno}</td></tr>`;
                        tbody.append(tr);
                        $(`#${id}_view`).on('click', function () { onViewCost(id, item); });
                        $(`#${id}_edit`).on('click', function () { onEditCost(id, item); });
                        $(`#${id}_delete`).on('click', function () { onDeleteRevenue(id, item); });
                    });
                }
            }
        }
    });
}

function onCheckChargeMode() {
    const chargemode = $('input[name="chargemode"]:checked').val();
    if (chargemode == 'A') {
        $('.add_revenue_cost_btn').hide();
    } else {
        $('.add_revenue_cost_btn').show();
    }
}


$(document).ready(function () {
    $(window).scroll(function () {
        if (window.scrollY > 50) {
            $('#gotop').addClass('gotop-show');
        } else {
            $('#gotop').removeClass('gotop-show');
        }
    });

    $('#gotop').on('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        $('#gotop').removeClass('gotop-show');
    });

    onCheckChargeMode();
    onLoadRevenueDetails();
    onLoadCostDetails();

    $('input[name="chargemode"]').on('change', () => {
        onCheckChargeMode();
        onLoadRevenueDetails();
        onLoadCostDetails();
    });

    $('#revenue-view-dialog').dialog({
        autoOpen: false,
        draggable: false,
        modal: true,
        width: 1024,
        position: {
            my: "top",
            at: "top",
            of: window
        },
        classes: {
            "ui-dialog": "contact-dialog"
        },
        open: function (event, ui) {
            $('#revenue-view-dialog #divInDialog').load('revenueViewDialog.html', function () {
                displayRevenueView();
            });
        },
        close: function () {
            selectedRevenue = undefined;
        }
    });

    $('#revenue-edit-dialog').dialog({
        autoOpen: false,
        draggable: false,
        modal: true,
        width: 1024,
        position: {
            my: "top",
            at: "top",
            of: window
        },
        classes: {
            "ui-dialog": "contact-dialog revenue-edit-dialog"
        },
        open: function (event, ui) {
            $('#revenue-edit-dialog #divInDialog').load('revenueEditDialog.html', function () {
                displayRevenueEdit();
            });
        },
        close: function () {
            onCloseRevenueEditDialog();
        }
    });

    $('#cost-view-dialog').dialog({
        autoOpen: false,
        draggable: false,
        modal: true,
        width: 1024,
        position: {
            my: "top",
            at: "top",
            of: window
        },
        classes: {
            "ui-dialog": "contact-dialog"
        },
        open: function (event, ui) {
            $('#cost-view-dialog #divInDialog').load('costViewDialog.html', function () {
                displayCostView();
            });
        },
        close: function () {
            selectedCost = undefined;
        }
    });

    $('#cost-edit-dialog').dialog({
        autoOpen: false,
        draggable: false,
        modal: true,
        width: 1024,
        position: {
            my: "top",
            at: "top",
            of: window
        },
        classes: {
            "ui-dialog": "contact-dialog cost-edit-dialog"
        },
        open: function (event, ui) {
            $('#cost-edit-dialog #divInDialog').load('costEditDialog.html', function () {
                displayCostEdit();
            });
        },
        close: function () {
            onCloseCostEditDialog();
        }
    });

});