function initQbpwAutoComplete(config) {
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
            $("#" + config.fieldId).val(data['no']);
            $("#" + config.container +" .token-input-token > p").html(data['no']);
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
    const qbpwQuoteNoConfig = {
        task: 'getQuoteNos',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'quoteno',
        tokenId: 'quoteno',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: true,
        container: 'quoteno_th',
        fields: [
            { ui: 'quoteno', api: 'no' }
        ]
    };
    initQbpwAutoComplete(qbpwQuoteNoConfig);

    const qbpwCdmBookNoConfig = {
        task: 'getCdmBookNos',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'cdmbookno',
        tokenId: 'cdmbookno',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: true,
        container: 'cdmbookno_th',
        fields: [
            { ui: 'cdmbookno', api: 'no' }
        ]
    };
    initQbpwAutoComplete(qbpwCdmBookNoConfig);

    const qbpwPickNoConfig = {
        task: 'getPickNos',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'pickno',
        tokenId: 'pickno',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: true,
        container: 'pickno_th',
        fields: [
            { ui: 'pickno', api: 'no' }
        ]
    };
    initQbpwAutoComplete(qbpwPickNoConfig);

    const qbpwWrNoConfig = {
        task: 'getWrNos',
        url: 'dataentry.ashx',
        queryParam: 'q',
        fieldId: 'wrno',
        tokenId: 'wrno',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: true,
        container: 'wrno_th',
        fields: [
            { ui: 'wrno', api: 'no' }
        ]
    };
    initQbpwAutoComplete(qbpwWrNoConfig);

});
