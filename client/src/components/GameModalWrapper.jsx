import Modal from "./modal";

export default function GameModalWrapper({
    gameResult,
    joinError,
    onStay,
    onLeave,
    onCloseJoinError,
}) {
    if (gameResult) {
        return (
            <Modal
                onClose={() => onLeave?.()}
                onStay={onStay}
                onLeave={onLeave}
                type={'gameEnd'}
            >
                {gameResult === 'citizens' ? 'Мирные жители победили!' : 'Мафия победила!'}
            </Modal>
        );
    }

    if (joinError) {
        return (
            <Modal
                onClose={onCloseJoinError}
                type={'joinError'}
            >
                {joinError === 'Name'
                    ? 'Ваш ник уже используется другим игроком в этой комнате, используйте другой ник.'
                    : 'В данный момент присоединиться нельзя, в комнате идет игра.'}
            </Modal>
        );
    }

    return null;
}
