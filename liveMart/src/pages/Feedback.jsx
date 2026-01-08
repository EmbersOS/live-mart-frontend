import React, { useState } from 'react'

const Feedback = () => {
  const [text, setText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Feedback</h1>
      {!submitted ? (
        <div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Share your feedback" className="w-full h-32 p-2 bg-gray-800 rounded"/>
          <button onClick={()=>setSubmitted(true)} className="mt-3 bg-green-600 px-4 py-2 rounded">Submit</button>
        </div>
      ) : (
        <p className="text-green-400">Thanks for your feedback!</p>
      )}
    </div>
  )
}

export default Feedback
