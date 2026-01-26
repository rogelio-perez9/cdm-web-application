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

    $("#jedate").datepicker({
        dateFormat: "mm/dd/yy",
    });

    $('#entry-add-btn').on('click', function () {
        onAddEntry();
    });

    $('#A1').on('click', function () {
        onCheckValidation();
    });

});

function onAddEntry(index = 1) {
    let ind = index;
    const trs = $('#journalentry-table tr');
    const lastPos = trs.length - 3;
    const lastTr = $(trs[lastPos]);
    if (lastTr) {
        const trId = lastTr.attr('id');
        if (trId) {
            const nn = trId.split('_');
            ind = parseInt(nn[nn.length - 1]) + 1;
        }
    }
    const id = ind.toString().padStart(3, '0');
    let tr = "";
    tr += `<tr id="entry_row_${id}">`;
    tr += `<th id="acctno-th${id}"><input name="acctno${id}" id="acctno${id}" /></th>`;
    tr += `<th id="acctname-th${id}"><input name="acctname${id}" id="acctname${id}" readonly /></th>`;
    tr += `<th id="cramt-th${id}"><input name="cramt${id}" id="cramt${id}" type="number" min=0 /></th>`;
    tr += `<th id="dbamt-th${id}"><input name="dbamt${id}" id="dbamt${id}" type="number" min=0 /></th>`;
    tr += `<th style="display: flex; width: 100%; padding: 8px 0; justify-content: center;"><img src="images/icon-edit.png" onclick="onEditEntry('${id}')" style="width: 50px; height: 50px; margin-right: 24px;"><img src="images/minus.gif" onclick="onDeleteEntry('entry_row_${id}')" style="width: 50px; height: 50px;"></th>`
    tr += "</tr>";
    $('#journalentry-table tr').eq(lastPos).after(tr);
    onLoadAccounts(id);
    $(`#cramt${id}`).on('change', function () {
        if ($(`#cramt${id}`).val().length > 0) {
            $(`#dbamt${id}`).val('').prop('disabled', true);
            onCalTotal();
        }
    });
    $(`#dbamt${id}`).on('change', function () {
        if ($(`#dbamt${id}`).val().length > 0) {
            $(`#cramt${id}`).val('').prop('disabled', true);
            onCalTotal();
        }
    });
}

function onEditEntry(id) {
    $(`#dbamt${id}`).prop('disabled', false);
    $(`#cramt${id}`).prop('disabled', false);
}

function onDeleteEntry(rowId) {
    $(`#${rowId}`).remove();
    onCalTotal();
}

function onCalTotal() {
    let totalcr = 0;
    let totaldb = 0;
    const trs = $('#journalentry-table tr');
    const n = trs.length;
    if (n > 3) {
        for (i = 1; i < n - 2; i++) {
            const trId = $(trs[i]).attr('id');
            const nn = trId.split('_');
            const id = nn[nn.length - 1];
            totalcr += parseFloat($(`#cramt${id}`).val() || 0, 10);
            totaldb += parseFloat($(`#dbamt${id}`).val() || 0, 10);
        }
    }
    $('#totalcr').val(totalcr);
    $('#totaldb').val(totaldb);
}

function onSetErrorMessage(msg) {
    $('#form-error-message').html(msg);
}

function onCheckValidation() {
    onSetErrorMessage('');
    const jeno = $(`#jeno`).val();
    const jedate = $(`#jedate`).val();
    const jeref = $(`#jeref`).val();
    if (!jeno || !jedate || !jeref) {
        onSetErrorMessage('Journal Entry Number, Journal Entry Date and Journal Entry Reference can not be blank.');
        return;
    }
    const dateReg = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!jedate.match(dateReg)) {
        onSetErrorMessage('Journal Entry Date should be formatted in MM/dd/yyyy.');
        return;
    }
    const trs = $('#journalentry-table tr');
    const n = trs.length;
    if (n === 3) {
        onSetErrorMessage('Please add some entries.');
        return;
    }
    const totalcr = Number($('#totalcr').val());
    const totaldb = Number($('#totaldb').val());
    if (totalcr !== totaldb) {
        onSetErrorMessage('Total credits must be equal total debits.');
        return;
    }
    const acctNos = [];
    const cramts = [];
    const dbamts = [];
    for (i = 1; i < n - 2; i++) {
        const trId = $(trs[i]).attr('id');
        const nn = trId.split('_');
        const id = nn[nn.length - 1];
        const acctno = $(`#acctno${id}`).val();
        const cramt = parseFloat($(`#cramt${id}`).val() || 0, 10);
        const dbamt = parseFloat($(`#dbamt${id}`).val() || 0, 10);
        if (acctno.length === 0) {
            onSetErrorMessage('GL Account can not be black.');
            return;
        }
        if (cramt === 0 && dbamt === 0) {
            onSetErrorMessage('Please enter either credit or debit.');
            return;
        }
        if (cramt < 0 || dbamt < 0) {
            onSetErrorMessage('Credit amount and debit account can not be negative.');
            return;
        }
        acctNos.push(acctno);
        cramts.push(cramt);
        dbamts.push(dbamt);
    }
    var formData = new FormData();
    formData.append("userid", $('#userid').val());
    formData.append("jeno", jeno);
    const jedates = jedate.split('/');
    formData.append("jedate", `${jedates[2]}-${jedates[0]}-${jedates[1]}`);
    formData.append("jeref", jeref);
    formData.append("division", $('#division').val());
    formData.append("station", $('#station').val());
    formData.append("currency", $('#currency').val());
    formData.append("exrate", $('#exrate').val() || 0);
    formData.append("acctNos[]", acctNos);
    formData.append("cramts[]", cramts);
    formData.append("dbamts[]", dbamts);
    const sqid = $("#sqid").val();
    $.ajax({
        type: "POST",
        url: `dataentry.ashx?task=saveJournalEntry&sqid=${sqid}`,
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            alert('Successfully saved!');
            onResetForm();
        }
    });
}

function onResetForm() {
    const trs = $('#journalentry-table tr');
    const n = trs.length;
    if (n > 3) {
        for (i = 1; i < n - 2; i++) {
            const trId = $(trs[i]).attr('id');
            if (trId) $(`#${trId}`).remove();
        }
    }
    $('#journalentry-form').trigger("reset");
}

function onLoadAccounts(id) {
    const accountInput = {
        url: 'dataentry.ashx',
        task: 'getJournalAccounts',
        queryParam: 'q',
        fieldId: `acctno${id}`,
        tokenId: 'code',
        searchKey: 'str',
        minChars: 2,
        preventDuplicates: false,
        fields: [
            { ui: `acctname${id}`, api: 'expand' },
            { ui: `acctno${id}`, api: 'code' }
        ]
    };
    initAutoComplete(accountInput);
}

function initAutoComplete(config) {
    if ($(`#${config.fieldId}`).is('[readonly]')) return;
    const initValue = $(`#${config.fieldId}`).val();
    const prePopulate = initValue ? [{ [config.tokenId]: '999-99999', [config.searchKey]: initValue }] : [];
    const sqid = $("#sqid").val();
    if (!config.url || !config.fieldId || !config.tokenId || !config.searchKey || !config.task) {
        console.error('Missing the required params');
        return false;
    }
    let query = '';
    if (config.params) {
        config.params.forEach(p => {
            query += `&${p.key}=${$(p.field).val()}`;
        });
    }
    $("#" + config.fieldId).tokenInput(config.url + "?task=" + config.task + "&sqid=" + sqid + query, {
        queryParam: config.queryParam || 'q',
        propertyToSearch: config.searchKey,
        tokenValue: config.tokenId,
        minChars: config.minChars || 2,
        preventDuplicates: config.preventDuplicates || false,
        tokenLimit: config.tokenLimit || 1,
        prePopulate: prePopulate,
        allowFreeTagging: config.allowFreeTagging || false,
        onAdd: function (data) {
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
    });
}
