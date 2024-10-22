import { SocketProvider } from "./context/SocketProvider";
import Whiteboard from "./modules/whiteboard";

const App = () => {
  return (
    <SocketProvider>
      <Whiteboard />
    </SocketProvider>
  );
};

export default App;
