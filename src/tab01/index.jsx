import { render } from "solid-js/web";
import App from "../App.jsx";
import Tab from "./Tab.jsx";

render(() => <App tab={(api) => <Tab {...api} />} />, document.body);
