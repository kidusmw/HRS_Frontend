import { Route, Routes } from 'react-router-dom'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import NotFoundPage from './features/shared/NotFoundPage'

function App() {

  return (
    <Routes>
      <Route path='/login' element={ <LoginPage /> }/>
      <Route path='/register' element={ <RegisterPage /> }/>
      <Route path='*' element={ <NotFoundPage /> } />
    </Routes>
  )
}

export default App
