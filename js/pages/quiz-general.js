
document.addEventListener("DOMContentLoaded", () => {
    const quizData = [
    {
        question: "Qu’est-ce qu’une valorisation DCF ?",
        answers: [
        { text: "Une méthode basée sur la valeur actuelle des flux futurs", correct: true },
        { text: "Une méthode qui compare les ratios de l’entreprise à ceux du secteur", correct: false },
        { text: "Une évaluation à partir du prix des actions", correct: false },
        ]
    },
    {
        question: "Le backtesting permet de…",
        answers: [
        { text: "Simuler la performance passée d’une stratégie", correct: true },
        { text: "Prévoir les performances futures avec certitude", correct: false },
        { text: "Analyser uniquement les ratios comptables", correct: false },
        ]
    },
    {
        question: "Que signifie M&A ?",
        answers: [
        { text: "Mergers and Acquisitions", correct: true },
        { text: "Money and Accounting", correct: false },
        { text: "Markets and Analytics", correct: false },
        ]
    },
    {
        question: "Dans le trading, un stop-loss sert à…",
        answers: [
        { text: "Limiter les pertes potentielles", correct: true },
        { text: "Augmenter les profits", correct: false },
        { text: "Fermer toutes les positions gagnantes", correct: false },
        ]
    },
    {
        question: "Quel indicateur mesure la rentabilité financière d’une entreprise ?",
        answers: [
        { text: "ROE (Return on Equity)", correct: true },
        { text: "PER (Price Earnings Ratio)", correct: false },
        { text: "Beta du marché", correct: false },
        ]
    }
    ];

    const questionEl = document.getElementById("question");
    const answersEl = document.getElementById("answers");
    const nextBtn = document.getElementById("next-btn");
    const resultEl = document.getElementById("result");
    const scoreText = document.getElementById("score-text");
    const restartBtn = document.getElementById("restart-btn");

    let currentQuestion = 0;
    let score = 0;
    let shuffledQuestions = [];

    function startQuiz() {
    resultEl.classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    shuffledQuestions = quizData.sort(() => Math.random() - 0.5);
    currentQuestion = 0;
    score = 0;
    showQuestion();
    }

    function showQuestion() {
    resetState();
    const currentQuiz = shuffledQuestions[currentQuestion];
    questionEl.textContent = currentQuiz.question;

    currentQuiz.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("answer-btn");
        button.addEventListener("click", () => selectAnswer(button, answer.correct));
        answersEl.appendChild(button);
    });
    }

    function resetState() {
    nextBtn.classList.add("hidden");
    answersEl.innerHTML = "";
    }

    function selectAnswer(button, isCorrect) {
    const allButtons = document.querySelectorAll(".answer-btn");
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
        button.classList.add("correct");
        score++;
    } else {
        button.classList.add("incorrect");
        const correctBtn = Array.from(allButtons).find(b =>
        shuffledQuestions[currentQuestion].answers.find(a => a.text === b.textContent && a.correct)
        );
        if (correctBtn) correctBtn.classList.add("correct");
    }

    nextBtn.classList.remove("hidden");
    }

    nextBtn.addEventListener("click", () => {
    currentQuestion++;
    if (currentQuestion < shuffledQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
    });

    function showResult() {
    document.getElementById("quiz").classList.add("hidden");
    resultEl.classList.remove("hidden");
    scoreText.textContent = `Vous avez obtenu ${score}/${shuffledQuestions.length} bonnes réponses.`;
    }

    restartBtn.addEventListener("click", startQuiz);

    startQuiz();
});
