document.addEventListener('DOMContentLoaded', function() {
    const macrosData = [
        {
            title: 'Dice Merchant Macro',
            videoUrl: 'https://www.youtube.com/embed/SZYsG4P2VWs?si=dBAhT9XZMtF8oLtg'
        },
        {
            title: 'MultiMacro V4',
            videoUrl: 'https://www.youtube.com/embed/zju4zs9QQNc?si=8YIC7Rhw7pqs2Ija'
        },
        {
            title: 'Treehouse Macro V2',
            videoUrl: 'https://www.youtube.com/embed/9hHHg_fG36Q?si=wqiZE5Og1xwUlHhC'
        }
    ];

    const downloadItems = document.querySelectorAll('.download-item');

    downloadItems.forEach((item, index) => {
        const macroData = macrosData[index];

        const titleElement = item.querySelector('.macro-title');
        if (titleElement) {
            titleElement.textContent = macroData.title;
        }

        const videoContainer = item.querySelector('.youtube-video');
        if (videoContainer) {
            const iframe = document.createElement('iframe');
            iframe.src = macroData.videoUrl;
            iframe.width = "560";
            iframe.height = "315";
            iframe.frameBorder = "0";
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            videoContainer.appendChild(iframe);
        }
    });
});
