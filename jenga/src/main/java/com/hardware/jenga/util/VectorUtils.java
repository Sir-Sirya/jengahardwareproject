package com.hardware.jenga.util;

public final class VectorUtils {

    private VectorUtils() {
        // Prevent instantiation
    }

    /**
     * Computes the Cosine Similarity between two float arrays.
     */
    public static double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null) {
            return 0.0;
        }

        if (vectorA.length != vectorB.length) {
            throw new IllegalArgumentException(String.format(
                "Dimension mismatch: Vector A (%d) vs Vector B (%d)",
                vectorA.length, vectorB.length
            ));
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}