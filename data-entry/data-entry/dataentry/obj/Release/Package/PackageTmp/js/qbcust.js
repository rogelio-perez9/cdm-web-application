$(document).ready(function () {
    $('#customerForm').submit(function (event) {
        event.preventDefault();
        SaveCustomer();
    });
});

function sendQBString() {
    const url = window.location.href;
    if (url.indexOf('code') === -1)
        SaveCustomer();
}

function InitCustomer() {
    const qbmid = $('#qbmid').val();
    const settings = {
        "url": "QuickBooksHandler.ashx",
        "contentType": "application/json; charset=utf-8",
        "data": { module: 'qbcust', qbmid },
        "responseType": "json"
    };

    $.ajax(settings).done(function (response) {
        window.location.href = response;
    });
}

function SaveCustomer() {
    $('#A1').attr('disabled', 'disabled');
    $('#A1').val('Loading...');

    const customerData = $('#QBAPI').val();
    const settings = {
        "url": "CustomerHandler.ashx",
        "contentType": "application/json; charset=utf-8",
        "headers": {
            "Content-Type": "application/json"
        },
        "data": ({ customerData: customerData }),
        "responseType": "json"
    };

    $.ajax(settings).done(function (response) {
        var obj = jQuery.parseJSON(response);
        if (obj.Status == "0") {
            alert(obj.Message);
            $('#A1').val('R E C O R D - S A V E D');
            $('#A1').removeAttr('disabled')
            return false;
        }
        if (obj.Status == "1") {
            alert(obj.Message);
            $('#A1').val('R E C O R D - S A V E D');
        }
        else {
            InitCustomer();
        }
    });
}