import React, { useCallback, useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';



export const usePeer = () => {
    const [peer, setPeer] = useState([])
    const [myId, setMyId] = useState([])
    const [peerTable, setPeerTable] = useState([])
    const peerRef = useRef(null)

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
        

        // прием внешних звонков
        newPeer.on('connection', function(conn) { 
            console.log('Получен звонок от ', conn.peer)
            if (!conn) {
                console.log('Соединение не создано');
                return;
            }
            conn.on('open', function(){
                if (conn.open) {
                    console.log('Соединение открыто');
                    conn.on('data', function(data){
                        if (conn && conn.open) {
                            console.log('Получены данные: ', data);
                            try {
                                setPeerTable(prevArray => {
                                    const newArray = [...prevArray]
                                    newArray[data] = {
                                        id: conn.peer,
                                        conn: conn
                                    }
                                    return newArray
                                })
                                console.log('Данные занесены в таблицу')
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

    // функция звонка другому игроку
    const makeCall = useCallback ((peerId, position, myPosition) => {
        console.log('Звоним игроку под номером ', position)
        let conn = peer.connect(peerId);
        if (!conn) {
            console.error('Соединение не создано');
            return;
        }
        setPeerTable(prevArray => {
            const newArray = [...prevArray]
            newArray[position] = {
                id: peerId,
                conn: conn
            }
            return newArray
        })
        conn.on('open', function(){
            if (conn && conn.open) {
                try {
                    conn.send(myPosition);
                    console.log('Выслали игроку нашу позицию ', myPosition);
                } catch (error) {
                    console.error('Ошибка отправки данных: ', error);
                }
            }
        })
        conn.on('data', function(data) {
	        if (conn && conn.open) {
                console.log('Получены данные по WebRtc: ', data);
            }
	    });

        // Обработка закрытия соединения
            conn.on('close', function() {
                console.log('Соединение закрыто');
            });
    })

    return { initPeer, myId, setPeerTable, makeCall}
}

