document.addEventListener('DOMContentLoaded', function() {
    const macrosData = [
        {
            title: 'Dice Merchant Macro',
            videoUrl: 'https://www.youtube.com/embed/SZYsG4P2VWs?si=dBAhT9XZMtF8oLtg'
        },
        {
            title: 'Multi Macro',
            videoUrl: 'https://www.youtube.com/embed/zju4zs9QQNc?si=8YIC7Rhw7pqs2Ija'
        },
        {
            title: 'Treehouse Macro',
            videoUrl: 'https://www.youtube.com/embed/9hHHg_fG36Q?si=wqiZE5Og1xwUlHhC'
        },
        {
            title: 'Rank Quest Macro',
            videoUrl: 'https://www.youtube.com/embed/ZSUV_iGsKGM?si=YMqzaOJ-T7WP4pJK'
        },
        {
            title: 'Deep Pool Fishing Macro',
            videoUrl: 'https://www.youtube.com/embed/nfpicQGkFfE?si=FmoWqokOSSIXq10j'
        },
        {
            title: 'Prison Key Macro',
            videoUrl: 'https://www.youtube.com/embed/7k_DZAVJgpE?si=46CladISeX0auVmH'
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
