import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useToast,
  HStack,
  Spinner,
} from "@chakra-ui/react";

const MODEL_OPTIONS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: SettingsState) => void;
  initialSettings: SettingsState;
}

export interface SettingsState {
  openaiKey: string;
  geminiKey: string;
  chatModel: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings,
}) => {
  const [openaiKey, setOpenaiKey] = useState(initialSettings.openaiKey);
  const [geminiKey, setGeminiKey] = useState(initialSettings.geminiKey);
  const [chatModel, setChatModel] = useState(initialSettings.chatModel);
  const [testing, setTesting] = useState<"openai" | "gemini" | null>(null);
  const [testResult, setTestResult] = useState<{
    openai?: boolean;
    gemini?: boolean;
  }>({});
  const toast = useToast();

  useEffect(() => {
    setOpenaiKey(initialSettings.openaiKey);
    setGeminiKey(initialSettings.geminiKey);
    setChatModel(initialSettings.chatModel);
  }, [initialSettings]);

  const testOpenAI = async () => {
    setTesting("openai");
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openaiKey}` },
      });
      setTestResult((r) => ({ ...r, openai: res.ok }));
      toast({
        title: res.ok ? "OpenAI key valid" : "OpenAI key invalid",
        status: res.ok ? "success" : "error",
      });
    } catch {
      setTestResult((r) => ({ ...r, openai: false }));
      toast({ title: "OpenAI key invalid", status: "error" });
    }
    setTesting(null);
  };

  const testGemini = async () => {
    setTesting("gemini");
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1/models",
        {
          headers: { "x-goog-api-key": geminiKey },
        }
      );
      setTestResult((r) => ({ ...r, gemini: res.ok }));
      toast({
        title: res.ok ? "Gemini key valid" : "Gemini key invalid",
        status: res.ok ? "success" : "error",
      });
    } catch {
      setTestResult((r) => ({ ...r, gemini: false }));
      toast({ title: "Gemini key invalid", status: "error" });
    }
    setTesting(null);
  };

  const handleSave = () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({ openaiKey, geminiKey, chatModel })
    );
    onSave({ openaiKey, geminiKey, chatModel });
    toast({ title: "Settings saved", status: "success" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>OpenAI API Key</FormLabel>
            <Input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
            <Button
              mt={2}
              size="sm"
              onClick={testOpenAI}
              isLoading={testing === "openai"}
            >
              Test OpenAI Key
            </Button>
            {testResult.openai !== undefined && (
              <Text
                color={testResult.openai ? "green.500" : "red.500"}
                fontSize="sm"
              >
                {testResult.openai ? "Valid" : "Invalid"}
              </Text>
            )}
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Google Gemini API Key</FormLabel>
            <Input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API key"
            />
            <Button
              mt={2}
              size="sm"
              onClick={testGemini}
              isLoading={testing === "gemini"}
            >
              Test Gemini Key
            </Button>
            {testResult.gemini !== undefined && (
              <Text
                color={testResult.gemini ? "green.500" : "red.500"}
                fontSize="sm"
              >
                {testResult.gemini ? "Valid" : "Invalid"}
              </Text>
            )}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="theme-select">Theme selection</FormLabel>
            <Select
              id="theme-select"
              name="theme-select"
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
            >
              {MODEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="teal" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
