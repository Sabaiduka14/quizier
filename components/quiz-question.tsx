'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock, 
  BarChart,
  RefreshCw,
  Home
} from 'lucide-react'
import { generateAIFeedback } from '@/api/gemini'

interface QuizData {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
}

interface QuizQuestionComponentProps {
  quizData: any; // Update this to match your quiz data structure
  onGoBack: () => void;
}

export function QuizQuestionComponent({ quizData, onGoBack }: QuizQuestionComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(new Array(quizData.length).fill(''))
  const [showResult, setShowResult] = useState(false)
  const [aiFeedback, setAIFeedback] = useState('')
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (showResult) {
      const fetchAIFeedback = async () => {
        const score = calculateScore()
        const feedback = await generateAIFeedback(quizData, selectedAnswers, score)
        setAIFeedback(feedback)
      }
      fetchAIFeedback()
    }
  }, [showResult])

  const handleAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResult(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) correct++
    })
    return {
      correct,
      total: quizData.length,
      percentage: (correct / quizData.length) * 100
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  if (showResult) {
    const score = calculateScore()
    return (
      <div className="min-h-screen bg-gradient-to-b p-6">
        <main className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-4xl font-bold mb-8 flex items-center text-blue-600">
            <Award className="mr-4" size={40} /> Quiz Results
          </h2>
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2" size={24} />
                <p className="text-xl">Correct Answers:</p>
              </div>
              <p className="text-2xl font-bold">{score.correct}</p>
            </div>
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="text-blue-500 mr-2" size={24} />
                <p className="text-xl">Total Questions:</p>
              </div>
              <p className="text-2xl font-bold">{score.total}</p>
            </div>
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart className="text-purple-500 mr-2" size={24} />
                <p className="text-xl">Score:</p>
              </div>
              <p className="text-2xl font-bold">{score.percentage.toFixed(2)}%</p>
            </div>
          </div>
          <div className="space-y-6 mb-8">
            <h3 className="text-2xl font-bold text-blue-600 flex items-center">
              <RefreshCw className="mr-2" size={24} /> Question Review:
            </h3>
            {quizData.map((question: QuizData, index: number) => (
              <div key={index} className="border p-4 rounded-lg bg-gray-50">
                <p className="font-bold mb-2">{index + 1}. {question.question}</p>
                <p className="mb-1">Your answer: 
                  <span className={selectedAnswers[index] === question.correctAnswer ? "text-green-600 font-bold ml-2" : "text-red-600 font-bold ml-2"}>
                    {question.options[selectedAnswers[index] as keyof typeof question.options]}
                  </span>
                  {selectedAnswers[index] === question.correctAnswer ? 
                    <CheckCircle className="inline text-green-600 ml-2" size={20} /> : 
                    <XCircle className="inline text-red-600 ml-2" size={20} />
                  }
                </p>
                <p className="mb-1">Correct answer: 
                  <span className="text-green-600 font-bold ml-2">
                    {question.options[question.correctAnswer as keyof typeof question.options]}
                  </span>
                </p>
              </div>
            ))}
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-blue-600 flex items-center mb-4">
              <Award className="mr-2" size={24} /> AI Feedback:
            </h3>
            <p className="text-lg bg-yellow-50 p-4 rounded-lg">{aiFeedback}</p>
          </div>
          <Button className="w-full" onClick={onGoBack}>
            <Home className="mr-2" size={20} /> Go Back to Home
          </Button>
        </main>
      </div>
    )
  }

  const currentQuestion = quizData[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b p-6">
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center space-x-3">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-blue-600">QuizMaster</h1>
        </div>
        <div className="flex items-center space-x-4 gap-1 text-xl font-bold">
          <Clock className="text-blue-600" size={24} />
          {formatTime(timeLeft)}
        </div>
      </header>
      <main className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-medium">Question {currentQuestionIndex + 1} of {quizData.length}</span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / quizData.length) * 100} className="h-2" />
        </div>
        <h2 className="text-3xl font-bold mb-8 text-blue-600">{currentQuestion.question}</h2>
        <div className="space-y-4">
          {Object.entries(currentQuestion.options).map(([key, value]) => (
            <button
              key={key}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedAnswers[currentQuestionIndex] === key 
                  ? 'bg-blue-100 border-blue-500 shadow-md' 
                  : 'hover:bg-gray-100 hover:border-gray-300'
              }`}
              onClick={() => handleAnswer(key)}
            >
              <span className="font-bold mr-2">{key}:</span> {value as React.ReactNode}
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-between">
          <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="flex items-center">
            <ChevronLeft className="mr-2" size={20} /> Previous
          </Button>
          <Button onClick={handleNext} className="flex items-center">
            {currentQuestionIndex === quizData.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="ml-2" size={20} />
          </Button>
        </div>
      </main>
    </div>
  )
}