        $(document).ready(function () {

            /* Autocomplete ports  */
            var expand = $("#locationName").val();
            var prePopulate = expand ? [{ code: '99999999', expand: expand }] : [];
            $("#locationName").tokenInput("Handler.ashx", {
                queryParam: "location_name_query",
                propertyToSearch: "expand",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#locationName").val(data.expand);
                    $("#locationCode").val(data.code);
                    $("#locationIso").val(data.iso);
                    $("#locationUncode").val(data.uncode);
                    $("#locationUncity").val(data.uncity);
                    $("#locationUniso").val(data.uniso);
                    $("#locationAir").val(data.schdair);
                    $("#locationOcean").val(data.schdocn);
                    return true;
                },
                onDelete: function () {
                    $("#locationName").val('');
                    $("#locationCode").val('');
                    $("#locationIso").val('');
                    $("#locationUncode").val('');
                    $("#locationUncity").val('');
                    $("#locationUniso").val('');
                    $("#locationAir").val('');
                    $("#locationOcean").val('');
                }
            });

            /* Autocomplete ports2  */
            var portname = $("#portName").val();
            var prePopulate = portname ? [{ code: '99999999', portname: portname }] : [];
            $("#portName").tokenInput("Handler.ashx", {
                queryParam: "port_name_query",
                propertyToSearch: "expand",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#portName").val(data.expand);
                    $("#portCode").val(data.code);
                    $("#portIso").val(data.iso);
                    $("#portAir").val(data.schdair);
                    $("#portOcean").val(data.schdocn);
                    return true;
                },
                onDelete: function () {
                    $("#portName").val('');
                    $("#portCode").val('');
                    $("#portIso").val('');
                    $("#portAir").val('');
                    $("#portOcean").val('');
                }
            });

            /* Autocomplete Contact  */
            var custname = $("#contactName").val();
            var prePopulate = custname ? [{ code: '99999999', custname: custname }] : [];
            $("#contactName").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#contactName").val(data.name);
                    $("#contactCode").val(data.code);
                    $("#contactAddr1").val(data.addr1);
                    $("#contactAddr2").val(data.addr2);
                    $("#contactAddr3").val(data.addr3);
                    $("#contactCity").val(data.city);
                    $("#contactState").val(data.state);
                    $("#contactPostal").val(data.zip);
                    $("#contactCountry").val(data.country);
                    $("#contactPhone").val(data.phone);
                    $("#contactEmail").val(data.email);
                    $("#contactContact").val(data.contact);
                    $("#contactCsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#contactName").val('');
                    $("#contactCode").val('');
                    $("#contactAddr1").val('');
                    $("#contactAddr2").val('');
                    $("#contactAddr3").val('');
                    $("#contactCity").val('');
                    $("#contactState").val('');
                    $("#contactPostal").val('');
                    $("#contactCountry").val('');
                    $("#contactPhone").val('');
                    $("#contactEmail").val('');
                    $("#contactContact").val('');
                    $("#contactCsr").val('');
                }
            });

            /* Autocomplete Shipper  */
            var shipname = $("#shipname").val();
            var prePopulate = shipname ? [{ code: '99999999', shipname: shipname }] : [];
            $("#shipname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#shipname").val(data.name);
                    $("#shipid").val(data.code);
                    $("#shipadd1").val(data.addr1);
                    $("#shipadd2").val(data.addr2);
                    $("#shipadd3").val(data.addr3);
                    $("#shipcity").val(data.city);
                    $("#shipst").val(data.state);
                    $("#shipzip").val(data.zip);
                    $("#shipiso").val(data.country);
                    $("#shipph").val(data.phone);
                    $("#shipemail").val(data.email);
                    $("#shipcont").val(data.contact);
                    $("#shipcsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#shipname").val('');
                    $("#shipid").val('');
                    $("#shipadd1").val('');
                    $("#shipadd2").val('');
                    $("#shipadd3").val('');
                    $("#shipcity").val('');
                    $("#shipst").val('');
                    $("#shipzip").val('');
                    $("#shipiso").val('');
                    $("#shipph").val('');
                    $("#shipemail").val('');
                    $("#shipcont").val('');
                    $("#shipcsr").val('');
                }
            });

            /* Autocomplete Consignee  */
            var consname = $("#consname").val();
            var prePopulate = consname ? [{ code: '99999999', consname: consname }] : [];
            $("#consname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#consname").val(data.name);
                    $("#consid").val(data.code);
                    $("#consadd1").val(data.addr1);
                    $("#consadd2").val(data.addr2);
                    $("#consadd3").val(data.addr3);
                    $("#conscity").val(data.city);
                    $("#consst").val(data.state);
                    $("#conszip").val(data.zip);
                    $("#consiso").val(data.country);
                    $("#consph").val(data.phone);
                    $("#consemail").val(data.email);
                    $("#conscont").val(data.contact);
                    $("#conscsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#consname").val('');
                    $("#consid").val('');
                    $("#consadd1").val('');
                    $("#consadd2").val('');
                    $("#consadd3").val('');
                    $("#conscity").val('');
                    $("#consst").val('');
                    $("#conszip").val('');
                    $("#consiso").val('');
                    $("#consph").val('');
                    $("#consemail").val('');
                    $("#conscont").val('');
                    $("#conscsr").val('');
                }
            });

            /* Autocomplete Notify Party  */
            var notiname = $("#notiname").val();
            var prePopulate = notiname ? [{ code: '99999999', notiname: notiname }] : [];
            $("#notiname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#notiname").val(data.name);
                    $("#notiid").val(data.code);
                    $("#notiadd1").val(data.addr1);
                    $("#notiadd2").val(data.addr2);
                    $("#notiadd3").val(data.addr3);
                    $("#noticity").val(data.city);
                    $("#notist").val(data.state);
                    $("#notizip").val(data.zip);
                    $("#notiiso").val(data.country);
                    $("#notiph").val(data.phone);
                    $("#notiemail").val(data.email);
                    $("#noticont").val(data.contact);
                    $("#noticsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#notiname").val('');
                    $("#notiid").val('');
                    $("#notiadd1").val('');
                    $("#notiadd2").val('');
                    $("#notiadd3").val('');
                    $("#noticity").val('');
                    $("#notist").val('');
                    $("#notizip").val('');
                    $("#notiiso").val('');
                    $("#notiph").val('');
                    $("#notiemail").val('');
                    $("#noticont").val('');
                    $("#noticsr").val('');
                }
            });

            /* Autocomplete Bill To  */
            var billname = $("#billname").val();
            var prePopulate = billname ? [{ code: '99999999', billname: billname }] : [];
            $("#billname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#billname").val(data.name);
                    $("#billid").val(data.code);
                    $("#billadd1").val(data.addr1);
                    $("#billadd2").val(data.addr2);
                    $("#billadd3").val(data.addr3);
                    $("#billcity").val(data.city);
                    $("#billst").val(data.state);
                    $("#billzip").val(data.zip);
                    $("#billiso").val(data.country);
                    $("#billph").val(data.phone);
                    $("#billemail").val(data.email);
                    $("#billcont").val(data.contact);
                    $("#billcsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#billname").val('');
                    $("#billid").val('');
                    $("#billadd1").val('');
                    $("#billadd2").val('');
                    $("#billadd3").val('');
                    $("#billcity").val('');
                    $("#billst").val('');
                    $("#billzip").val('');
                    $("#billiso").val('');
                    $("#billph").val('');
                    $("#billemail").val('');
                    $("#billcont").val('');
                    $("#billcsr").val('');
                }
            });

            /* Autocomplete Pick Up  */
            var pickname = $("#pickname").val();
            var prePopulate = pickname ? [{ code: '99999999', pickname: pickname }] : [];
            $("#pickname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#pickname").val(data.name);
                    $("#pickid").val(data.code);
                    $("#pickadd1").val(data.addr1);
                    $("#pickadd2").val(data.addr2);
                    $("#pickadd3").val(data.addr3);
                    $("#pickcity").val(data.city);
                    $("#pickst").val(data.state);
                    $("#pickzip").val(data.zip);
                    $("#pickiso").val(data.country);
                    $("#pickph").val(data.phone);
                    $("#pickemail").val(data.email);
                    $("#pickcont").val(data.contact);
                    $("#pickcsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#pickname").val('');
                    $("#pickid").val('');
                    $("#pickadd1").val('');
                    $("#pickadd2").val('');
                    $("#pickadd3").val('');
                    $("#pickcity").val('');
                    $("#pickst").val('');
                    $("#pickzip").val('');
                    $("#pickiso").val('');
                    $("#pickph").val('');
                    $("#pickemail").val('');
                    $("#pickcont").val('');
                    $("#pickcsr").val('');
                }
            });

            /* Autocomplete Deliver To  */
            var delvname = $("#delvname").val();
            var prePopulate = delvname ? [{ code: '99999999', delvname: delvname }] : [];
            $("#delvname").tokenInput("Handler.ashx", {
                queryParam: "contact_name_query",
                propertyToSearch: "name",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#delvname").val(data.name);
                    $("#delvid").val(data.code);
                    $("#delvadd1").val(data.addr1);
                    $("#delvadd2").val(data.addr2);
                    $("#delvadd3").val(data.addr3);
                    $("#delvcity").val(data.city);
                    $("#delvst").val(data.state);
                    $("#delvzip").val(data.zip);
                    $("#delviso").val(data.country);
                    $("#delvph").val(data.phone);
                    $("#delvemail").val(data.email);
                    $("#delvcont").val(data.contact);
                    $("#delvcsr").val(data.csr);
                    return true;
                },
                onDelete: function () {
                    $("#delvname").val('');
                    $("#delvid").val('');
                    $("#delvadd1").val('');
                    $("#delvadd2").val('');
                    $("#delvadd3").val('');
                    $("#delvcity").val('');
                    $("#delvst").val('');
                    $("#delvzip").val('');
                    $("#delviso").val('');
                    $("#delvph").val('');
                    $("#delvemail").val('');
                    $("#delvcont").val('');
                    $("#delvcsr").val('');
                }
            });





            /* Autocomplete Vessel  */
            var vessel = $("#vesselName").val();
            var prePopulate = vessel ? [{ code: '99999999', vessel: vessel }] : [];
            $("#vesselName").tokenInput("Handler.ashx", {
                queryParam: "vessel_name_query",
                propertyToSearch: "vessel",
                tokenValue: "imo",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#vesselName").val(data.vessel);
                    $("#vesselImo").val(data.imo);
                    $("#vesselFlag").val(data.flag);
                    $("#vesselCallsign").val(data.callsign);
                    $("#vesselopscode").val(data.opscode);
                    return true;
                },
                onDelete: function () {
                    $("#vesselName").val('');
                    $("#vesselImo").val('');
                    $("#vesselFlag").val('');
                    $("#vesselCallsign").val('');
                    $("#vesselopscode").val('');
                }
            });

            /* Autocomplete Apcode  */
            var apcode = $("#apCode").val();
            var prePopulate = apcode ? [{ code: '99999999', code: apcode }] : [];
            $("#apCode").tokenInput("Handler.ashx", {
                queryParam: "apcode_name_query",
                propertyToSearch: "code",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#apCode").val(data.code);
                    $("#apName").val(data.expand);
                    $("#dbPost").val(data.dbpost);
                    $("#dbPostname").val(data.dbpostname);
                    $("#crPost").val(data.crpost);
                    $("#crPostname").val(data.crpostname);
                    $("#dbAccr").val(data.dbaccr);
                    $("#dbAccrname").val(data.dbaccrname);
                    $("#crAccr").val(data.craccr);
                    $("#crAccrname").val(data.craccrname);
                    return true;
                },
                onDelete: function () {
                    $("#apCode").val('');
                    $("#apName").val('');
                    $("#dbPost").val('');
                    $("#dbPostname").val('');
                    $("#crPost").val('');
                    $("#crPostname").val('');
                    $("#dbAccr").val('');
                    $("#dbAccrname").val('');
                    $("#crAccr").val('');
                    $("#crAccrname").val('');
                }
            });

             /* Autocomplete Arcode  */
            var arcode = $("#arCode").val();
            var prePopulate = arcode ? [{ code: '99999999', code: arcode }] : [];
            $("#arCode").tokenInput("Handler.ashx", {
                queryParam: "arcode_name_query",
                propertyToSearch: "code",
                tokenValue: "code",
                minChars: 2,
                preventDuplicates: true,
                tokenLimit: 1,
                prePopulate: prePopulate,
                onAdd: function (data) {
                    $("#arCode").val(data.code);
                    $("#arName").val(data.expand);
                    $("#arApCode").val(data.apcode);
                    $("#arApName").val(data.apname);
                    $("#arDbPost").val(data.dbpost);
                    $("#arDbPostname").val(data.dbpostname);
                    $("#arCrPost").val(data.crpost);
                    $("#arCrPostname").val(data.crpostname);
                    $("#dbWip").val(data.dbwip);
                    $("#dbWipname").val(data.dbwipname);
                    $("#crWip").val(data.crwip);
                    $("#crWipname").val(data.crwipname);
                    return true;
                },
                onDelete: function () {
                    $("#arCode").val('');
                    $("#arName").val('');
                    $("#arApCode").val('');
                    $("#arApName").val('');
                    $("#arDbPost").val('');
                    $("#arDbPostname").val('');
                    $("#arCrPost").val('');
                    $("#arCrPostname").val('');
                    $("#dbWip").val('');
                    $("#dbWipname").val('');
                    $("#crWip").val('');
                    $("#crWipname").val('');
                }
            });
        });
