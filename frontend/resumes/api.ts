import axiosInstance from "@/lib/axiosInstance";
import { Resume } from "./types";

interface UploadResumeResponse {
  message: string;
}

interface RenameResumeRequest {
  resume_id: string;
  resume_name: string;
}

interface RenameResumeResponse {
  id: string;
  name: string;
  owner_user_id: string;
  industry: string;
  yoe_bucket: string;
  current_elo_int: number;
  battles_count: number;
  last_matched_at: string | null;
  in_flight: boolean;
  created_at: string;
  pdf_storage_key: string | null;
  pdf_size_bytes: number;
  pdf_mime: string;
  image_key_prefix: string | null;
  page_count: number;
  image_ready: boolean;
  slot: number;
}

class ResumeApi {
  async getResumes(): Promise<Resume[]> {
    const response = await axiosInstance.get("/resume");
    return response.data;
  }

  async uploadResume(
    file: File,
    resumeName: string,
    userId: string
  ): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resume_name", resumeName);
    console.log("userId", userId);
    formData.append("user_id", userId);

    const response = await axiosInstance.post("/storage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async renameResume(
    request: RenameResumeRequest
  ): Promise<RenameResumeResponse> {
    const response = await axiosInstance.put("/resume", {
      resume_id: request.resume_id,
      resume_name: request.resume_name,
    });
    return response.data;
  }

  async deleteResume(resumeId: string): Promise<void> {
    await axiosInstance.delete(`/resume/${resumeId}`);
  }

  async downloadResume(resumeId: string): Promise<Blob> {
    const response = await axiosInstance.get(`/resume/${resumeId}/download`, {
      responseType: "blob",
    });
    return response.data;
  }
}

export const resumeApi = new ResumeApi();
