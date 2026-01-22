var packagevalue = $("#packagevalue").val();
var recid = $("#recid").val();
$(document).ready(function () {
    const compname = $("#compname").val();
    const compid = $("#compid").val() || '99999999';
    const prePopulate = compname ? [{ compid: compid, compname: compname }] : [];

    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    $("#compname").tokenInput("PackageLookUp.ashx?task=getcompanies", {
        propertyToSearch: "compname",
        tokenValue: "compid",
        minChars: 2,
        preventDuplicates: true,
        tokenLimit: 1,
        prePopulate: prePopulate,
        onAdd: function (comp) {
            $("#compname").val(comp.compname);
            $("#compid").val(comp.compid);
            loadPackages(comp.compid);
            return true;
        },
        onDelete: function () {
            $("#compname").val('');
            $("#compid").val('');
            $('#package').empty().append(`<option value="">SELECT FROM LIST</option>`);
        },
        onReady: function () {
            $("#compname").val(compname);
        }
    });

    if (recid && recid != -1)
        loadAssetDetails(recid);
    else if (compid && recid == -1)
        loadPackages(compid);
    else {
        addAssetDetail();
        addNonrfidDetail();
    }


    $("#rigdate").datepicker();

    $("#package").on("change", function () {
        loadPackage($(this).val());
    });

    $("#prompt_cancel").on("click", function () {
        $("#packagename").val('');
        $("#pkgdetid").val('');
        $.modal.close();
    });

    $("#prompt_ok").on("click", function () {
        const pkgdetid = $('#pkgdetid').val();
        const packagename = $('#packagename').val();
        $('#package').append(`<option value="${pkgdetid}">${packagename}</option>`);
        $('#package').val(pkgdetid);
        $.modal.close();
        //createPackage();
    });

    $("#newpkg").on("change", function () {
        checkPkg();
    });

    $("#asset_add_btn").on("click", function () {
        addAssetDetail();
    });

    $("#nonrfid_add_btn").on("click", function () {
        addNonrfidDetail();
    });

    $("#api_add_btn").on("click", function () {
        addAPI();
    });

    loadAPIs();
});

function loadoutFormSubmit() {
    const compname = $("#loadoutForm #compname").val();
    const compid = $("#loadoutForm #compid").val();
    const package = $("#loadoutForm #package").val();
    const leasename = $("#loadoutForm #leasename").val();
    const rigdate = $("#loadoutForm #rigdate").val();
    
    if (!compname) {
        alert('Customer Cannot Be Blank!');
        return false;
    }
    if (!package) {
        alert('Package Cannot Be Blank!');
        return false;
    }
    if (!leasename) {
        alert('Lease Name Cannot Be Blank!');
        return false;
    }
    if (!rigdate) {
        alert('Rig Date Cannot Be Blank!');
        return false;
    }

    const descnnn = [];
    $(".asset_row .descnnn").each(function () {
        descnnn.push($(this).val());
    });

    const hasDuplicates = checkForDuplicates(descnnn);
    if (hasDuplicates) {
        alert('Loadout Has Duplicate Asset Details!');
        return false;
    }

    return true;
}

