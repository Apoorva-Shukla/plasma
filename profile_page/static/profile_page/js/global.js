function callAJAX(type, url, data, success=() => {}, error=() => {}, beforeSend=() => {}) {
    $.ajax({
        type: type,
        url: url,
        data: data,
        success: function(data) {
            success(data);
        },
        error: error,
        beforeSend: beforeSend,
        dataType: 'json',
    });
}

function friendRequest(r, name, s) {
    callAJAX('POST', '/friend/', {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken').val(),
        r: r,
        name: name,
    },
    success=() => {
        s();
        $('.add-friend-btn').attr('disabled', true)
    },
    error=() => {
        showAlert();
    },
    beforeSend=() => {
        document.querySelector('.add-friend-btn').disabled = true;
    });
}

function replaceAll(str, find, replace) {
    let escapedFind=find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return str.replace(new RegExp(escapedFind, 'g'), replace);
}