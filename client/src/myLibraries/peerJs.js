import React, { useCallback, useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';



export const usePeer = () => {
    const [peer, setPeer] = useState([])
    const [myId, setMyId] = useState([])
    const [peerTable, setPeerTable] = useState([])
    const [myStream, setMyStream] = useState([])
    const peerRef = useRef(null)

    const setStream = useCallback((stream) => {
        setMyStream(stream)
    })

    // начальная инициализация
    const initPeer = useCallback((sendMyPeerId) => {
        if (peerRef.current) return;

        // создание объекта Peer
        const newPeer = new Peer();
        peerRef.current = newPeer;
        setPeer(newPeer);

        // получение своего id
        newPeer.on('open', function(id) {
            setMyId(id)
            sendMyPeerId(id)
            console.log("My peer id sended")
            console.log('My peer ID is: ' + id)
        });

        // обработка ошибки создания объекта
        newPeer.on('error', function(err) {
            console.log('Ошибка соединения: ', err)
        });
        
        newPeer.on('call', async function(call) {
            console.log('Получен видеозвонок от ', call.peer);
            let myStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480 },
                audio: true 
            });
            call.answer(myStream);
            call.on('stream', function(remoteStream) {
                addStreamToTable(remoteStream, call.peer)
                console.log('добавил стрим звонящего')
            })
        }) 

        // прием внешних звонков
        newPeer.on('connection', function(conn) { 
            if (!conn) {
                console.log('Соединение не создано');
                return;
            }
            conn.on('open', function(){
                if (conn.open) {
                    conn.on('data', function(data){
                        if (conn && conn.open) {
                            try {
                                setPeerTable(prevArray => {
                                    const newArray = [...prevArray]
                                    newArray[data] = {
                                        id: conn.peer,
                                        stream: null
                                    }
                                    return newArray
                                })
                            } catch (error){
                                console.log('Ошибка занесения данных в таблицу: ', error)
                            }
                            
                        } else {
                            console.log('Соединение закрыто, данные игнорируются');
                        }
                    })
                }
            })

            // Обработка закрытия соединения
            conn.on('close', function() {
                console.log('Соединение закрыто');
            });
        });
    })

    async function callTo(peerId) {
    // Добавляем задержку 1 секунду
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!myStream || !(myStream instanceof MediaStream))
            console.log('Не получилось получить свой медиапоток');
        const call = peer.call(peerId, myStream)

        call.on('stream', function(remoteStream) {
                console.log('Получен удаленный видеопоток от ', peerId);
                addStreamToTable(remoteStream, peerId)
            });
    }

    function addStreamToTable(stream, id){
        let index = peerTable.findIndex(p => p.id === id)
                if (index < 0){
                    console.log('не нашел индекс звонящего')
                    return
                }
        setPeerTable(prevArray => {
                    const newArray = [...prevArray]
                    newArray[index] = {
                        id: id,
                        stream: stream
                    }
                    return newArray
                })
    }

    // функция звонка другому игроку
    const makeCall = useCallback ((peerId, position, myPosition) => {
        console.log('Соединение с игроком ', position)
        let conn = peer.connect(peerId);
        if (!conn) {
            console.error('Соединение не создано');
            return;
        }
        setPeerTable(prevArray => {
            const newArray = [...prevArray]
            newArray[position] = {
                id: peerId,
                stream: null
            }
            return newArray
        })
        conn.on('open', function(){
            if (conn && conn.open) {
                try {
                    conn.send(myPosition);
                    console.log('Выслали игроку нашу позицию ', myPosition);
                    callTo(peerId)
                } catch (error) {
                    console.error('Ошибка отправки данных: ', error);
                }
            }
        })

        // Обработка закрытия соединения
            conn.on('close', function() {
                console.log('Соединение закрыто');
            });
    })

    return { initPeer, myId, setPeerTable, makeCall, peerTable, setStream}
}

