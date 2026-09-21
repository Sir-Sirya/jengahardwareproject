export interface ProductDto {
  id: number;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  whatsappLink?: string;
  categoryName?: string;
}

export interface AiChatRequest {
  message: string;
}

export interface AiChatResponse {
  message: string;
  recommendedProducts: ProductDto[];
}

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  products?: ProductDto[];
  timestamp: Date;
}