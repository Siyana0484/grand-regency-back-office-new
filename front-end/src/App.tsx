import { RouterProvider } from "react-router-dom";
import Routers from "./Routers/Routers";

const App = () => {
  return (
    <>
    <RouterProvider router={Routers}/>
    </>
  );
};

export default App;
