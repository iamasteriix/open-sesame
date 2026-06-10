import { BrowserRouter, Routes, Route, } from "react-router";
import {
  Home,
} from "../views";


export default function Routing () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={ Home }/>
      </Routes>
    </BrowserRouter>
  );
}