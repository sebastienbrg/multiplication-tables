import { User } from "../appState";
import { QuizState } from "../quizzState";
import { getMarginDisplay } from "../tools/statsDisplayTools";
import { getScorePointsForAnswer } from "./getScorePointsForAnswer";

const BrokenClock = () => (
    <svg width="60" height="60" viewBox="0 0 60 60" className="animate-shake inline-block mr-2">
        <circle cx="30" cy="30" r="28" stroke="#e53e3e" strokeWidth="4" fill="#fff" />
        <line x1="30" y1="30" x2="30" y2="12" stroke="#e53e3e" strokeWidth="3" />
        <line x1="30" y1="30" x2="44" y2="44" stroke="#e53e3e" strokeWidth="3" />


    </svg>
);

const ThumbsUp = () => (
    <svg width="120" height="120" viewBox="-60 -60 60 60" className="animate-bounce inline-block ml-4 drop-shadow-lg">

        <g>
            <text x="-30" y="-20" textAnchor="middle" fontSize="42" fill="#38a169" fontWeight="bold" style={{ fontFamily: 'Arial' }}>👍</text>
        </g>
    </svg>
);

const QuestionResultViewer = ({ quizzState, user }: { quizzState: QuizState, user: User }) => {
    if (!quizzState.showResult) return null;

    const { a, b } = quizzState.questions[quizzState.currentQuestionIndex];
    const scoredPoints = getScorePointsForAnswer(user, quizzState.responseTime, quizzState.correct);
    const targetScorePoints = getScorePointsForAnswer(user, user.targetResponseTime, true);
    return <>
        <div className="text-4xl font-bold mb-4">{a} × {b} = {a * b} </div>
        {quizzState.timedOut && (
            <div className="flex items-center text-red-600">
                <BrokenClock />
                <span>Temps écoulé !</span>
            </div>
        )}
        {((!quizzState.timedOut) && quizzState.correct) && (
            <>
                <div className="text-green-600 flex flex-col justify-center items-center">
                    <div key="m" className="text-3xl">
                        Bonne réponse !
                        {scoredPoints > targetScorePoints && <ThumbsUp />}
                    </div>
                    <div key="s" className="text-lg">
                        Temps de réponse : {quizzState.responseTime} secondes.
                        {getMarginDisplay(quizzState.responseTime, user.maxResponseTime)}
                    </div>
                </div>
                <div className="text-gray-500 mt-2">
                    Score + {Math.round(scoredPoints)} point ( Objectif : {Math.round(targetScorePoints)} points )
                </div>
            </>
        )}
        {(!quizzState.timedOut) && !quizzState.correct && (
            <div className="text-red-600 animate-wiggle text-3xl">Mauvaise réponse !</div>
        )}
        <style jsx global>{`
            @keyframes shake {
                0% { transform: translate(0, 0) rotate(0deg); }
                20% { transform: translate(-2px, 2px) rotate(-10deg); }
                40% { transform: translate(2px, -2px) rotate(10deg); }
                60% { transform: translate(-2px, 2px) rotate(-10deg); }
                80% { transform: translate(2px, -2px) rotate(10deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            .animate-shake {
                animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes wiggle {
                0%, 100% { transform: rotate(-3deg); }
                20% { transform: rotate(3deg); }
                40% { transform: rotate(-3deg); }
                60% { transform: rotate(3deg); }
                80% { transform: rotate(-3deg); }
            }
            .animate-wiggle {
                animation: wiggle 0.7s ease-in-out;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
                50% { transform: translateY(-5px); }
                70% { transform: translateY(-10px); }
            }
            .animate-bounce {
                animation: bounce 0.8s;
            }
        `}</style>
    </>;
};

export default QuestionResultViewer;