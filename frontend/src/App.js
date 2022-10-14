
import './App.css';
import { Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
// import { Button, ButtonGroup } from '@chakra-ui/react'
function App() {
  return (
    <div className="App">
      {/* <Button colorScheme='blue'>Button</Button> */}
      <Route exact path="/" component={HomePage}/>
      <Route exact path='/chats' component={ChatPage}/>
    </div>
  );
}

export default App;
