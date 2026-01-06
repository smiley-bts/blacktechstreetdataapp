/**
 * Simple fuzzy string matching for search with typo tolerance
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Calculate similarity score (0-1, higher is better)
export function calculateSimilarity(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  
  if (!q || !t) return 0;
  if (q === t) return 1;
  if (t.includes(q)) return 0.9;
  if (t.startsWith(q)) return 0.95;
  
  // For short queries, be more lenient
  const maxDistance = Math.max(1, Math.floor(q.length / 3));
  const distance = levenshteinDistance(q, t.substring(0, Math.min(t.length, q.length + 3)));
  
  if (distance <= maxDistance) {
    return 0.7 - (distance * 0.1);
  }
  
  // Check if words match
  const queryWords = q.split(/\s+/);
  const targetWords = t.split(/\s+/);
  
  let matchedWords = 0;
  for (const qWord of queryWords) {
    for (const tWord of targetWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        matchedWords++;
        break;
      }
      // Fuzzy word match
      const wordDistance = levenshteinDistance(qWord, tWord);
      if (wordDistance <= Math.max(1, Math.floor(qWord.length / 3))) {
        matchedWords += 0.7;
        break;
      }
    }
  }
  
  return matchedWords > 0 ? (matchedWords / queryWords.length) * 0.6 : 0;
}

// Check if a query matches a target with fuzzy matching
export function fuzzyMatch(query: string, target: string, threshold = 0.3): boolean {
  return calculateSimilarity(query, target) >= threshold;
}

// Search through multiple fields and return a score
export function fuzzySearchFields(
  query: string,
  fields: (string | undefined)[],
  threshold = 0.3
): { matches: boolean; score: number } {
  const q = query.toLowerCase().trim();
  if (!q) return { matches: true, score: 1 };
  
  let bestScore = 0;
  
  for (const field of fields) {
    if (!field) continue;
    
    const fieldLower = field.toLowerCase();
    
    // Exact substring match is best
    if (fieldLower.includes(q)) {
      const exactScore = fieldLower.startsWith(q) ? 1 : 0.95;
      bestScore = Math.max(bestScore, exactScore);
      continue;
    }
    
    // Calculate fuzzy score
    const score = calculateSimilarity(q, field);
    bestScore = Math.max(bestScore, score);
  }
  
  return { matches: bestScore >= threshold, score: bestScore };
}
