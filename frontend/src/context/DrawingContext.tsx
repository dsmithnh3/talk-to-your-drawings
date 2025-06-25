import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { BoundingBox } from "../components/Canvas/EngineeringCanvas";

interface DrawingState {
  imageUrl: string | null;
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
}

type DrawingAction =
  | { type: "SET_IMAGE"; imageUrl: string | null }
  | { type: "ADD_BOX"; box: BoundingBox }
  | { type: "UPDATE_BOX"; box: BoundingBox }
  | { type: "DELETE_BOX"; id: string }
  | { type: "SET_BOXES"; boxes: BoundingBox[] }
  | { type: "SELECT_BOX"; id: string | null }
  | { type: "CLEAR_BOXES" }
  | { type: "RESET" };

const initialState: DrawingState = {
  imageUrl: null,
  boundingBoxes: [],
  selectedBoxId: null,
};

function reducer(state: DrawingState, action: DrawingAction): DrawingState {
  switch (action.type) {
    case "SET_IMAGE":
      return {
        ...state,
        imageUrl: action.imageUrl,
        boundingBoxes: [],
        selectedBoxId: null,
      };
    case "ADD_BOX":
      return { ...state, boundingBoxes: [...state.boundingBoxes, action.box] };
    case "UPDATE_BOX":
      return {
        ...state,
        boundingBoxes: state.boundingBoxes.map((b) =>
          b.id === action.box.id ? action.box : b
        ),
      };
    case "DELETE_BOX":
      return {
        ...state,
        boundingBoxes: state.boundingBoxes.filter((b) => b.id !== action.id),
        selectedBoxId:
          state.selectedBoxId === action.id ? null : state.selectedBoxId,
      };
    case "SET_BOXES":
      return { ...state, boundingBoxes: action.boxes };
    case "SELECT_BOX":
      return { ...state, selectedBoxId: action.id };
    case "CLEAR_BOXES":
      return { ...state, boundingBoxes: [], selectedBoxId: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const DrawingContext = createContext<{
  state: DrawingState;
  setImage: (url: string | null) => void;
  addBox: (box: BoundingBox) => void;
  updateBox: (box: BoundingBox) => void;
  deleteBox: (id: string) => void;
  setBoxes: (boxes: BoundingBox[]) => void;
  selectBox: (id: string | null) => void;
  clearBoxes: () => void;
  reset: () => void;
} | null>(null);

export const DrawingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    // Load from localStorage if available
    try {
      const saved = localStorage.getItem("drawing_state");
      if (saved) return JSON.parse(saved);
    } catch {}
    return init;
  });

  useEffect(() => {
    localStorage.setItem("drawing_state", JSON.stringify(state));
  }, [state]);

  const setImage = (url: string | null) =>
    dispatch({ type: "SET_IMAGE", imageUrl: url });
  const addBox = (box: BoundingBox) => dispatch({ type: "ADD_BOX", box });
  const updateBox = (box: BoundingBox) => dispatch({ type: "UPDATE_BOX", box });
  const deleteBox = (id: string) => dispatch({ type: "DELETE_BOX", id });
  const setBoxes = (boxes: BoundingBox[]) =>
    dispatch({ type: "SET_BOXES", boxes });
  const selectBox = (id: string | null) => dispatch({ type: "SELECT_BOX", id });
  const clearBoxes = () => dispatch({ type: "CLEAR_BOXES" });
  const reset = () => dispatch({ type: "RESET" });

  return (
    <DrawingContext.Provider
      value={{
        state,
        setImage,
        addBox,
        updateBox,
        deleteBox,
        setBoxes,
        selectBox,
        clearBoxes,
        reset,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};

export function useDrawing() {
  const ctx = useContext(DrawingContext);
  if (!ctx) throw new Error("useDrawing must be used within DrawingProvider");
  return ctx;
}
