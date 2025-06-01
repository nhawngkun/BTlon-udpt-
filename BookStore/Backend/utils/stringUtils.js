/**
 * Standardizes category names for consistent database storage
 * @param {string} category - The category name to standardize
 * @returns {string} - The standardized category name
 */
export const standardizeCategory = (category) => {
  if (!category) return 'General';
  
  // Trim whitespace and convert to lowercase
  let standardized = category.trim().toLowerCase();
  
  // Capitalize first letter of each word
  standardized = standardized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  // Handle common naming variations
  const categoryMap = {
    'Scifi': 'Science Fiction',
    'Sci-fi': 'Science Fiction',
    'Sci Fi': 'Science Fiction',
    'Sci-Fiction': 'Science Fiction',
    'Literary': 'Literature',
    'Novel': 'Fiction',
    'Novels': 'Fiction'
  };
  
  return categoryMap[standardized] || standardized;
};

/**
 * Standardizes author names for consistent database storage
 * @param {string} author - The author name to standardize
 * @returns {string} - The standardized author name
 */
export const standardizeAuthor = (author) => {
  if (!author) return 'Unknown Author';
  
  // Trim whitespace
  let standardized = author.trim();
  
  // Capitalize first letter of each word
  standardized = standardized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    
  return standardized;
};
