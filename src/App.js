import React, { useState, useEffect } from "react";
import Chat, { Bubble, useMessages } from "@chatui/core";
import "@chatui/core/dist/index.css";

// Depression screening questions (PHQ-9 based)
const SCREENING_QUESTIONS = [
  "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
  "Over the last 2 weeks, how often have you been feeling down, depressed, or hopeless?",
  "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
  "Over the last 2 weeks, how often have you been feeling tired or having little energy?",
  "Over the last 2 weeks, how often have you had poor appetite or overeating?",
  "Over the last 2 weeks, how often have you been feeling bad about yourself or that you are a failure?",
  "Over the last 2 weeks, how often have you had trouble concentrating on things?",
  "Over the last 2 weeks, how often have you been moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?",
  "Over the last 2 weeks, how often have you had thoughts that you would be better off dead or of hurting yourself in some way?",
];

const RESPONSE_OPTIONS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

export default function App() {
  const { messages, appendMsg } = useMessages([]);
  const [screeningInProgress, setScreeningInProgress] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [screeningResults, setScreeningResults] = useState([]);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Initial welcome message
    appendMsg({
      type: "text",
      content: {
        text: "Welcome! I'm here to help you understand your mental well-being. Before we begin, please note that I am not a replacement for professional medical advice. If you're in crisis, please call emergency services immediately.",
      },
    });
    appendMsg({
      type: "text",
      content: {
        text: "Would you like to participate in a brief mental health screening? Your responses will be kept confidential. Type 'yes' to begin or 'no' to decline.",
      },
    });
  }, []);

  function handleSend(type, val) {
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
      });

      if (!consentGiven) {
        handleConsent(val.toLowerCase());
        return;
      }

      if (screeningInProgress) {
        handleScreeningResponse(val);
      } else {
        // Regular conversation analysis
        analyzeConversation(val);
      }
    }
  }

  function handleConsent(response) {
    if (response === "yes") {
      setConsentGiven(true);
      appendMsg({
        type: "text",
        content: {
          text: "Thank you for agreeing to participate. Let's begin with some questions about how you've been feeling recently.",
        },
      });
      startScreening();
    } else if (response === "no") {
      appendMsg({
        type: "text",
        content: {
          text: "I understand. If you change your mind, you can start the screening at any time by typing 'start screening'. Remember, if you need immediate help, please contact emergency services or a mental health professional.",
        },
      });
    }
  }

  function startScreening() {
    setScreeningInProgress(true);
    setCurrentQuestionIndex(0);
    appendMsg({
      type: "text",
      content: {
        text:
          SCREENING_QUESTIONS[0] +
          "\n\nPlease respond with:\n1. Not at all\n2. Several days\n3. More than half the days\n4. Nearly every day",
      },
    });
  }

  function handleScreeningResponse(response) {
    const score = RESPONSE_OPTIONS.indexOf(response) + 1;
    if (score > 0) {
      const score = RESPONSE_OPTIONS.indexOf(response);
      if (score >= 0) {
        setScreeningResults([...screeningResults, score]);

        if (currentQuestionIndex < SCREENING_QUESTIONS.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          appendMsg({
            type: "text",
            content: {
              text:
                SCREENING_QUESTIONS[currentQuestionIndex + 1] +
                "\n\nPlease respond with:\n1. Not at all\n2. Several days\n3. More than half the days\n4. Nearly every day",
            },
          });
        } else {
          // Screening complete
          const totalScore =
            screeningResults.reduce((a, b) => a + b, 0) + score;
          provideFeedback(totalScore);
          setScreeningInProgress(false);
        }
      }
    } else {
      appendMsg({
        type: "text",
        content: {
          text: "Please respond with one of the following options:\n1. Not at all\n2. Several days\n3. More than half the days\n4. Nearly every day",
        },
      });
    }
  }

  function provideFeedback(score) {
    let feedback = "";
    if (score <= 4) {
      if (score === 0) {
        feedback =
          "Your responses suggest minimal depression. However, if you're experiencing any concerns, please don't hesitate to speak with a healthcare provider.";
      }
    } else if (score <= 4) {
      feedback =
        "Your responses suggest minimal depression. However, if you're experiencing any concerns, please don't hesitate to speak with a healthcare provider.";
    } else if (score <= 9) {
      feedback =
        "Your responses suggest mild depression. It might be helpful to discuss your feelings with a healthcare provider.";
    } else if (score <= 14) {
      feedback =
        "Your responses suggest moderate depression. We strongly recommend speaking with a healthcare provider about your symptoms.";
    } else if (score <= 19) {
      feedback =
        "Your responses suggest moderately severe depression. Please consider speaking with a healthcare provider as soon as possible.";
    } else {
      feedback =
        "Your responses suggest severe depression. We strongly recommend seeking help from a healthcare provider immediately.";
    }

    appendMsg({
      type: "text",
      content: {
        text:
          feedback +
          "\n\nIf you need immediate help, please contact:\n- Emergency Services: 999\n- National Suicide Prevention Lifeline: 2382 0000\n- Crisis Text Line: 2382 2738",
      },
    });
  }

  function analyzeConversation(text) {
    // Basic sentiment analysis
    const negativeWords = [
      "sad",
      "depressed",
      "hopeless",
      "worthless",
      "suicide",
      "die",
      "kill",
    ];
    const hasNegativeSentiment = negativeWords.some((word) =>
      text.toLowerCase().includes(word)
    );

    if (hasNegativeSentiment) {
      appendMsg({
        type: "text",
        content: {
          text: "I notice you're expressing some difficult feelings. Would you like to talk more about this? Remember, if you're in crisis, please call emergency services immediately.",
        },
      });
    } else {
      appendMsg({
        type: "text",
        content: {
          text: "I'm here to listen. How are you feeling today?",
        },
      });
    }
  }

  function renderMessageContent(msg) {
    const { type, content } = msg;

    // 根据消息类型来渲染
    switch (type) {
      case "text":
        return <Bubble content={content.text} />;
      default:
        return null;
    }
  }

  return (
    <Chat
      navbar={{ title: "Mental Health Support Chat" }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      onSend={handleSend}
    />
  );
}
