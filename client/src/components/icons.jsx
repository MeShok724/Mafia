import '../styles/icon.css'
import imageIcon from '../images/icon2.png'
export default function Icons(props){
    const printIcons = () => {
        // {console.log(props.players)}
        return props.players.map((name, index) => (
            <div className='icon' key={index}>
                <img  src={imageIcon} className='icon-img' alt={name}/>
                <strong className='icon-name'>{name}</strong>
                {props.fPlayerReady(name)?
                    <label className='icon-ready'>Готов</label>:
                    <label className='icon-not-ready'>Не готов</label>
                    }
            </div>
        ));
    };
    return (
        <div className='cont-icons'>
            {printIcons()}
        </div>
    )
}