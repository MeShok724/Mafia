export default function ReadyButton({ phase, readyPlayers, name, onReady, onNotReady }) {
    if (phase !== 'preparing') return <div />;
    const isReady = readyPlayers.indexOf(name) !== -1;
    return isReady ? (
        <button onClick={onNotReady} className='btn-not-ready'>Отмена</button>
    ) : (
        <button onClick={onReady} className='btn-ready'>Готов</button>
    );
}
