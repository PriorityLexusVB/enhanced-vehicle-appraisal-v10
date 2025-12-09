// Test the scoring logic locally
function extractMileageFromText(text) {
  console.log('🔍 ADVANCED MILEAGE EXTRACTION from text:', text);
  
  // Step 1: Split text into lines and clean them
  const lines = text.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 0);
  console.log('Text lines:', lines);
  
  // Step 2: Advanced pattern matching for mileage displays
  const mileagePatterns = [
    /(\d{1,3}[,.]?\d{3}[,.]?\d{3})/g,  // 123,456,789 or 123.456.789
    /(\d{1,3},\d{3},\d{3})/g,          // 123,456,789
    /(\d{1,3}\s\d{3}\s\d{3})/g,        // 123 456 789
    /(\d{4,6})/g,                      // 123456 (simple 4-6 digits)
    /ODO[\s:]*(\d{4,6})/gi,            // ODO: 123456
    /MILES[\s:]*(\d{4,6})/gi,          // MILES: 123456
    /(\d+)\s*MI/gi,                    // 123456 MI
    /(\d+)\s*MILES/gi                  // 123456 MILES
  ];
  
  let allCandidates = [];
  
  // Step 3: Extract numbers using all patterns
  for (const pattern of mileagePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Extract just the numbers from the match
        const numbers = match.replace(/[^\d]/g, '');
        if (numbers.length >= 1 && numbers.length <= 7) {  // CHANGED: was >= 4, now >= 1
          allCandidates.push(numbers);
        }
      });
    }
  }
  
  // Step 4: Look for clustered digits (including very short ones for low mileage)
  const digitClusters = text.match(/\d{1,7}/g) || [];  // CHANGED: was \d{4,7}, now \d{1,7}
  allCandidates.push(...digitClusters);
  
  // Remove duplicates
  allCandidates = [...new Set(allCandidates)];
  console.log('All mileage candidates found:', allCandidates);
  
  if (allCandidates.length === 0) {
    return "UNREADABLE";
  }
  
  // Step 5: Advanced filtering and scoring
  const scoredCandidates = allCandidates.map(candidate => {
    const value = parseInt(candidate);
    let score = 0;
    
    // Length scoring - UPDATED to allow 1-3 digit readings for very low mileage
    if (candidate.length === 5) score += 30;
    else if (candidate.length === 6) score += 25;
    else if (candidate.length === 4) score += 15;
    else if (candidate.length === 3) score += 20;            // NEW: 3 digits (e.g., 123 miles)
    else if (candidate.length === 2) score += 25;            // NEW: 2 digits (e.g., 23 miles)
    else if (candidate.length === 1) score += 20;            // NEW: 1 digit (e.g., 3 miles)
    else if (candidate.length === 7) score += 10;
    
    // Realistic mileage range scoring - FIXED to allow very low mileage
    if (value >= 10000 && value <= 300000) score += 40;      // Very realistic
    else if (value >= 5000 && value <= 500000) score += 25;  // Realistic
    else if (value >= 1000 && value <= 999999) score += 10;  // Possible
    else if (value >= 1 && value <= 999) score += 35;        // NEW: Very low mileage (new cars, demos)
    
    // Avoid obvious non-mileage numbers
    if (value >= 1900 && value <= 2030) score -= 50;         // Years
    // REMOVED: if (value < 1000) score -= 30; // This was rejecting valid low mileage!
    if (value > 999999) score -= 30;                         // Too high
    
    // Common mileage patterns bonus
    if (value % 1000 === 0) score += 5;                      // Round thousands
    if (candidate.endsWith('000')) score += 3;               // Ends in 000
    
    // Penalize obviously wrong patterns
    if (/^(\d)\1{3,}$/.test(candidate)) score -= 20;         // All same digits (1111)
    if (candidate === '12345' || candidate === '54321') score -= 30; // Sequential
    
    console.log(`Candidate ${candidate} (${value}): score ${score}`);
    
    return { candidate, value, score };
  });
  
  // Step 6: Sort by score and return best candidate
  scoredCandidates.sort((a, b) => b.score - a.score);
  
  if (scoredCandidates.length > 0 && scoredCandidates[0].score > 0) {
    const winner = scoredCandidates[0];
    console.log(`✅ Selected mileage: ${winner.candidate} (score: ${winner.score})`);
    return winner.candidate;
  }
  
  console.log('❌ No suitable mileage candidate found');
  return "UNREADABLE";
}

// Test cases
console.log("=== Testing Low Mileage Scoring ===");
console.log("Result for '2':", extractMileageFromText("2"));
console.log("\nResult for '23':", extractMileageFromText("23"));
console.log("\nResult for '123':", extractMileageFromText("123"));
console.log("\nResult for '2 MI':", extractMileageFromText("2 MI"));
console.log("\nResult for 'ODO: 3':", extractMileageFromText("ODO: 3"));
console.log("\nResult for 'MILES: 23':", extractMileageFromText("MILES: 23"));