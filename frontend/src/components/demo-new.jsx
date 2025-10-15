// App.jsx
import { TelnyxRTCProvider } from "@telnyx/react-client";

// Phone.jsx
import { useNotification, Audio, } from "@telnyx/react-client";
import { useCallbacks } from "@telnyx/react-client";
import { useTelnyxRTC } from "@telnyx/react-client";


function App() {
  const credential = {
    login_token: localStorage.getItem("telnyxToken"),
  };

  return (
    <TelnyxRTCProvider credential={credential}>
      <Phone />
    </TelnyxRTCProvider>
  );
}

function Phone() {
  const funtions = useCallbacks({
    onReady: () => console.log("client ready"),
    onError: () => console.log("client registration error"),
    onSocketError: () => console.log("client socket error"),
    onSocketClose: () => console.log("client disconnected"),
    onNotification: (x) => console.log("received notification:", x),
  });

  const notification = useNotification();
  const activeCall = notification && notification.call;
  const client = useTelnyxRTC({ login_token: localStorage.getItem("telnyxToken") });

  client.on("telnyx.ready", () => {
    console.log("client ready",client);
  });

  return (
    <div>
      {activeCall &&
        activeCall.state === "ringing" &&
        "You have an incoming call."}

      <Audio stream={activeCall && activeCall.remoteStream} />
    </div>
  );
}

export default App;
