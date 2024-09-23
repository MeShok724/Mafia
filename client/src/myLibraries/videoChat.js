import React, { useState, useEffect, useRef } from 'react';

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302",
        },
    ],
};

// захват видеопотока
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

// компонент видеопотока
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

// создание и отправка SDP пакета на сервер
export const createAndSendSDP = (wsServer, name, roomName) => {


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

// отправка SDP пакета на сервер
const sendSdpToServer = (sdp, wsServer, name, roomName) => {
    const message = {
        event: 'sdp',
        name: name,
        roomName: roomName,
        sdp: sdp,
    }
    wsServer.send(JSON.stringify(message));
}

// действия при получении SDP пакета
export const sdpHandler = (sdp, selfName, destName, ws, roomName, setVideoStreams) => {
    console.log('SDP пакет от ', destName);
    // создание объекта
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

    // создание ответа на SDP
    peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
            console.log('Удалённое SDP установлено');
            // Если получен offer, создаём ответ
            if (sdp.type === 'offer') {
                return peerConnection.createAnswer();
            }
        })
        .then(answer => {
            // Устанавливаем локальное SDP (ответ)
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            // Отправляем свой SDP answer обратно другому клиенту через сервер
            const message = {
                type: 'sdpAnswer',
                destName: destName,
                sourceName: selfName,
                roomName: roomName,
                sdp: peerConnection.localDescription,
            };
            ws.send(JSON.stringify(message));
            console.log('SDP answer отправлен');
        })
        .catch((error) => {
            console.error('Ошибка при установке удалённого SDP:', error);
        });

    // Обмен ICE-кандидатами
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: "candidate",
                destName: destName,
                sourceName: selfName,
                roomName: roomName,
                candidate: event.candidate,
            }));
        }
    }

    // Обработка медиапотока от другого клиента
    peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setVideoStreams(prev => [...prev, remoteStream]);
    }
}

// обработка sdpAnswer
export const sdpAnswerHandler = (message) => {
}

// Добавление полученных ICE-кандидатов
function addReceivedIceCandidate(remoteCandidate, peerConnection) {
    const candidate = new RTCIceCandidate(remoteCandidate);
    peerConnection.addIceCandidate(candidate);
}