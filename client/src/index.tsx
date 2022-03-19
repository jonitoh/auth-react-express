import React from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader";
import App from "./App";

const HMLApp = hot(module)(App);


ReactDOM.render(
  <React.StrictMode>
    <HMLApp />
  </React.StrictMode>,
  document.getElementById("root")
);