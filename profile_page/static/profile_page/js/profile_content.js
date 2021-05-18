const months = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'August', 'Sep', 'Oct', 'Nov', 'Dec'];
const container = $('.main-content');
const pagePosts = $('.page-posts');
const laterHtml = `<p class="text-center" id="more-post-container">
<button class="btn button-blue" id="load-more-posts-btn">Load more</button>
</p>

<div class="posts-loader-container text-center w-100 d-block py-2 d-none">
<span class="spinner-border text-secondary" role="status" aria-hidden="true"></span>
</div>`;

function loadMorePosts() {
    callAJAX("POST",
        "/load-post/",
        {
            username: $('#username').val(),
            length: $('.e-post').length, csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken').val(),
        },
        success = (data) => {
            const moreBool = $.parseJSON(data.more_bool);
            $('#more-post-container').remove();
            $('.posts-loader-container').remove();
            let wholeHtml;
            if (moreBool) {
                const posts = $.parseJSON(data.posts);
                const liked_or_not = data.liked_or_not;
                const like_stats = data.like_stats;
                const users = $.parseJSON(data.users);
                const profiles = $.parseJSON(data.profiles);
                const share_with = data.share_with;
                let content = ``;
                let like_btn = ``;
                let share_with_html = `<i class="fas fa-users mx-2 d-block my-auto" title="Shared with: Few People"></i>`;
                let _caption;

                for (let i = 0; i < posts.length; i++) {
                    _caption = JSON.stringify(posts[i].fields.caption).replace('"', '').replace('"', '').toString();
                    _caption = replaceAll(_caption, String.raw`\n`, '<br>').split('<br>');

                    if (!share_with[i]) {
                        share_with_html = `<i class="fas fa-globe-asia mx-2 d-block my-auto" title="Shared with: Public"></i>`;
                    }
                    if (posts[i].fields.image != '') {
                        content = `<img style="width: auto;height: auto;max-height: 80vh;max-width: 100%;" src="/media/${posts[i].fields.image}" alt=" ">`;
                    } else {
                        content = `<video style="width: auto;height: auto;max-height: 80vh;max-width: 100%;" src="/media/${posts[i].fields.video}" controls></video>`;
                    }

                    if (!liked_or_not[i]) {
                        like_btn = `<div class="like-btn-container d-inline-block">
                                <button name="like" class="far fa-thumbs-up like-button like-btn"></button>
                            </div>`;
                        if ($('#username').val() == '') {
                            like_btn = `<button class="far fa-thumbs-up like-btn-fake"></button>`;
                        }
                    } else {
                        like_btn = `<div class="like-btn-container d-inline-block">
                                <button name="unlike" class="fas fa-thumbs-up like-button unlike-btn"></button>
                            </div>`;
                    }

                    wholeHtml = `
                    <div class="e-post mb-4">
						<div class="about-post px-2 py-3 d-flex">
							<div class="d-flex">
                            <img class="my-auto d-block" src="/media/${profiles[i].fields.avatar}" alt=" ">
								<div class="mx-2 my-auto">
                                    <span class="d-block">${users[i].fields.username}</span>
                                    <small class="d-block my-auto d-flex">
                                        ${months[Number(posts[i].fields.date_added.split('-')[1]) - 1]} ${posts[i].fields.date_added.split('-')[2]}, ${posts[i].fields.date_added.split('-')[0]}
                                        ${share_with_html}
                                    </small>
								</div>
							</div>
							<button class="fas fa-ellipsis-h" data-bs-toggle="modal" data-bs-target="#post-option-modal"></button>
						</div>
						<div id="${posts[i].pk}-show-more-btn" class="e-post-caption px-2 py-1">
							<span class="d-block caption-text">${_caption}</span>
						</div>
						<div class="e-post-content w-100 text-center border mt-2">
                            ${content}
						</div>
                        <div class="e-post-options-wrapper">
                            <div class="e-post-options d-flex py-2" id="post-op2-${posts[i].pk}">
                                <div class="e-post-options-btn my-auto">
                                    ${like_btn}

                                    <div class="comment-btn-container d-inline-block">
										<button class="fas fa-comment comment-btn"></button>
									</div>
                                </div>
                                <div class="e-post-options-stats my-auto">
                                    <span class="mx-2">${like_stats[i]} likes</span>
                                    <a class="comment-btn underline-hover" style="background-color: transparent;font-size: initial;font-weight: initial;color: #000;width: initial;">4 comments</a>
                                </div>
                            </div>
                        </div>
                        <div class="e-comments border-top">
                                <div class="add-comment-container py-3">
                                    <input type="text" class="form-control w-100 transparent-inp" placeholder="Say something..." style="border-bottom: 1px solid rgba(128, 128, 128, 0.2)!important;">
                                </div>
                                <div class="e-comments-fluid py-3">
                                    <div class="e-comments-items"></div>
                                    <p class="text-center"><button class="btn button-green comment-load-btn">Load comments</button></p>
                                </div>
                            </div>
					</div>`;

                    $('#id_posts').append(wholeHtml);
                    if ($(`#${posts[i].pk}-show-more-btn`).find('span').height() > 43) {
                        $(`#${posts[i].pk}-show-more-btn`).find('span').addClass('caption-height');
                        $(`#${posts[i].pk}-show-more-btn`).find('span').addClass('overflow-hidden');

                        $(`#${posts[i].pk}-show-more-btn`).append(`<button name="show-more" class="underline-hover text-blue show-more-caption-btn fw-bold px-0">Show more</button>`);
                    }

                    $(`${posts[i].pk}-show-more-btn`).find('span.caption-text').html('');
                    for (const x in _caption) {
                        if (x > 0) {
                            document.getElementById(`${posts[i].pk}-show-more-btn`).children[0].innerText += _caption[x];
                        } else {
                            $(`#${posts[i].pk}-show-more-btn`).find('span.caption-text').text(_caption[x]);
                        }
                        $(`#${posts[i].pk}-show-more-btn`).find('span.caption-text').append('<br>');
                    }
                }
                $('.e-comments').hide();
                $('#id_posts').append(laterHtml);
                $("#load-more-posts-btn").on('click', $('#load-more-posts-btn'), (e) => {
                    loadMorePosts();
                });
            } else {
                pagePosts.append('<p class="text-center">Looks like you\'ve digested all Posts!</p>');
            }
        },
        () => {
            showAlert();
        },
        () => {
            $('#more-post-container').addClass('d-none');
            $('.posts-loader-container').removeClass('d-none');
        },
    );
}

$("#load-more-posts-btn").on('click', $('#load-more-posts-btn'), (e) => {
    loadMorePosts();
});


const form = document.querySelector('#upload-post-form');
const crsf = document.getElementsByName('csrfmiddlewaretoken');
const sendBtn = document.querySelector('.sendBtn');

let emptyInpCheck = 0;

let url = '';
function emptyOthers(vari, a) {
    if (vari != null) {
        vari.addEventListener('change', e => {
            a.value = '';
            url = URL.createObjectURL(vari.files[0]);
            if (vari.files[0].type.includes('image')) {
                document.querySelector('#filePreviewBox').innerHTML = `<div class="text-center w-100"><img style="max-width:100%;width:auto;max-height:80vh;height:auto;" class="px-3 py-3" src="${url}"></div>`;
            } else if (vari.files[0].type.includes('video')) {
                document.querySelector('#filePreviewBox').innerHTML = `<div class="text-center w-100"><video style="max-width:100%;width:auto;max-height:80vh;height:auto;" class="px-3 py-3" src="${url}" controls></video></div>`;
            } else {
                document.querySelector('#filePreviewBox').innerHTML = `<div class="text-center w-100"><span>The file you uploaded was either corrupted or not the supported file type.</span></div>`;
                vari.value = '';
                a.value = '';
            }
        });
    }
}

const inputElem = document.querySelector('#id_caption');
const fileUploadElemImage = document.querySelector('#id_image');
const fileUploadElemVideo = document.querySelector('#id_video');
const shareWithElem = document.querySelector('#id_share_with');

emptyOthers(fileUploadElemImage, fileUploadElemVideo);
emptyOthers(fileUploadElemVideo, fileUploadElemImage);
if (form != null) {

    form.addEventListener('submit', e => {
        e.preventDefault();

        emptyInpCheck = 0;
        for (let i of inputElem.value) {
            if (i == ' ') {
                emptyInpCheck += 1;
            }
        }

        if ((fileUploadElemImage.value == '' && fileUploadElemVideo.value == '') || (emptyInpCheck == inputElem.value.length || inputElem.value == '')) {
            return;
        }

        let fd = new FormData();
        fd.append('csrfmiddlewaretoken', crsf[0].value);
        fd.append('caption', inputElem.value);
        fd.append('image', fileUploadElemImage.files[0]);
        fd.append('video', fileUploadElemVideo.files[0]);
        fd.append('share_with', shareWithElem.value);
        fd.append('profile', Number($('#auth_username_pk').val()));

        $.ajax({
            type: 'POST',
            url: `/${$('#auth_username').val()}/`,
            enctype: "multipart/form-data",
            data: fd,
            success: function (data) {
                const _data = $.parseJSON(data['lp'])[0];
                let _caption = JSON.stringify(_data.fields.caption).replace('"', '').replace('"', '').toString();
                _caption = replaceAll(_caption, String.raw`\n`, '<br>').split('<br>');
                let content;

                let share_with_html = `<i class="fas fa-users mx-2 d-block my-auto" title="Shared with: Few People"></i>`;
                if (_data.fields.share_with == null) {
                    share_with_html = `<i class="fas fa-globe-asia mx-2 d-block my-auto" title="Shared with: Public"></i>`;
                }

                if (_data.fields.image != '') {
                    content = `<img style="width: auto;height: auto;max-height: 80vh;max-width: 100%;" src="/media/${_data.fields.image}" alt=" ">`;
                } else {
                    content = `<video style="width: auto;height: auto;max-height: 80vh;max-width: 100%;" src="/media/${_data.fields.video}" controls></video>`;
                }

                let mh = `<div class="e-post mb-4">
                        <div class="about-post px-2 py-3 d-flex">
                            <div class="d-flex">
                                <img class="my-auto d-block" src="${$('.profile-page-link').find('img').attr('src')}" alt=" ">
                                <div class="mx-2 my-auto">
                                    <span class="d-block">${$('#auth_username').val()}</span>
                                    <small class="d-block my-auto d-flex">
                                        ${months[Number(_data.fields.date_added.split('-')[1]) - 1]} ${_data.fields.date_added.split('-')[2]}, ${_data.fields.date_added.split('-')[0]}
                                        ${share_with_html}
                                    </small>
                                </div>
                            </div>
                            <button class="fas fa-ellipsis-h" data-bs-toggle="modal" data-bs-target="#post-option-modal"></button>
                        </div>
                        <div id="${_data.pk}-show-more-btn" class="e-post-caption px-2 py-1">
							<span class="d-block caption-text">${_caption}</span>
						</div>
                        <div class="e-post-content w-100 text-center border mt-2">
                            ${content}
                        </div>
                        <div class="e-post-options-wrapper">
                            <div class="e-post-options d-flex py-2" id="post-op-${_data.pk}">
                                <div class="e-post-options-btn my-auto">
                                    <div class="like-btn-container d-inline-block">
                                        <button name="like" class="far fa-thumbs-up like-button like-btn"></button>
                                    </div>
                                    <div class="comment-btn-container d-inline-block">
                                        <button class="fas fa-comment comment-btn"></button>
                                    </div>
                                </div>
                                <div class="e-post-options-stats my-auto">
                                    <span class="mx-2">0 likes</span>
                                    <a class="comment-btn underline-hover" style="background-color: transparent;font-size: initial;font-weight: initial;color: #000;width: initial;">4 comments</a>
                                </div>
                            </div>
                        <div class="e-comments border-top">
                            <div class="add-comment-container py-3">
                                <input type="text" class="form-control w-100 transparent-inp" placeholder="Say something..." style="border-bottom: 1px solid rgba(128, 128, 128, 0.2)!important;">
                            </div>
                            <div class="e-comments-fluid py-3">
                                <div class="e-comments-items"></div>
                                <p class="text-center"><button class="btn button-green comment-load-btn">Load comments</button></p>
                            </div>
                        </div>
                    </div>
                </div>`;

                $('#id_posts').prepend(mh);
                if ($(`#${_data.pk}-show-more-btn`).find('span').height() > 43) {
                    $(`#${_data.pk}-show-more-btn`).find('span').addClass('caption-height');
                    $(`#${_data.pk}-show-more-btn`).find('span').addClass('overflow-hidden');

                    $(`#${_data.pk}-show-more-btn`).append(`<button name="show-more" class="underline-hover text-blue show-more-caption-btn fw-bold px-0">Show more</button>`);
                }

                $(`${_data.fields.pk}-show-more-btn`).find('span.caption-text').html('');
                for (const x in _caption) {
                    if (x > 0) {
                        document.getElementById(`${_data.pk}-show-more-btn`).children[0].innerText += _caption[x];
                    } else {
                        $(`#${_data.pk}-show-more-btn`).find('span.caption-text').text(_caption[x]);
                    }
                    $(`#${_data.pk}-show-more-btn`).find('span.caption-text').append('<br>');
                }

                $('.sendBtn').html(`Share`);
                $('#filePreviewBox').html('');
                document.querySelector('.sendBtn').disabled = false;

                inputElem.value = '';
                fileUploadElemImage.value = '';
                fileUploadElemVideo.value = '';
                $('.no-post-h1').remove();
                showAlert('Post uploaded successfully');
                $('.e-comments').hide();
            },
            beforeSend: function () {
                $('.sendBtn').html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`);
                document.querySelector('.sendBtn').disabled = true;
            },
            error: () => {
                showAlert();
                inputElem.value = '';
                fileUploadElemImage.value = '';
                fileUploadElemVideo.value = '';
                $('.sendBtn').html(`Share`);
                $('#filePreviewBox').html('');
                document.querySelector('.sendBtn').disabled = false;
            },
            cache: false,
            contentType: false,
            processData: false,
        });
    });
}


window.addEventListener('paste', e => {
    if (document.activeElement == document.getElementById('id_caption')) {
        try {
            let blob = URL.createObjectURL(e.clipboardData.files[0]);
            document.querySelector('#id_image').files = e.clipboardData.files;
            if (e.clipboardData.files[0].type.includes('image')) {
                document.querySelector('#id_image').files = e.clipboardData.files;
                document.querySelector('#filePreviewBox').innerHTML = `<div class="text-center w-100"><img style="max-width:100%;width:auto;max-height:80vh;height:auto;" class="px-3 py-3" src="${blob}"></div>`;
            } else if (e.clipboardData.files[0].type.includes('video')) {
                document.querySelector('#id_video').files = e.clipboardData.files;
                document.querySelector('#filePreviewBox').innerHTML = `<div class="text-center w-100"><video style="max-width:100%;width:auto;max-height:80vh;height:auto;" class="px-3 py-3" src="${blob}" controls></video></div>`;
            }
        } catch { }
    }
});

// post caption overflow hide
$(document).on('click', '.show-more-caption-btn', (e) => {
    if (e.target.name == 'show-more') {
        $(jQuery(e.target.parentElement)).find('span.caption-text').removeClass('caption-height');
        $(jQuery(e.target.parentElement)).find('span.caption-text').removeClass('overflow-hidden');
        e.target.name = 'show-less';
        e.target.innerText = 'Show less';

    } else if (e.target.name == 'show-less') {
        $(jQuery(e.target.parentElement)).find('span.caption-text').addClass('caption-height');
        $(jQuery(e.target.parentElement)).find('span.caption-text').addClass('overflow-hidden');
        e.target.name = 'show-more';
        e.target.innerText = 'Show more';
    }
});

// Like, Unlike logic here
$(document).on('click', '.like-button', (e) => {
    callAJAX("POST", "/like/", {
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
        index: () => {
            let parent = document.getElementById('id_posts');
            let child = e.target;
            while (!(child.classList.toString().includes('e-post mb-4'))) {
                child = child.parentElement;
            }
            return Array.prototype.indexOf.call(parent.children, child);
        },
        page: $('#username_pk').val(),
        name: e.target.name,
    },
        (data) => {
            let temp = e.target;
            while (!(temp.classList.toString().includes('e-post-options-wrapper'))) {
                temp = temp.parentElement;
            }
            let id = $(jQuery(temp)).find('div.e-post-options').attr('id');
            let liked = data.liked;
            let like_count = data.like_count;

            if (liked) {
                $(`#${id}`).find('.e-post-options-btn').find('.like-btn-container').html('<button name="unlike" class="fas fa-thumbs-up like-button unlike-btn"></button>');
                showAlert('Added to liked posts');
            } else if (!liked) {
                $(`#${id}`).find('.e-post-options-btn').find('.like-btn-container').html('<button name="like" class="far fa-thumbs-up like-button like-btn"></button>');
                showAlert('Removed from liked posts');
            }

            $(`#${id}`).find('.e-post-options-stats').find('span').first().html(`${like_count} likes`);
        },
        () => {
            showAlert();
        },
    );
});

// comment load logic here
$('.e-comments').hide();
$(document).on('click', '.comment-btn', (e) => {
    let child = e.target;
    let jQueryElem;
    while (!(child.classList.toString().includes('e-post mb-4'))) {
        child = child.parentElement;
    }
    jQueryElem = jQuery(child);
    jQueryElem.find('.e-comments').toggle('slide');

    // click for the first time to load comments without user inter..
    if (jQueryElem.find('.comment-load-btn').text() == 'Load comments') {
        jQueryElem.find('.comment-load-btn').click();
    }
});

$(document).on('click', '.comment-load-btn', (e) => {
    e.target.innerHTML = `Loading`;
    e.target.disabled = true;
    $.ajax({
        type: "POST",
        url: "/load-comment/",
        data: {
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
            page: $('#username_pk').val(),
            post_ind: () => {
                let parent = document.getElementById('id_posts');
                let child = e.target;
                while (!(child.classList.toString().includes('e-post mb-4'))) {
                    child = child.parentElement;
                }
                return Array.prototype.indexOf.call(parent.children, child);
            },
            c_length: () => {
                let temp = e.target;
                while (!(temp.classList.toString().includes('e-comments-fluid'))) {
                    temp = temp.parentElement;
                }
                return $(jQuery(temp)).find('.each-comment').length;
            },
        },
        success: (data) => {
            const comments = $.parseJSON(data.comments);
            const profiles = $.parseJSON(data.profiles);
            const users = $.parseJSON(data.users);
            const comments_time = data.comments_time;

            let html = '';
            let img_html = '';
            for (const i in comments) {
                img_html = `<img class="rounded-circle" width="50px" height="50px" src="/static/profile_page/images/default_avatar.jpg">`;
                if (profiles[i].fields.avatar != '') {
                    img_html = `<img class="rounded-circle" width="50px" height="50px" src="/media/${profiles[i].fields.avatar}">`;
                }
                html += `
                <div class="each-comment d-flex mb-4">
                    <div class="each-comment-img my-auto">
                        ${img_html}
                    </div>
                    <div class="each-comment-text my-auto mx-3" style="flex: 1;">
                        <div>
                            <a href="/${users[i].fields.username}/" class="fw-bold text-primary">${users[i].fields.username}</a>
                            <span class="mx-1 badge rounded-pill bg-dark">${comments_time[i]}</span>
                        </div>
                        <span class="each-comment-actual-text d-block">
                            ${comments[i].fields.comment}
                        </span>
                    </div>
                </div>`;
            }
            let temp = e.target;
            while (!(temp.classList.toString().includes('e-post'))) {
                temp = temp.parentElement;
            }

            let v_temp = e.target;
            while (!(v_temp.classList.toString().includes('e-comments-fluid'))) {
                v_temp = v_temp.parentElement;
            }

            $(jQuery(temp)).find('.e-comments').find('.e-comments-fluid').find('.e-comments-items').append(html);
            if (comments.length < Number(data.limit)) {
                if ($(jQuery(v_temp)).find('.each-comment').length == 0) {
                    $(jQuery(v_temp)).find('.comment-load-btn').parent().html('<span>No comments to show</span>');
                } else {
                    $(jQuery(v_temp)).find('.comment-load-btn').parent().html('<span>No more comments</span>');
                }
            } else {
                $(jQuery(v_temp)).find('.comment-load-btn').parent().html('<button class="btn button-green comment-load-btn">Load more</button>');
            }
        },
        error: () => {
            e.target.innerHTML = `Try again`;
            e.target.disabled = false;
            showAlert();
        },
        dataType: 'json',
    });
});