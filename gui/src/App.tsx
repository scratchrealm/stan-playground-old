import { SetupUrlState } from '@figurl/interface'
import './App.css'
import MainWindow from './MainWindow'
import SetupAccessCode from './SetupAccessCode'
import SetupStatusBar from './StatusBar/SetupStatusBar'

function App() {
  return (
    <SetupAccessCode>
      <SetupUrlState>
        <SetupStatusBar>
          <MainWindow />
        </SetupStatusBar>
      </SetupUrlState>
    </SetupAccessCode>
  )
}

export default App
