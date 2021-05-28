// circle utils
$(document).on('click', '.e-btn', (e) => {
    let target = e.target;
    while (!target.classList.toString().includes('e-btn')) {
        target = target.parentElement;
    }

    let button_id = target.id;
    let grandparent_id = target.parentElement.parentElement.id;

    console.log(button_id, grandparent_id);
    callAJAX('POST', '/create/circle/',
    data={
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        person: Number(button_id.replace('-people', '')),
        circle: Number(grandparent_id.replace('-circle', '')),
        _name: 'remove-person',
    },
    success=() => {
        $('#most-unique-damn-it').remove();
        showAlert(`Successfully removed <strong class="text-blue">${$(`#${button_id}`).attr('name')}</strong> from <strong class="text-blue">${$(`#${grandparent_id}`).attr('name')}</strong>`);
        $('#container_id').load(location.href+' #container_fluid_id');
        $('.container').show();
    },
    error=() => {
        showAlert();
        $('.container').show();
        $('#most-unique-damn-it').remove();
    },
    beforeSend=() => {
        $('.container').hide();
        $('body').append('<p id="most-unique-damn-it">Updating...</p>');
    });
});

$(document).on('input', '#search-user-inp', (e) => {
    callAJAX('POST', '');
});