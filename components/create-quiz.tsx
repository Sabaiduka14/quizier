'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { generateQuiz } from '@/api/gemini'
import { QuizQuestionComponent } from './quiz-question'
import { FaBook, FaQuestionCircle, FaChalkboardTeacher, FaCog, FaArrowRight, FaEye } from 'react-icons/fa'
import { MdSubject, MdNumbers } from 'react-icons/md'
import { supabase } from '@/lib/supabase'

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

interface Generation {
  id: string;
  created_at: string;
  subject: string;
  questions: number;
  quiz_data: QuizData[];
}

interface CreateQuizComponentProps {
  onQuizCreated: () => void;
  onClose: () => void;
}

export function CreateQuizComponent({ onQuizCreated, onClose }: CreateQuizComponentProps) {
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [numberOfQuestions, setNumberOfQuestions] = useState(5)
  const [quizData, setQuizData] = useState<QuizData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Generation | null>(null)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching generations:', error)
      } else {
        setGenerations(data || [])
      }
    }
  }

  const handleGenerateQuiz = async () => {
    if (!content || !subject || numberOfQuestions < 1) {
      alert('Please enter content, select a subject, and specify the number of questions')
      return
    }

    setIsLoading(true)
    try {
      const questions = await Promise.all(
        Array(numberOfQuestions).fill(null).map(() => generateQuiz(subject, content))
      )
      setQuizData(questions)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase.from('generations').insert({
          user_id: user.id,
          subject,
          questions: numberOfQuestions,
          quiz_data: questions,
          topic: content
        })
        if (error) throw error
      }

      onQuizCreated()
      fetchGenerations()
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('An error occurred while generating the quiz. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    setQuizData([])
    setSelectedQuiz(null)
    onClose()
  }

  const handlePreviewQuiz = (quiz: Generation) => {
    setSelectedQuiz(quiz)
    setQuizData(quiz.quiz_data)
  }

  if (quizData.length > 0 || selectedQuiz) {
    return <QuizQuestionComponent quizData={quizData} onGoBack={handleGoBack} />
  }

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold mb-2 text-indigo-800 flex items-center">
        <FaChalkboardTeacher className="mr-3" /> Create a Quiz
      </h2>
      <p className="text-gray-600 mb-8 text-xl flex items-center">
        <FaQuestionCircle className="mr-2 text-indigo-500" /> Generate a quiz based on your content
      </p>
      <div className="space-y-8">
        <div>
          <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
            <FaBook className="mr-2 text-indigo-500" /> Enter your content
          </label>
          <Textarea
            id="content"
            placeholder="Paste or type your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="text-lg py-3 px-4 border-2 border-indigo-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            rows={6}
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="subject" className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
              <MdSubject className="mr-2 text-indigo-500" /> Select a subject
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="subject" className="text-lg py-3 px-4 border-2 border-indigo-200 rounded-lg">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math" className="text-lg">Math</SelectItem>
                <SelectItem value="science" className="text-lg">Science</SelectItem>
                <SelectItem value="history" className="text-lg">History</SelectItem>
                <SelectItem value="literature" className="text-lg">Literature</SelectItem>
                <SelectItem value="geography" className="text-lg">Geography</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label htmlFor="numberOfQuestions" className="block text-lg font-medium text-gray-700 mb-2 flex items-center">
              <MdNumbers className="mr-2 text-indigo-500" /> Number of questions
            </label>
            <Input
              id="numberOfQuestions"
              type="number"
              min={1}
              max={20}
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="text-lg py-3 px-4 border-2 border-indigo-200 rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-5">
          <Button variant="outline" className="text-lg py-2 px-4 text-indigo-600 border-indigo-600 hover:bg-indigo-50" onClick={() => { setContent(''); setSubject(''); setNumberOfQuestions(5) }}>
            Cancel
          </Button>
          <Button className="text-lg py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleGenerateQuiz} disabled={isLoading}>
            {isLoading ? (
              <>
                <FaCog className="animate-spin mr-2" /> Generating...
              </>
            ) : (
              <>
                Generate Quiz <FaArrowRight className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}