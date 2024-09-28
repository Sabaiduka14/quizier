'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function Contact() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Form submitted:', { name, email, message })
        alert('Thank you for your message. We will get back to you soon!')
        setName('')
        setEmail('')
        setMessage('')
        router.push('/')

        const { data, error } = await supabase.from('contact_messages').insert([
            { name, email, message }
        ])
            .select()

        if (error) {
            console.error('Error sending message:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/">
                        <h1 className="text-2xl font-bold text-gray-900">QuizMaster AI</h1>
                    </Link>
                </nav>
            </header>

            <main className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Contact Us</h2>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                    <div>
                        <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</Label>
                        <Input
                            placeholder='Name'
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                        <Input
                            placeholder='Email'
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</Label>
                        <Textarea
                            placeholder='Message'
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className="mt-1"
                            rows={4}
                        />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                </form>
            </main>
        </div>
    )
}