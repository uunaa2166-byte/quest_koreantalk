import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Edit2, Check, RefreshCw, Trophy } from "lucide-react";

// 단어 하나의 상태를 정의합니다.
interface WordItem {
  id: number;
  text: string;
  owner: "none" | "teamA" | "teamB"; // 상태: 없음, A팀(파랑), B팀(빨강)
}

export default function App() {
  // 1. 상태 관리: 단어 목록, 편집 모드 여부
  const [words, setWords] = useState<WordItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 2. 초기 데이터 불러오기 (브라우저 저장소 확인)
  useEffect(() => {
    const savedWords = localStorage.getItem("quest-words");
    if (savedWords) {
      setWords(JSON.parse(savedWords));
    } else {
      // 기본 단어 10개 설정
      const initialWords: WordItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        text: `단어 ${i + 1}`,
        owner: "none",
      }));
      setWords(initialWords);
    }
  }, []);

  // 3. 단어 변경 시 저장하기
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem("quest-words", JSON.stringify(words));
    }
  }, [words]);

  // 4. 클릭 시 팀 색상 변경 (순환: 없음 -> 팀A -> 팀B -> 없음)
  const toggleOwner = (id: number) => {
    if (isEditing) return; // 편집 모드일 때는 색상 변경 방지

    setWords((prev) =>
      prev.map((word) => {
        if (word.id === id) {
          const nextOwner: WordItem["owner"] =
            word.owner === "none"
              ? "teamA"
              : word.owner === "teamA"
              ? "teamB"
              : "none";
          return { ...word, owner: nextOwner };
        }
        return word;
      })
    );
  };

  // 5. 단어 텍스트 수정
  const handleTextChange = (id: number, newText: string) => {
    setWords((prev) =>
      prev.map((word) => (word.id === id ? { ...word, text: newText } : word))
    );
  };

  // 6. 초기화 기능
  const resetGame = () => {
    if (confirm("모든 단어의 체크 상태를 초기화할까요?")) {
      setWords((prev) => prev.map((word) => ({ ...word, owner: "none" })));
    }
  };

  // 팀별 점수 계산
  const scoreA = words.filter((w) => w.owner === "teamA").length;
  const scoreB = words.filter((w) => w.owner === "teamB").length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 섹션 */}
        <header className="flex flex-col items-center mb-8 gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h1 className="text-xl font-bold text-slate-800">단어 퀘스트 대결</h1>
          </div>

          <div className="flex justify-between w-full items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
                <span className="font-bold text-blue-600">A팀: {scoreA}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm shadow-red-200"></div>
                <span className="font-bold text-red-600">B팀: {scoreB}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isEditing
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {isEditing ? (
                  <>
                    <Check className="w-4 h-4" /> 저장
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" /> 수정
                  </>
                )}
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-slate-600 border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> 초기화
              </button>
            </div>
          </div>
        </header>

        {/* 단어 그리드 */}
        <main className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {words.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
                onClick={() => toggleOwner(word.id)}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300 h-24 flex items-center justify-center p-4 shadow-sm ${
                  word.owner === "teamA"
                    ? "bg-blue-500 border-blue-600 text-white shadow-blue-200"
                    : word.owner === "teamB"
                    ? "bg-red-500 border-red-600 text-white shadow-red-200"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                } ${isEditing ? "cursor-default border-dashed border-green-400" : ""}`}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={word.text}
                    onChange={(e) => handleTextChange(word.id, e.target.value)}
                    className="w-full bg-transparent text-center font-bold text-lg outline-none"
                    autoFocus={index === 0}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-xl font-bold tracking-tight">
                    {word.text}
                  </span>
                )}

                {/* 팀 표시 배지 */}
                {!isEditing && word.owner !== "none" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </main>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>칸을 클릭하면 파랑 → 빨강 → 하양 순서로 바뀝니다.</p>
          <p className="mt-1">수정 버튼을 누르면 단어 내용을 바꿀 수 있습니다.</p>
        </footer>
      </div>
    </div>
  );
}
