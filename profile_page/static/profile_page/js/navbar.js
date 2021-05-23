const months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'];


document.getElementById('toggle-sidebar').onclick = (e) => {

    if (document.querySelector('#sidebar').classList.toString().includes('d-none')) {
        document.querySelector('#sidebar').classList.remove('d-none');
        document.cookie = "sidebarState=visible; path=/";
    } else {
        document.querySelector('#sidebar').classList.add('d-none');
        document.cookie = "sidebarState=hidden; path=/";
    }

}

$(document).ready(() => {
    let _cookie = document.cookie.split('; ');
    for (const i in _cookie) {
        if (_cookie[i].toString().includes('sidebarState')) {
            if (_cookie[i].toString().split('=')[1] == 'hidden') {
                document.querySelector('#sidebar').classList.add('d-none');
            }
            break;
        }
    }
});


// account info dropdown
$(document).on('click', '.nav-user-photo', (e) => {
    $('.account-info-dropdown').toggle();
    $('.notifications-dropdown').hide();
});


// notifications dropdown
$(document).on('click', '#notifications-loader', (e) => {
    $('.notifications-dropdown').toggle();
    $('.account-info-dropdown').hide();

    callAJAX('POST', '/notifications/',
        data = {
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        },
        success = (data) => {
            $('.noti-spinner').remove();
            let notifications = $.parseJSON(data.notifications).reverse();
            let _html = ``;
            let date;
            let time;
            for (const i in notifications) {
                date = notifications[i].fields.date.split('-');
                time = notifications[i].fields.time.toString().split(':')[0] + ':' + notifications[i].fields.time.toString().split(':')[1];
                _html += `<a href="${notifications[i].fields.link}" class="e-notification d-block px-3 py-3 d-flex" style="justify-content: space-between;border-bottom: 1px solid rgba(182, 128, 128, 0.4);">
                    <span>${notifications[i].fields.notification_text}</span>
                    <small class="fw-normal" style="font-size: small;">${date[2]+' '+months[Number(date[1])-1]+' '+date[0]}, ${time}</small>
                    </a>`;
            }
            $('.notifications-fluid').append(_html);
        },
        error = () => {
            showAlert();
            $('.noti-spinner').remove();
        },
        beforeSend = () => {
            $('.e-notification').remove();
            $('.notifications-fluid').append(`<div class="text-center noti-spinner"><span class="spinner-border" role="status" aria-hidden="true"></span></div>`);
        },
    );
});