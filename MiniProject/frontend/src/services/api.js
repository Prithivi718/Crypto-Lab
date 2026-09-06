/* global process */
import * as dotenv from "dotenv"; // Fix: standard ES module import for dotenv
dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:5000/api";

export const checkHealth = async () => {
    const response = await fetch(`${API_URL}/health`)
    return response.json();
};

export const uploadFile = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("File Upload failed");
    }

    return response.json();
}