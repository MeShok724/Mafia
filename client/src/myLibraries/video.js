export const GetMyVideoStream = async () => {
    console.log('Пытаюсь получить свое медиа')
    try {
        const constraints = {
            video:true,
            audio: true
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
    } catch (error) {
        console.error('Не получилось захватить свое медиа:', error);
        return null;
    }
};