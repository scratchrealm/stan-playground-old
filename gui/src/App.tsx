import { SetupUrlState } from '@figurl/interface'
// import AlertProvider from 'react-alert-async'
import './App.css'
import MainWindow from './MainWindow'
import SetupAccessCode from './SetupAccessCode'
import SetupStatusBar from './StatusBar/SetupStatusBar'
// import 'react-alert-async/dist/index.css'

function App() {
  return (
    // <>
    // <AlertProvider />
    <SetupAccessCode>
      <SetupUrlState>
        <SetupStatusBar>
          <MainWindow />
        </SetupStatusBar>
      </SetupUrlState>
    </SetupAccessCode>
    // </>
  )
}

export default App
