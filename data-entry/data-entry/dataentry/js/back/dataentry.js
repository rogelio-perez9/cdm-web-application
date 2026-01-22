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

$(document).ready(function () {
    $("#date").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#reqshipdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#pickdate").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd1").datepicker({
        dateFormat: "mm/dd/yy",
    });
    $("#etd2").datepicker({
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

    for (let i = 1; i < 21; i += 1) {
    /* Sales Description */
        const sufix = String(i).padStart(2, '0');
        const salesConfig = {
            task: 'getArcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'ardesc' + sufix,
            tokenId: 'code',
            searchKey: 'expand',
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

        const salesConfig2 = {
            task: 'getArcodes',
            url: 'dataentry.ashx',
            queryParam: 'q',
            fieldId: 'arcode' + sufix,
            tokenId: 'code',
            searchKey: 'code',
            minChars: 2,
            preventDuplicates: false,
            pairField: 'ardesc' + sufix,
            pairKey: 'expand',
            fields: [
                { ui: 'ardesc' + sufix, api: 'expand' },
                { ui: 'arcode' + sufix, api: 'code' }
            ]
        };
        initPairAutoComplete(salesConfig2);

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
