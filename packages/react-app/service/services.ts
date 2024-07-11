import axios from "axios";
import { TriviaInterface } from "@/types/questions";
import { PrizeInterface } from "@/types/prizes";

const BASE_URL = `${process.env.DATABASE_URL || "http://localhost:5000"}`;

const api_v1 = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create a new prize for host
export const createPrize = async (prize: PrizeInterface) => {
  try {
    const response = await api_v1.post("/api/v1/prize", prize);
    return response.data;
  } catch (error) {
    console.error("Error creating trivia:", error);
    throw error;
  }
};

// Get all prizes for a specific user
export const getUserPrize = async (walletAddress: string) => {
  try {
    const response = await api_v1.get(`/api/v1/prize/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user trivia:", error);
    throw error;
  }
};

// Delete a specific prize by its ID
export const deletePrize = async (id: string) => {
  try {
    const response = await api_v1.delete(`/api/v1/prize/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting trivia:", error);
    throw error;
  }
};

// Create a new trivia entry
export const createTrivia = async (trivia: TriviaInterface) => {
  try {
    const response = await api_v1.post("/api/v1/trivia", trivia);
    return response.data;
  } catch (error) {
    console.error("Error creating trivia:", error);
    throw error;
  }
};

// Get all trivia entries for a specific user
export const getUserTrivia = async (walletAddress: string) => {
  try {
    const response = await api_v1.get(`/api/v1/trivia/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user trivia:", error);
    throw error;
  }
};

// Delete a specific trivia entry by its ID
export const deleteTrivia = async (id: string) => {
  try {
    const response = await api_v1.delete(`/api/v1/trivia/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting trivia:", error);
    throw error;
  }
};
