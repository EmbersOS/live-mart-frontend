import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const RetailerQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answeringQuestion, setAnsweringQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('/retailer/questions');
            setQuestions(response.data.questions || []);
        } catch (err) {
            console.error('Error fetching questions:', err);
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (questionId) => {
        if (!answerText.trim()) {
            alert('Please enter an answer');
            return;
        }

        try {
            await axios.put(`/retailer/questions/${questionId}`, {
                answer: answerText
            });
            alert('Answer submitted successfully!');
            setAnsweringQuestion(null);
            setAnswerText('');
            fetchQuestions(); // Refresh list
        } catch (err) {
            console.error('Failed to submit answer:', err);
            alert('Failed to submit answer. Please try again.');
        }
    };

    if (loading) {
        return <div className="text-gray-300 text-center py-8">Loading questions...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Customer Questions</h2>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {questions.length} Unanswered
                </span>
            </div>

            {questions.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No unanswered questions at the moment.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((question) => (
                        <div key={question.id} className="bg-gray-800 rounded-lg p-6">
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <p className="text-white font-medium mb-1">{question.question}</p>
                                        <p className="text-gray-400 text-sm">
                                            Asked by {question.user_name} ({question.user_email})
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Product ID: {question.product_id} • {new Date(question.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {answeringQuestion === question.id ? (
                                <div className="space-y-3 bg-gray-700 p-4 rounded-lg">
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        className="w-full bg-gray-600 text-white px-4 py-2 rounded-md border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Type your answer here..."
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => submitAnswer(question.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                        >
                                            Submit Answer
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAnsweringQuestion(null);
                                                setAnswerText('');
                                            }}
                                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAnsweringQuestion(question.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                                >
                                    Answer Question
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RetailerQuestions;
