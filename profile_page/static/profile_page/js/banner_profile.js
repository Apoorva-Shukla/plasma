// only for uploading avatar and banner photo

const bannerInput = document.getElementById('id_edit_banner');
const avatarInput = document.getElementById('id_avatar');

function uploadPhoto(uploadElem, str) {

	let blobUrl = URL.createObjectURL(uploadElem.files[0]);
	$('#drag-image').attr('src', blobUrl);
	$('#drag-image').on('load', (e) => {
		$('.update-img-container').removeClass('d-none');
		initCropper(str);
	});
}


$(document).on('change', '#id_avatar', e => {
	uploadPhoto(avatarInput, 'avatar');
});

$(document).on('change', '#id_edit_banner', e => {
	uploadPhoto(bannerInput, 'banner');
});

function initCropper(str) {
	var image = document.getElementById('drag-image');
	let ratio = 1 / 1;
	if (str == 'banner') {
		ratio = 16/5;
	}

	var cropper;
	if (image.classList.contains("cropper-hidden")) {
		image.cropper.destroy();
		$('#drag-image').on('load', (e) => {
			cropper = new Cropper(image, {
				aspectRatio: ratio,
			});
		});
	} else {
		cropper = new Cropper(image, {
			aspectRatio: ratio,
		});
	}

	// On crop button clicked
	document.getElementById('crop-submit').addEventListener('click', function () {
		$('.update-img-container').addClass('d-none');
		cropper.getCroppedCanvas().toBlob(function (blob) {
			var formData = new FormData();
			formData.append('file', blob, `${str}.jpg`);
			formData.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val());

			$.ajax({
				url: `/update-${str}/`,
				method: "POST",
				data: formData,
				processData: false,
				contentType: false,
				success: function (data) {
					if (str == 'avatar') {
						document.querySelector('#id_avatar_img').src = data.url;
						showAlert('Profile photo updated');
					} else {
						document.querySelector('#id_banner_img').src = data.url;
						showAlert('Cover photo updated');
					}
					showAlert('Changes might take time to show everywhere');
				},
				error: function () {
					showAlert();
				}
			});
		});
	});
}