        $(document).ready(function () {
            const compname = $("#compname").val();
            const compid = $("#compid").val() || '99999999';
            const prePopulate = compname ? [{ compid: compid, compname: compname }] : [];
            $("#compname").tokenInput("PackageLookUp.ashx?task=getcompanies", {
                propertyToSearch: "compname",
                tokenValue: "compid",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (comp) {
                    console.log('onAdd', comp);
                    $("#compname").val(comp.compname);
                    $("#compid").val(comp.compid);
                    return true;
                },
                onDelete: function () {
                    $("#compname").val('');
                    $("#compid").val('');
                }
            });

            $("#rigdate").datepicker();

            $()
        });
