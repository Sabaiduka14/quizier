'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase'
import { CreateQuizComponent } from '@/components/create-quiz'
import { QuizQuestionComponent } from '@/components/quiz-question'
import { FaPlus, FaSignOutAlt, FaUser, FaCreditCard, FaPlay } from 'react-icons/fa'

interface Generation {
    id: string
    created_at: string
    subject: string
    questions: number
    quiz_data: any // Consider defining a more specific type
    topic: string
    user_id: string // Add this field
}

export default function Dashboard() {
    const [user, setUser] = useState<any>(null) // Consider using a more specific type
    const [generations, setGenerations] = useState<Generation[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState<Generation | null>(null)
    const [generationLimit, setGenerationLimit] = useState(5)
    const router = useRouter()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/signin')
            } else {
                setUser(user)
                fetchGenerations(user.id)
                setGenerationLimit(user.user_metadata.generation_limit || 5)
            }
        }
        getUser()
    }, [router])

    const fetchGenerations = async (userId: string) => {
        const { data, error } = await supabase
            .from('generations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching generations:', error)
        } else {
            setGenerations(data || [])
        }
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const handleQuizCreated = async () => {
        if (user) {
            await fetchGenerations(user.id)
        }
        setIsDialogOpen(false)
    }

    const handlePayment = async () => {
        // Simulate payment process
        setTimeout(async () => {
            setShowPaymentDialog(false)
            // Update the user's generation limit in the user metadata
            const newLimit = generationLimit + 5
            const { data, error } = await supabase.auth.updateUser({
                data: { generation_limit: newLimit }
            })

            if (error) {
                console.error('Error updating generation limit:', error)
                alert('Error processing payment. Please try again.')
            } else {
                setGenerationLimit(newLimit)
                setUser(data.user)
                alert('Payment successful! You can now generate 5 more quizzes.')
            }
        }, 2000)
    }

    const handleStartQuiz = (quiz: Generation) => {
        setSelectedQuiz(quiz)
    }

    const handleQuizFinished = () => {
        setSelectedQuiz(null)
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 flex items-center">
                            <FaUser className="mr-2" /> {user?.user_metadata?.name || user?.email}
                        </span>
                        <Button onClick={handleSignOut} variant="outline">
                            <FaSignOutAlt className="mr-2" /> Sign Out
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {selectedQuiz ? (
                    <QuizQuestionComponent quizData={selectedQuiz.quiz_data} onGoBack={handleQuizFinished} />
                ) : (
                    <>
                        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Generations Used</h2>
                            <Progress value={(generations.length / generationLimit) * 100} className="h-4 mb-2" />
                            <p className="text-sm text-gray-600">{generations.length} out of {generationLimit} generations used</p>
                        </div>

                        <div className="bg-white shadow-sm rounded-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Your Generations</h2>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button onClick={() => generations.length >= generationLimit ? setShowPaymentDialog(true) : null}>
                                            <FaPlus className="mr-2" /> Create New
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className={`${showPaymentDialog ? "max-w-[40vw]" : "max-w-[80vw]"} max-h-[90vh] overflow-y-auto`}>
                                        {showPaymentDialog ? (
                                            <div className="p-2">
                                                <h2 className="text-2xl font-bold mb-4">Upgrade to Generate More Quizzes</h2>
                                                <p className="mb-4">You've reached the limit of {generationLimit} quizzes. Upgrade now to generate more!</p>
                                                <Button onClick={handlePayment} className="w-full">
                                                    <FaCreditCard className="mr-2" /> Pay $9.99 for 5 more quizzes
                                                </Button>
                                            </div>
                                        ) : (
                                            <CreateQuizComponent onQuizCreated={handleQuizCreated} onClose={() => setIsDialogOpen(false)} />
                                        )}
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {generations.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Topic</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Questions</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {generations.map((generation) => (
                                            <TableRow key={generation.id}>
                                                <TableCell>
                                                    <Button onClick={() => handleStartQuiz(generation)} className="flex items-center">
                                                        <FaPlay className="mr-2" /> Start Quiz
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{generation.topic.slice(0, 20)}</TableCell>
                                                <TableCell>{generation.subject}</TableCell>
                                                <TableCell>{generation.questions}</TableCell>
                                                <TableCell>{new Date(generation.created_at).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-gray-500 text-center">No generations yet. Create your first quiz!</p>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}