import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import Image from "next/image";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface ResumeViewerContentProps {
  resumeName: string;
  imageKeyPrefix: string;
  cdnUrl: string;
}

export function ResumeViewerContent({
  resumeName,
  imageKeyPrefix,
  cdnUrl,
}: ResumeViewerContentProps) {
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev: number) => (prev + 90) % 360);
  };

  return (
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={3}
      centerOnInit
      limitToBounds
      wheel={{ step: 0.1 }}
      panning={{ disabled: false }}
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
            wrapperClass="!w-full !h-[calc(90vh-4rem)]"
            contentClass="!w-full !h-full flex items-center justify-center"
          >
            <div
              className="relative inline-block"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-in-out",
              }}
            >
              <Image
                src={`${cdnUrl}/${imageKeyPrefix}`}
                alt={resumeName}
                width={1600}
                height={2000}
                priority
                className="rounded-lg shadow-lg max-w-none"
                style={{
                  maxWidth: "min(100vw, 1200px)",
                  maxHeight: "calc(90vh - 6rem)",
                  height: "auto",
                  width: "auto",
                }}
              />
            </div>
          </TransformComponent>
        </>
      )}
    </TransformWrapper>
  );
}
