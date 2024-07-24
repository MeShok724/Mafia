// функция захватывает собственный поток видео и возвращает его
export const getSelfVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        console.log('Собственный поток видео захвачен');
        return stream;
    } catch (error) {
        console.error('Ошибка при захвате собственного видео:', error);
    }
};

// функция добавляет к элементу видео поток
export const addVideoStream = (video, stream) => {
    // video.srcObject = stream;
    // video.addEventListener("loadedmetadata", () => {
    //     video.play();
    //     videoGrid.append(video);
    // });
};