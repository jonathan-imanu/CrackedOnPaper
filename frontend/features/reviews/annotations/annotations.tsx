import React from "react";
import { Annotation, AnnotationCategory } from "@/features/reviews/types";
import EditAnnotation from "./edit-annotation";
import HoverAnnotation from "./hover-annotation";

interface AnnotationsOverlayProps {
  annotations: Annotation[];
  imageRef: React.RefObject<HTMLImageElement>;
  editingAnnotation: Annotation | null;
  editText: string;
  setEditText: (text: string) => void;
  editCategory: string;
  setEditCategory: (cat: string) => void;
  annotationCategories: AnnotationCategory[];
  getCategoryColor: (category: string) => string;
  handleEditAnnotation: (annotation: Annotation) => void;
  handleSaveAnnotationEdit: () => void;
  handleCancelAnnotationEdit: () => void;
}

const AnnotationsOverlay: React.FC<AnnotationsOverlayProps> = ({
  annotations,
  imageRef,
  editingAnnotation,
  editText,
  setEditText,
  editCategory,
  setEditCategory,
  annotationCategories,
  getCategoryColor,
  handleEditAnnotation,
  handleSaveAnnotationEdit,
  handleCancelAnnotationEdit,
}) => {
  return (
    <>
      {annotations.map((annotation) => {
        // Convert natural coordinates to display coordinates
        const img = imageRef.current;
        if (!img) return null;

        const displayX =
          (annotation.geometry.coordinates[0] / img.naturalWidth) *
          img.offsetWidth;
        const displayY =
          (annotation.geometry.coordinates[1] / img.naturalHeight) *
          img.offsetHeight;
        const isEditingThis = editingAnnotation?.id === annotation.id;

        return (
          <div
            key={annotation.id}
            className="absolute group"
            style={{
              left: displayX - 12,
              top: displayY - 12,
            }}
          >
            {/* Annotation dot */}
            <div
              key={`dot-${annotation.id}`}
              className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform ${
                isEditingThis ? "ring-2 ring-blue-500" : ""
              }`}
              style={{
                backgroundColor: getCategoryColor(
                  annotation.properties.category || "general"
                ),
              }}
              onClick={() => handleEditAnnotation(annotation)}
            />

            {/* Annotation text bubble */}
            {isEditingThis && (
              <EditAnnotation
                annotation={annotation}
                editText={editText}
                setEditText={setEditText}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                annotationCategories={annotationCategories}
                getCategoryColor={getCategoryColor}
                handleSaveAnnotationEdit={handleSaveAnnotationEdit}
                handleCancelAnnotationEdit={handleCancelAnnotationEdit}
              />
            )}

            {!isEditingThis && (
              <HoverAnnotation
                annotation={annotation}
                getCategoryColor={getCategoryColor}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default AnnotationsOverlay;