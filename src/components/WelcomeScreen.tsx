import { SparkIcon } from './Icons';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

// The example prompts shown as cards. Clicking one sends it as a message.
const examplePrompts = [
  { title: 'Explain a concept', prompt: 'Explain how the internet works in simple terms' },
  { title: 'Write something', prompt: 'Write a short poem about the ocean' },
  { title: 'Get ideas', prompt: 'Give me ideas for a relaxing weekend trip' },
  { title: 'Make a plan', prompt: 'Help me plan a productive study schedule' },
];

export default function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome-logo">
        <SparkIcon size={26} />
      </div>
      <h1 className="welcome-title">How can I help you today?</h1>
      <p className="welcome-subtitle">Ask anything, or start with one of these examples.</p>

      <div className="prompt-grid">
        {examplePrompts.map((item) => (
          <button key={item.prompt} className="prompt-card" onClick={() => onPromptClick(item.prompt)}>
            <span className="prompt-card-title">{item.title}</span>
            <span className="prompt-card-text">{item.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
