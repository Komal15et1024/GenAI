import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const JobApplicationChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your job application assistant. I'll help you through the application process step by step. Let's start with your basic information. What's your full name?",
      timestamp: new Date()
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [currentStep, setCurrentStep] = useState('name');
  const [applicationData, setApplicationData] = useState({});
  const [uploadedResume, setUploadedResume] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);

  const steps = {
    name: { next: 'email', question: "Great to meet you, {name}! What's your email address?" },
    email: { next: 'phone', question: "Perfect! Now, what's your phone number?" },
    phone: { next: 'position', question: "Thanks! Which position are you applying for?" },
    position: { next: 'experience', question: "Excellent choice! How many years of relevant experience do you have?" },
    experience: { next: 'education', question: "That's great experience! What's your highest level of education?" },
    education: { next: 'resume', question: "Perfect! Please upload your resume using the upload button below, or type 'skip' if you'd like to continue without uploading." },
    resume: { next: 'motivation', question: "Thank you! What motivates you to apply for this position?" },
    motivation: { next: 'availability', question: "That's inspiring! When would you be available to start if selected?" },
    availability: { next: 'complete', question: "Almost done! Is there anything else you'd like to add about your application?" }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus on input after each message for better accessibility
    if (chatInputRef.current && !isLoading) {
      chatInputRef.current.focus();
    }
  }, [messages, isLoading]);

  const addMessage = (content, type = 'user') => {
    const newMessage = {
      id: messages.length + 1,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = () => {
    if (!currentInput.trim() && currentStep !== 'resume') return;

    setIsLoading(true);
    addMessage(currentInput);

    // Simulate processing delay for better UX
    setTimeout(() => {
      processUserInput(currentInput);
      setCurrentInput('');
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const processUserInput = (input) => {
    const stepData = { [currentStep]: input };
    setApplicationData(prev => ({ ...prev, ...stepData }));

    const nextStep = steps[currentStep]?.next;
    
    if (nextStep === 'complete') {
      addMessage("Thank you for completing your application! We've received all your information and will review it shortly. You should hear back from us within 3-5 business days. Good luck!", 'bot');
      setCurrentStep('complete');
    } else if (nextStep) {
      const nextQuestion = steps[currentStep].question.replace('{name}', applicationData.name || input);
      addMessage(nextQuestion, 'bot');
      setCurrentStep(nextStep);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        addMessage("Please upload a PDF or Word document for your resume.", 'bot');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        addMessage("Please upload a file smaller than 5MB.", 'bot');
        return;
      }

      setUploadedResume(file);
      addMessage(`Resume uploaded: ${file.name}`, 'user');
      
      setTimeout(() => {
        const nextQuestion = steps[currentStep].question;
        addMessage("Perfect! Your resume has been uploaded successfully. " + nextQuestion, 'bot');
        setCurrentStep(steps[currentStep].next);
      }, 500);
    }
  };

  const ApplicationSummary = () => {
    if (currentStep !== 'complete') return null;

    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Application Summary
        </h3>
        <div className="space-y-2 text-sm text-green-700">
          {Object.entries(applicationData).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium capitalize w-24">{key}:</span>
              <span>{value}</span>
            </div>
          ))}
          {uploadedResume && (
            <div className="flex">
              <span className="font-medium w-24">Resume:</span>
              <span>{uploadedResume.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-green-100 border-b border-green-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-green-800">Job Application Assistant</h1>
            <p className="text-sm text-green-600">Step {Object.keys(steps).indexOf(currentStep) + 1} of {Object.keys(steps).length}</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-green-50 p-2">
        <div className="w-full bg-green-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((Object.keys(steps).indexOf(currentStep) + 1) / Object.keys(steps).length) * 100}%` }}
            role="progressbar"
            aria-valuenow={Object.keys(steps).indexOf(currentStep) + 1}
            aria-valuemin={1}
            aria-valuemax={Object.keys(steps).length}
            aria-label={`Application progress: step ${Object.keys(steps).indexOf(currentStep) + 1} of ${Object.keys(steps).length}`}
          ></div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg break-words ${
                message.type === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-50 text-green-800 border border-green-200'
              }`}
              role="article"
              aria-label={`${message.type === 'user' ? 'Your message' : 'Assistant message'}: ${message.content}`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-green-100' : 'text-green-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Processing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        <ApplicationSummary />
      </div>

      {/* Input Area */}
      {currentStep !== 'complete' && (
        <div className="border-t border-green-200 p-4 bg-green-50">
          <div className="flex space-x-2">
            <div className="flex-1">
              <label htmlFor="chat-input" className="sr-only">
                Type your response here
              </label>
              <input
                id="chat-input"
                ref={chatInputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={currentStep === 'resume' ? "Type your response or upload resume..." : "Type your response..."}
                className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isLoading}
                aria-describedby={currentStep === 'resume' ? "upload-help" : undefined}
              />
              {currentStep === 'resume' && (
                <p id="upload-help" className="text-xs text-green-600 mt-1">
                  You can upload a PDF, DOC, or DOCX file (max 5MB)
                </p>
              )}
            </div>
            
            {currentStep === 'resume' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  id="resume-upload"
                  aria-label="Upload resume file"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                  disabled={isLoading}
                  aria-label="Upload resume"
                >
                  <Upload className="w-4 h-4" />
                  <span className="sr-only">Upload Resume</span>
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!currentInput.trim() && currentStep !== 'resume')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationChatbot;