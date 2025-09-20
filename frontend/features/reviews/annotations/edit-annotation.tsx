import React from "react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Annotation, AnnotationCategory } from "@/features/reviews/types";

interface EditAnnotationProps {
  annotation: Annotation;
  editText: string;
  setEditText: (text: string) => void;
  editCategory: string;
  setEditCategory: (cat: string) => void;
  annotationCategories: AnnotationCategory[];
  getCategoryColor: (category: string) => string;
  handleSaveAnnotationEdit: () => void;
  handleCancelAnnotationEdit: () => void;
}

export const EditAnnotation: React.FC<EditAnnotationProps> = ({
  annotation,
  editText,
  setEditText,
  editCategory,
  setEditCategory,
  annotationCategories,
  getCategoryColor,
  handleSaveAnnotationEdit,
  handleCancelAnnotationEdit,
}) => {
  return (
    <div className="absolute top-8 left-0 bg-background backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 min-w-[240px] max-w-[320px] z-50">
      <div className="absolute -top-2 left-4 w-4 h-4 bg-card/95 backdrop-blur-sm border-l border-t border-border rotate-45 rounded-tl-sm" />
      <div className="space-y-3">
        <div className="space-y-3">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder="Add your feedback..."
            rows={3}
            className="text-sm resize-none"
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
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleSaveAnnotationEdit();
            }}
            disabled={!editText.trim()}
            className="flex-1"
          >
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelAnnotationEdit();
            }}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAnnotation;