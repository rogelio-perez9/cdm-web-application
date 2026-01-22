$(document).ready(function () {
    $('#start_btn').on('click', function () {
        $.ajax({
            url: 'Handlers/ics2.ashx?task=createDraft',
            contentType: "application/json; charset=utf-8",
            type: 'POST',
            success: function (res) {
                console.log(res)
            }
        });
    });
});