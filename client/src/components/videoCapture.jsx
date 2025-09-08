import {useEffect, useRef, useState} from "react";

// компонент видеопотока
export const VideoCapture = ({videoStream, isMe}) => {
    const videoRef = useRef(null);  // ссылка на поток собственного видео
    const [isRefReady, setIsRefReady] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            setIsRefReady(true);
        }
    }, []);

    useEffect(() => {
        if (isRefReady && videoStream instanceof MediaStream) {
            console.log('Устанавливаю srcObject (ref готов)');
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream, isRefReady]);

    return (
        <div>
            <video ref={videoRef} autoPlay muted={isMe} style={{ width: '100%', height: 'auto' }} />
        </div>
    );
};