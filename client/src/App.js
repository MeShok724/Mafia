import {BrowserRouter, Route, Routes} from "react-router-dom";
import JoinPage from "./JoinPage";
import RoomPage from "./RoomPage";


function App() {
  return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<JoinPage/>} />
            <Route path='/room/:roomName' element={<RoomPage />}/>
          </Routes>

        </BrowserRouter>
      </div>
  );
}

export default App;