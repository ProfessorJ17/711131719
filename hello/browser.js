document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector('.back');
    const forwardButton = document.querySelector('.forward');
    const refreshButton = document.querySelector('.refresh');
    const iframe = document.querySelector('iframe');

    backButton.addEventListener('click', () => {
        iframe.contentWindow.history.back();
    });

    forwardButton.addEventListener('click', () => {
        iframe.contentWindow.history.forward();
    });

    refreshButton.addEventListener('click', () => {
        iframe.contentWindow.location.reload();
    });

    iframe.addEventListener('load', () => {
        try {
            iframe.contentWindow.addEventListener('beforeunload', () => {
                iframe.contentWindow.postMessage('saveData', '*');
            });
        } catch (e) {
            console.log('Security restrictions prevent direct communication');
        }
    });

    window.addEventListener('message', (event) => {
        if (event.data === 'saveData') {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.querySelector('script').dispatchEvent(new Event('saveTrigger'));
        }
    });
});
