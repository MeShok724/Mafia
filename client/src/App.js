import {BrowserRouter, Route, Routes} from "react-router-dom";
import JoinPage from "./pages/JoinPage";
import RoomPage from "./pages/RoomPage";


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