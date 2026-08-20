import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import socket from "../services/socket";
import { useParams } from "react-router-dom";
import { Download, Play } from "lucide-react";
import axios from "../api/axios"

const CodeEditor = () => {

    const { roomId } = useParams();

    const [code, setCode] = useState("// Write your code here....");
    const [language, setLanguage] = useState("javascript");
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);

    useEffect(()=>{

        const fetchRoom=async()=>{
            try{
                const response = await axios.get(`/rooms/${roomId}`); 
                
                setCode(response.data.room.code || "//Write your code here....");
                setLanguage(response.data.room.language || "javascript");
            } catch(error){
                console.log(error);
        }
    }
        fetchRoom();
        
        
        socket.on("code-update", (newCode)=>{
            setCode(newCode);
        });

        socket.on("language-change", (newLanguage)=>{
            setLanguage(newLanguage);
        });

        return()=>{
            socket.off("code-update");
            socket.off("language-change");
        }
    }, [roomId]);

    const downloadCode = () => {
        const extensionMap = {
            javascript: "js",
            cpp: "cpp",
            c: "c",
            python: "py",
            java: "java"
        };

        const blob = new Blob([code], {
            type: "text/plain;charset=utf-8"
        })

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `code.${extensionMap[language] || "txt"}`;
        link.click();

        URL.revokeObjectURL(link.href);
    }


    const runCode = async () => {
    try {
        setRunning(true);
        setOutput("");

        const response = await axios.post("/code/run", {
            roomId,
            code,
            language
        });

        setOutput(
            response.data.output ||
            response.data.error ||
            "No output"
        );

    } catch (error) {
        console.log(error);

        setOutput(
            error.response?.data?.error ||
            "Failed to execute code."
        );
    } finally {
        setRunning(false);
    }
};

return(
        <div className="w-full bg-[#181818] border border-zinc-800 rounded-xl p-4">


            
            <div className="mb-4 flex justify-end">
                <select
                    value={language}
                    onChange={(e)=>{
                        const selectedLanguage = e.target.value;
                        setLanguage(selectedLanguage);

                        socket.emit("language-change",{
                            roomId,
                            language: selectedLanguage
                        });
                    }}

                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white outline-none"  >
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>


                      

                    <button
                        onClick={runCode}
                        disabled={running}
                        title="Run Code"
                        className="p-2 rounded-lg hover:bg-zinc-700 transition duration-300 disabled:opacity-50 ml-2"
                    >
                    <Play size={20} />
                    </button> 


                    <button
                        onClick={downloadCode}
                        title="Download Code"
                        className="p-2 rounded-lg hover:bg-zinc-700 transition duration-300"
                    >
                        <Download size={20} />
                    </button> 
            </div>


            <div className="mt-4 w-full bg-[#181818] border border-zinc-800 rounded-xl p-4">
                    <Editor
        height="300px"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={async (value) => {
            const updatedCode = value || "";

            setCode(updatedCode);

            socket.emit("code-change", {
                roomId,
                code: updatedCode,
            });

            try{
                await axios.post("/code/save", {
                    roomId,
                    code: updatedCode,
                    language
                });
            } catch(error){
                console.log(error);
            }
        }}
        options={{
            minimap: {
                enabled: false,
            },
            fontSize: 15,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            alwaysConsumeMouseWheel: false,
        }}
    />

<div className="mt-4 bg-[#1f1f1f] border border-zinc-700 rounded-xl overflow-hidden">

    {/* Output Header */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#242424] border-b border-zinc-700">

        <span className="text-sm font-medium text-zinc-300">
            Output
        </span>

        {running && (
            <span className="text-xs text-zinc-400">
                Running...
            </span>
        )}

    </div>


    {/* Output Content */}
    <div className="p-4 min-h-[100px]">

        <pre className="text-sm text-zinc-200 whitespace-pre-wrap font-mono">
            {running
                ? "Running..."
                : output || "Run your code to see output..."}
        </pre>

    </div>

</div>
            </div>

        </div>
    );
}

export default CodeEditor;