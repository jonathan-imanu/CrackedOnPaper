import axiosInstance from "@/lib/axiosInstance";

interface UploadResumeResponse {
  message: string;
}

class ResumeApi {
  async uploadResume(
    file: File,
    resumeName: string,
    version: string,
    userId: string
  ): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resume_name", resumeName);
    formData.append("version", version);
    console.log("userId", userId);
    formData.append("user_id", userId);

    const response = await axiosInstance.post("/storage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
}

export const resumeApi = new ResumeApi();
