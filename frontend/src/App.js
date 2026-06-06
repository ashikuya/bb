import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { Kaelthas } from "./kaelthas/Kaelthas.jsx";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Kaelthas />
      </BrowserRouter>
    </div>
  );
}

export default App;
