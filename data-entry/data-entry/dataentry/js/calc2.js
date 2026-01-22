/**** Function to sum all values inputs that id starts prefix and has index ****/
/* prefix - prefix of inputs */
/* targetId - a input to display the total */
function sumAllInputs(prefix, targetId) {
    let total = 0;
    const inputs = document.querySelectorAll(`[id^="${prefix}"]`);
    inputs.forEach(el => {
        const index = el.id.substring(prefix.length);
        if (!isNaN(index) && !isNaN(el.value)) total += Number(el.value);
    });
    document.getElementById(targetId).value = total.toLocaleString();
}

function addEventToAllInputs(prefix, targetId) {
    sumAllInputs(prefix, targetId);
    const inputs = document.querySelectorAll(`[id^="${prefix}"]`);
    inputs.forEach(el => {
        el.addEventListener("change", function(){ sumAllInputs(prefix, targetId); });
    });
}

function addEventToAllCheckboxes(prefix, inputPrefix, targetId) {
    const inputs = document.querySelectorAll(`[id^="${prefix}"]`);
    inputs.forEach(el => {
        el.addEventListener("change", function(){ sumAllInputs(inputPrefix, targetId); });
    });
}