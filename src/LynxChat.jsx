import { useState } from "react";
import { ArrowUp, CornerDownRight, Maximize2, Mic, PanelRight, X } from "lucide-react";
import lynxIcon from "../assets/lynx_icon_light.png";

const SUGGESTIONS = [
  "Frag mich den heutigen Wortschatz ab.",
  "Wiederhole die Wörter, die ich falsch hatte.",
];

function LessonIdentity({ lesson, onExpand }) {
  return (
    <div className="lynx-chat-lesson">
      <img src={lesson.image} alt="" width={40} height={40} />
      <div className="lynx-chat-lesson-copy">
        <p className="lynx-chat-lesson-title">{lesson.title}</p>
        <p className="lynx-chat-lesson-course">{lesson.course}</p>
      </div>
      {onExpand ? (
        <button type="button" className="widget-large-icon-button" aria-label="Expand Lynx" onClick={onExpand}>
          <Maximize2 size={20} strokeWidth={1.5} absoluteStrokeWidth />
        </button>
      ) : null}
    </div>
  );
}

export default function LynxChat({ onClose, sheet = false, lesson = null, replaceTitle = false, onTogglePanel = null, onExpand = null, closable = false }) {
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
      {sheet ? (
        <header className="review-panel-header">
          <div className="review-header-bar">
            <h2>Lynx AI</h2>
            <button type="button" className="widget-large-icon-button" aria-label="Close" onClick={onClose}>
              <X size={20} strokeWidth={1.5} absoluteStrokeWidth />
            </button>
          </div>
        </header>
      ) : replaceTitle ? (
        lesson ? <LessonIdentity lesson={lesson} onExpand={onExpand} /> : null
      ) : (
        <>
          <header className="lynx-chat-header">
            <div className="lynx-chat-title">
              <img src={lynxIcon} alt="" width={20} height={20} />
              <p>Lynx AI</p>
            </div>
            {onExpand || onTogglePanel || closable ? (
              <div className="lynx-chat-heading-actions">
                {onExpand ? (
                  <button type="button" className="widget-large-icon-button" aria-label="Expand Lynx" onClick={onExpand}>
                    <Maximize2 size={20} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                ) : null}
                {onTogglePanel ? (
                  <button type="button" className="widget-large-icon-button" aria-label="Close side panel" onClick={onTogglePanel}>
                    <PanelRight size={20} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                ) : null}
                {closable ? (
                  <button type="button" className="widget-large-icon-button" aria-label="Close Lynx" onClick={onClose}>
                    <X size={20} strokeWidth={1.5} absoluteStrokeWidth />
                  </button>
                ) : null}
              </div>
            ) : null}
          </header>
          {lesson ? <LessonIdentity lesson={lesson} /> : null}
        </>
      )}
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
