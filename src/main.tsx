import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import CreateQuestion from './routes/create-question';

const router = createBrowserRouter([
  {
    path: "/",
    element: <CreateQuestion />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
        <RouterProvider router={router} />
  </React.StrictMode>,
)
