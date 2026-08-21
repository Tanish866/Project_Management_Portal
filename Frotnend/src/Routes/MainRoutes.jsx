import { Route, Routes } from "react-router-dom";
import Home from "../Pages/Home";
import Login from "../Pages/Auth/Login";
import Signup from "../Pages/Auth/Signup";

function MainRoutes(){
    return (
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/" element={<Home />} />
        </Routes>
    )
}
export default MainRoutes;