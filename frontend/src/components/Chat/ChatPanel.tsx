import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Textarea,
  Button,
  Spinner,
  VStack,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export interface ChatMessage {
  sender: "user" | "assistant" | "system";
  content: string;
}

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  sampleQuestions: string[];
  onSampleQuestion: (question: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  chatHistory,
  loading,
  onSend,
  sampleQuestions,
  onSampleQuestion,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const bgUser = useColorModeValue("primary.light", "primary.dark");
  const bgAssistant = useColorModeValue("surface.light", "surface.dark");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <Flex direction="column" h="100%">
      <Box flex="1" overflowY="auto" mb={4} px={2}>
        <VStack align="stretch" spacing={3}>
          {chatHistory.map((msg, idx) => (
            <Box
              key={idx}
              alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
              bg={msg.sender === "user" ? bgUser : bgAssistant}
              color={msg.sender === "user" ? "white" : "text.light"}
              px={4}
              py={2}
              borderRadius="lg"
              maxW="80%"
              boxShadow="sm"
            >
              <Text fontSize="sm">{msg.content}</Text>
            </Box>
          ))}
          {loading && (
            <HStack alignSelf="flex-start" spacing={2}>
              <Spinner size="sm" />
              <Text fontSize="sm">Assistant is typing...</Text>
            </HStack>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
      <Box mb={2}>
        <HStack spacing={2} wrap="wrap">
          {sampleQuestions.map((q, i) => (
            <Button
              key={i}
              size="xs"
              variant="outline"
              onClick={() => onSampleQuestion(q)}
            >
              {q}
            </Button>
          ))}
        </HStack>
      </Box>
      <Flex
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the drawing..."
          size="sm"
          resize="none"
          rows={2}
          mr={2}
        />
        <Button
          colorScheme="teal"
          onClick={handleSend}
          isDisabled={!input.trim() || loading}
        >
          Send
        </Button>
      </Flex>
    </Flex>
  );
};

export default ChatPanel;
