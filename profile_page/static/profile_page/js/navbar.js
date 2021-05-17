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