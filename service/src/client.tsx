import "./styles.css";
import { createRoot } from "react-dom/client";
import App from "./app";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const root = createRoot(document.getElementById("app")!);

root.render(<App />);
