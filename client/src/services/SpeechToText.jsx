import { useState, useEffect } from 'react';

export const SpeechToText = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
            alert('Браузер не поддерживает распознавание речи')
            return
        }

        // экземпляр распознавателя
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ru-RU';

        recognitionInstance.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++){
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            setTranscript(prev => prev + finalTranscript);
            console.log('Распознано: ', finalTranscript || interimTranscript);
        }

        recognitionInstance.onerror = (event) => {
            console.log('Ошибка распознавания: ', event.error);
            setIsListening(false);
        }

        recognitionInstance.onend = () => {
            console.log('Распознавание завершено');
            setIsListening(false);
        }

        setRecognition(recognitionInstance);

        return () => {
            if (recognitionInstance){
                recognitionInstance.stop();
            }
        }
    }, []);

    const startListening = () => {
        if (recognition) {
            setTranscript('');
            recognition.start();
            setIsListening(true);
            console.log('Начало распознавания')
        }
    }

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px'}}>
            <h3>Text to speech</h3>
            <button onClick={startListening} disabled={isListening}>
                Начать запись
            </button>
            <button onClick={stopListening} disabled={!isListening}>
                Остановить
            </button>
            <div>
                <strong>Распознанный текст:</strong>
                <p>{transcript}</p>
            </div>
        </div>
    )
}