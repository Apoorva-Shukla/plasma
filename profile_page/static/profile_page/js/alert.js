function showAlert(message='Somthing went wrong', period=3000) {
    const alertContainer = $('.l-alert-c');
    const alertContainerFluid = $('.l-alert-fluid');
    const fluidId = `${alertContainerFluid.length+1}-alert-fluid`;

    alertContainer.removeClass('d-none');

    alertContainer.prepend(`<div class="l-alert-fluid px-3 py-3 mt-3" id="${fluidId}">
        <span>${message}</span>
    </div>`);

    let interval = setInterval(() => {
        $('#' + fluidId).remove();
        clearTimeout(interval);
    }, period);
}