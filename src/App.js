import './App.css';
import backgroundImage from './images/bacground1.jpg';

function App() {
  return (
      <div className="cont" style={{backgroundImage: `url(${backgroundImage})`}}>
        <h2 className="header">Подключение к комнате</h2>
        <form className="form-connect">
            <label className="inp-label">Ваш никнейм:</label>
            <input type="text" className="inp-name"/>
            <label className="inp-label">Название комнаты:</label>
            <input type="text" className="inp-room"/>
            <button className="form-btn">Присоединиться</button>
        </form>
      </div>
  );
}

export default App;