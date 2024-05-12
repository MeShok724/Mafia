import './App.css';
import backgroundImage from './images/bacground2.jpg';

function App() {
  return (
      <div className="cont" style={{backgroundImage: `url(${backgroundImage})`}}>
        <h2 className="header">ПОДКЛЮЧЕНИЕ К КОМНАТЕ</h2>
        <form className="form-connect">
            <label className="inp-label">никнейм</label>
            <input type="text" className="inp-name"/>
            <label className="inp-label">комната</label>
            <input type="text" className="inp-room"/>
            <button className="form-btn"><b>ВОЙТИ</b></button>
        </form>
      </div>
  );
}

export default App;