import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Main from "./pages/Main";
import Room from "./pages/Room";

function App() {
  return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Main />} />
            <Route path='/room/:id' element={<Room />}/>
          </Routes>

        </BrowserRouter>
      </div>
  );
}

export default App;