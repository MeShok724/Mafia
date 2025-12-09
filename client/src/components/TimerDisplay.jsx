export default function TimerDisplay({ phase, timeToView }) {
    if (!timeToView) return <div />;
    switch (phase) {
        case 'startDay':
        case 'day':
            return (<strong className='time'>День: {timeToView}</strong>);
        case 'startNight':
        case 'night':
            return (<strong className='time'>Ночь: {timeToView}</strong>);
        case 'citizenVoting':
            return (<strong className='time'>Голосование: {timeToView}</strong>);
        case 'mafiaVoting':
            return (<strong className='time'>Голосование мафии: {timeToView}</strong>);
        default:
            return <div />;
    }
}
