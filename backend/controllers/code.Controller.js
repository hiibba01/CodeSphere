import Room from "../models/room.model.js"


export const saveCode = async(req,res)=>{
    try{

        const {roomId, code, language} = req.body;

        await Room.findByIdAndUpdate(
            roomId,
            {
                code,
                language
            }
        );

        res.status(200).json({
            success: true,
        });

    } catch(error){
        res.status(500).json({
            message: error.message,
        });

    }
};


export const runCode = async (req, res) => {
    try {

        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                error: "Code and language are required"
            });
        }


        // Convert our Monaco language
        // into OneCompiler language/file names

        const languageMap = {

            javascript: {
                language: "javascript",
                fileName: "main.js"
            },

            python: {
                language: "python",
                fileName: "main.py"
            },

            cpp: {
                language: "cpp",
                fileName: "main.cpp"
            },

            c: {
                language: "c",
                fileName: "main.c"
            },

            java: {
                language: "java",
                fileName: "Main.java"
            }

        };


        const selectedLanguage = languageMap[language];


        if (!selectedLanguage) {
            return res.status(400).json({
                error: `Unsupported language: ${language}`
            });
        }


        // Call OneCompiler API

        console.log("API KEY EXISTS:", !!process.env.ONECOMPILER_API_KEY);
        console.log("API KEY LENGTH:", process.env.ONECOMPILER_API_KEY?.length);

        const response = await fetch(
            "https://api.onecompiler.com/v1/run",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": process.env.ONECOMPILER_API_KEY
                },

                body: JSON.stringify({

                    language: selectedLanguage.language,

                    stdin: "",

                    files: [
                        {
                            name: selectedLanguage.fileName,
                            content: code
                        }
                    ]

                })
            }
        );


        const result = await response.json();


        console.log("OneCompiler Result:");
        console.log(result);


        // API itself failed
        if (result.status === "failed") {

            return res.status(500).json({
                error: result.error || "OneCompiler API failed!"
            });

        }


        // Code execution produced an error
        if (result.stderr) {

            return res.status(200).json({
                success: false,
                output: result.stderr,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed
            });

        }


        // Exception during execution
        if (result.exception) {

            return res.status(200).json({
                success: false,
                output: result.exception,
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed
            });

        }


        // Successful execution

        return res.status(200).json({

            success: true,

            output: result.stdout || "No output",

            executionTime: result.executionTime,

            compilationTime: result.compilationTime,

            memoryUsed: result.memoryUsed,

            limitRemaining: result.limitRemaining

        });


    } catch (error) {
    console.error("Run Code Error:", error);

    return res.status(500).json({
        error: error.message
    });
}
};