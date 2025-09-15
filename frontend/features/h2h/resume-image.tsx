import { Lens } from "@/components/ui/lens";
import { FileText } from "lucide-react";
import Image from "next/image";

interface ResumeImageProps {
    imageKeyPrefix: string;
    imageReady: boolean;
}


export function ResumeImage({
  imageKeyPrefix,
  imageReady,
  pageCount,
}: ResumeImageProps & { pageCount?: number }) {
  if (imageReady && imageKeyPrefix) {
    return (
      <div className="aspect-[4/5] rounded-lg overflow-hidden border">
          <Lens zoomFactor={1.5} lensSize={350}>
                <Image
                src={`${process.env.NEXT_PUBLIC_CDN_URL}/${imageKeyPrefix}`}
                alt="Resume Image"
                width={1000}
                height={1250}
                className="object-contain w-full h-full"
                priority
                />
          </Lens>
      </div>
    );
  }

  return (
    <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center border">
      <div className="text-center">
        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Resume Preview</p>
        <p className="text-xs text-muted-foreground">
          {pageCount ?? 1} page{(pageCount ?? 1) !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}