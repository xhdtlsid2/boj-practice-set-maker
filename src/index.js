import ReactDOM from "react-dom/client";
import App from "./components/App";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import "./styles/ProblemOption.css";
import "./styles/UserExcludeOption.css";
import "./styles/TagSelectOption.css";
import "./styles/ProblemSet.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);