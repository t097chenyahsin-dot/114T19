import React, { useState, useCallback, useEffect } from 'react';
import Fireworks from './components/Fireworks';
import { fetchEncouragement } from './services/geminiService';

// Simple ID generator for keys
const generateId = () => Math.random().toString(36).substr(2, 9);

interface Emoji {
  id: string;
  x: number;
  y: number;
}

interface StudentData {
  name: string;
  grade: string;
  context: string;
}

type AppState = 'animating' | 'ready' | 'loading' | 'result';

const App: React.FC = () => {
  const [step, setStep] = useState<AppState>('animating');
  const [comment, setComment] = useState<string>("");
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  
  // Default data
  const [studentData, setStudentData] = useState<StudentData>({
    name: "",
    grade: "A",
    context: ""
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');

    if (dataParam) {
      try {
        // Robust Base64 decode for UTF-8 (Handling Chinese characters correctly)
        // This is compatible with Google Apps Script's Utilities.base64Encode(..., Utilities.Charset.UTF_8)
        const decodedString = decodeURIComponent(
          Array.prototype.map.call(atob(dataParam), (c: string) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join('')
        );

        const parsedData = JSON.parse(decodedString);
        setStudentData({
          name: parsedData.name || "",
          grade: parsedData.grade || "A",
          context: parsedData.context || ""
        });
      } catch (e) {
        console.error("Failed to parse student data", e);
      }
    }
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setStep('ready');
  }, []);

  const handleViewResult = useCallback(async () => {
    setStep('loading');
    
    // Fetch comment from Gemini API with dynamic data
    const fetchedComment = await fetchEncouragement(
      studentData.name,
      studentData.grade,
      studentData.context
    );
    setComment(fetchedComment);
    
    // Simulate a short delay for anticipation
    setTimeout(() => {
      setStep('result');
    }, 800);
  }, [studentData]);

  const handleAwesomeClick = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    const buttonRect = (e.target as HTMLElement).getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const startY = buttonRect.top;

    const newEmojis: Emoji[] = [];
    for(let i=0; i<5; i++) {
        newEmojis.push({
            id: generateId(),
            x: centerX + (Math.random() * 120 - 60), 
            y: startY - (Math.random() * 20)
        });
    }

    setEmojis(prev => [...prev, ...newEmojis]);

    setTimeout(() => {
      setEmojis(prev => prev.filter(emoji => !newEmojis.find(ne => ne.id === emoji.id)));
    }, 1500);
  }, []);

  // Dynamic font size for grade based on length
  const getGradeFontSize = (grade: string) => {
    if (grade.length > 2) return "text-[6rem]";
    if (grade.length > 1) return "text-[8rem]";
    return "text-[10rem]";
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Keep firework visible during animating and ready states */}
      {(step === 'animating' || step === 'ready') && (
        <Fireworks onComplete={handleAnimationComplete} />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md px-6 text-center">
        
        {/* Step 1: Show Button after animation */}
        {step === 'ready' && (
          <div className="animate-fade-in flex justify-center mt-32"> 
            <button 
              onClick={handleViewResult}
              className="group relative px-12 py-4 font-bold text-white transition-all duration-300 bg-gray-900 rounded-full hover:bg-gray-800 hover:scale-105 hover:shadow-xl shadow-lg active:scale-95"
            >
              <span className="text-xl tracking-wide">查看評語</span>
            </button>
          </div>
        )}

        {/* Step 2: Loading */}
        {step === 'loading' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-lg font-medium text-slate-500">正在分析...</p>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && (
          <div className="glass-card p-10 rounded-3xl flex flex-col items-center animate-[fadeInUp_0.8s_ease-out]">
             {/* Grade Display */}
             <div className="relative mb-8 transform hover:scale-110 transition-transform duration-500">
                <h2 className={`${getGradeFontSize(studentData.grade)} leading-none font-serif font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 drop-shadow-lg`}>
                  {studentData.grade}
                </h2>
             </div>

             <div className="w-16 h-1 bg-slate-200 rounded-full mb-6"></div>

             {/* Comments */}
             <div className="mb-10 min-h-[60px] flex items-center justify-center">
                <p className="text-xl font-medium leading-relaxed text-slate-700">
                  {comment}
                </p>
             </div>

             {/* Awesome Button */}
             <button 
               onClick={handleAwesomeClick}
               className="relative overflow-hidden px-10 py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold text-white text-lg shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-pink-500/40 active:scale-95 active:shadow-inner"
             >
               我好棒！
             </button>
          </div>
        )}
      </div>

      {/* Floating Emojis Container */}
      {emojis.map(emoji => (
        <div
          key={emoji.id}
          className="fixed text-4xl pointer-events-none animate-float-up z-50"
          style={{
            left: emoji.x,
            top: emoji.y,
          }}
        >
          👍
        </div>
      ))}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;