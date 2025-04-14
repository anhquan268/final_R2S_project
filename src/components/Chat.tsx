import { useEffect, useState, useRef } from "react";
import { db } from "../firebase"; // Import Firestore DB
import { collection, addDoc, onSnapshot, DocumentData } from "firebase/firestore";
import mqtt, { MqttClient } from "mqtt";
import Header from "../components/Header";

interface Message {
  text: string;
  isMine: boolean;
  beAdmin: boolean;
  sender: string;
  timestamp: Date; // Add timestamp as a Date object
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]); // Use the correct Message type
  const [inputMessage, setInputMessage] = useState<string>("");

  const clientRef = useRef<MqttClient | null>(null);
  const clientId = useRef<string>("client-" + Math.random().toString(16).substr(2, 8));
  const sentMessages = useRef(new Set());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const topic = "r2s";
  const mqttUrl = "wss://devapi.uniscore.vn:443/mqtt";

  const [user, setUser] = useState<{ email: string; roles: string[] } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data from localStorage (update this if using API)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setUser(storedUser);
      
      // Kiểm tra vai trò ADMIN
      if (storedUser.roles && storedUser.roles[0] === "ADMIN") {
        setIsAdmin(true);
      }
    }
  }, []);

  // Fetch messages from Firestore on component mount
  useEffect(() => {
    if (!user) return; // Wait until the user data is loaded

    const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
      // Explicitly type the Firestore document data
      const newMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          text: data.text,
          sender: data.sender,
          isMine: data.sender === user.email, // Check if the sender is the current client
          beAdmin: data.beAdmin,
          timestamp: data.timestamp.toDate(),
        };
      });
      const sortedMessages = newMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      setMessages(sortedMessages);
    });

    return () => unsubscribe();
  }, [user]); // Now this effect depends on the `user` state

  useEffect(() => {
    if (!user) return; // Wait until the user is available before connecting to MQTT

    if (clientRef.current) return; // Avoid creating multiple MQTT clients

    const mqttClient: MqttClient = mqtt.connect(mqttUrl, {
      clientId: clientId.current,
      username: "football",
      password: "football123",
    });

    clientRef.current = mqttClient;

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      mqttClient.subscribe(topic, (err) => {
        if (err) console.error("Subscribe error:", err);
      });
    });

    mqttClient.on("message", async (topic, payload) => {
      const message = payload.toString();
      const [sender, text, beeAdmin] = message.split("::");
      var beAdmin: boolean;
      if (beeAdmin === "true"){
        beAdmin = true;
      } else {
        beAdmin = false;
      }
      // Ensure user is loaded and check if the sender is the current user
      if (user?.email) {
        const isMine = sender === user.email;
        if (!isMine || !sentMessages.current.has(text)) {
          setMessages((prev) => [...prev, { text, isMine, beAdmin, sender, timestamp: new Date() }]);
        }
      } else {
        console.log("User is not loaded yet");
      }
    });

    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.end();
        clientRef.current = null;
      }
    };
  }, [user]); // Ensure the MQTT setup depends on the user being available

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (clientRef.current?.connected && inputMessage.trim()) {
      var fullMessage: string;
      if (isAdmin) {
        fullMessage = user?.email + "::" + inputMessage + "::" + "true";
      }
      else {
        fullMessage = user?.email + "::" + inputMessage + "::" + "false";
      }

      clientRef.current.publish(topic, fullMessage, { qos: 0, retain: false });

      setMessages((prev) => [...prev, { text: inputMessage, isMine: true, beAdmin: isAdmin, sender: user?.email || "unknown", timestamp: new Date() }]);

      sentMessages.current.add(inputMessage);
      setInputMessage("");

      // Send the message to Firestore
      await addDoc(collection(db, "messages"), {
        sender: user?.email,
        text: inputMessage,
        beAdmin: isAdmin,
        timestamp: new Date(),
      });
    }
  };

  return (
    <><Header /><div className="flex flex-col items-center min-h-[90vh] pl-4 pr-4 md:pl-20 md:pr-20 lg:pl-40 lg:pr-40 xl:pl-60 xl:pr-60 py-4">
      <h1 className="text-[36px] font-semibold mb-4 mt-4">Community Chat</h1>
      <div style={{ width: '100%', backgroundColor: 'white', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', height: '350px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{
              display: 'flex', flexDirection: 'column', alignItems: msg.isMine ? 'flex-end' : 'flex-start', maxWidth: '100%'
            }}
              className={`px-4 ${msg.isMine ? 'pl-28 sm:pl-60 md:pl-80 lg:pl-[20rem] pr-0' : 'pl-0 pr-28 sm:pr-60 md:pr-80 lg:pr-[20rem]'}`}>
              {!msg.isMine && msg.beAdmin && (
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', marginTop: '4px', color: 'black' }}>
                  ADMIN
                </div>
              )}
              {!msg.isMine && !msg.beAdmin && (
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', marginTop: '4px', color: 'black' }}>
                  {msg.sender}
                </div>
              )}
              <div style={{
                backgroundColor: msg.isMine ? '#3b82f6' : '#f472b6',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                maxWidth: '100%'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div style={{ width: '100%', marginTop: '16px' }}>
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault(); // Ngăn xuống dòng
              sendMessage(); // Gửi tin nhắn
            }
          } }
          placeholder="Enter message..."
          rows={1}
          className="w-full resize-none border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ overflow: 'hidden' }}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto'; // reset
              el.style.height = el.scrollHeight + 'px'; // grow
            }
          } } />
        <div style={{ textAlign: 'center', marginTop: '0px' }}>
          <button onClick={sendMessage} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '4px', marginTop: '12px', cursor: 'pointer', border: 'none' }}>
            Send
          </button>
        </div>
      </div>
    </div></>
  );
}

export default Chat;