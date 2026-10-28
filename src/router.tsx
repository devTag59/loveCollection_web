// src/router.tsx
import { createBrowserRouter } from "react-router";
import Home from "./pages/App";
import UploadImagem from "./pages/uploadImages";
import Galeria from "./pages/showImage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/galeria",
    element: <Galeria />,
  },{
    path:"/subirImages",
    element:<UploadImagem/>
  }
]);