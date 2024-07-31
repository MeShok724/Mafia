import React, { useState, useEffect, useRef } from 'react';

export const startVideoCapture = async (setVideoStream) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        setVideoStream(stream);
    } catch (error) {
        console.error('Ошибка при захвате видеопотока:', error);
    }
};

export const VideoCapture = ({videoStream}) => {
    const videoRef = useRef(null);  // ссылка на поток собственного видео
    // Назначение видеопотока элементу <video> через ref
    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    return (
        <div>
            <video ref={videoRef} autoPlay muted style={{ width: '100%', height: 'auto' }} />
        </div>
    );
};
