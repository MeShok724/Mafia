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

export const createAndSendSDP = (wsServer, name, roomName) => {
    const configuration = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302",
            },
        ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Добавление медиапотока к PeerConnection
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        })
        .catch((error) => {
            console.error('Ошибка при получении медиапотока:', error);
        });

    // Создание SDP offer
    peerConnection.createOffer()
        .then((offer) => {
            return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
            console.log('SDP offer:', peerConnection.localDescription.sdp);
            sendSdpToServer(peerConnection.localDescription.sdp, wsServer, name, roomName);
            // Здесь можно отправить SDP offer на удаленный peer
        })
        .catch((error) => {
            console.error('Ошибка при создании SDP offer:', error);
        });
}
const sendSdpToServer = (sdp, wsServer, name, roomName) => {
    const message = {
        event: 'sdp',
        name: name,
        roomName: roomName,
        sdp: sdp,
    }
    wsServer.send(JSON.stringify(message));
}