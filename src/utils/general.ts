export function createMarkup(htmlStr: string) {
    return { __html: htmlStr };
}

export function downloadFile(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute('target', "_blank");

    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}