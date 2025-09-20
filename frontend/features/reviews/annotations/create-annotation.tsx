import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, X } from "lucide-react";
import { annotationCategories } from "../constants";

interface CreateAnnotationProps {
  pendingAnnotation: { x: number; y: number };
  editText: string;
  setEditText: (text: string) => void;
  editCategory: string;
  setEditCategory: (cat: string) => void;
  handleSaveAnnotation: () => void;
  handleCancelEdit: () => void;
}

const CreateAnnotation: React.FC<CreateAnnotationProps> = ({
  pendingAnnotation,
  editText,
  setEditText,
  editCategory,
  setEditCategory,
  handleSaveAnnotation,
  handleCancelEdit,
}) => {
  if (!pendingAnnotation) return null;

  return (
    <div
      className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px] z-50"
      style={{
        left: pendingAnnotation.x - 100,
        top: pendingAnnotation.y - 50,
        transform: "translateZ(0)",
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Add Annotation</h3>
          <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          placeholder="Add your feedback..."
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
          className="text-sm"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />

        <Select value={editCategory} onValueChange={setEditCategory}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {annotationCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSaveAnnotation();
          }}
          disabled={!editText.trim()}
          size="sm"
          className="w-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Save Annotation
        </Button>
      </div>
    </div>
  );
};

export default CreateAnnotation;