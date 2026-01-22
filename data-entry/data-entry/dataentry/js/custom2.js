function CompanyLookup(compname, compid, addr1, addr2, addr3, city, state, zip, iso, contact, phone, email, hrsop1, hrsop2) {
    $("#" + compname).autocomplete({
        source: "api/contact",
        minLength: 2,
        select: function (event, ui) {
            event.preventDefault();
            $("#" + compname).val(ui.item.custname)
            $("#" + compid).val(ui.item.custid)
            $("#" + addr1).val(ui.item.addr1)
            $("#" + addr2).val(ui.item.addr2)
            $("#" + addr3).val(ui.item.addr3)
            $("#" + city).val(ui.item.city)
            $("#" + state).val(ui.item.state)
            $("#" + zip).val(ui.item.zip)
            $("#" + iso).val(ui.item.iso)
            $("#" + contact).val(ui.item.contact)
            $("#" + phone).val(ui.item.phone1)
            $("#" + email).val(ui.item.email1)
            $("#" + fax1).val(ui.item.fax1)
            $("#" + hrsop1).val(ui.item.hrsop1)
            $("#" + hrsop2).val(ui.item.hrsop2)
            ;
        },
        focus: function (event, ui) {
        }
    })
        .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>")
                .append(item.custname)
                .appendTo(ul);
        };
}
