import { useState, useEffect } from "react";
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
  Select,
  HStack,
  Box,
} from "@chakra-ui/react";
import { BoundingBox } from "./EngineeringCanvas";

const LABEL_OPTIONS = [
  "Pump",
  "Valve",
  "Motor",
  "Tank",
  "Vessel",
  "Pipe",
  "Sensor",
  "Instrument",
  "Circuit Breaker",
  "Transformer",
  "Busbar",
  "Switch",
  "Relay",
  "Other",
];
const COLOR_OPTIONS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FFA500",
  "#800080",
];

interface BoundingBoxEditorProps {
  isOpen: boolean;
  box: BoundingBox | null;
  onSave: (box: BoundingBox) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const BoundingBoxEditor: React.FC<BoundingBoxEditorProps> = ({
  isOpen,
  box,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [label, setLabel] = useState("Other");
  const [color, setColor] = useState("#FF0000");

  useEffect(() => {
    if (box) {
      setLabel(box.label);
      setColor(box.color);
    }
  }, [box]);

  if (!box) return null;

  return (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Bounding Box</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel htmlFor="bbox-label-select">
              Bounding box label
            </FormLabel>
            <Select
              id="bbox-label-select"
              name="bbox-label-select"
              value={label}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setLabel(e.target.value)
              }
            >
              {LABEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Color</FormLabel>
            <HStack spacing={2}>
              {COLOR_OPTIONS.map((opt) => (
                <Box
                  key={opt}
                  w={6}
                  h={6}
                  borderRadius="full"
                  bg={opt}
                  border={color === opt ? "2px solid #222" : "1px solid #ccc"}
                  cursor="pointer"
                  onClick={() => setColor(opt)}
                />
              ))}
            </HStack>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            mr={3}
            onClick={() => onSave({ ...box, label, color })}
          >
            Save
          </Button>
          <Button variant="ghost" mr={3} onClick={onCancel}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={() => onDelete(box.id)}>
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BoundingBoxEditor;
