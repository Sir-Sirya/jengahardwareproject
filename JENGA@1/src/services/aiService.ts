import { AiChatResponse, ProductDto } from '../types/ai';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Helper to retrieve stored auth token for authenticated requests
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fetches similar products based on vector cosine similarity
 */
export const fetchSimilarProducts = async (
  productId: number,
  limit: number = 4
): Promise<ProductDto[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${productId}/similar?limit=${limit}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch recommendations (${response.status}): ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in fetchSimilarProducts for ID ${productId}:`, error);
    throw error;
  }
};

/**
 * Sends customer prompt to the conversational AI Hardware Advisor (Google Gemini RAG)
 */
export const sendAiPrompt = async (message: string): Promise<AiChatResponse> => {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error('Prompt message cannot be empty.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message: trimmedMessage }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI assistant error (${response.status}): ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in sendAiPrompt:', error);
    throw error;
  }
};