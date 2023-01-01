import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import CreateQuestion from './routes/create-question';
import SurveyView from "./routes/survey-view"
import ResponsiveAppBar from './components/AppBar';

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

    <BrowserRouter>
      <ResponsiveAppBar />
      <div style={{ display: "flex" }}>
        <div className='content-container-root'>
          <Routes>
            <Route path="/" element={<CreateQuestion />}>
            </Route>
            <Route path="/survey">
              <Route index element={<SurveyView />} />
              <Route path=":section/:question" element={<SurveyView />} />

            </Route>
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)
