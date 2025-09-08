import React, { useCallback, useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';



export const usePeer = () => {
    const [peer, setPeer] = useState([])
    const [myId, setMyId] = useState([])
    const [peerTable, setPeerTable] = useState([])
    const [myStream, setMyStream] = useState([])
    const peerRef = useRef(null)
    const peerTableRef = useRef(peerTable);

    useEffect(() => {
        peerTableRef.current = peerTable;
        console.log('peerTable changed: ', peerTableRef.current)
    }, [peerTable]);

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
            while (!myStream || !(myStream instanceof MediaStream)){
                console.log('Ошибка получения медиапотока, ожидание ...');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            call.answer(myStream);
            call.on('stream', async function(remoteStream) {
                await addStreamToTable(remoteStream, call.peer)
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
                                console.log('Занес в таблицу подключение')
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

    async function addStreamToTable(stream, id){
        const currentTable = peerTableRef.current;
        let index = currentTable.findIndex(p => p?.id === id)
        console.log('peerTable: ', currentTable)
        console.log('id :', id)
                while (index < 0){
                    console.log('не нашел индекс звонящего, ожидаю')
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
        setPeerTable(prevArray => {
                    const newArray = [...prevArray]
                    newArray[index] = {
                        id: id,
                        stream: stream
                    }
                    return newArray
                })
        console.log('Добавил стрим')        
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
        console.log('Занес в таблицу подключение')
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

