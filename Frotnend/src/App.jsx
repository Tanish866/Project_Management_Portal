import { useDispatch } from 'react-redux';
import './App.css'
import MainRoutes from './Routes/MainRoutes'
import { useEffect } from 'react';
import { getCurrentUser } from './redux/slices/AuthSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <>
      <MainRoutes/>
    </>
  )
}

export default App;

