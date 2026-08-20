import { useRef, useEffect, useState } from "react";
import socket from "../services/socket";
import { Download, Undo2, Redo2 } from "lucide-react";
import axios from "../api/axios";

const Whiteboard = ({roomId}) => {

    const canvasRef = useRef(null);
    const historyRef = useRef([]);
    const redoRef = useRef([]);
    const shapeStartRef = useRef(null);

    const [drawing, setDrawing] = useState(false);
    const [ color, setColor] = useState("#FFFFFF");
    const [brushSize, setBrushSize] = useState(3);
    const [isEraser, setIsEraser] = useState(false);
    const [selectedShape, setSelectedShape] = useState(null);
    const [isDrawingShape, setIsDrawingShape] = useState(false);


    const saveWhiteboard = async()=> {
        try{
            await axios.post("/whiteboard/save", {
                roomId,
                whiteboardData: historyRef.current
            });
        } catch(error){
            console.log("Error saving whiteboard:", error);
            
        }
    }

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle='#181818';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.beginPath();

        historyRef.current.forEach((action)=> {
            if(action.type === "start"){
                ctx.beginPath();
                ctx.strokeStyle = action.color;
                ctx.lineWidth = action.brushSize;
                ctx.moveTo(action.x, action.y);

            }

            else if(action.type === "draw"){
                ctx.strokeStyle = action.color;
                ctx.lineWidth = action.brushSize;
                ctx.lineTo(action.x, action.y);
                ctx.stroke();
            }

            else if(action.type === "stop"){
                ctx.beginPath();
            }

            else if (action.type === "shape") {
                drawShape(
                    ctx,
                    action.shape,
                    action.startX,
                    action.startY,
                    action.endX,
                    action.endY
                );
            }
        });
    }

    const drawPolygon = (
        ctx,
        centerX,
        centerY,
        radius,
        sides
    ) => {

        for (let i = 0; i < sides; i++) {

            const angle =
                -Math.PI / 2 +
                (i * 2 * Math.PI) / sides;

            const x =
                centerX +
                radius * Math.cos(angle);

            const y =
                centerY +
                radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
         }

        ctx.closePath();
        ctx.stroke();
    };

    const drawShape = (ctx, shape, startX, startY, endX, endY) => {
    const width = endX - startX;
    const height = endY - startY;

    ctx.beginPath();

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
// rectangle 
    if (shape === "rectangle") {

        ctx.rect(
            startX,
            startY,
            width,
            height
        );

        ctx.stroke();
    }

    // square 
    else if (shape === "square") {

        const size = Math.min(
            Math.abs(width),
            Math.abs(height)
        );

        const x = width < 0
            ? startX - size
            : startX;

        const y = height < 0
            ? startY - size
            : startY;

        ctx.rect(
            x,
            y,
            size,
            size
        );

        ctx.stroke();
    }

//    circle 
    else if (shape === "circle") {

        const radius = Math.sqrt(
            width * width +
            height * height
        );

        ctx.arc(
            startX,
            startY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
// ellipse 
    else if (shape === "ellipse") {

        ctx.ellipse(
            startX + width / 2,
            startY + height / 2,
            Math.abs(width / 2),
            Math.abs(height / 2),
            0,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
// line 
    else if (shape === "line") {

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        ctx.stroke();
    }
// arrow 
    else if (shape === "arrow") {

        const angle = Math.atan2(
            endY - startY,
            endX - startX
        );

        const arrowSize = 12;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        ctx.moveTo(endX, endY);

        ctx.lineTo(
            endX -
                arrowSize *
                    Math.cos(angle - Math.PI / 6),

            endY -
                arrowSize *
                    Math.sin(angle - Math.PI / 6)
        );

        ctx.moveTo(endX, endY);

        ctx.lineTo(
            endX -
                arrowSize *
                    Math.cos(angle + Math.PI / 6),

            endY -
                arrowSize *
                    Math.sin(angle + Math.PI / 6)
        );

        ctx.stroke();
    }
//  triangle 
    else if (shape === "triangle") {

        ctx.moveTo(
            startX + width / 2,
            startY
        );

        ctx.lineTo(
            endX,
            endY
        );

        ctx.lineTo(
            startX,
            endY
        );

        ctx.closePath();

        ctx.stroke();
    }
// diamond 
    else if (shape === "diamond") {

        const centerX = startX + width / 2;
        const centerY = startY + height / 2;

        ctx.moveTo(
            centerX,
            startY
        );

        ctx.lineTo(
            endX,
            centerY
        );

        ctx.lineTo(
            centerX,
            endY
        );

        ctx.lineTo(
            startX,
            centerY
        );

        ctx.closePath();

        ctx.stroke();
    }
// pentagon 
    else if (shape === "pentagon") {

        drawPolygon(
            ctx,
            startX + width / 2,
            startY + height / 2,
            Math.min(
                Math.abs(width),
                Math.abs(height)
            ) / 2,
            5
        );
    }

//    hexagon 
    else if (shape === "hexagon") {

        drawPolygon(
            ctx,
            startX + width / 2,
            startY + height / 2,
            Math.min(
                Math.abs(width),
                Math.abs(height)
            ) / 2,
            6
        );
    }

//    star 
    else if (shape === "star") {

        const centerX = startX + width / 2;
        const centerY = startY + height / 2;

        const outerRadius =
            Math.min(
                Math.abs(width),
                Math.abs(height)
            ) / 2;

        const innerRadius = outerRadius * 0.45;

        const points = 5;

        for (let i = 0; i < points * 2; i++) {

            const radius =
                i % 2 === 0
                    ? outerRadius
                    : innerRadius;

            const angle =
                -Math.PI / 2 +
                (i * Math.PI) / points;

            const x =
                centerX +
                radius * Math.cos(angle);

            const y =
                centerY +
                radius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();

        ctx.stroke();
    }
// trapezoid 
    else if (shape === "trapezoid") {

        const topWidth = width * 0.6;

        const topLeft =
            startX + (width - topWidth) / 2;

        const topRight =
            topLeft + topWidth;

        ctx.moveTo(
            topLeft,
            startY
        );

        ctx.lineTo(
            topRight,
            startY
        );

        ctx.lineTo(
            endX,
            endY
        );

        ctx.lineTo(
            startX,
            endY
        );

        ctx.closePath();

        ctx.stroke();
    }
};



    useEffect(() => {

        const canvas = canvasRef.current;

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#181818";
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        const loadWhiteboard = async () => {
            try{
                const response = await axios.get(`/whiteboard/${roomId}`);

                historyRef.current = response.data.whiteboardData || [];

                redrawCanvas();

            } catch(error){
                console.log("Error loading Whiteboard: ",error);
                

            }
        }
        loadWhiteboard();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        socket.on("start-draw",({x,y,color,brushSize})=>{
            ctx.beginPath();
            ctx.strokeStyle=color;
            ctx.lineWidth=brushSize;
            ctx.moveTo(x,y);

            historyRef.current.push({
                type: "start",
                x,
                y,
                color,
                brushSize,
            });
        });

        socket.on("draw", ({x,y, color, brushSize})=> {
            ctx.strokeStyle = color;
            ctx.lineWidth=brushSize;
            ctx.lineTo(x,y);
            ctx.stroke();

            historyRef.current.push({
                type: "draw",
                x,
                y,
                color,
                brushSize,
            });
        });

        socket.on("stop-draw",()=>{
            ctx.beginPath();

            historyRef.current.push({
                type: "stop",
            });

            console.log("Remote History:", historyRef.current);
        });

        socket.on("draw-shape", (shapeData)=>{
            historyRef.current.push(shapeData);
            redrawCanvas();
        })

        socket.on("clear-canvas",()=>{
            ctx.fillStyle = "#181818";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });


       socket.on("undo", (removedStroke) => {

    if (!removedStroke || removedStroke.length === 0) {
        return;
    }

    for (let i = 0; i < removedStroke.length; i++) {
        historyRef.current.pop();
    }

    redrawCanvas();
});

        socket.on("redo", (stroke) => {

            if (!stroke || stroke.length === 0) {
                return;
            }

            historyRef.current.push(...stroke);

            redrawCanvas();

            });



        return()=>{
            socket.off("start-draw");
            socket.off("draw");
            socket.off("stop-draw");
            socket.off("draw-shape")
            socket.off("clear-canvas");
            socket.off("undo");
            socket.off("redo");

        }
    }, [roomId]);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.strokeStyle = color;
    }, [color]);


    useEffect(()=>{
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.lineWidth = brushSize;
    }, [brushSize]);

    const startDrawing = (e) => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top

        if(selectedShape && selectedShape!=="menu"){
            shapeStartRef.current={
                x,
                y
            };
            setIsDrawingShape(true);
            return;
        }

        ctx.strokeStyle = isEraser ? "#181818" : color;

        ctx.lineWidth = brushSize;
        

        ctx.beginPath();

        ctx.moveTo(x, y);

        historyRef.current.push({
            type: "start",
            x,
            y,
            color: isEraser ? '#181818' : color,
            brushSize
        });

        redoRef.current = [];

        socket.emit("start-draw", {
            roomId,
            x,
            y,
            color: isEraser ? "#181818" : color,
            brushSize
        });

        setDrawing(true);
    };

    const draw = (e) => {

        

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const rect = canvas.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if(isDrawingShape && shapeStartRef.current){
            const{x: startX, y: startY} = shapeStartRef.current;

            redrawCanvas();

            drawShape(
                ctx,
                selectedShape,
                startX,
                startY,
                x,
                y
            );
            return;
        };

        if(!drawing) return;


       

        ctx.lineTo(x,y);
    
        ctx.stroke();

        historyRef.current.push({
            type: "draw",
            x,
            y,
            color: isEraser ? '#181818' : color,
            brushSize
        })

        socket.emit("draw", {
            roomId,
            x,
            y,
            color: isEraser ? "#181818" : color,
            brushSize
        });
    };

   const stopDrawing = (e) => {

    if (isDrawingShape && shapeStartRef.current) {

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const { x: startX, y: startY } = shapeStartRef.current;

        const shapeData = {
            type: "shape",
            shape: selectedShape,
            startX,
            startY,
            endX,
            endY,
            color,
            brushSize
        };

        // Save shape in history
        historyRef.current.push(shapeData);

        // Clear redo history
        redoRef.current = [];

        // Send shape to other users
        socket.emit("draw-shape", {
            roomId,
            ...shapeData
        });

        // Exit shape mode
        setIsDrawingShape(false);
        shapeStartRef.current = null;

        // Redraw final shape
        redrawCanvas();

        // Save to database
        saveWhiteboard();

        return;
    }

//freehand drawing

    if (!drawing) return;

    socket.emit("stop-draw", {
        roomId
    });

    historyRef.current.push({
        type: "stop"
    });

    setDrawing(false);

    saveWhiteboard();
};

    const downloadCanvas =()=>{
        const canvas = canvasRef.current;
        const link = document.createElement("a");
        link.download = "SyncSpace-Whiteboard.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#181818";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        historyRef.current=[];
        redoRef.current=[];

        socket.emit("clear-canvas", {
            roomId
        });

        saveWhiteboard();
    }



    


    const undo = () => {
    if (historyRef.current.length === 0) return;

    let removedStroke = [];

    const lastAction =
        historyRef.current[historyRef.current.length - 1];

    // Shape = one complete history item
    if (lastAction.type === "shape") {

        removedStroke.push(historyRef.current.pop());

    } 
    // Freehand stroke
    else {

        while (historyRef.current.length > 0) {
            const action = historyRef.current.pop();

            removedStroke.unshift(action);

            if (action.type === "start") {
                break;
            }
        }
    }

    redoRef.current.push(removedStroke);

    redrawCanvas();

    socket.emit("undo", {
        roomId,
        removedStroke
    });

    saveWhiteboard();
};

    const redo = () => {
        if(redoRef.current.length === 0) return;

        const stroke = redoRef.current.pop();
        historyRef.current.push(...stroke);
        redrawCanvas();

        socket.emit("redo", {
            roomId,
            stroke,
        });

        saveWhiteboard();


    }

    return (

        <div className="w-full bg-[#181818] border border-zinc-800 rounded-xl p-4">

           <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

                 {/* toolbar */}

            <div className="flex items-center gap-2">
                <span className="text-lg text-zinc-300">Color</span>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-zinc-700"
                />
            </div>

            <div className="flex items-center gap-2">
                <span className="text-lg text-zinc-300 mr-4">Size</span>

                <input
                    type="range"
                    min="1"
                    max="10"
                    value={brushSize}
                    onChange={(e) => setBrushSize(e.target.value)}
                    className=" w-24 sm:w-32 cursor-pointer"
                />

                <span className="text-lg text-zinc-400 w-5 text-cente">{brushSize}</span>
            </div>

            {/* shapes */}

            <div className="relative">
    <button
        onClick={() => setSelectedShape(
            selectedShape ? null : "menu"
        )}
        className="px-3 py-2 rounded-lg hover:bg-zinc-700 transition"
    >
        Shapes
    </button>

    {selectedShape === "menu" && (
        <div className="
        absolute top-full left-0 mt-2 z-50
        w-[min(90vw,420px)]
        p-4
        rounded-xl
        bg-[#202020]
        border border-zinc-700
        shadow-xl
        max-h-[70vh]
        overflow-y-auto
    ">

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

                <button
                    onClick={() => setSelectedShape("rectangle")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Rectangle
                </button>

                <button
                    onClick={() => setSelectedShape("square")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Square
                </button>

                <button
                    onClick={() => setSelectedShape("circle")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Circle
                </button>

                <button
                    onClick={() => setSelectedShape("ellipse")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Ellipse
                </button>

                <button
                    onClick={() => setSelectedShape("triangle")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Triangle
                </button>

                <button
                    onClick={() => setSelectedShape("diamond")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Diamond
                </button>

                <button
                    onClick={() => setSelectedShape("line")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Line
                </button>

                <button
                    onClick={() => setSelectedShape("arrow")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Arrow
                </button>

                <button
                    onClick={() => setSelectedShape("star")}
                   className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Star
                </button>

                <button
                    onClick={() => setSelectedShape("hexagon")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Hexagon
                </button>

                <button
                    onClick={() => setSelectedShape("pentagon")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Pentagon
                </button>

                <button
                    onClick={() => setSelectedShape("trapezoid")}
                    className="px-3 py-3 rounded-lg hover:bg-zinc-700 transition text-sm whitespace-nowrap"
                >
                    Trapezoid
                </button>

            </div>
        </div>
    )}
</div>

            {/* eraser  */}

            <button
                onClick={()=>setIsEraser(!isEraser)}
                className={`px-4 py-2 rounded-lg transition duration-300 ${
                    isEraser
                        ? "bg-red-600 hover:bg-red-500"
                        : "bg-zinc-700 hover:bg-zinc-600" }`} >
                        {isEraser ? "Pen" : "Eraser"}
            </button>

            <button onClick={clearCanvas} className='px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition'>
                Clear
            </button>

            <button
                onClick={undo}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition">
                    <Undo2 size={18} />
            </button>

            <button
                onClick={redo}
                className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition">
                    <Redo2 size={18} />
            </button>

           <button
                onClick={downloadCanvas}
                title="Download Whiteboard"
                className="p-2 rounded-lg hover:bg-zinc-700 transition duration-300"
            >
            <Download size={20} />
           </button>


           </div>

            {/* canvas  */}

            <canvas
    ref={canvasRef}
    className={`w-full h-[300px] sm:h-[450px] lg:h-[600px] rounded-lg ${
        isEraser ? "cursor-cell" : "cursor-crosshair"
    }`}
    style={{ touchAction: "none" }}
    onPointerDown={startDrawing}
    onPointerMove={draw}
    onPointerUp={stopDrawing}
    onPointerCancel={stopDrawing}
    onPointerLeave={stopDrawing}
/>

        </div>

    );
};

export default Whiteboard;
