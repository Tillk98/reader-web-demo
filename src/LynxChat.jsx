import { useState } from "react";
import { ArrowUp, ChevronDown, CornerDownRight, Mic } from "lucide-react";
import lynxIcon from "../assets/lynx_icon_light.png";
import thumbnail from "../assets/lesson-thumbnail.jpg";

const SUGGESTIONS = [
  "Frag mich den heutigen Wortschatz ab.",
  "Wiederhole die Wörter, die ich falsch hatte.",
];

export default function LynxChat({ onClose }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);

  function send(text) {
    const value = text.trim();
    if (!value) return;
    setMessages((current) => [...current, value]);
    setDraft("");
  }

  return (
    <section className="lynx-chat" aria-label="Lynx AI">
      <header className="lynx-chat-header">
        <div className="lynx-chat-title">
          <img src={lynxIcon} alt="" width={18} height={18} />
          <p>Lynx AI</p>
        </div>
        <button type="button" className="lynx-chat-close" aria-label="Close Lynx" onClick={onClose}>
          <ChevronDown size={18} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      </header>
      <div className="lynx-chat-lesson">
        <img src={thumbnail} alt="" width={32} height={32} />
        <span>
          <strong>Mehrere Sprachen auf einmal lernen?! Wie lange jeden Tag lernen?</strong>
          <em>YouTube auf Deutsch</em>
        </span>
      </div>
      <div className="lynx-chat-thread">
        {messages.map((message, index) => (
          <p key={`${index}-${message}`}>{message}</p>
        ))}
      </div>
      <div className="lynx-chat-suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => send(suggestion)}>
            <CornerDownRight size={16} strokeWidth={1.5} absoluteStrokeWidth />
            <span>{suggestion}</span>
          </button>
        ))}
      </div>
      <form
        className="lynx-chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <input
          type="text"
          value={draft}
          placeholder="Was möchtest du heute diskutieren?"
          aria-label="Message Lynx"
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="lynx-chat-actions">
          <button type="button" aria-label="Voice input">
            <Mic size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
          <button type="submit" aria-label="Send">
            <ArrowUp size={16} strokeWidth={1.5} absoluteStrokeWidth />
          </button>
        </div>
      </form>
    </section>
  );
}
