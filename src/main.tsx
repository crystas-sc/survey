import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {
  BrowserRouter,
  createBrowserRouter,
  createHashRouter,
  HashRouter,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import CreateQuestion from './routes/create-question';
import SurveyView from "./routes/survey-view"
import ResponsiveAppBar from './components/AppBar';
import DowloadPPKView from './routes/download-ppk';
import AnsVizContainer from './routes/ans-viz';



ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>

    <HashRouter>
      <ResponsiveAppBar />
      <div style={{ display: "flex" }}>
        <div className='content-container-root'>
          <Routes>
            <Route path="/" element={<CreateQuestion />}></Route>
            <Route path="/download-ppk" element={<DowloadPPKView />}></Route>
            <Route path="/viz" element={<AnsVizContainer />}></Route>
            
            <Route path="/survey">
              <Route index element={<SurveyView />} />
              <Route path=":section/:question" element={<SurveyView />} />

            </Route>
          </Routes>
        </div>
      </div>
    </HashRouter>
  </React.StrictMode>,
)
