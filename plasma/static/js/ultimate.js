$(document).ready( ( ) => {
    let elements = document.getElementsByTagName('a');
    for (let i in elements) {
        try {
            if (elements[i].href.toString().includes('/s/')) {
                elements[i].href = `/s/?next=${location.href}`;
            } else if (elements[i].href.toString().includes('/r/')) {
                elements[i].href = `/r/?next=${location.href}`;
            }
        } catch {}
    }
});