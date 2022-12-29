import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import CreateQuestion from './routes/create-question';
import SurveyView from "./routes/survey-view"

const router = createBrowserRouter([
  {
    path: "/",
    element: <CreateQuestion />,
  },
  {
    path: "/survey/:section/:question",
    element: <SurveyView />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
        <RouterProvider router={router} />
  </React.StrictMode>,
)
