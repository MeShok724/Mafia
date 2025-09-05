import React, { useCallback, useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';



export const usePeer = () => {
    const [peer, setPeer] = useState([])
    const [myId, setMyId] = useState([])
    const [peerTable, setPeerTable] = useState([])
    const peerRef = useRef(null)

    // начальная инициализация и получение своего id
    const initPeer = useCallback((sendMyPeerId) => {
        if (peerRef.current) return;

        const newPeer = new Peer();
        peerRef.current = newPeer;
        setPeer(newPeer);

        newPeer.on('open', function(id) {
            setMyId(id)
            sendMyPeerId(id)
            console.log("My peer id sended")
            console.log('My peer ID is: ' + id)
        });

        newPeer.on('error', function(err) {
            console.log('Peer error: ', err)
        });
    })

    return { initPeer, myId}
}

