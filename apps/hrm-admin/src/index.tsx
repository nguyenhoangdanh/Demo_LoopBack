import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "@/redux/store";

const Main: React.FC<any> = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Main />
  /* <React.StrictMode> */
  /*   <Main /> */
  /* </React.StrictMode> */
);
