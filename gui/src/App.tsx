import { SetupUrlState } from '@figurl/interface'
import './App.css'
import MainWindow from './MainWindow'
import SetupAccessCode from './SetupAccessCode'

function App() {
  return (
    <SetupAccessCode>
      <SetupUrlState>
        <MainWindow />
      </SetupUrlState>
    </SetupAccessCode>
  )
}

export default App
