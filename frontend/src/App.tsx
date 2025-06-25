import React, { useState, useCallback, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  IconButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import theme from "./theme/theme";
import { DrawingProvider, useDrawing } from "./context/DrawingContext";
import ImageUpload from "./components/ImageUpload/ImageUpload";
import EngineeringCanvas, {
  BoundingBox,
} from "./components/Canvas/EngineeringCanvas";
import BoundingBoxEditor from "./components/Canvas/BoundingBoxEditor";
import ChatPanel, { ChatMessage } from "./components/Chat/ChatPanel";
import SettingsModal, {
  SettingsState,
} from "./components/Settings/SettingsModal";

const SAMPLE_QUESTIONS = [
  "What is the main purpose of this system?",
  "Explain how the temperature control loop works",
  "Detect all pumps in this drawing",
  "Detect all valves",
  "What safety measures are present in this system?",
  "How do the transformers support reliability?",
];

function MainApp() {
  const {
    state: { imageUrl, boundingBoxes, selectedBoxId },
    setImage,
    setBoxes,
    addBox,
    updateBox,
    deleteBox,
    selectBox,
    clearBoxes,
  } = useDrawing();
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("settings") || "") || {
          openaiKey: "",
          geminiKey: "",
          chatModel: "gpt-4o",
        }
      );
    } catch {
      return { openaiKey: "", geminiKey: "", chatModel: "gpt-4o" };
    }
  });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chat_history") || "") || [];
    } catch {
      return [];
    }
  });
  const [chatLoading, setChatLoading] = useState(false);
  const toast = useToast();

  // Persist chat history
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Bounding box editor modal logic
  useEffect(() => {
    setEditorOpen(!!selectedBoxId);
  }, [selectedBoxId]);

  // Settings modal logic
  const handleSaveSettings = (s: SettingsState) => {
    setSettings(s);
  };

  // Image upload logic
  const handleImageLoaded = (url: string) => {
    setImage(url);
    setChatHistory([]);
    clearBoxes();
  };

  // Bounding box editor logic
  const handleSaveBox = (box: BoundingBox) => {
    updateBox(box);
    setEditorOpen(false);
    selectBox(null);
  };
  const handleDeleteBox = (id: string) => {
    deleteBox(id);
    setEditorOpen(false);
    selectBox(null);
  };
  const handleCancelBox = () => {
    setEditorOpen(false);
    selectBox(null);
  };

  // Chat logic
  const handleSendChat = useCallback(
    async (message: string) => {
      setChatLoading(true);
      setChatHistory((prev) => [...prev, { sender: "user", content: message }]);
      try {
        // Detection trigger (simple keyword match)
        if (
          /detect\s+(pumps?|valves?|motors?|tanks?|vessels?|pipes?|sensors?|instruments?|breakers?|transformers?|busbars?|switches?|relays?)/i.test(
            message
          )
        ) {
          // Call Gemini for detection
          const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" +
              settings.geminiKey,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: message },
                      {
                        inlineData: {
                          mimeType: "image/png",
                          data: imageUrl?.split(",")[1] || "",
                        },
                      },
                    ],
                  },
                ],
              }),
            }
          );
          const data = await response.json();
          // Parse bounding boxes from Gemini response (assume JSON in text)
          let boxes: BoundingBox[] = [];
          try {
            const match =
              data.candidates?.[0]?.content?.parts?.[0]?.text?.match(/\[.*\]/s);
            if (match) boxes = JSON.parse(match[0]);
          } catch {}
          if (boxes.length) {
            setBoxes(boxes);
            setChatHistory((prev) => [
              ...prev,
              {
                sender: "assistant",
                content: "Detected and annotated requested elements.",
              },
            ]);
          } else {
            setChatHistory((prev) => [
              ...prev,
              {
                sender: "assistant",
                content:
                  "No elements detected or unable to parse detection results.",
              },
            ]);
          }
        } else {
          // Call OpenAI for chat
          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.openaiKey}`,
              },
              body: JSON.stringify({
                model: settings.chatModel,
                messages: [
                  {
                    role: "system",
                    content:
                      "You are a helpful assistant for engineering drawings.",
                  },
                  ...chatHistory.map((m) => ({
                    role: m.sender === "user" ? "user" : "assistant",
                    content: m.content,
                  })),
                  { role: "user", content: message },
                ],
                stream: false,
              }),
            }
          );
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || "No response.";
          setChatHistory((prev) => [...prev, { sender: "assistant", content }]);
        }
      } catch (err) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "assistant",
            content:
              "Error: " +
              (err instanceof Error ? err.message : "Unknown error"),
          },
        ]);
        toast({
          title: "Chat error",
          description: String(err),
          status: "error",
        });
      }
      setChatLoading(false);
    },
    [settings, chatHistory, imageUrl, setBoxes, toast]
  );

  // Sample question logic
  const handleSampleQuestion = (q: string) => {
    handleSendChat(q);
  };

  return (
    <Flex as="main" bg="background.light" minH="100vh" py={8}>
      <Flex w="100%" maxW="container.xl" mx="auto" gap={8}>
        {/* Left Panel: Canvas/Image */}
        <Box flex="1" bg="surface.light" borderRadius="lg" boxShadow="md" p={4}>
          <Box mb={4}>
            <ImageUpload
              onImageLoaded={handleImageLoaded}
              currentImageUrl={imageUrl}
            />
          </Box>
          {imageUrl && (
            <EngineeringCanvas
              imageUrl={imageUrl}
              boundingBoxes={boundingBoxes}
              selectedBoxId={selectedBoxId}
              onBoxesChange={setBoxes}
              onSelectBox={selectBox}
            />
          )}
          <BoundingBoxEditor
            isOpen={editorOpen}
            box={boundingBoxes.find((b) => b.id === selectedBoxId) || null}
            onSave={handleSaveBox}
            onDelete={handleDeleteBox}
            onCancel={handleCancelBox}
          />
        </Box>
        {/* Right Panel: Chat */}
        <Box
          flex="1"
          bg="surface.light"
          borderRadius="lg"
          boxShadow="md"
          p={4}
          position="relative"
        >
          <IconButton
            icon={<SettingsIcon />}
            aria-label="Settings"
            position="absolute"
            top={2}
            right={2}
            size="sm"
            onClick={() => setSettingsOpen(true)}
            zIndex={2}
          />
          <ChatPanel
            chatHistory={chatHistory}
            loading={chatLoading}
            onSend={handleSendChat}
            sampleQuestions={SAMPLE_QUESTIONS}
            onSampleQuestion={handleSampleQuestion}
          />
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            onSave={handleSaveSettings}
            initialSettings={settings}
          />
        </Box>
      </Flex>
    </Flex>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <DrawingProvider>
        <Box as="header" bg="surface.light" px={4} py={3} boxShadow="sm">
          <Flex
            align="center"
            justify="space-between"
            maxW="container.xl"
            mx="auto"
          >
            <Box as="h1" fontSize="2xl" fontWeight="bold" color="primary.light">
              Engineering Drawing Analyzer
            </Box>
          </Flex>
        </Box>
        <MainApp />
      </DrawingProvider>
    </ChakraProvider>
  );
}

export default App;
