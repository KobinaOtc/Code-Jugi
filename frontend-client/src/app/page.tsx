"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";

export default function Workspace() {
  const [code, setCode] = useState<string>('// Write your solution here...\nconsole.log("Hello World");');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<string>("Waiting for submission...");

  // Initialize WebSocket connection to the API Gateway
  useEffect(() => {
    // Ensure this matches the port your backend is currently running on (5001)
    const socketInstance = io("http://localhost:5001");
    
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket Server:", socketInstance.id);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value) setCode(value);
  };

  const handleSubmit = () => {
    setStatus("Submitting code...");
    // Mocking a submission ID for now. 
    // In Phase 2, this ID will come from the Express API response.
    const mockSubmissionId = "sub_12345"; 
    
    if (socket) {
      socket.emit("subscribe_submission", mockSubmissionId);
      setStatus(`Subscribed to updates for: ${mockSubmissionId}`);
    }
  };

  return (
    <main className="flex h-screen w-full bg-neutral-900 text-white font-sans">
      
      {/* Left Panel: Problem Description */}
      <section className="w-1/2 p-6 border-r border-neutral-700 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-2">Two Sum</h1>
        <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
          Easy
        </span>
        
        <div className="mt-6 text-neutral-300 space-y-4">
          <p>
            Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
          </p>
          <div className="bg-neutral-800 p-4 rounded-md">
            <p className="font-mono text-sm">
              <span className="text-neutral-500">Input:</span> nums = [2,7,11,15], target = 9<br/>
              <span className="text-neutral-500">Output:</span> [0,1]
            </p>
          </div>
        </div>
      </section>

      {/* Right Panel: Code Editor & Console */}
      <section className="w-1/2 flex flex-col">
        {/* Editor Header */}
        <div className="flex justify-between items-center p-4 bg-neutral-800 border-b border-neutral-700">
          <select className="bg-neutral-700 text-white px-3 py-1 rounded-md text-sm outline-none">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <button 
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-1.5 rounded-md text-sm font-semibold transition-colors"
          >
            Submit Code
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-grow">
          <Editor
            height="100%"
            theme="vs-dark"
            defaultLanguage="javascript"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
            }}
          />
        </div>

        {/* Output/Terminal Panel */}
        <div className="h-48 bg-black p-4 border-t border-neutral-700 font-mono text-sm overflow-y-auto">
          <h3 className="text-neutral-500 mb-2">Execution Console</h3>
          <p className="text-green-400">{status}</p>
        </div>
      </section>

    </main>
  );
}