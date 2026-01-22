/**** the function to build Autocomplete Field ****/
/* --- required params in config variable --- */
/* url: request url */
/* task: used to define API to auto complete */
/* fieldId: id of the autocomplete input in html(ex: vessel)  */
/* tokenId: id to identify the values fetched from database(ex: imo) */
/* searchKey: name of field to search in the fetched data (column name matched with fieldId in html)(ex: vessel) */
/* ---- optional params  --- */
/* queryParam: key to pass the value in autocomplete field(default: 'q') */
/* minChars: minimum legth of autocomplete field to search(default: 2)  */
/* preventDuplicates: define if prevent or not duplicated values in autocomplete select (default: false) */
/* fields: fields to be filled automatically, type object({ui: , api: }) */
/* field/ui: id of input, select or checkbox in html */
/* field/api: column name in database */

var tempData = {};
function initAutoComplete(config) {
    const initValue = $("#" + config.fieldId).val();
    const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : [];
    const sqid = $("#sqid").val();
    if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
        console.error('Missing the required params');
        return false;
    }
    $("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid, {
        queryParam: config.queryParam || 'q',
        propertyToSearch: config.searchKey,
        tokenValue: config.tokenId,
        minChars: config.minChars || 2,
        preventDuplicates: config.preventDuplicates || false,
        tokenLimit: config.tokenLimit || 1,
        prePopulate: prePopulate,
        allowFreeTagging: config.allowFreeTagging || false,
        onAdd: function (data) {
            if (config.allowFreeTagging && config.serverKey in data) {
                config.fields.forEach(item => {
                    $("#" + item.ui).val(data[item.api]);
                });
            } else {
                config.fields.forEach(item => {
                    $("#" + item.ui).val('');
                });
                $("#" + config.fieldId).val(data[config.fieldId]);
            }
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

function initPairAutoComplete(config) {
    const initValue = $("#" + config.fieldId).val();
    const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : [];
    const sqid = $("#sqid").val();
    if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
        console.error('Missing the required params');
        return false;
    }
    return $("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid + "&searchkey=" + config.searchKey, {
        queryParam: config.queryParam || 'q',
        propertyToSearch: config.searchKey,
        tokenValue: config.tokenId,
        minChars: config.minChars || 2,
        preventDuplicates: config.preventDuplicates || false,
        tokenLimit: config.tokenLimit || 1,
        prePopulate: prePopulate,
        resultsLimit: 100,
        onAdd: function (data) {
            //console.log('data===>', data);
            //console.log('temp===>', tempData);
            //console.log('config===>', config);
            if (config.pairField && (tempData[config.pairKey] !== data[config.pairKey] || tempData.fieldId !== config.pairField)) {
                //console.log('run=== if');
                tempData = {
                    fieldId: config.fieldId,
                    [config.pairKey]: data[config.pairKey],
                    [config.searchKey]: data[config.searchKey]
                };
                $("#" + config.pairField).tokenInput("clear");
                $("#" + config.pairField).tokenInput("add", { [config.pairKey]: data[config.pairKey], [config.searchKey]: data[config.searchKey] });
            }

            config.fields.forEach(item => {
                $("#" + item.ui).val(data[item.api]);
            });
            return true;
        },
        onDelete: function () {
            config.fields.forEach(item => {
                $("#" + item.ui).val('');
            });
            $("#" + config.pairField).tokenInput("clear");
            $("#token-input-" + config.fieldId).focus();
        },
        onReady: function () {
            $("#" + config.fieldId).val(initValue);
        }
    });
}

function initCombineAutoComplete(config) {
    const initValue = $("#" + config.fieldId).val();
    const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : [];
    const sqid = $("#sqid").val();
    if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
        console.error('Missing the required params');
        return false;
    }
    $("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid, {
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


function onLoadCompanyTypes() {
    const sqid = $("#sqid").val();
    $.ajax({
        url: 'dataentry.ashx?task=getCompanyTypes',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { sqid: sqid },
        success: function (res) {
            $('#conttype').empty().append(`<option value="">-- SELECT FROM LIST --</option>`);
            res.forEach(function (item) {
                $('#conttype').append(`<option value="${item.code}">${item.expand}</option>`);
            });
        }
    });
}

function onLoadCountries() {
    $.ajax({
        url: 'dataentry.ashx?task=getCountries',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            $('#contiso').empty().append(`<option value="">-- Country --</option>`);
            res.forEach(function (item) {
                $('#contiso').append(`<option value="${item.iso}">${item.expand}</option>`);
            });
        }
    });
}

function onLoadStates() {
    const iso = $('#contiso').val() || '';
    $.ajax({
        url: 'dataentry.ashx?task=getStates',
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { iso: iso },
        success: function (res) {
            $('#contst').empty().append(`<option value="">-- State --</option>`);
            res.forEach(function (item) {
                $('#contst').append(`<option value="${item.code}">${item.expand}</option>`);
            });
        }
    });
}

function onCloseCompanyDialog() {
    $('#contact-dialog').dialog('close');
}

function onAddContact(event) {
    event.preventDefault();
    const sqid = $("#sqid").val();
    const data = $('#contact-form').serialize();
    $('#contact-save-btn').prop("disabled", true);
    $.ajax({
        type: 'POST',
        url: `dataentry.ashx?task=addContact&sqid=${sqid}`,
        data: data,
        success: function (response) {
            if (response.success) {
                $('#contact-form').trigger("reset");
                alert('Added a new contact successfully!');
            } else {
                alert('Failed adding a new contact, please try again later.');
            }
            $('#contact-save-btn').prop("disabled", false);
        },
        error: function (error) {
            console.log('failed add contact===>', error);
            $('#contact-save-btn').prop("disabled", false);
            alert('Failed adding a new contact, please try again later.');
        }
    });
}

function loadClauses() {
    const sqid = $("#sqid").val();
    $.ajax({
        url: `dataentry.ashx?task=getClauses&sqid=${sqid}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        success: function (res) {
            $('#code').empty().append(`<option value="">-- Select --</option>`);
            res.forEach(function (item) {
                $('#code').append(`<option value="${item.id}">${item.clause}</option>`);
            });
        }
    });
}

function loadClause() {
    const sqid = $("#sqid").val();
    const code = $('#code').val();
    $.ajax({
        url: `dataentry.ashx?task=getClause&sqid=${sqid}`,
        contentType: "application/json; charset=utf-8",
        type: 'GET',
        data: { code },
        success: function (res) {
            if (Array.isArray(res) && res.length == 1) {
                $('#expand').val(res[0].clause);
            }
            else $('#expand').val('');
        }
    });
}

$(document).ready(function () {
    $('#contact-dialog').dialog({
        autoOpen: false,
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
            $('#divInDialog').load('popup.html', function () {
                onLoadCompanyTypes();
                onLoadCountries();
                onLoadStates();
                $('#contiso').on('change', function () {
                    onLoadStates();
                });
            });
        }
    });
    $('.new-contact-dialog-opener').on('click', () => {
        $('#contact-dialog').dialog('open');
    });
    $("#date").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#reqshipdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#followupdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#pickdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#pickdate2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd3").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd4").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#eta1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#eta2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etadelv1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etadelv2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#dfrom").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#dto").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#entrydate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#importdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#carriereta").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#exportdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#obdate1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#intransitdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#prestmndate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#lfd").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#expdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#issdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#godate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#refdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#invdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#duedate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#coodate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#refdate1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#refdate2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#indate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#outdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#indate2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#outdate2").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#poadate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#poaexp").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#shipdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#aescutoff").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#cutoff").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#docdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#vgmdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#inlanddate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#raildate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#early").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $('#code').on('change', function () {
        loadClause();
    });

    loadClauses();

    /* Autocomplete Vessel  */
    const vesselConfig = {
        task: 'getVessels',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'vessel',
        tokenId: 'imo',
        searchKey: 'vessel',
        minChars: 2,
        preventDuplicates: true,
        allowFreeTagging: true,
        serverKey: 'flag',
        fields: [
            { ui: 'vessel', api: 'vessel' },
            { ui: 'imo', api: 'imo' },
            { ui: 'imoflag', api: 'flag' }
        ]
    };
    initAutoComplete(vesselConfig);

    //// UN /////

    /* Place of Receipt by Code */
    const placeConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getUncodes2',
        queryParam: 'q',
        fieldId: 'porcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'porcode_th',
        fields: [
            { ui: 'porname', api: 'expand' },
            { ui: 'porcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(placeConfigByCode);

    /* Port of Loading By code  */
    const portConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getUncodes2',
        queryParam: 'q',
        fieldId: 'polcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'polcode_th',
        fields: [
            { ui: 'polname', api: 'expand' },
            { ui: 'polcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(portConfigByCode);

    /* Port of Discharge by code  */
    const dischargeConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getUncodes2',
        queryParam: 'q',
        fieldId: 'poulcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'poulcode_th',
        fields: [
            { ui: 'poulname', api: 'expand' },
            { ui: 'poulcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(dischargeConfigByCode);

    /* Place of Delivery by code  */
    const deliveryConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getUncodes2',
        queryParam: 'q',
        fieldId: 'podcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'podcode_th',
        fields: [
            { ui: 'podname', api: 'expand' },
            { ui: 'podcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(deliveryConfigByCode);

    /* Schedule D */
    const schdConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getSchd2',
        queryParam: 'q',
        fieldId: 'schdcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'schd_th',
        fields: [
            { ui: 'schdname', api: 'expand' },
            { ui: 'schdcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(schdConfigByCode);

    /* Schedule D */
    const schdConfigByCode2 = {
        url: 'dataentry.ashx',
        task: 'getSchd2',
        queryParam: 'q',
        fieldId: 'schdcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'schd_th',
        fields: [
            { ui: 'schdname2', api: 'expand' },
            { ui: 'schdcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(schdConfigByCode2);





    /* Port of Entry */
    const portentryConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getSchd2',
        queryParam: 'q',
        fieldId: 'portentry',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'portentry_th',
        fields: [
            { ui: 'portentryname', api: 'expand' },
            { ui: 'portentry', api: 'code' }
        ]
    };
    initCombineAutoComplete(portentryConfigByCode);

    /* Schedule K */
    const schkConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getSchk2',
        queryParam: 'q',
        fieldId: 'schkcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'schk_th',
        fields: [
            { ui: 'schkname', api: 'expand' },
            { ui: 'schkcode', api: 'code' }
        ]
    };
    initCombineAutoComplete(schkConfigByCode);

    /* Schedule K */
    const schk2ConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getSchk2',
        queryParam: 'q',
        fieldId: 'schkcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'schk2_th',
        fields: [
            { ui: 'schkname2', api: 'expand' },
            { ui: 'schkcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(schk2ConfigByCode);

    /* Schedule K */
    const schk3ConfigByCode = {
        url: 'dataentry.ashx',
        task: 'getSchk2',
        queryParam: 'q',
        fieldId: 'schkcode3',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'schk3_th',
        fields: [
            { ui: 'schkname3', api: 'expand' },
            { ui: 'schkcode3', api: 'code' }
        ]
    };
    initCombineAutoComplete(schk3ConfigByCode);

    //// PORT //////
    /* Place of Receipt by Code */
    const placeConfigByCode2 = {
        url: 'dataentry.ashx',
        task: 'getPort',
        queryParam: 'q',
        fieldId: 'porcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'porcode2_th',
        pairKey: 'expand',
        fields: [
            { ui: 'porname2', api: 'expand' },
            { ui: 'porcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(placeConfigByCode2);

    /* Port of Loading By code  */
    const portConfigByCode2 = {
        url: 'dataentry.ashx',
        task: 'getPort',
        queryParam: 'q',
        fieldId: 'polcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'polcode2_th',
        fields: [
            { ui: 'polname2', api: 'expand' },
            { ui: 'polcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(portConfigByCode2);

    /* Port of Discharge by code  */
    const dischargeConfigByCode2 = {
        url: 'dataentry.ashx',
        task: 'getPort',
        queryParam: 'q',
        fieldId: 'poulcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'poulcode2_th',
        fields: [
            { ui: 'poulname2', api: 'expand' },
            { ui: 'poulcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(dischargeConfigByCode2);

    /* Place of Delivery by code  */
    const deliveryConfigByCode2 = {
        url: 'dataentry.ashx',
        task: 'getPort',
        queryParam: 'q',
        fieldId: 'podcode2',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'podcode2_th',
        fields: [
            { ui: 'podname2', api: 'expand' },
            { ui: 'podcode2', api: 'code' }
        ]
    };
    initCombineAutoComplete(deliveryConfigByCode2);

    /* SED */
    /*const sedConfig = {
        url: 'dataentry.ashx',
        task: 'getSeds',
        queryParam: 'q',
        fieldId: 'seddesc',
        tokenId: 'code',
        searchKey: 'expand',
        minChars: 2,
        preventDuplicates: false,
        pairField: 'sedcode',
        pairKey: 'code',
        fields: [
            { ui: 'seddesc', api: 'expand' },
            { ui: 'sedcode', api: 'code' },
            { ui: 'seduom1', api: 'uom1' },
            { ui: 'seduom2', api: 'uom2' }
        ]
    };
    initPairAutoComplete(sedConfig);
    */
    const sedConfig = {
        url: 'dataentry.ashx',
        task: 'getSeds2',
        queryParam: 'q',
        fieldId: 'sedcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'sed_th',
        fields: [
            { ui: 'seddesc', api: 'expand' },
            { ui: 'sedcode', api: 'code' },
            { ui: 'seduom1', api: 'uom1' },
            { ui: 'seduom2', api: 'uom2' }
        ]
    };
    initCombineAutoComplete(sedConfig);

    /*  Shipper */
    const shipperConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'shipid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'shipid_th',
        fields: [
            { ui: 'shipname', api: 'custname' },
            { ui: 'shipid', api: 'custid' },
            { ui: 'shipadd1', api: 'addr1' },
            { ui: 'shipadd2', api: 'addr2' },
            { ui: 'shipadd3', api: 'addr3' },
            { ui: 'shipcity', api: 'city' },
            { ui: 'shipst', api: 'state' },
            { ui: 'shipzip', api: 'zip' },
            { ui: 'shipiso', api: 'iso' },
            { ui: 'shipcont', api: 'contact1' },
            { ui: 'shipph', api: 'phone1' },
            { ui: 'shipemail', api: 'email1' },
            { ui: 'shiptaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(shipperConfig);

    /*  Consignee */
    const consigneeConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'consid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'consid_th',
        fields: [
            { ui: 'consname', api: 'custname' },
            { ui: 'consid', api: 'custid' },
            { ui: 'consadd1', api: 'addr1' },
            { ui: 'consadd2', api: 'addr2' },
            { ui: 'consadd3', api: 'addr3' },
            { ui: 'conscity', api: 'city' },
            { ui: 'consst', api: 'state' },
            { ui: 'conszip', api: 'zip' },
            { ui: 'consiso', api: 'iso' },
            { ui: 'conscont', api: 'contact1' },
            { ui: 'consph', api: 'phone1' },
            { ui: 'consemail', api: 'email1' },
            { ui: 'constaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(consigneeConfig);

    /*  Notify Party */

    const notifyConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'notiid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'notiid_th',
        fields: [
            { ui: 'notiname', api: 'custname' },
            { ui: 'notiid', api: 'custid' },
            { ui: 'notiadd1', api: 'addr1' },
            { ui: 'notiadd2', api: 'addr2' },
            { ui: 'notiadd3', api: 'addr3' },
            { ui: 'noticity', api: 'city' },
            { ui: 'notist', api: 'state' },
            { ui: 'notizip', api: 'zip' },
            { ui: 'notiiso', api: 'iso' },
            { ui: 'noticont', api: 'contact1' },
            { ui: 'notiph', api: 'phone1' },
            { ui: 'notiemail', api: 'email1' },
            { ui: 'notitaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(notifyConfig);

    /* Bill To  */

    const billtoConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'billid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'billid_th',
        fields: [
            { ui: 'billname', api: 'custname' },
            { ui: 'billid', api: 'custid' },
            { ui: 'billadd1', api: 'addr1' },
            { ui: 'billadd2', api: 'addr2' },
            { ui: 'billadd3', api: 'addr3' },
            { ui: 'billcity', api: 'city' },
            { ui: 'billst', api: 'state' },
            { ui: 'billzip', api: 'zip' },
            { ui: 'billiso', api: 'iso' },
            { ui: 'billcont', api: 'contact1' },
            { ui: 'billph', api: 'phone1' },
            { ui: 'billemail', api: 'email1' },
            { ui: 'billtaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(billtoConfig);

    /* Pick Up  */

    const pickupConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'pickid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'pickid_th',
        fields: [
            { ui: 'pickname', api: 'custname' },
            { ui: 'pickid', api: 'custid' },
            { ui: 'pickadd1', api: 'addr1' },
            { ui: 'pickadd2', api: 'addr2' },
            { ui: 'pickadd3', api: 'addr3' },
            { ui: 'pickcity', api: 'city' },
            { ui: 'pickst', api: 'state' },
            { ui: 'pickzip', api: 'zip' },
            { ui: 'pickiso', api: 'iso' },
            { ui: 'pickcont', api: 'contact1' },
            { ui: 'pickph', api: 'phone1' },
            { ui: 'pickemail', api: 'email1' },
            { ui: 'picktaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(pickupConfig);

    /* Deliver To  */

    const delivertoConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'delvid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'delvid_th',
        fields: [
            { ui: 'delvname', api: 'custname' },
            { ui: 'delvid', api: 'custid' },
            { ui: 'delvadd1', api: 'addr1' },
            { ui: 'delvadd2', api: 'addr2' },
            { ui: 'delvadd3', api: 'addr3' },
            { ui: 'delvcity', api: 'city' },
            { ui: 'delvst', api: 'state' },
            { ui: 'delvzip', api: 'zip' },
            { ui: 'delviso', api: 'iso' },
            { ui: 'delvcont', api: 'contact1' },
            { ui: 'delvph', api: 'phone1' },
            { ui: 'delvemail', api: 'email1' },
            { ui: 'delvtaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(delivertoConfig);

    /*  Origin Agent  */

    const originAgentConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'oagtid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'oagtid_th',
        fields: [
            { ui: 'oagtname', api: 'custname' },
            { ui: 'oagtid', api: 'custid' },
            { ui: 'oagtadd1', api: 'addr1' },
            { ui: 'oagtadd2', api: 'addr2' },
            { ui: 'oagtadd3', api: 'addr3' },
            { ui: 'oagtcity', api: 'city' },
            { ui: 'oagtst', api: 'state' },
            { ui: 'oagtzip', api: 'zip' },
            { ui: 'oagtiso', api: 'iso' },
            { ui: 'oagtcont', api: 'contact1' },
            { ui: 'oagtph', api: 'phone1' },
            { ui: 'oagtemail', api: 'email1' },
            { ui: 'oagttaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(originAgentConfig);

    /*  Destination Agent */
    const destAgentConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'dagtid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'dagtid_th',
        fields: [
            { ui: 'dagtname', api: 'custname' },
            { ui: 'dagtid', api: 'custid' },
            { ui: 'dagtadd1', api: 'addr1' },
            { ui: 'dagtadd2', api: 'addr2' },
            { ui: 'dagtadd3', api: 'addr3' },
            { ui: 'dagtcity', api: 'city' },
            { ui: 'dagtst', api: 'state' },
            { ui: 'dagtzip', api: 'zip' },
            { ui: 'dagtiso', api: 'iso' },
            { ui: 'dagtcont', api: 'contact1' },
            { ui: 'dagtph', api: 'phone1' },
            { ui: 'dagtemail', api: 'email1' },
            { ui: 'dagttaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(destAgentConfig);

    /*  Forwarder */

    const forwarderConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'forwid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'forwid_th',
        fields: [
            { ui: 'forwname', api: 'custname' },
            { ui: 'forwid', api: 'custid' },
            { ui: 'forwadd1', api: 'addr1' },
            { ui: 'forwadd2', api: 'addr2' },
            { ui: 'forwadd3', api: 'addr3' },
            { ui: 'forwcity', api: 'city' },
            { ui: 'forwst', api: 'state' },
            { ui: 'forwzip', api: 'zip' },
            { ui: 'forwiso', api: 'iso' },
            { ui: 'forwcont', api: 'contact1' },
            { ui: 'forwph', api: 'phone1' },
            { ui: 'forwemail', api: 'email1' },
            { ui: 'forwtaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(forwarderConfig);

    /*  Supplier */

    const supplierConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'suppid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'suppid_th',
        fields: [
            { ui: 'suppname', api: 'custname' },
            { ui: 'suppid', api: 'custid' },
            { ui: 'suppadd1', api: 'addr1' },
            { ui: 'suppadd2', api: 'addr2' },
            { ui: 'suppadd3', api: 'addr3' },
            { ui: 'suppcity', api: 'city' },
            { ui: 'suppst', api: 'state' },
            { ui: 'suppzip', api: 'zip' },
            { ui: 'suppiso', api: 'iso' },
            { ui: 'suppcont', api: 'contact1' },
            { ui: 'suppph', api: 'phone1' },
            { ui: 'suppemail', api: 'email1' },
            { ui: 'supptaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(supplierConfig);

    /*  Broker */

    const brokerConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'brokid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'brokid_th',
        fields: [
            { ui: 'brokname', api: 'custname' },
            { ui: 'brokid', api: 'custid' },
            { ui: 'brokadd1', api: 'addr1' },
            { ui: 'brokadd2', api: 'addr2' },
            { ui: 'brokadd3', api: 'addr3' },
            { ui: 'brokcity', api: 'city' },
            { ui: 'brokst', api: 'state' },
            { ui: 'brokzip', api: 'zip' },
            { ui: 'brokiso', api: 'iso' },
            { ui: 'brokcont', api: 'contact1' },
            { ui: 'brokph', api: 'phone1' },
            { ui: 'brokemail', api: 'email1' },
            { ui: 'broktaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(brokerConfig);

    /*  Carr1id */
    const carr1Config = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'carr1id',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'carr1id_th',
        fields: [
            { ui: 'carr1name', api: 'custname' },
            { ui: 'carr1id', api: 'custid' },
            { ui: 'carr1add1', api: 'addr1' },
            { ui: 'carr1add2', api: 'addr2' },
            { ui: 'carr1add3', api: 'addr3' },
            { ui: 'carr1city', api: 'city' },
            { ui: 'carr1st', api: 'state' },
            { ui: 'carr1zip', api: 'zip' },
            { ui: 'carr1iso', api: 'iso' },
            { ui: 'carr1cont', api: 'contact1' },
            { ui: 'carr1ph', api: 'phone1' },
            { ui: 'carr1email', api: 'email1' },
            { ui: 'carr1taxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(carr1Config);

    /*  Carr2id */
    const carr2Config = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'carr2id',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'carr2id_th',
        fields: [
            { ui: 'carr2name', api: 'custname' },
            { ui: 'carr2id', api: 'custid' },
            { ui: 'carr2add1', api: 'addr1' },
            { ui: 'carr2add2', api: 'addr2' },
            { ui: 'carr2add3', api: 'addr3' },
            { ui: 'carr2city', api: 'city' },
            { ui: 'carr2st', api: 'state' },
            { ui: 'carr2zip', api: 'zip' },
            { ui: 'carr2iso', api: 'iso' },
            { ui: 'carr2cont', api: 'contact1' },
            { ui: 'carr2ph', api: 'phone1' },
            { ui: 'carr2email', api: 'email1' },
            { ui: 'carr2taxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(carr2Config);

    /*  carr3id */
    const carr3Config = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'carr3id',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'carr3id_th',
        fields: [
            { ui: 'carr3name', api: 'custname' },
            { ui: 'carr3id', api: 'custid' },
            { ui: 'carr3add1', api: 'addr1' },
            { ui: 'carr3add2', api: 'addr2' },
            { ui: 'carr3add3', api: 'addr3' },
            { ui: 'carr3city', api: 'city' },
            { ui: 'carr3st', api: 'state' },
            { ui: 'carr3zip', api: 'zip' },
            { ui: 'carr3iso', api: 'iso' },
            { ui: 'carr3cont', api: 'contact1' },
            { ui: 'carr3ph', api: 'phone1' },
            { ui: 'carr3email', api: 'email1' },
            { ui: 'carr3taxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(carr3Config);

    /*  carr4id */
    const carr4Config = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'carr4id',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'carr4id_th',
        fields: [
            { ui: 'carr4name', api: 'custname' },
            { ui: 'carr4id', api: 'custid' },
            { ui: 'carr4add1', api: 'addr1' },
            { ui: 'carr4add2', api: 'addr2' },
            { ui: 'carr4add3', api: 'addr3' },
            { ui: 'carr4city', api: 'city' },
            { ui: 'carr4st', api: 'state' },
            { ui: 'carr4zip', api: 'zip' },
            { ui: 'carr4iso', api: 'iso' },
            { ui: 'carr4cont', api: 'contact1' },
            { ui: 'carr4ph', api: 'phone1' },
            { ui: 'carr4email', api: 'email1' },
            { ui: 'carr4taxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(carr4Config);

    /*  carr5id */
    const carr5Config = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'carr5id',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'carr5id_th',
        fields: [
            { ui: 'carr5name', api: 'custname' },
            { ui: 'carr5id', api: 'custid' },
            { ui: 'carr5add1', api: 'addr1' },
            { ui: 'carr5add2', api: 'addr2' },
            { ui: 'carr5add3', api: 'addr3' },
            { ui: 'carr5city', api: 'city' },
            { ui: 'carr5st', api: 'state' },
            { ui: 'carr5zip', api: 'zip' },
            { ui: 'carr5iso', api: 'iso' },
            { ui: 'carr5cont', api: 'contact1' },
            { ui: 'carr5ph', api: 'phone1' },
            { ui: 'carr5email', api: 'email1' },
            { ui: 'carr5taxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(carr5Config);

    /*  IOR */
    const iorConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'iorid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'iorid_th',
        fields: [
            { ui: 'iorname', api: 'custname' },
            { ui: 'iorid', api: 'custid' },
            { ui: 'ioradd1', api: 'addr1' },
            { ui: 'ioradd2', api: 'addr2' },
            { ui: 'ioradd3', api: 'addr3' },
            { ui: 'iorcity', api: 'city' },
            { ui: 'iorst', api: 'state' },
            { ui: 'iorzip', api: 'zip' },
            { ui: 'ioriso', api: 'iso' },
            { ui: 'iorcont', api: 'contact1' },
            { ui: 'iorph', api: 'phone1' },
            { ui: 'ioremail', api: 'email1' },
            { ui: 'iortaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(iorConfig);


    /*  USPPI */
    const USPPIConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'usppiid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'usppiid_th',
        fields: [
            { ui: 'usppiname', api: 'custname' },
            { ui: 'usppiid', api: 'custid' },
            { ui: 'usppiadd1', api: 'addr1' },
            { ui: 'usppiadd2', api: 'addr2' },
            { ui: 'usppiadd3', api: 'addr3' },
            { ui: 'usppicity', api: 'city' },
            { ui: 'usppist', api: 'state' },
            { ui: 'usppizip', api: 'zip' },
            { ui: 'usppiiso', api: 'iso' },
            { ui: 'usppicont', api: 'contact1' },
            { ui: 'usppiph', api: 'phone1' },
            { ui: 'usppiemail', api: 'email1' },
            { ui: 'usppitaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(USPPIConfig);

    /*  Entry Location */
    const EntLocConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'entlocid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'entlocid_th',
        fields: [
            { ui: 'entlocname', api: 'custname' },
            { ui: 'entlocid', api: 'custid' },
            { ui: 'entlocadd1', api: 'addr1' },
            { ui: 'entlocadd2', api: 'addr2' },
            { ui: 'entlocadd3', api: 'addr3' },
            { ui: 'entloccity', api: 'city' },
            { ui: 'entlocst', api: 'state' },
            { ui: 'entloczip', api: 'zip' },
            { ui: 'entlociso', api: 'iso' },
            { ui: 'entloccont', api: 'contact1' },
            { ui: 'entlocph', api: 'phone1' },
            { ui: 'entlocemail', api: 'email1' },
            { ui: 'entloctaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(EntLocConfig);

    /*  Rail */
    const RailConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'railid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'railid_th',
        fields: [
            { ui: 'railname', api: 'custname' },
            { ui: 'railid', api: 'custid' },
            { ui: 'railadd1', api: 'addr1' },
            { ui: 'railadd2', api: 'addr2' },
            { ui: 'railadd3', api: 'addr3' },
            { ui: 'railcity', api: 'city' },
            { ui: 'railst', api: 'state' },
            { ui: 'railzip', api: 'zip' },
            { ui: 'railiso', api: 'iso' },
            { ui: 'railcont', api: 'contact1' },
            { ui: 'railph', api: 'phone1' },
            { ui: 'railemail', api: 'email1' },
            { ui: 'railtaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(RailConfig);

    /*  Ramp */
    const RampConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'rampid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'rampid_th',
        fields: [
            { ui: 'rampname', api: 'custname' },
            { ui: 'rampid', api: 'custid' },
            { ui: 'rampadd1', api: 'addr1' },
            { ui: 'rampadd2', api: 'addr2' },
            { ui: 'rampadd3', api: 'addr3' },
            { ui: 'rampcity', api: 'city' },
            { ui: 'rampst', api: 'state' },
            { ui: 'rampzip', api: 'zip' },
            { ui: 'rampiso', api: 'iso' },
            { ui: 'rampcont', api: 'contact1' },
            { ui: 'rampph', api: 'phone1' },
            { ui: 'rampemail', api: 'email1' },
            { ui: 'ramptaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(RampConfig);

    /*  Return Empty */
    const ReturnEmptyConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'returnid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'returnid_th',
        fields: [
            { ui: 'returnname', api: 'custname' },
            { ui: 'returnid', api: 'custid' },
            { ui: 'returnadd1', api: 'addr1' },
            { ui: 'returnadd2', api: 'addr2' },
            { ui: 'returnadd3', api: 'addr3' },
            { ui: 'returncity', api: 'city' },
            { ui: 'returnst', api: 'state' },
            { ui: 'returnzip', api: 'zip' },
            { ui: 'returniso', api: 'iso' },
            { ui: 'returncont', api: 'contact1' },
            { ui: 'returnph', api: 'phone1' },
            { ui: 'returnemail', api: 'email1' },
            { ui: 'returntaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(ReturnEmptyConfig);

    /*  Load At */
    const LoadConfig = {
        url: 'dataentry.ashx',
        task: 'getContacts2',
        queryParam: 'q',
        fieldId: 'loadid',
        tokenId: 'custid',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'loadid_th',
        fields: [
            { ui: 'loadname', api: 'custname' },
            { ui: 'loadid', api: 'custid' },
            { ui: 'loadadd1', api: 'addr1' },
            { ui: 'loadadd2', api: 'addr2' },
            { ui: 'loadadd3', api: 'addr3' },
            { ui: 'loadcity', api: 'city' },
            { ui: 'loadst', api: 'state' },
            { ui: 'loadzip', api: 'zip' },
            { ui: 'loadiso', api: 'iso' },
            { ui: 'loadcont', api: 'contact1' },
            { ui: 'loadph', api: 'phone1' },
            { ui: 'loademail', api: 'email1' },
            { ui: 'loadtaxid', api: 'ein' }
        ]
    };
    initCombineAutoComplete(LoadConfig);

    /*  Item Master */
    const ItemMasterConfig = {
        url: 'dataentry.ashx',
        task: 'getItem2',
        queryParam: 'q',
        fieldId: 'itemcode',
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        container: 'itemid_th',
        fields: [
            { ui: 'desc', api: 'expand' },
            { ui: 'itemcode', api: 'code' },
            { ui: 'sedcode', api: 'schbcode' },
            { ui: 'seddesc', api: 'schbdesc' }
        ]
    };
    initCombineAutoComplete(ItemMasterConfig);
         

    for (let i = 1; i < 21; i += 1) {
        /* Sales Description */
        const sufix = String(i).padStart(2, '0');
        /*const salesConfig = {
            task: 'getArcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'ardesc' + sufix,
            tokenId: 'code',
            searchKey: 'str',
            minChars: 2,
            preventDuplicates: false,
            pairField: 'arcode' + sufix,
            pairKey: 'code',
            fields: [
                { ui: 'ardesc' + sufix, api: 'expand' },
                { ui: 'arcode' + sufix, api: 'code' }
            ]
        };
        initPairAutoComplete(salesConfig);
        */
        const salesConfig2 = {
            task: 'getArcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'arcode' + sufix,
            tokenId: 'code',
            searchKey: 'str',
            minChars: 2,
            preventDuplicates: false,
            //pairField: 'ardesc' + sufix,
            //pairKey: 'expand',
            fields: [
                { ui: 'ardesc' + sufix, api: 'expand' },
                { ui: 'arcode' + sufix, api: 'code' }
            ]
        };
        initCombineAutoComplete(salesConfig2);

        /* COS Description */
        const cosConfig = {
            task: 'getApcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'apdesc' + sufix,
            tokenId: 'code',
            searchKey: 'expand',
            minChars: 2,
            preventDuplicates: false,
            pairField: 'apcode' + sufix,
            pairKey: 'code',
            fields: [
                { ui: 'apdesc' + sufix, api: 'expand' },
                { ui: 'apcode' + sufix, api: 'code' }
            ]
        };
        initPairAutoComplete(cosConfig);

        const cosConfig2 = {
            task: 'getApcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'apcode' + sufix,
            tokenId: 'code',
            searchKey: 'code',
            minChars: 2,
            preventDuplicates: false,
            pairField: 'apdesc' + sufix,
            pairKey: 'expand',
            fields: [
                { ui: 'apdesc' + sufix, api: 'expand' },
                { ui: 'apcode' + sufix, api: 'code' }
            ]
        };
        initPairAutoComplete(cosConfig2);
    }
});
