"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Save, X, MessageSquare, ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Navbar } from "@/components/navbar/navbar";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Annotation } from "./types";
import { annotationCategories } from "./constants";
import CreateAnnotation from "./annotations/create-annotation";
import AnnotationsOverlay from "./annotations/annotations";


interface AnnotatorProps {
  resumeId: string;
  resumeName: string;
  imageUrl: string;
  onSave: (annotations: Annotation[]) => void;
  onCancel: () => void;
  initialAnnotations?: Annotation[];
}

export default function Annotator({ 
  resumeId, 
  resumeName, 
  imageUrl, 
  onSave, 
  onCancel,
  initialAnnotations = []
}: AnnotatorProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState("general");
  const [rotation, setRotation] = useState(0);
  const [pendingAnnotation, setPendingAnnotation] = useState<{x: number, y: number, naturalX: number, naturalY: number} | null>(null);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);


  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isAnnotationMode) return;

    // Prevent the transform wrapper from handling this event
    event.stopPropagation();
    event.preventDefault();

    // Get the image's natural dimensions and current display dimensions
    const rect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current;
    
    // Calculate the click position relative to the image's natural size (for storage)
    const naturalX = ((event.clientX - rect.left) / rect.width) * img.naturalWidth;
    const naturalY = ((event.clientY - rect.top) / rect.height) * img.naturalHeight;
    
    // Calculate display coordinates for the floating editor
    const displayX = event.clientX - rect.left;
    const displayY = event.clientY - rect.top;

    // Set pending annotation position with both natural and display coordinates
    setPendingAnnotation({ 
      x: displayX, 
      y: displayY,
      naturalX, 
      naturalY 
    });
    setIsEditing(true);
    setEditText("");
    setEditCategory("general");
    setIsAnnotationMode(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveAnnotation = () => {
    if (!editText.trim() || !pendingAnnotation) return;

    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      type: "TextualBody",
      geometry: {
        type: "Point",
        coordinates: [pendingAnnotation.naturalX, pendingAnnotation.naturalY]
      },
      properties: {
        text: editText,
        category: editCategory,
        color: annotationCategories.find(cat => cat.value === editCategory)?.color || "#3b82f6"
      }
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setIsEditing(false);
    setPendingAnnotation(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPendingAnnotation(null);
    setEditText("");
    setIsAnnotationMode(false);
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation(null);
    }
    if (editingAnnotation?.id === annotationId) {
      setEditingAnnotation(null);
    }
  };

  const handleEditAnnotation = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setEditText(annotation.properties.text || "");
    setEditCategory(annotation.properties.category || "general");
    setIsEditing(true);
  };

  const handleSaveAnnotationEdit = () => {
    if (!editingAnnotation || !editText.trim()) return;

    const updatedAnnotation: Annotation = {
      ...editingAnnotation,
      properties: {
        text: editText,
        category: editCategory,
        color: annotationCategories.find(cat => cat.value === editCategory)?.color || "#3b82f6"
      }
    };

    setAnnotations(prev => prev.map(ann => 
      ann.id === editingAnnotation.id ? updatedAnnotation : ann
    ));

    setEditingAnnotation(null);
    setIsEditing(false);
    setEditText("");
  };

  const handleCancelAnnotationEdit = () => {
    setEditingAnnotation(null);
    setIsEditing(false);
    setEditText("");
  };

  const handleSave = () => {
    onSave(annotations);
  };

  const getCategoryColor = (category: string) => {
    const cat = annotationCategories.find(c => c.value === category);
    return cat?.color || "#3b82f6";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 mt-16">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onCancel} size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{resumeName}</h1>
              <p className={`text-sm ${isAnnotationMode ? 'text-blue-600 font-medium' : 'text-muted-foreground'}`}>
                {isAnnotationMode 
                  ? "Click on the resume to place annotation" 
                  : "Use the 'Add Annotation' button to add an annotation"
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAnnotationMode ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAnnotationMode(false)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAnnotationMode(true);
                  setEditText("");
                  setEditCategory("general");
                }}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Add Annotation
              </Button>
            )}
            <Button onClick={handleSave} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <div className="w-full">
          <div className="w-full">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-muted/30 min-h-[70vh]">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={3}
                    centerOnInit
                    limitToBounds
                    wheel={{ step: 0.1 }}
                    panning={{ disabled: isAnnotationMode }}
                    pinch={{ step: 5 }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        {/* Controls */}
                        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => zoomIn()}
                            aria-label="Zoom in"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => zoomOut()}
                            aria-label="Zoom out"
                          >
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRotate}
                            aria-label="Rotate 90 degrees"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              resetTransform();
                              setRotation(0);
                            }}
                          >
                            Reset
                          </Button>
                        </div>

                        <TransformComponent
                          wrapperClass="!w-full !h-[70vh]"
                          contentClass="!w-full !h-full flex items-center justify-center"
                        >
                          <div
                            className="relative inline-block"
                            style={{
                              transform: `rotate(${rotation}deg)`,
                              transition: "transform 0.2s ease-in-out",
                            }}
                            onClick={isAnnotationMode ? handleImageClick : undefined}
                          >
                            <img
                              ref={imageRef}
                              src={imageUrl}
                              alt={resumeName}
                              className={`rounded-lg shadow-lg max-w-none ${
                                isAnnotationMode ? 'cursor-crosshair' : 'cursor-default'
                              }`}
                              style={{
                                maxWidth: "min(100vw, 1200px)",
                                maxHeight: "calc(70vh - 6rem)",
                                height: "auto",
                                width: "auto",
                                border: isAnnotationMode ? '2px dashed #3b82f6' : 'none',
                                pointerEvents: isAnnotationMode ? 'none' : 'auto'
                              }}
                            />
                            
                            {/* New annotation editor - floating */}
                            {isEditing && pendingAnnotation && (
                              <CreateAnnotation
                                pendingAnnotation={pendingAnnotation}
                                editText={editText}
                                setEditText={setEditText}
                                editCategory={editCategory}
                                setEditCategory={setEditCategory}
                                handleSaveAnnotation={handleSaveAnnotation}
                                handleCancelEdit={handleCancelEdit}
                              />
                            )}
                            
                            {/* Annotation overlays - always show */}
                            <AnnotationsOverlay
                              annotations={annotations}
                              imageRef={imageRef as React.RefObject<HTMLImageElement>}
                              editingAnnotation={editingAnnotation}
                              editText={editText}
                              setEditText={setEditText}
                              editCategory={editCategory}
                              setEditCategory={setEditCategory}
                              annotationCategories={annotationCategories}
                              getCategoryColor={getCategoryColor}
                              handleEditAnnotation={handleEditAnnotation}
                              handleSaveAnnotationEdit={handleSaveAnnotationEdit}
                              handleCancelAnnotationEdit={handleCancelAnnotationEdit}
                            />
                            
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}